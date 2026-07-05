from db import resp


def list_customers(cur, params):
    search = (params.get('search') or '').strip()
    where = ''
    args = []
    if search:
        where = 'WHERE name ILIKE %s OR phone ILIKE %s OR email ILIKE %s'
        like = f'%{search}%'
        args = [like, like, like]
    cur.execute(
        f'''
        SELECT id, name, phone, email, telegram, city, notes,
               total_spent, orders_count, created_at
        FROM customers {where}
        ORDER BY updated_at DESC LIMIT 300
        ''',
        args,
    )
    return resp(200, {'customers': cur.fetchall()})


def get_customer(cur, cid):
    cur.execute('SELECT * FROM customers WHERE id = %s', (cid,))
    c = cur.fetchone()
    if not c:
        return resp(404, {'error': 'Клиент не найден'})
    cur.execute(
        '''
        SELECT id, order_number, status, title, total_amount, paid_amount,
               warranty_until, purchase_date, created_at
        FROM orders WHERE customer_id = %s ORDER BY created_at DESC
        ''',
        (cid,),
    )
    c['orders'] = cur.fetchall()
    return resp(200, c)


CUSTOMER_FIELDS = {'name', 'phone', 'email', 'telegram', 'city', 'notes'}


def save_customer(cur, data):
    cid = data.get('id')
    fields = {k: v for k, v in data.items() if k in CUSTOMER_FIELDS}
    if cid:
        if not fields:
            return resp(400, {'error': 'Нет данных'})
        parts, vals = [], []
        for k, v in fields.items():
            parts.append(f'{k} = %s')
            vals.append(v)
        vals.append(cid)
        cur.execute(f'UPDATE customers SET {", ".join(parts)}, updated_at = NOW() WHERE id = %s RETURNING id', vals)
        if not cur.fetchone():
            return resp(404, {'error': 'Клиент не найден'})
        return resp(200, {'ok': True, 'id': cid})
    cur.execute(
        'INSERT INTO customers (name, phone, email, telegram, city, notes) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
        (data.get('name') or 'Клиент', data.get('phone'), data.get('email'),
         data.get('telegram'), data.get('city'), data.get('notes')),
    )
    return resp(200, {'ok': True, 'id': cur.fetchone()['id']})
