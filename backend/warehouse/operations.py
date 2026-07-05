from db import resp

# Operacii, kotorye uvelichivayut ostatok
INCOME_OPS = ('income', 'return', 'correction')
# Operacii, kotorye umenshayut ostatok
OUTCOME_OPS = ('sale', 'build', 'write_off', 'correction')


def _get_item(cur, item_id):
    cur.execute(
        'SELECT id, quantity, reserved_qty, avg_purchase_price, purchase_price, '
        'last_purchase_price, location_id FROM inventory_items WHERE id = %s',
        (item_id,),
    )
    return cur.fetchone()


def do_operation(cur, uid, data):
    '''Universalnaya obrabotka dvizheniya tovara.'''
    op = data.get('operation')
    item_id = data.get('item_id')
    item = _get_item(cur, item_id)
    if not item:
        return resp(404, {'error': 'Товар не найден'})

    qty = int(data.get('qty') or 0)
    comment = data.get('comment')
    current = item['quantity']

    if op == 'income':
        if qty <= 0:
            return resp(400, {'error': 'Количество должно быть больше нуля'})
        price = float(data.get('unit_price') or item['purchase_price'] or 0)
        new_qty = current + qty
        # Peresch. sredney zakupochnoy ceny
        old_total = float(item['avg_purchase_price'] or 0) * current
        new_avg = (old_total + price * qty) / new_qty if new_qty else price
        cur.execute(
            '''UPDATE inventory_items SET quantity=%s, avg_purchase_price=%s,
               last_purchase_price=%s, purchase_price=%s, received_at=CURRENT_DATE,
               status=CASE WHEN status='awaiting_supply' THEN 'in_stock' ELSE status END,
               updated_at=NOW() WHERE id=%s''',
            (new_qty, round(new_avg, 2), price, price, item_id),
        )
        _log(cur, item_id, 'income', qty, new_qty, uid, comment,
             unit_price=price, supplier_id=data.get('supplier_id'),
             to_location=data.get('location_id'))

    elif op == 'reserve':
        if qty <= 0 or qty > current - item['reserved_qty']:
            return resp(400, {'error': 'Недостаточно свободного остатка для резерва'})
        cur.execute(
            "UPDATE inventory_items SET reserved_qty=reserved_qty+%s, "
            "status=CASE WHEN reserved_qty+%s>=quantity THEN 'reserved' ELSE status END, "
            "updated_at=NOW() WHERE id=%s",
            (qty, qty, item_id),
        )
        _log(cur, item_id, 'reserve', 0, current, uid, comment,
             order_id=data.get('order_id'))

    elif op in ('build', 'sale', 'write_off'):
        if qty <= 0 or qty > current:
            return resp(400, {'error': 'Недостаточно товара на складе'})
        new_qty = current - qty
        # Snimaem rezerv esli byl
        release = min(qty, item['reserved_qty'])
        status_map = {'build': 'in_build', 'sale': 'sold', 'write_off': 'written_off'}
        new_status = status_map[op] if new_qty == 0 else 'in_stock'
        cur.execute(
            'UPDATE inventory_items SET quantity=%s, reserved_qty=GREATEST(0,reserved_qty-%s), '
            'status=%s, updated_at=NOW() WHERE id=%s',
            (new_qty, release, new_status, item_id),
        )
        _log(cur, item_id, op, -qty, new_qty, uid, comment,
             order_id=data.get('order_id'), build_id=data.get('build_id'))

    elif op == 'return':
        if qty <= 0:
            return resp(400, {'error': 'Количество должно быть больше нуля'})
        new_qty = current + qty
        cur.execute(
            "UPDATE inventory_items SET quantity=%s, status='in_stock', updated_at=NOW() WHERE id=%s",
            (new_qty, item_id),
        )
        _log(cur, item_id, 'return', qty, new_qty, uid, comment,
             order_id=data.get('order_id'))

    elif op == 'transfer':
        to_loc = data.get('to_location_id')
        if not to_loc:
            return resp(400, {'error': 'Укажите место назначения'})
        cur.execute(
            'UPDATE inventory_items SET location_id=%s, updated_at=NOW() WHERE id=%s',
            (to_loc, item_id),
        )
        _log(cur, item_id, 'transfer', 0, current, uid, comment,
             from_location=item['location_id'], to_location=to_loc)

    elif op == 'correction':
        new_qty = int(data.get('new_qty') if data.get('new_qty') is not None else current)
        if new_qty < 0:
            return resp(400, {'error': 'Остаток не может быть отрицательным'})
        diff = new_qty - current
        cur.execute(
            'UPDATE inventory_items SET quantity=%s, updated_at=NOW() WHERE id=%s',
            (new_qty, item_id),
        )
        _log(cur, item_id, 'correction', diff, new_qty, uid,
             comment or 'Ручная корректировка остатка')

    else:
        return resp(400, {'error': 'Неизвестная операция'})

    return resp(200, {'ok': True})


def _log(cur, item_id, operation, qty_change, qty_after, uid, comment,
         unit_price=None, supplier_id=None, order_id=None, build_id=None,
         from_location=None, to_location=None):
    cur.execute(
        '''INSERT INTO inventory_movements
           (item_id, operation, qty_change, qty_after, unit_price, supplier_id,
            order_id, build_id, from_location_id, to_location_id, comment, user_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
        (item_id, operation, qty_change, qty_after, unit_price,
         supplier_id or None, order_id or None, build_id or None,
         from_location or None, to_location or None, comment, uid),
    )


def list_movements(cur, params):
    '''Poslednie dvizheniya po vsemu skladu (dlya dashboard).'''
    limit = int(params.get('limit') or 30)
    cur.execute(
        '''
        SELECT m.id, m.operation, m.qty_change, m.qty_after, m.comment, m.created_at,
               i.name AS item_name, i.sku, u.name AS user_name
        FROM inventory_movements m
        JOIN inventory_items i ON i.id = m.item_id
        LEFT JOIN users u ON u.id = m.user_id
        ORDER BY m.created_at DESC LIMIT %s
        ''',
        (limit,),
    )
    return resp(200, {'movements': cur.fetchall()})
