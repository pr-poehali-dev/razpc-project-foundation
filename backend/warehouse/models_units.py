from db import resp, next_number, log_unit

STATUSES = (
    'in_stock', 'reserved', 'in_build', 'sold', 'written_off',
    'returned', 'diagnostics', 'repair',
)


def refs(cur):
    cur.execute('SELECT id, code, title, icon, component_type FROM inventory_categories '
                'WHERE is_active = TRUE ORDER BY sort_order')
    categories = cur.fetchall()
    cur.execute('SELECT id, code, title FROM storage_locations WHERE is_active = TRUE ORDER BY sort_order')
    locations = cur.fetchall()
    cur.execute('SELECT id, name FROM suppliers WHERE is_active = TRUE ORDER BY name')
    suppliers = cur.fetchall()
    cur.execute('SELECT id, name, kind, balance FROM accounts WHERE is_active = TRUE ORDER BY name')
    accounts = cur.fetchall()
    cur.execute('SELECT id, name, kind FROM counterparties WHERE is_active = TRUE ORDER BY name')
    counterparties = cur.fetchall()
    return resp(200, {
        'categories': categories, 'locations': locations, 'suppliers': suppliers,
        'accounts': accounts, 'counterparties': counterparties, 'statuses': list(STATUSES),
    })


def _gen_sku(cur):
    cur.execute("SELECT COUNT(*) AS c FROM product_models")
    return f"RZ-{(cur.fetchone()['c'] or 0) + 1:05d}"


# ---------- Modeli (spisok = svodka po ekzemplyaram) ----------
def list_models(cur, params):
    where, args = [], []
    search = (params.get('search') or '').strip()
    if search:
        where.append('(pm.name ILIKE %s OR pm.sku ILIKE %s OR pm.manufacturer ILIKE %s OR pm.model ILIKE %s)')
        like = f'%{search}%'
        args += [like, like, like, like]
    if params.get('category_id'):
        where.append('pm.category_id = %s')
        args.append(params['category_id'])

    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''
    cur.execute(f'''
        SELECT pm.id, pm.sku, pm.name, pm.manufacturer, pm.model, pm.category_id,
               pm.default_sale_price, pm.low_stock_threshold, pm.photo_url,
               c.title AS category_title, c.icon AS category_icon,
               COUNT(u.id) FILTER (WHERE u.status = 'in_stock') AS in_stock,
               COUNT(u.id) FILTER (WHERE u.status = 'reserved') AS reserved,
               COUNT(u.id) FILTER (WHERE u.status = 'in_build') AS in_build,
               COUNT(u.id) FILTER (WHERE u.status = 'sold') AS sold,
               COUNT(u.id) AS total_units,
               COALESCE(AVG(u.purchase_cost) FILTER (WHERE u.status='in_stock'),0) AS avg_cost
        FROM product_models pm
        LEFT JOIN inventory_categories c ON c.id = pm.category_id
        LEFT JOIN inventory_units u ON u.model_id = pm.id
        {where_sql}
        GROUP BY pm.id, c.title, c.icon
        ORDER BY pm.name LIMIT 500
    ''', args)
    return resp(200, {'models': cur.fetchall()})


def get_model(cur, model_id):
    cur.execute('''
        SELECT pm.*, c.title AS category_title, c.icon AS category_icon
        FROM product_models pm LEFT JOIN inventory_categories c ON c.id = pm.category_id
        WHERE pm.id = %s
    ''', (model_id,))
    model = cur.fetchone()
    if not model:
        return resp(404, {'error': 'Модель не найдена'})
    cur.execute('''
        SELECT u.id, u.unit_number, u.serial_number, u.status, u.condition,
               u.purchase_cost, u.sale_price, u.sold_price, u.received_at,
               u.lot_id, u.machine_id, l.lot_number, m.machine_number,
               loc.title AS location_title
        FROM inventory_units u
        LEFT JOIN lots l ON l.id = u.lot_id
        LEFT JOIN machines m ON m.id = u.machine_id
        LEFT JOIN storage_locations loc ON loc.id = u.location_id
        WHERE u.model_id = %s ORDER BY u.id DESC
    ''', (model_id,))
    return resp(200, {'model': model, 'units': cur.fetchall()})


def save_model(cur, uid, data):
    mid = data.get('id')
    fields = ('name', 'category_id', 'manufacturer', 'model', 'default_sale_price',
              'low_stock_threshold', 'photo_url', 'notes')
    if mid:
        sets, args = [], []
        for f in fields:
            if f in data:
                sets.append(f'{f} = %s')
                v = data[f]
                if f in ('category_id',) and v in ('', None):
                    v = None
                args.append(v)
        if not sets:
            return resp(400, {'error': 'Нет данных'})
        sets.append('updated_at = NOW()')
        args.append(mid)
        cur.execute(f'UPDATE product_models SET {", ".join(sets)} WHERE id = %s', args)
        return resp(200, {'ok': True, 'id': mid})

    name = (data.get('name') or '').strip()
    if not name:
        return resp(400, {'error': 'Введите наименование'})
    sku = (data.get('sku') or '').strip() or _gen_sku(cur)
    cur.execute('SELECT id FROM product_models WHERE sku = %s', (sku,))
    if cur.fetchone():
        return resp(409, {'error': 'Модель с таким SKU уже существует'})
    cur.execute('''
        INSERT INTO product_models
        (sku, name, category_id, manufacturer, model, default_sale_price,
         low_stock_threshold, photo_url, notes, created_by)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
    ''', (sku, name, data.get('category_id') or None, data.get('manufacturer'),
          data.get('model'), float(data.get('default_sale_price') or 0),
          int(data.get('low_stock_threshold') or 2), data.get('photo_url'),
          data.get('notes'), uid))
    return resp(200, {'ok': True, 'id': cur.fetchone()['id'], 'sku': sku})


def find_or_create_model(cur, uid, data):
    '''Ispolzuetsya priemkoy: po model_id ili sozdaet novuyu.'''
    if data.get('model_id'):
        return data['model_id']
    name = (data.get('name') or '').strip()
    if not name:
        return None
    sku = (data.get('sku') or '').strip() or _gen_sku(cur)
    cur.execute('SELECT id FROM product_models WHERE sku = %s', (sku,))
    ex = cur.fetchone()
    if ex:
        return ex['id']
    cur.execute('''
        INSERT INTO product_models (sku, name, category_id, manufacturer, model, default_sale_price, created_by)
        VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id
    ''', (sku, name, data.get('category_id') or None, data.get('manufacturer'),
          data.get('model'), float(data.get('sale_price') or 0), uid))
    return cur.fetchone()['id']


# ---------- Ekzemplyary ----------
def list_units(cur, params):
    where, args = [], []
    search = (params.get('search') or '').strip()
    if search:
        where.append('(pm.name ILIKE %s OR u.serial_number ILIKE %s OR u.unit_number ILIKE %s OR pm.sku ILIKE %s)')
        like = f'%{search}%'
        args += [like, like, like, like]
    for f, col in (('status', 'u.status'), ('condition', 'u.condition'),
                   ('location_id', 'u.location_id'), ('lot_id', 'u.lot_id'),
                   ('machine_id', 'u.machine_id'), ('model_id', 'u.model_id'),
                   ('category_id', 'pm.category_id')):
        if params.get(f):
            where.append(f'{col} = %s')
            args.append(params[f])
    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''
    cur.execute(f'''
        SELECT u.id, u.unit_number, u.serial_number, u.status, u.condition,
               u.purchase_cost, u.sale_price, u.sold_price, u.received_at,
               u.model_id, pm.name AS model_name, pm.sku, pm.photo_url,
               c.title AS category_title, c.icon AS category_icon,
               u.lot_id, l.lot_number, u.machine_id, m.machine_number,
               loc.title AS location_title,
               (u.sale_price - u.purchase_cost) AS unit_profit
        FROM inventory_units u
        JOIN product_models pm ON pm.id = u.model_id
        LEFT JOIN inventory_categories c ON c.id = pm.category_id
        LEFT JOIN lots l ON l.id = u.lot_id
        LEFT JOIN machines m ON m.id = u.machine_id
        LEFT JOIN storage_locations loc ON loc.id = u.location_id
        {where_sql}
        ORDER BY u.id DESC LIMIT 800
    ''', args)
    return resp(200, {'units': cur.fetchall()})


def get_unit(cur, unit_id):
    cur.execute('''
        SELECT u.*, pm.name AS model_name, pm.sku, pm.manufacturer, pm.model AS model_model,
               pm.photo_url, c.title AS category_title, c.icon AS category_icon,
               l.lot_number, l.source AS lot_source, l.is_disassembly, l.machine_title,
               m.machine_number, m.name AS machine_name,
               loc.title AS location_title, s.name AS supplier_name,
               cust.name AS sold_to_name,
               (u.sale_price - u.purchase_cost) AS unit_profit
        FROM inventory_units u
        JOIN product_models pm ON pm.id = u.model_id
        LEFT JOIN inventory_categories c ON c.id = pm.category_id
        LEFT JOIN lots l ON l.id = u.lot_id
        LEFT JOIN suppliers s ON s.id = l.supplier_id
        LEFT JOIN machines m ON m.id = u.machine_id
        LEFT JOIN storage_locations loc ON loc.id = u.location_id
        LEFT JOIN customers cust ON cust.id = u.sold_to_customer_id
        WHERE u.id = %s
    ''', (unit_id,))
    unit = cur.fetchone()
    if not unit:
        return resp(404, {'error': 'Экземпляр не найден'})
    cur.execute('''
        SELECT e.id, e.event_type, e.comment, e.created_at, e.meta,
               us.name AS user_name, m.machine_number, l.lot_number
        FROM unit_events e
        LEFT JOIN users us ON us.id = e.user_id
        LEFT JOIN machines m ON m.id = e.machine_id
        LEFT JOIN lots l ON l.id = e.lot_id
        WHERE e.unit_id = %s ORDER BY e.created_at DESC
    ''', (unit_id,))
    return resp(200, {'unit': unit, 'events': cur.fetchall()})


def update_unit(cur, uid, data):
    unit_id = data.get('id')
    cur.execute('SELECT id, sale_price, status FROM inventory_units WHERE id = %s', (unit_id,))
    old = cur.fetchone()
    if not old:
        return resp(404, {'error': 'Экземпляр не найден'})
    fields = ('serial_number', 'condition', 'status', 'location_id', 'sale_price', 'purchase_cost', 'notes')
    sets, args = [], []
    for f in fields:
        if f in data:
            sets.append(f'{f} = %s')
            v = data[f]
            if f == 'location_id' and v in ('', None):
                v = None
            args.append(v)
    if not sets:
        return resp(400, {'error': 'Нет данных'})
    sets.append('updated_at = NOW()')
    args.append(unit_id)
    cur.execute(f'UPDATE inventory_units SET {", ".join(sets)} WHERE id = %s', args)
    if 'sale_price' in data and float(data['sale_price'] or 0) != float(old['sale_price'] or 0):
        log_unit(cur, unit_id, 'price_change', uid,
                 f"Цена продажи: {old['sale_price']} → {data['sale_price']}")
    if 'status' in data and data['status'] != old['status']:
        log_unit(cur, unit_id, 'status_change', uid, f"Статус: {old['status']} → {data['status']}")
    return resp(200, {'ok': True})
