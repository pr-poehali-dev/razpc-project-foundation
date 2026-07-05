import json
import os
import base64
import uuid

import boto3
import psycopg2
from psycopg2.extras import RealDictCursor


CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}

EXT_BY_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
}


def _resp(status, body):
    return {
        'statusCode': status,
        'headers': CORS,
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def _is_admin(token):
    if not token:
        return False
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                '''
                SELECT u.role FROM sessions s
                JOIN users u ON u.id = s.user_id
                WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE
                ''',
                (token,),
            )
            row = cur.fetchone()
            return bool(row and row['role'] == 'admin')
    finally:
        conn.close()


def handler(event: dict, context) -> dict:
    '''Zagruzka izobrazheniy fajlom (base64) v S3. Tolko dlya admina.'''
    method = event.get('httpMethod', 'POST')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    if not _is_admin(token):
        return _resp(403, {'error': 'Только администратор может загружать изображения'})

    data = {}
    if event.get('body'):
        try:
            data = json.loads(event['body'])
        except (ValueError, TypeError):
            data = {}

    file_b64 = data.get('file')
    content_type = (data.get('content_type') or 'image/png').lower()
    if not file_b64:
        return _resp(400, {'error': 'Файл не передан'})

    # Ubiraem prefiks data:image/...;base64, esli est
    if ',' in file_b64 and file_b64.strip().startswith('data:'):
        header, file_b64 = file_b64.split(',', 1)
        if 'image/' in header:
            content_type = header.split(':', 1)[1].split(';', 1)[0].lower()

    try:
        raw = base64.b64decode(file_b64)
    except Exception:
        return _resp(400, {'error': 'Некорректный файл'})

    if len(raw) > 8 * 1024 * 1024:
        return _resp(400, {'error': 'Файл слишком большой (макс. 8 МБ)'})

    ext = EXT_BY_TYPE.get(content_type, 'png')
    access_key = os.environ['AWS_ACCESS_KEY_ID']
    key = f'uploads/{uuid.uuid4().hex}.{ext}'

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=content_type)

    cdn_url = f'https://cdn.poehali.dev/projects/{access_key}/bucket/{key}'
    return _resp(200, {'url': cdn_url})
