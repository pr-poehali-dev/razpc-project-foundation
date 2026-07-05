from db import resp


def list_audits(cur):
    cur.execute(
        '''
        SELECT a.id, a.title, a.status, a.started_at, a.completed_at,
               u.name AS started_by_name,
               COUNT(al.id) AS total_lines,
               COUNT(al.id) FILTER (WHERE al.actual_qty IS NOT NULL) AS checked_lines,
               COUNT(al.id) FILTER (WHERE al.discrepancy <> 0) AS discrepancies
        FROM inventory_audits a
        LEFT JOIN users u ON u.id = a.started_by
        LEFT JOIN inventory_audit_lines al ON al.audit_id = a.id
        GROUP BY a.id, u.name
        ORDER BY a.started_at DESC LIMIT 100
        ''',
    )
    return resp(200, {'audits': cur.fetchall()})


def get_audit(cur, audit_id):
    cur.execute(
        '''SELECT a.*, u.name AS started_by_name FROM inventory_audits a
           LEFT JOIN users u ON u.id = a.started_by WHERE a.id = %s''',
        (audit_id,),
    )
    audit = cur.fetchone()
    if not audit:
        return resp(404, {'error': 'Инвентаризация не найдена'})

    cur.execute(
        '''
        SELECT al.id, al.item_id, al.expected_qty, al.actual_qty, al.discrepancy,
               al.comment, al.checked_at, i.name AS item_name, i.sku,
               u.name AS checked_by_name
        FROM inventory_audit_lines al
        JOIN inventory_items i ON i.id = al.item_id
        LEFT JOIN users u ON u.id = al.checked_by
        WHERE al.audit_id = %s ORDER BY i.name
        ''',
        (audit_id,),
    )
    return resp(200, {'audit': audit, 'lines': cur.fetchall()})


def start_audit(cur, uid, data):
    '''Nachat inventarizaciyu: sozdaet sessiyu i stroki po vsem (ili filtr.) tovaram.'''
    title = (data.get('title') or '').strip() or 'Инвентаризация'
    category_id = data.get('category_id')

    cur.execute(
        'INSERT INTO inventory_audits (title, started_by) VALUES (%s,%s) RETURNING id',
        (title, uid),
    )
    audit_id = cur.fetchone()['id']

    where = ''
    args = [audit_id]
    if category_id:
        where = 'WHERE category_id = %s'
        args.append(category_id)

    cur.execute(
        f'''
        INSERT INTO inventory_audit_lines (audit_id, item_id, expected_qty)
        SELECT %s, id, quantity FROM inventory_items {where}
        ''',
        args,
    )
    return resp(200, {'ok': True, 'id': audit_id})


def save_audit_line(cur, uid, data):
    '''Sohranit fakticheskoe kolichestvo po pozicii.'''
    line_id = data.get('line_id')
    actual = data.get('actual_qty')
    if actual is None:
        return resp(400, {'error': 'Введите фактическое количество'})
    actual = int(actual)

    cur.execute('SELECT expected_qty FROM inventory_audit_lines WHERE id = %s', (line_id,))
    line = cur.fetchone()
    if not line:
        return resp(404, {'error': 'Строка не найдена'})

    discrepancy = actual - line['expected_qty']
    cur.execute(
        '''UPDATE inventory_audit_lines
           SET actual_qty=%s, discrepancy=%s, comment=%s, checked_by=%s, checked_at=NOW()
           WHERE id=%s''',
        (actual, discrepancy, data.get('comment'), uid, line_id),
    )
    return resp(200, {'ok': True, 'discrepancy': discrepancy})


def complete_audit(cur, uid, data):
    '''Zavershit inventarizaciyu i primenit korrektirovki ostatkov.'''
    audit_id = data.get('id')
    apply_changes = data.get('apply', True)

    cur.execute('SELECT status FROM inventory_audits WHERE id = %s', (audit_id,))
    audit = cur.fetchone()
    if not audit:
        return resp(404, {'error': 'Инвентаризация не найдена'})
    if audit['status'] == 'completed':
        return resp(400, {'error': 'Инвентаризация уже завершена'})

    if apply_changes:
        cur.execute(
            '''SELECT item_id, actual_qty, discrepancy FROM inventory_audit_lines
               WHERE audit_id = %s AND actual_qty IS NOT NULL AND discrepancy <> 0''',
            (audit_id,),
        )
        for line in cur.fetchall():
            cur.execute(
                'UPDATE inventory_items SET quantity=%s, updated_at=NOW() WHERE id=%s',
                (line['actual_qty'], line['item_id']),
            )
            cur.execute(
                '''INSERT INTO inventory_movements
                   (item_id, operation, qty_change, qty_after, comment, user_id)
                   VALUES (%s,'inventory',%s,%s,%s,%s)''',
                (line['item_id'], line['discrepancy'], line['actual_qty'],
                 'Корректировка по инвентаризации', uid),
            )

    cur.execute(
        "UPDATE inventory_audits SET status='completed', completed_at=NOW() WHERE id=%s",
        (audit_id,),
    )
    return resp(200, {'ok': True})
