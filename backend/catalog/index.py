import json
import os

import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}

EDITABLE_FIELDS = {
    'name', 'tagline', 'price', 'old_price', 'image_url', 'tier',
    'performance_badge', 'status', 'warranty', 'is_featured', 'is_archived',
}


def _resp(status, body):
    return {
        'statusCode': status,
        'headers': CORS,
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def _admin_id(cur, token):
    '''Vozvrashchaet user_id esli token prinadlezhit adminu, inache None.'''
    if not token:
        return None
    cur.execute(
        '''
        SELECT u.id, u.role FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE
        ''',
        (token,),
    )
    row = cur.fetchone()
    if row and row['role'] == 'admin':
        return row['id']
    return None


def handler(event: dict, context) -> dict:
    '''API kataloga RazPC: chtenie vsem, izmenenie i udalenie sborok — tolko adminu.'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    params = event.get('queryStringParameters') or {}
    slug = params.get('slug')

    body_data = {}
    if event.get('body'):
        try:
            body_data = json.loads(event['body'])
        except (ValueError, TypeError):
            body_data = {}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if method == 'POST' and body_data.get('action') == 'create':
                return _create_build(cur, token, body_data)
            if method in ('PUT', 'POST'):
                return _update_build(cur, token, body_data)
            if method == 'DELETE':
                bid = params.get('id') or body_data.get('id')
                return _delete_build(cur, token, bid)

            if slug:
                result = _get_build_detail(cur, slug)
                if result is None:
                    return _resp(404, {'error': 'Build not found'})
                return _resp(200, result)
            # Arhivnye sborki vidny tolko adminu pri ?archived=1
            include_archived = params.get('archived') == '1' and _admin_id(cur, token) is not None
            return _resp(200, {'builds': _get_builds_list(cur, include_archived)})
    finally:
        conn.close()


def _update_build(cur, token, data):
    if _admin_id(cur, token) is None:
        return _resp(403, {'error': 'Только администратор может редактировать товары'})
    bid = data.get('id')
    if not bid:
        return _resp(400, {'error': 'Не указан товар'})

    fields = {k: v for k, v in data.items() if k in EDITABLE_FIELDS}
    if not fields:
        return _resp(400, {'error': 'Нет данных для обновления'})

    set_parts = []
    values = []
    for k, v in fields.items():
        set_parts.append(f'{k} = %s')
        values.append(v)
    values.append(bid)
    cur.execute(
        f'UPDATE builds SET {", ".join(set_parts)} WHERE id = %s RETURNING id',
        values,
    )
    if cur.fetchone() is None:
        return _resp(404, {'error': 'Товар не найден'})
    return _resp(200, {'ok': True})


def _create_build(cur, token, data):
    if _admin_id(cur, token) is None:
        return _resp(403, {'error': 'Только администратор может добавлять товары'})

    name = (data.get('name') or 'Новая конфигурация').strip()

    # Generiruem unikalniy slug
    cur.execute('SELECT COALESCE(MAX(id), 0) + 1 AS n FROM builds')
    n = cur.fetchone()['n']
    slug = f'build-{n}'

    cur.execute('SELECT COALESCE(MAX(sort_order), 0) + 1 AS s FROM builds')
    sort_order = cur.fetchone()['s']

    cur.execute(
        '''
        INSERT INTO builds
            (slug, name, tagline, price, old_price, image_url, tier,
             performance_badge, status, warranty, is_featured, sort_order, key_tasks)
        VALUES (%s, %s, %s, %s, NULL, NULL, %s, NULL, 'in_stock', %s, FALSE, %s, '')
        RETURNING id, slug
        ''',
        (
            slug,
            name,
            data.get('tagline') or 'Описание сборки',
            int(data.get('price') or 0),
            data.get('tier') or 'Новинка',
            data.get('warranty') or '12 месяцев',
            sort_order,
        ),
    )
    row = cur.fetchone()
    return _resp(200, {'ok': True, 'id': row['id'], 'slug': row['slug']})


def _delete_build(cur, token, bid):
    if _admin_id(cur, token) is None:
        return _resp(403, {'error': 'Только администратор может удалять товары'})
    if not bid:
        return _resp(400, {'error': 'Не указан товар'})
    cur.execute('DELETE FROM build_components WHERE build_id = %s', (bid,))
    cur.execute('DELETE FROM builds WHERE id = %s RETURNING id', (bid,))
    if cur.fetchone() is None:
        return _resp(404, {'error': 'Товар не найден'})
    return _resp(200, {'ok': True})


def _get_builds_list(cur, include_archived=False):
    where = '' if include_archived else 'WHERE is_archived = FALSE'
    cur.execute(
        f'''
        SELECT id, slug, name, tagline, price, old_price, image_url,
               tier, performance_badge, status, warranty, is_featured, is_archived
        FROM builds
        {where}
        ORDER BY sort_order ASC, id ASC
        '''
    )
    builds = cur.fetchall()

    build_ids = [b['id'] for b in builds]
    highlights_map = {bid: [] for bid in build_ids}
    if build_ids:
        ids_csv = ','.join(str(i) for i in build_ids)
        cur.execute(
            f'''
            SELECT bc.build_id, c.type, c.brand, c.name, c.spec, bc.position
            FROM build_components bc
            JOIN components c ON c.id = bc.component_id
            WHERE bc.build_id IN ({ids_csv}) AND bc.is_highlight = TRUE
            ORDER BY bc.build_id, bc.position
            '''
        )
        for row in cur.fetchall():
            highlights_map[row['build_id']].append({
                'type': row['type'],
                'brand': row['brand'],
                'name': row['name'],
                'spec': row['spec'],
            })

    for b in builds:
        b['highlights'] = highlights_map.get(b['id'], [])
    return builds


def _get_build_detail(cur, slug):
    cur.execute(
        '''
        SELECT id, slug, name, tagline, price, old_price, image_url,
               tier, performance_badge, status, warranty, key_tasks, is_archived
        FROM builds WHERE slug = %s
        ''',
        (slug,),
    )
    build = cur.fetchone()
    if not build:
        return None

    build['key_tasks'] = [t for t in (build.get('key_tasks') or '').split(';') if t]

    cur.execute(
        '''
        SELECT c.type, c.brand, c.name, c.spec, c.role, c.key_specs, c.image_url, bc.position
        FROM build_components bc
        JOIN components c ON c.id = bc.component_id
        WHERE bc.build_id = %s
        ORDER BY bc.position ASC
        ''',
        (build['id'],),
    )
    build['components'] = [
        {
            'type': r['type'],
            'brand': r['brand'],
            'name': r['name'],
            'spec': r['spec'],
            'role': r['role'],
            'key_specs': [s for s in (r['key_specs'] or '').split(';') if s],
            'image_url': r['image_url'],
        }
        for r in cur.fetchall()
    ]
    return build