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

# Roli s dostupom k skladu
WAREHOUSE_ROLES = ('admin', 'manager')


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


def cursor(conn):
    return conn.cursor(cursor_factory=RealDictCursor)


def get_user(cur, token):
    '''Vozvrashchaet {id, role, name} po tokenu sessii ili None.'''
    if not token:
        return None
    cur.execute(
        '''
        SELECT u.id, u.role, u.name FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE
        ''',
        (token,),
    )
    return cur.fetchone()


def require_warehouse(cur, token):
    '''Vozvrashchaet {id, name} esli est dostup k skladu, inache None.'''
    user = get_user(cur, token)
    if user and user['role'] in WAREHOUSE_ROLES:
        return user
    return None


# ---------- Generatory nomerov (LOT-00001, U-000001, PC-00001) ----------
_PREFIX = {'unit': 'U-', 'lot': 'LOT-', 'machine': 'PC-'}
_PAD = {'unit': 6, 'lot': 5, 'machine': 5}


def next_number(cur, name):
    '''Atomarno uvelichivaet schetchik i vozvrashchaet formatirovannyy nomer.'''
    cur.execute(
        'UPDATE erp_counters SET value = value + 1 WHERE name = %s RETURNING value',
        (name,),
    )
    row = cur.fetchone()
    val = row['value'] if row else 1
    return f"{_PREFIX[name]}{str(val).zfill(_PAD[name])}"


def log_unit(cur, unit_id, event_type, uid, comment=None, machine_id=None, lot_id=None, meta=None):
    cur.execute(
        '''INSERT INTO unit_events (unit_id, event_type, comment, machine_id, lot_id, meta, user_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s)''',
        (unit_id, event_type, comment, machine_id, lot_id,
         json.dumps(meta or {}, ensure_ascii=False), uid),
    )


def log_machine(cur, machine_id, event_type, uid, comment=None, unit_id=None, customer_id=None):
    cur.execute(
        '''INSERT INTO machine_events (machine_id, event_type, comment, unit_id, customer_id, user_id)
           VALUES (%s,%s,%s,%s,%s,%s)''',
        (machine_id, event_type, comment, unit_id, customer_id, uid),
    )


def add_transaction(cur, uid, account_id, op_type, amount, direction, comment=None,
                    lot_id=None, unit_id=None, machine_id=None, order_id=None,
                    counterparty_id=None, to_account_id=None):
    '''Sozdaet finansovuyu operaciyu i obnovlyaet balans(y) schetov.'''
    if not account_id:
        return None
    cur.execute(
        '''INSERT INTO transactions
           (account_id, op_type, amount, direction, to_account_id, comment,
            lot_id, unit_id, machine_id, order_id, counterparty_id, user_id)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id''',
        (account_id, op_type, abs(amount), direction, to_account_id, comment,
         lot_id, unit_id, machine_id, order_id, counterparty_id, uid),
    )
    tx_id = cur.fetchone()['id']
    cur.execute('UPDATE accounts SET balance = balance + %s WHERE id = %s',
                (abs(amount) * direction, account_id))
    if to_account_id and op_type == 'transfer':
        cur.execute('UPDATE accounts SET balance = balance + %s WHERE id = %s',
                    (abs(amount), to_account_id))
    return tx_id