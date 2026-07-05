from datetime import date, datetime, timedelta

from db import resp

STATUSES = ['new', 'approval', 'paid', 'assembly', 'ready', 'delivered', 'canceled']


def _gen_order_number(cur):
    cur.execute("SELECT COALESCE(MAX(id), 0) + 1 AS n FROM orders")
    n = cur.fetchone()['n']
    return f"RZ-{datetime.now():%y%m}-{n:04d}"


def _recalc_customer(cur, customer_id):
    if not customer_id:
        return
    cur.execute(
        '''
        UPDATE customers SET
            orders_count = (SELECT COUNT(*) FROM orders WHERE customer_id = %s AND status <> 'canceled'),
            total_spent = (SELECT COALESCE(SUM(paid_amount), 0) FROM orders WHERE customer_id = %s AND status <> 'canceled'),
            updated_at = NOW()
        WHERE id = %s
        ''',
        (customer_id, customer_id, customer_id),
    )


def list_orders(cur, params):
    status = params.get('status')
    search = (params.get('search') or '').strip()
    where = []
    args = []
    if status and status in STATUSES:
        where.append('o.status = %s')
        args.append(status)
    if search:
        where.append('(o.order_number ILIKE %s OR c.name ILIKE %s OR c.phone ILIKE %s OR o.title ILIKE %s)')
        like = f'%{search}%'
        args.extend([like, like, like, like])
    clause = ('WHERE ' + ' AND '.join(where)) if where else ''
    cur.execute(
        f'''
        SELECT o.id, o.order_number, o.status, o.source, o.title,
               o.total_amount, o.paid_amount, o.cost_amount,
               o.warranty_until, o.purchase_date, o.created_at, o.updated_at,
               c.id AS customer_id, c.name AS customer_name, c.phone AS customer_phone
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        {clause}
        ORDER BY o.created_at DESC
        LIMIT 300
        ''',
        args,
    )
    return resp(200, {'orders': cur.fetchall(), 'statuses': STATUSES})


def get_order(cur, oid):
    cur.execute(
        '''
        SELECT o.*, c.name AS customer_name, c.phone AS customer_phone,
               c.email AS customer_email, c.city AS customer_city
        FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
        WHERE o.id = %s
        ''',
        (oid,),
    )
    order = cur.fetchone()
    if not order:
        return resp(404, {'error': 'Заказ не найден'})
    cur.execute('SELECT * FROM order_items WHERE order_id = %s ORDER BY position, id', (oid,))
    order['items'] = cur.fetchall()
    cur.execute(
        'SELECT * FROM order_status_history WHERE order_id = %s ORDER BY created_at DESC',
        (oid,),
    )
    order['history'] = cur.fetchall()
    return resp(200, order)


def _upsert_customer(cur, data):
    '''Nahodit klienta po telefonu/email ili sozdaet novogo. Vozvrashchaet id.'''
    cid = data.get('customer_id')
    if cid:
        return cid
    phone = (data.get('customer_phone') or '').strip()
    email = (data.get('customer_email') or '').strip()
    name = (data.get('customer_name') or 'Клиент').strip()
    if phone or email:
        cur.execute(
            'SELECT id FROM customers WHERE (phone = %s AND %s <> \'\') OR (email = %s AND %s <> \'\') LIMIT 1',
            (phone, phone, email, email),
        )
        row = cur.fetchone()
        if row:
            return row['id']
    cur.execute(
        'INSERT INTO customers (name, phone, email, city) VALUES (%s, %s, %s, %s) RETURNING id',
        (name, phone or None, email or None, data.get('customer_city')),
    )
    return cur.fetchone()['id']


def create_order(cur, uid, data):
    customer_id = _upsert_customer(cur, data)
    number = _gen_order_number(cur)
    warranty_months = int(data.get('warranty_months') or 36)
    purchase_date = data.get('purchase_date')
    warranty_until = None
    if purchase_date:
        try:
            pd = datetime.strptime(purchase_date, '%Y-%m-%d').date()
            warranty_until = pd + timedelta(days=warranty_months * 30)
        except ValueError:
            purchase_date = None

    cur.execute(
        '''
        INSERT INTO orders
            (order_number, customer_id, build_id, status, source, title,
             total_amount, paid_amount, cost_amount, comment, manager_id,
             warranty_months, warranty_until, purchase_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        ''',
        (
            number, customer_id, data.get('build_id'),
            data.get('status') or 'new', data.get('source') or 'manual',
            data.get('title'),
            int(data.get('total_amount') or 0), int(data.get('paid_amount') or 0),
            int(data.get('cost_amount') or 0), data.get('comment'), uid,
            warranty_months, warranty_until, purchase_date,
        ),
    )
    oid = cur.fetchone()['id']

    for i, item in enumerate(data.get('items') or []):
        cur.execute(
            'INSERT INTO order_items (order_id, name, qty, price, cost, position) VALUES (%s, %s, %s, %s, %s, %s)',
            (oid, item.get('name', 'Позиция'), int(item.get('qty') or 1),
             int(item.get('price') or 0), int(item.get('cost') or 0), i),
        )

    cur.execute(
        'INSERT INTO order_status_history (order_id, to_status, changed_by, comment) VALUES (%s, %s, %s, %s)',
        (oid, data.get('status') or 'new', uid, 'Заказ создан'),
    )
    _recalc_customer(cur, customer_id)
    return resp(200, {'ok': True, 'id': oid, 'order_number': number})


ORDER_FIELDS = {
    'title', 'total_amount', 'paid_amount', 'cost_amount', 'comment',
    'build_id', 'warranty_months', 'warranty_until', 'purchase_date',
}


def update_order(cur, uid, data):
    oid = data.get('id')
    if not oid:
        return resp(400, {'error': 'Не указан заказ'})

    cur.execute('SELECT status, customer_id FROM orders WHERE id = %s', (oid,))
    cur_row = cur.fetchone()
    if not cur_row:
        return resp(404, {'error': 'Заказ не найден'})

    # Smena statusa s zapisyu v istoriyu
    new_status = data.get('status')
    if new_status and new_status in STATUSES and new_status != cur_row['status']:
        closed = 'closed_at = NOW(),' if new_status in ('delivered', 'canceled') else ''
        cur.execute(
            f'UPDATE orders SET status = %s, {closed} updated_at = NOW() WHERE id = %s',
            (new_status, oid),
        )
        cur.execute(
            'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, comment) VALUES (%s, %s, %s, %s, %s)',
            (oid, cur_row['status'], new_status, uid, data.get('status_comment')),
        )

    fields = {k: v for k, v in data.items() if k in ORDER_FIELDS}
    if fields:
        parts, vals = [], []
        for k, v in fields.items():
            parts.append(f'{k} = %s')
            vals.append(v)
        vals.append(oid)
        cur.execute(f'UPDATE orders SET {", ".join(parts)}, updated_at = NOW() WHERE id = %s', vals)

    # Perezapis pozicii esli peredany
    if 'items' in data:
        cur.execute('DELETE FROM order_items WHERE order_id = %s', (oid,))
        for i, item in enumerate(data['items']):
            cur.execute(
                'INSERT INTO order_items (order_id, name, qty, price, cost, position) VALUES (%s, %s, %s, %s, %s, %s)',
                (oid, item.get('name', 'Позиция'), int(item.get('qty') or 1),
                 int(item.get('price') or 0), int(item.get('cost') or 0), i),
            )

    _recalc_customer(cur, cur_row['customer_id'])
    return resp(200, {'ok': True})
