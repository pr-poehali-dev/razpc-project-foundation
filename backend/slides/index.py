import json
import os

import psycopg2
from psycopg2.extras import RealDictCursor, Json


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}


def _resp(status, body):
    return {
        'statusCode': status,
        'headers': CORS,
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def _admin_id(cur, token):
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
    '''Kastomnye slaydy prezentacii sborki: chtenie vsem, sohranenie adminu.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    params = event.get('queryStringParameters') or {}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if method == 'GET':
                build_id = params.get('build_id')
                if not build_id:
                    return _resp(400, {'error': 'Не указан build_id'})
                cur.execute(
                    'SELECT slides FROM build_slides WHERE build_id = %s',
                    (int(build_id),),
                )
                row = cur.fetchone()
                slides = row['slides'] if row else []
                return _resp(200, {'slides': slides})

            if method == 'POST':
                if _admin_id(cur, token) is None:
                    return _resp(403, {'error': 'Только администратор может редактировать слайды'})
                data = {}
                if event.get('body'):
                    try:
                        data = json.loads(event['body'])
                    except (ValueError, TypeError):
                        data = {}
                build_id = data.get('build_id')
                slides = data.get('slides')
                if not build_id or slides is None:
                    return _resp(400, {'error': 'Не переданы данные слайдов'})
                if not isinstance(slides, list):
                    return _resp(400, {'error': 'Некорректный формат слайдов'})
                admin_id = _admin_id(cur, token)
                cur.execute(
                    '''
                    INSERT INTO build_slides (build_id, slides, updated_at, updated_by)
                    VALUES (%s, %s, NOW(), %s)
                    ON CONFLICT (build_id)
                    DO UPDATE SET slides = EXCLUDED.slides,
                                  updated_at = NOW(),
                                  updated_by = EXCLUDED.updated_by
                    ''',
                    (int(build_id), Json(slides), admin_id),
                )
                return _resp(200, {'ok': True, 'count': len(slides)})

            return _resp(405, {'error': 'Method not allowed'})
    finally:
        conn.close()
