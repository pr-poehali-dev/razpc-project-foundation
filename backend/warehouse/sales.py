from db import resp, log_unit, log_machine, add_transaction


def _upsert_customer(cur, data):
    name = (data.get('customer_name') or '').strip()
    phone = (data.get('customer_phone') or '').strip()
    if not name and not phone:
        return None
    if phone:
        cur.execute('SELECT id FROM customers WHERE phone = %s LIMIT 1', (phone,))
        ex = cur.fetchone()
        if ex:
            return ex['id']
    cur.execute('INSERT INTO customers (name, phone) VALUES (%s,%s) RETURNING id',
                (name or phone, phone or None))
    return cur.fetchone()['id']


def sell(cur, uid, data):
    '''Prodazha: unit | machine | service.'''
    kind = data.get('kind')
    price = float(data.get('price') or 0)
    account_id = data.get('account_id')
    customer_id = _upsert_customer(cur, data)
    comment = data.get('comment')

    if kind == 'unit':
        unit_id = data.get('unit_id')
        cur.execute("SELECT id, status, machine_id FROM inventory_units WHERE id = %s", (unit_id,))
        u = cur.fetchone()
        if not u:
            return resp(404, {'error': 'Экземпляр не найден'})
        if u['status'] == 'sold':
            return resp(400, {'error': 'Экземпляр уже продан'})
        cur.execute('''UPDATE inventory_units
                       SET status='sold', sold_price=%s, sold_at=NOW(),
                           sold_to_customer_id=%s, order_id=%s, updated_at=NOW()
                       WHERE id=%s''',
                    (price, customer_id, data.get('order_id') or None, unit_id))
        log_unit(cur, unit_id, 'sold', uid, f'Продан за {price} ₽', meta={'price': price})
        if account_id and price > 0:
            add_transaction(cur, uid, account_id, 'income', price, 1,
                            comment=comment or 'Продажа комплектующей', unit_id=unit_id,
                            order_id=data.get('order_id') or None)
        return resp(200, {'ok': True})

    if kind == 'machine':
        machine_id = data.get('machine_id')
        cur.execute("SELECT id, status FROM machines WHERE id = %s", (machine_id,))
        m = cur.fetchone()
        if not m:
            return resp(404, {'error': 'Компьютер не найден'})
        if m['status'] == 'sold':
            return resp(400, {'error': 'Компьютер уже продан'})
        cur.execute('''UPDATE machines SET status='sold', sale_price=%s, sold_at=NOW(),
                       owner_customer_id=%s, order_id=%s, updated_at=NOW() WHERE id=%s''',
                    (price, customer_id, data.get('order_id') or None, machine_id))
        # Vse komplektuyushchie perehodyat v status sold
        cur.execute("SELECT id FROM inventory_units WHERE machine_id = %s", (machine_id,))
        for row in cur.fetchall():
            cur.execute('''UPDATE inventory_units SET status='sold', sold_at=NOW(),
                           sold_to_customer_id=%s, order_id=%s, updated_at=NOW() WHERE id=%s''',
                        (customer_id, data.get('order_id') or None, row['id']))
            log_unit(cur, row['id'], 'sold', uid, 'Продан в составе компьютера', machine_id=machine_id)
        log_machine(cur, machine_id, 'sold', uid, f'Продан за {price} ₽', customer_id=customer_id)
        if account_id and price > 0:
            add_transaction(cur, uid, account_id, 'income', price, 1,
                            comment=comment or 'Продажа компьютера', machine_id=machine_id,
                            order_id=data.get('order_id') or None)
        return resp(200, {'ok': True})

    if kind == 'service':
        if account_id and price > 0:
            add_transaction(cur, uid, account_id, 'income', price, 1,
                            comment=comment or 'Услуга', order_id=data.get('order_id') or None)
        return resp(200, {'ok': True})

    return resp(400, {'error': 'Неизвестный тип продажи'})


def unit_operation(cur, uid, data):
    '''Operacii nad ekzemplyarom: reserve|unreserve|write_off|return|transfer|to_diagnostics|to_repair.'''
    op = data.get('operation')
    unit_id = data.get('unit_id')
    cur.execute("SELECT id, status, machine_id FROM inventory_units WHERE id = %s", (unit_id,))
    u = cur.fetchone()
    if not u:
        return resp(404, {'error': 'Экземпляр не найден'})
    comment = data.get('comment')

    status_map = {
        'reserve': 'reserved', 'unreserve': 'in_stock', 'write_off': 'written_off',
        'return': 'returned', 'to_diagnostics': 'diagnostics', 'to_repair': 'repair',
        'to_stock': 'in_stock',
    }
    if op == 'transfer':
        loc = data.get('location_id')
        cur.execute('UPDATE inventory_units SET location_id=%s, updated_at=NOW() WHERE id=%s', (loc, unit_id))
        log_unit(cur, unit_id, 'transferred', uid, comment or 'Перемещение')
        return resp(200, {'ok': True})

    if op in status_map:
        new_status = status_map[op]
        # esli snimaem so sborki
        clear_machine = op in ('write_off', 'return', 'to_stock') and u['machine_id']
        if clear_machine:
            cur.execute("UPDATE inventory_units SET status=%s, machine_id=NULL, updated_at=NOW() WHERE id=%s",
                        (new_status, unit_id))
            log_unit(cur, unit_id, 'removed_from_build', uid, 'Снят со сборки')
        else:
            cur.execute("UPDATE inventory_units SET status=%s, updated_at=NOW() WHERE id=%s",
                        (new_status, unit_id))
        log_unit(cur, unit_id, op, uid, comment)
        return resp(200, {'ok': True})

    return resp(400, {'error': 'Неизвестная операция'})
