from db import resp, next_number, log_unit, add_transaction
from models_units import find_or_create_model


def _create_units(cur, uid, model_id, lot_id, count, serials, unit_cost, sale_price,
                  condition='new', location_id=None):
    '''Sozdaet count ekzemplyarov modeli, privyazannyh k partii.'''
    created = []
    for i in range(count):
        num = next_number(cur, 'unit')
        sn = serials[i] if i < len(serials) and serials[i] else None
        cur.execute('''
            INSERT INTO inventory_units
            (unit_number, model_id, serial_number, lot_id, condition, status,
             location_id, purchase_cost, sale_price, created_by)
            VALUES (%s,%s,%s,%s,%s,'in_stock',%s,%s,%s,%s) RETURNING id
        ''', (num, model_id, sn, lot_id, condition, location_id,
              round(unit_cost, 2), round(sale_price, 2), uid))
        uid_new = cur.fetchone()['id']
        log_unit(cur, uid_new, 'received', uid, 'Приёмка на склад', lot_id=lot_id)
        created.append(uid_new)
    return created


def receive(cur, uid, data):
    '''Priemka: sozdaet partiyu i ekzemplyary po spisku modeley.'''
    items = data.get('items') or []
    if not items:
        return resp(400, {'error': 'Добавьте хотя бы одну позицию'})

    lot_number = next_number(cur, 'lot')
    total_cost = float(data.get('purchase_cost') or 0)
    cur.execute('''
        INSERT INTO lots (lot_number, source, purchase_method, supplier_id,
                          counterparty_id, account_id, purchase_cost, purchase_date,
                          comment, created_by)
        VALUES (%s,'purchase',%s,%s,%s,%s,%s,COALESCE(%s,CURRENT_DATE),%s,%s) RETURNING id
    ''', (lot_number, data.get('purchase_method'), data.get('supplier_id') or None,
          data.get('counterparty_id') or None, data.get('account_id') or None,
          total_cost, data.get('purchase_date') or None, data.get('comment'), uid))
    lot_id = cur.fetchone()['id']

    total_created = 0
    for it in items:
        model_id = find_or_create_model(cur, uid, it)
        if not model_id:
            continue
        qty = int(it.get('qty') or 1)
        serials = it.get('serials') or []
        unit_cost = float(it.get('unit_cost') or 0)
        sale_price = float(it.get('sale_price') or 0)
        _create_units(cur, uid, model_id, lot_id, qty, serials, unit_cost, sale_price,
                      it.get('condition') or 'new', data.get('location_id') or None)
        total_created += qty

    # Finansovaya operaciya: rashod so scheta
    if data.get('account_id') and total_cost > 0:
        add_transaction(cur, uid, data['account_id'], 'expense', total_cost, -1,
                        comment=f'Закупка {lot_number}', lot_id=lot_id,
                        counterparty_id=data.get('counterparty_id') or None)

    return resp(200, {'ok': True, 'lot_id': lot_id, 'lot_number': lot_number, 'units': total_created})


def create_disassembly(cur, uid, data):
    '''Kompyuter na razbor: sozdaet partiyu i ekzemplyary komplektuyushchih.
    Sebestoimost raspredelyaetsya po ocenochnoy cene prodazhi.'''
    parts = data.get('parts') or []
    if not parts:
        return resp(400, {'error': 'Добавьте хотя бы одну комплектующую'})
    total_cost = float(data.get('purchase_cost') or 0)

    lot_number = next_number(cur, 'lot')
    cur.execute('''
        INSERT INTO lots (lot_number, source, supplier_id, counterparty_id, account_id,
                          purchase_cost, purchase_date, comment, is_disassembly,
                          machine_title, created_by)
        VALUES (%s,'disassembly',%s,%s,%s,%s,COALESCE(%s,CURRENT_DATE),%s,TRUE,%s,%s) RETURNING id
    ''', (lot_number, data.get('supplier_id') or None, data.get('counterparty_id') or None,
          data.get('account_id') or None, total_cost, data.get('purchase_date') or None,
          data.get('comment'), data.get('machine_title') or 'Выкупленный компьютер', uid))
    lot_id = cur.fetchone()['id']

    total_estimate = sum(float(p.get('sale_price') or 0) for p in parts) or 1

    created = 0
    for p in parts:
        model_id = find_or_create_model(cur, uid, p)
        if not model_id:
            continue
        sale_price = float(p.get('sale_price') or 0)
        # raspredelenie sebestoimosti proporcionalno ocenke
        unit_cost = total_cost * (sale_price / total_estimate) if total_cost else 0
        serials = [p['serial_number']] if p.get('serial_number') else []
        _create_units(cur, uid, model_id, lot_id, 1, serials, unit_cost, sale_price,
                      p.get('condition') or 'used', data.get('location_id') or None)
        created += 1

    if data.get('account_id') and total_cost > 0:
        add_transaction(cur, uid, data['account_id'], 'expense', total_cost, -1,
                        comment=f'Выкуп ПК {lot_number}', lot_id=lot_id,
                        counterparty_id=data.get('counterparty_id') or None)

    return resp(200, {'ok': True, 'lot_id': lot_id, 'lot_number': lot_number, 'parts': created})


def list_lots(cur, params):
    where, args = [], []
    if params.get('source'):
        where.append('l.source = %s')
        args.append(params['source'])
    search = (params.get('search') or '').strip()
    if search:
        where.append('(l.lot_number ILIKE %s OR l.comment ILIKE %s OR l.machine_title ILIKE %s)')
        like = f'%{search}%'
        args += [like, like, like]
    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''
    cur.execute(f'''
        SELECT l.id, l.lot_number, l.source, l.purchase_cost, l.purchase_date,
               l.comment, l.is_disassembly, l.machine_title, l.status, l.created_at,
               s.name AS supplier_name,
               COUNT(u.id) AS units_total,
               COUNT(u.id) FILTER (WHERE u.status IN ('in_stock','reserved','in_build')) AS units_left,
               COUNT(u.id) FILTER (WHERE u.status = 'sold') AS units_sold,
               COALESCE(SUM(u.sale_price),0) AS estimate_value,
               COALESCE(SUM(u.sold_price) FILTER (WHERE u.status='sold'),0) AS sold_value
        FROM lots l
        LEFT JOIN suppliers s ON s.id = l.supplier_id
        LEFT JOIN inventory_units u ON u.lot_id = l.id
        {where_sql}
        GROUP BY l.id, s.name
        ORDER BY l.created_at DESC LIMIT 300
    ''', args)
    return resp(200, {'lots': cur.fetchall()})


def get_lot(cur, lot_id):
    cur.execute('''
        SELECT l.*, s.name AS supplier_name, cp.name AS counterparty_name,
               a.name AS account_name, us.name AS created_by_name
        FROM lots l
        LEFT JOIN suppliers s ON s.id = l.supplier_id
        LEFT JOIN counterparties cp ON cp.id = l.counterparty_id
        LEFT JOIN accounts a ON a.id = l.account_id
        LEFT JOIN users us ON us.id = l.created_by
        WHERE l.id = %s
    ''', (lot_id,))
    lot = cur.fetchone()
    if not lot:
        return resp(404, {'error': 'Партия не найдена'})
    cur.execute('''
        SELECT u.id, u.unit_number, u.serial_number, u.status, u.condition,
               u.purchase_cost, u.sale_price, u.sold_price, u.sold_at,
               u.order_id, u.machine_id,
               pm.name AS model_name, pm.sku, c.title AS category_title,
               m.machine_number, cust.name AS sold_to_name
        FROM inventory_units u
        JOIN product_models pm ON pm.id = u.model_id
        LEFT JOIN inventory_categories c ON c.id = pm.category_id
        LEFT JOIN machines m ON m.id = u.machine_id
        LEFT JOIN customers cust ON cust.id = u.sold_to_customer_id
        WHERE u.lot_id = %s ORDER BY u.id
    ''', (lot_id,))
    units = cur.fetchall()

    estimate = sum(float(u['sale_price'] or 0) for u in units)
    sold = sum(float(u['sold_price'] or 0) for u in units if u['status'] == 'sold')
    left_estimate = sum(float(u['sale_price'] or 0) for u in units if u['status'] != 'sold')
    analytics = {
        'purchase_cost': float(lot['purchase_cost'] or 0),
        'estimate_value': estimate,
        'sold_value': sold,
        'left_estimate': left_estimate,
        'potential_profit': estimate - float(lot['purchase_cost'] or 0),
        'realized_profit': sold - float(lot['purchase_cost'] or 0),
        'units_total': len(units),
        'units_sold': sum(1 for u in units if u['status'] == 'sold'),
        'units_left': sum(1 for u in units if u['status'] != 'sold'),
    }
    return resp(200, {'lot': lot, 'units': units, 'analytics': analytics})
