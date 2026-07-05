from db import resp

# Vozmozhnye statusy tovara
STATUSES = (
    'in_stock', 'reserved', 'in_build', 'sold', 'written_off',
    'returned', 'diagnostics', 'repair', 'awaiting_supply',
)

ITEM_FIELDS = (
    'name', 'category_id', 'manufacturer', 'model', 'serial_number',
    'sku', 'low_stock_threshold', 'sale_price', 'condition', 'status',
    'supplier_id', 'location_id', 'photo_url', 'notes', 'received_at',
    'component_id',
)


def _gen_sku(cur):
    cur.execute("SELECT COUNT(*) AS c FROM inventory_items")
    n = (cur.fetchone()['c'] or 0) + 1
    return f'RZ-{n:05d}'


def refs(cur):
    '''Spravochniki: kategorii, mesta hraneniya, postavshchiki.'''
    cur.execute(
        'SELECT id, code, title, icon, component_type FROM inventory_categories '
        'WHERE is_active = TRUE ORDER BY sort_order'
    )
    categories = cur.fetchall()
    cur.execute(
        'SELECT id, code, title FROM storage_locations WHERE is_active = TRUE ORDER BY sort_order'
    )
    locations = cur.fetchall()
    cur.execute(
        'SELECT id, name FROM suppliers WHERE is_active = TRUE ORDER BY name'
    )
    suppliers = cur.fetchall()
    return resp(200, {
        'categories': categories,
        'locations': locations,
        'suppliers': suppliers,
        'statuses': list(STATUSES),
    })


def _profit_select():
    '''Vychislyaemye polya pribyli/marzhi dlya SELECT.'''
    return (
        '(i.sale_price - i.avg_purchase_price) AS unit_profit, '
        'CASE WHEN i.sale_price > 0 THEN '
        'ROUND((i.sale_price - i.avg_purchase_price) / i.sale_price * 100, 1) '
        'ELSE 0 END AS margin_pct'
    )


def list_items(cur, params):
    where = []
    args = []

    search = (params.get('search') or '').strip()
    if search:
        where.append(
            '(i.name ILIKE %s OR i.sku ILIKE %s OR i.model ILIKE %s '
            'OR i.manufacturer ILIKE %s OR i.serial_number ILIKE %s)'
        )
        like = f'%{search}%'
        args += [like, like, like, like, like]

    for field, col in (
        ('category_id', 'i.category_id'),
        ('status', 'i.status'),
        ('supplier_id', 'i.supplier_id'),
        ('location_id', 'i.location_id'),
        ('condition', 'i.condition'),
    ):
        val = params.get(field)
        if val:
            where.append(f'{col} = %s')
            args.append(val)

    manufacturer = (params.get('manufacturer') or '').strip()
    if manufacturer:
        where.append('i.manufacturer = %s')
        args.append(manufacturer)

    stock = params.get('stock')
    if stock == 'in':
        where.append('i.quantity > 0')
    elif stock == 'low':
        where.append('i.quantity > 0 AND i.quantity <= i.low_stock_threshold')
    elif stock == 'out':
        where.append('i.quantity = 0')

    for field, col in (('price_min', 'i.sale_price >= %s'), ('price_max', 'i.sale_price <= %s')):
        val = params.get(field)
        if val:
            where.append(col)
            args.append(val)

    date_from = params.get('date_from')
    if date_from:
        where.append('i.received_at >= %s')
        args.append(date_from)
    date_to = params.get('date_to')
    if date_to:
        where.append('i.received_at <= %s')
        args.append(date_to)

    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''

    sort = params.get('sort') or 'created_at'
    sort_map = {
        'name': 'i.name', 'quantity': 'i.quantity', 'sale_price': 'i.sale_price',
        'purchase_price': 'i.avg_purchase_price', 'margin': 'margin_pct',
        'received_at': 'i.received_at', 'created_at': 'i.created_at',
    }
    sort_col = sort_map.get(sort, 'i.created_at')
    direction = 'ASC' if params.get('dir') == 'asc' else 'DESC'

    cur.execute(
        f'''
        SELECT i.id, i.sku, i.name, i.category_id, i.manufacturer, i.model,
               i.serial_number, i.quantity, i.reserved_qty, i.low_stock_threshold,
               i.purchase_price, i.avg_purchase_price, i.last_purchase_price,
               i.sale_price, i.condition, i.status, i.supplier_id, i.location_id,
               i.photo_url, i.received_at, i.created_at,
               c.title AS category_title, c.icon AS category_icon,
               s.name AS supplier_name, l.title AS location_title,
               {_profit_select()}
        FROM inventory_items i
        LEFT JOIN inventory_categories c ON c.id = i.category_id
        LEFT JOIN suppliers s ON s.id = i.supplier_id
        LEFT JOIN storage_locations l ON l.id = i.location_id
        {where_sql}
        ORDER BY {sort_col} {direction} NULLS LAST
        LIMIT 500
        ''',
        args,
    )
    return resp(200, {'items': cur.fetchall()})


def get_item(cur, item_id):
    cur.execute(
        f'''
        SELECT i.*, c.title AS category_title, c.icon AS category_icon,
               s.name AS supplier_name, l.title AS location_title,
               u.name AS created_by_name,
               {_profit_select()}
        FROM inventory_items i
        LEFT JOIN inventory_categories c ON c.id = i.category_id
        LEFT JOIN suppliers s ON s.id = i.supplier_id
        LEFT JOIN storage_locations l ON l.id = i.location_id
        LEFT JOIN users u ON u.id = i.created_by
        WHERE i.id = %s
        ''',
        (item_id,),
    )
    item = cur.fetchone()
    if not item:
        return resp(404, {'error': 'Товар не найден'})

    cur.execute(
        '''
        SELECT m.id, m.operation, m.qty_change, m.qty_after, m.unit_price,
               m.comment, m.created_at, u.name AS user_name,
               fl.title AS from_location, tl.title AS to_location
        FROM inventory_movements m
        LEFT JOIN users u ON u.id = m.user_id
        LEFT JOIN storage_locations fl ON fl.id = m.from_location_id
        LEFT JOIN storage_locations tl ON tl.id = m.to_location_id
        WHERE m.item_id = %s ORDER BY m.created_at DESC LIMIT 200
        ''',
        (item_id,),
    )
    movements = cur.fetchall()

    cur.execute(
        '''
        SELECT p.id, p.price_type, p.old_price, p.new_price, p.created_at,
               u.name AS user_name
        FROM inventory_price_history p
        LEFT JOIN users u ON u.id = p.user_id
        WHERE p.item_id = %s ORDER BY p.created_at DESC LIMIT 100
        ''',
        (item_id,),
    )
    price_history = cur.fetchall()

    cur.execute(
        '''
        SELECT al.id, al.expected_qty, al.actual_qty, al.discrepancy,
               al.comment, al.checked_at, a.title AS audit_title,
               u.name AS checked_by_name
        FROM inventory_audit_lines al
        JOIN inventory_audits a ON a.id = al.audit_id
        LEFT JOIN users u ON u.id = al.checked_by
        WHERE al.item_id = %s AND al.actual_qty IS NOT NULL
        ORDER BY al.checked_at DESC LIMIT 50
        ''',
        (item_id,),
    )
    audits = cur.fetchall()

    # Svyazannye sborki (zadel - beryom iz movements s build_id)
    cur.execute(
        '''
        SELECT DISTINCT m.build_id FROM inventory_movements m
        WHERE m.item_id = %s AND m.build_id IS NOT NULL
        ''',
        (item_id,),
    )
    builds = [r['build_id'] for r in cur.fetchall()]

    return resp(200, {
        'item': item,
        'movements': movements,
        'price_history': price_history,
        'audits': audits,
        'builds': builds,
    })


def create_item(cur, uid, data):
    name = (data.get('name') or '').strip()
    if not name:
        return resp(400, {'error': 'Введите наименование'})

    sku = (data.get('sku') or '').strip() or _gen_sku(cur)
    cur.execute('SELECT id FROM inventory_items WHERE sku = %s', (sku,))
    if cur.fetchone():
        return resp(409, {'error': 'Товар с таким SKU уже существует'})

    qty = int(data.get('quantity') or 0)
    purchase = float(data.get('purchase_price') or 0)

    cur.execute(
        '''
        INSERT INTO inventory_items
        (sku, name, category_id, manufacturer, model, serial_number, quantity,
         low_stock_threshold, purchase_price, avg_purchase_price, last_purchase_price,
         sale_price, condition, status, supplier_id, location_id, photo_url, notes,
         received_at, component_id, created_by)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING id
        ''',
        (
            sku, name, data.get('category_id') or None, data.get('manufacturer'),
            data.get('model'), data.get('serial_number'), qty,
            int(data.get('low_stock_threshold') or 2), purchase, purchase, purchase,
            float(data.get('sale_price') or 0), data.get('condition') or 'new',
            data.get('status') or 'in_stock', data.get('supplier_id') or None,
            data.get('location_id') or None, data.get('photo_url'), data.get('notes'),
            data.get('received_at') or None, data.get('component_id') or None, uid,
        ),
    )
    item_id = cur.fetchone()['id']

    if qty > 0:
        cur.execute(
            '''INSERT INTO inventory_movements
               (item_id, operation, qty_change, qty_after, unit_price, supplier_id, comment, user_id)
               VALUES (%s,'income',%s,%s,%s,%s,%s,%s)''',
            (item_id, qty, qty, purchase, data.get('supplier_id') or None,
             'Первичное оприходование', uid),
        )
    return resp(200, {'ok': True, 'id': item_id, 'sku': sku})


def update_item(cur, uid, data):
    item_id = data.get('id')
    cur.execute('SELECT id, sale_price, purchase_price FROM inventory_items WHERE id = %s', (item_id,))
    old = cur.fetchone()
    if not old:
        return resp(404, {'error': 'Товар не найден'})

    sets = []
    args = []
    for f in ITEM_FIELDS:
        if f in data:
            sets.append(f'{f} = %s')
            val = data[f]
            if f in ('category_id', 'supplier_id', 'location_id', 'component_id',
                     'low_stock_threshold') and val in ('', None):
                val = None
            args.append(val)
    if not sets:
        return resp(400, {'error': 'Нет полей для обновления'})

    sets.append('updated_at = NOW()')
    args.append(item_id)
    cur.execute(f'UPDATE inventory_items SET {", ".join(sets)} WHERE id = %s', args)

    # Zhurnal izmeneniya ceny prodazhi
    if 'sale_price' in data and float(data['sale_price'] or 0) != float(old['sale_price'] or 0):
        cur.execute(
            '''INSERT INTO inventory_price_history (item_id, price_type, old_price, new_price, user_id)
               VALUES (%s,'sale',%s,%s,%s)''',
            (item_id, old['sale_price'], data['sale_price'], uid),
        )
    return resp(200, {'ok': True})
