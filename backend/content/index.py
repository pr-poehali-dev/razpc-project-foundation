import json
import os

import psycopg2
from psycopg2.extras import RealDictCursor


def _cors(extra=None):
    h = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Content-Type': 'application/json',
    }
    if extra:
        h.update(extra)
    return h


def _json(status, body):
    return {
        'statusCode': status,
        'headers': _cors(),
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def _admin_from_token(cur, token):
    '''Vozvrashchaet user_id esli token prinadlezhit adminu, inache None.'''
    if not token:
        return None
    cur.execute(
        '''
        SELECT u.id, u.role
        FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE
        ''',
        (token,),
    )
    row = cur.fetchone()
    if row and row['role'] == 'admin':
        return row['id']
    return None


def handler(event: dict, context) -> dict:
    '''Redaktiruemiy kontent sayta: chtenie vsem, sohranenie tolko adminu.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': _cors({'Access-Control-Max-Age': '86400'}), 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if method == 'GET':
                return _get_content(cur)
            if method == 'POST':
                body = {}
                if event.get('body'):
                    try:
                        body = json.loads(event['body'])
                    except (ValueError, TypeError):
                        body = {}
                return _save_content(cur, token, body)
            return _json(405, {'error': 'Method not allowed'})
    finally:
        conn.close()


def _get_content(cur):
    cur.execute('SELECT content_key, content_value, content_type FROM site_content')
    items = {r['content_key']: r['content_value'] for r in cur.fetchall()}
    return _json(200, {'content': items})


def _save_content(cur, token, body):
    admin_id = _admin_from_token(cur, token)
    if admin_id is None:
        return _json(403, {'error': 'Только администратор может редактировать сайт'})

    updates = body.get('updates')
    if not isinstance(updates, list) or not updates:
        # odinochnoe sohranenie
        key = body.get('key')
        value = body.get('value')
        if key is None or value is None:
            return _json(400, {'error': 'Не переданы данные для сохранения'})
        updates = [{'key': key, 'value': value, 'type': body.get('type', 'text')}]

    saved = 0
    for u in updates:
        key = u.get('key')
        value = u.get('value')
        ctype = u.get('type', 'text')
        if key is None or value is None:
            continue
        cur.execute(
            '''
            INSERT INTO site_content (content_key, content_value, content_type, updated_at, updated_by)
            VALUES (%s, %s, %s, NOW(), %s)
            ON CONFLICT (content_key)
            DO UPDATE SET content_value = EXCLUDED.content_value,
                          content_type = EXCLUDED.content_type,
                          updated_at = NOW(),
                          updated_by = EXCLUDED.updated_by
            ''',
            (key, value, ctype, admin_id),
        )
        saved += 1

    return _json(200, {'ok': True, 'saved': saved})
