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

# Roli s dostupom k CRM
CRM_ROLES = ('admin', 'manager')


def resp(status, body):
    return {
        'statusCode': status,
        'headers': CORS,
        'body': json.dumps(body, ensure_ascii=False, default=str),
        'isBase64Encoded': False,
    }


def connect():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    return conn


def get_user(cur, token):
    '''Vozvrashchaet {id, role} po tokenu sessii ili None.'''
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
    return cur.fetchone()


def require_crm(cur, token):
    '''Vozvrashchaet user_id esli est dostup k CRM, inache None.'''
    user = get_user(cur, token)
    if user and user['role'] in CRM_ROLES:
        return user['id']
    return None


def cursor(conn):
    return conn.cursor(cursor_factory=RealDictCursor)
