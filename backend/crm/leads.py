from db import resp

LEAD_STATUSES = ['new', 'in_work', 'converted', 'rejected']


def create_lead(cur, data):
    '''Publichnoe sozdanie zayavki s sayta (bez avtorizacii).'''
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    email = (data.get('email') or '').strip()
    if not phone and not email:
        return resp(400, {'error': 'Укажите телефон или email'})
    cur.execute(
        '''
        INSERT INTO leads (name, phone, email, message, build_id, build_name, source, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, 'new')
        RETURNING id
        ''',
        (name or 'Без имени', phone or None, email or None, data.get('message'),
         data.get('build_id'), data.get('build_name'),
         data.get('source') or 'site'),
    )
    return resp(200, {'ok': True, 'id': cur.fetchone()['id']})


def list_leads(cur, params):
    status = params.get('status')
    where = ''
    args = []
    if status and status in LEAD_STATUSES:
        where = 'WHERE status = %s'
        args = [status]
    cur.execute(
        f'''
        SELECT id, name, phone, email, message, build_id, build_name,
               source, status, order_id, created_at, processed_at
        FROM leads {where}
        ORDER BY created_at DESC LIMIT 300
        ''',
        args,
    )
    return resp(200, {'leads': cur.fetchall(), 'statuses': LEAD_STATUSES})


def update_lead(cur, uid, data):
    lid = data.get('id')
    status = data.get('status')
    if not lid or status not in LEAD_STATUSES:
        return resp(400, {'error': 'Некорректные данные'})
    processed = 'processed_at = NOW(),' if status != 'new' else ''
    cur.execute(
        f'UPDATE leads SET status = %s, {processed} manager_id = %s WHERE id = %s RETURNING id',
        (status, uid, lid),
    )
    if not cur.fetchone():
        return resp(404, {'error': 'Заявка не найдена'})
    return resp(200, {'ok': True})
