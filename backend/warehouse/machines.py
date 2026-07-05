from db import resp, next_number, log_unit, log_machine, add_transaction
from models_units import find_or_create_model


def build_machine(cur, uid, data):
    '''Master sborki: sozdaet kompyuter i privyazyvaet ekzemplyary komplektuyushchih.
    Istochniki chastey: stock (unit_id), lot (unit_id), custom (novyy unit bez partii).'''
    name = (data.get('name') or '').strip()
    if not name:
        return resp(400, {'error': 'Введите название компьютера'})
    parts = data.get('parts') or []
    if not parts:
        return resp(400, {'error': 'Добавьте комплектующие'})

    machine_number = next_number(cur, 'machine')
    labor = float(data.get('labor_cost') or 0)
    cur.execute('''
        INSERT INTO machines (machine_number, name, serial_number, builder_id, labor_cost,
                             sale_price, status, comment, created_by)
        VALUES (%s,%s,%s,%s,%s,%s,'assembling',%s,%s) RETURNING id
    ''', (machine_number, name, data.get('serial_number'),
          data.get('builder_id') or uid, labor,
          float(data.get('sale_price') or 0), data.get('comment'), uid))
    machine_id = cur.fetchone()['id']

    parts_cost = 0.0
    for p in parts:
        unit_id = p.get('unit_id')
        if not unit_id and p.get('source') == 'custom':
            # vneshnyaya komplektuyushchaya: sozdaem model i ekzemplyar
            model_id = find_or_create_model(cur, uid, p)
            if not model_id:
                continue
            num = next_number(cur, 'unit')
            cur.execute('''
                INSERT INTO inventory_units
                (unit_number, model_id, serial_number, condition, status, purchase_cost, sale_price, created_by)
                VALUES (%s,%s,%s,%s,'in_stock',%s,%s,%s) RETURNING id
            ''', (num, model_id, p.get('serial_number'), p.get('condition') or 'new',
                  float(p.get('unit_cost') or 0), float(p.get('sale_price') or 0), uid))
            unit_id = cur.fetchone()['id']
            log_unit(cur, unit_id, 'created', uid, 'Внешняя комплектующая для сборки')

        if not unit_id:
            continue
        cur.execute('SELECT purchase_cost, status FROM inventory_units WHERE id = %s', (unit_id,))
        u = cur.fetchone()
        if not u:
            continue
        parts_cost += float(u['purchase_cost'] or 0)
        cur.execute("UPDATE inventory_units SET machine_id=%s, status='in_build', updated_at=NOW() WHERE id=%s",
                    (machine_id, unit_id))
        log_unit(cur, unit_id, 'in_build', uid, f'Установлен в {machine_number}', machine_id=machine_id)
        log_machine(cur, machine_id, 'built', uid, 'Установлена комплектующая', unit_id=unit_id)

    total_cost = parts_cost + labor
    cur.execute('''UPDATE machines SET parts_cost=%s, total_cost=%s, status='in_stock', updated_at=NOW()
                   WHERE id=%s''', (round(parts_cost, 2), round(total_cost, 2), machine_id))
    log_machine(cur, machine_id, 'built', uid, f'Сборка завершена. Себестоимость: {total_cost}')

    return resp(200, {'ok': True, 'machine_id': machine_id, 'machine_number': machine_number})


def list_machines(cur, params):
    where, args = [], []
    if params.get('status'):
        where.append('m.status = %s')
        args.append(params['status'])
    search = (params.get('search') or '').strip()
    if search:
        where.append('(m.name ILIKE %s OR m.machine_number ILIKE %s OR m.serial_number ILIKE %s)')
        like = f'%{search}%'
        args += [like, like, like]
    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''
    cur.execute(f'''
        SELECT m.id, m.machine_number, m.name, m.serial_number, m.build_date,
               m.labor_cost, m.parts_cost, m.total_cost, m.sale_price, m.status,
               m.created_at, b.name AS builder_name,
               COUNT(u.id) AS parts_count,
               (m.sale_price - m.total_cost) AS profit
        FROM machines m
        LEFT JOIN users b ON b.id = m.builder_id
        LEFT JOIN inventory_units u ON u.machine_id = m.id
        {where_sql}
        GROUP BY m.id, b.name
        ORDER BY m.created_at DESC LIMIT 300
    ''', args)
    return resp(200, {'machines': cur.fetchall()})


def get_machine(cur, machine_id):
    cur.execute('''
        SELECT m.*, b.name AS builder_name, cust.name AS owner_name,
               (m.sale_price - m.total_cost) AS profit,
               CASE WHEN m.sale_price > 0 THEN ROUND((m.sale_price - m.total_cost)/m.sale_price*100,1) ELSE 0 END AS margin_pct
        FROM machines m
        LEFT JOIN users b ON b.id = m.builder_id
        LEFT JOIN customers cust ON cust.id = m.owner_customer_id
        WHERE m.id = %s
    ''', (machine_id,))
    machine = cur.fetchone()
    if not machine:
        return resp(404, {'error': 'Компьютер не найден'})
    cur.execute('''
        SELECT u.id, u.unit_number, u.serial_number, u.status, u.condition,
               u.purchase_cost, u.sale_price,
               pm.name AS model_name, pm.sku, c.title AS category_title, c.icon AS category_icon,
               u.lot_id, l.lot_number, l.is_disassembly, l.machine_title AS origin_machine
        FROM inventory_units u
        JOIN product_models pm ON pm.id = u.model_id
        LEFT JOIN inventory_categories c ON c.id = pm.category_id
        LEFT JOIN lots l ON l.id = u.lot_id
        WHERE u.machine_id = %s ORDER BY c.sort_order NULLS LAST, pm.name
    ''', (machine_id,))
    parts = cur.fetchall()
    cur.execute('''
        SELECT e.id, e.event_type, e.comment, e.created_at, us.name AS user_name
        FROM machine_events e LEFT JOIN users us ON us.id = e.user_id
        WHERE e.machine_id = %s ORDER BY e.created_at DESC
    ''', (machine_id,))
    events = cur.fetchall()
    return resp(200, {'machine': machine, 'parts': parts, 'events': events})


def update_machine(cur, uid, data):
    mid = data.get('id')
    cur.execute('SELECT id FROM machines WHERE id = %s', (mid,))
    if not cur.fetchone():
        return resp(404, {'error': 'Компьютер не найден'})
    fields = ('name', 'serial_number', 'sale_price', 'labor_cost', 'status', 'comment', 'builder_id')
    sets, args = [], []
    for f in fields:
        if f in data:
            sets.append(f'{f} = %s')
            args.append(data[f])
    if not sets:
        return resp(400, {'error': 'Нет данных'})
    sets.append('updated_at = NOW()')
    args.append(mid)
    cur.execute(f'UPDATE machines SET {", ".join(sets)} WHERE id = %s', args)
    return resp(200, {'ok': True})
