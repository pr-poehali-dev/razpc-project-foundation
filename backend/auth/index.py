import json
import os
import hashlib
import hmac
import secrets
import smtplib
import ssl
from email.mime.text import MIMEText
from email.utils import formataddr
from datetime import datetime, timedelta

import psycopg2
from psycopg2.extras import RealDictCursor

SESSION_DAYS = 30
RESET_CODE_TTL_MIN = 15
RESET_MAX_ATTEMPTS = 5


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


def _hash_password(password: str, salt: str) -> str:
    dk = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return dk.hex()


def _make_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    return f"{salt}${_hash_password(password, salt)}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split('$', 1)
    except ValueError:
        return False
    return hmac.compare_digest(_hash_password(password, salt), digest)


def _json(status, body):
    return {
        'statusCode': status,
        'headers': _cors(),
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def _send_email(to_email: str, subject: str, text: str) -> bool:
    '''Otpravka pisma cherez SMTP. Vozvrashchaet True pri uspehe.'''
    host = os.environ.get('SMTP_HOST')
    user = os.environ.get('SMTP_USER')
    password = os.environ.get('SMTP_PASSWORD')
    port = int(os.environ.get('SMTP_PORT') or 465)
    if not (host and user and password):
        # Pochta ne nastroena - kod ostaetsya v logah
        print(f'[SMTP not configured] To {to_email}: {text}')
        return False

    msg = MIMEText(text, 'plain', 'utf-8')
    msg['Subject'] = subject
    msg['From'] = formataddr(('RazPC', user))
    msg['To'] = to_email

    try:
        if port == 465:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(host, port, context=ctx, timeout=15) as server:
                server.login(user, password)
                server.sendmail(user, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=15) as server:
                server.starttls(context=ssl.create_default_context())
                server.login(user, password)
                server.sendmail(user, [to_email], msg.as_string())
        return True
    except Exception as e:
        print(f'[SMTP error] {e}')
        return False


def handler(event: dict, context) -> dict:
    '''Avtorizaciya RazPC: registraciya, vhod, tekushchiy polzovatel, vyhod.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': _cors({'Access-Control-Max-Age': '86400'}), 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except (ValueError, TypeError):
            body = {}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if method == 'POST' and action == 'register':
                return _register(cur, body)
            if method == 'POST' and action == 'login':
                return _login(cur, body)
            if method == 'POST' and action == 'logout':
                return _logout(cur, token)
            if method == 'GET' and action == 'me':
                return _me(cur, token)
            if method == 'GET' and action == 'users':
                return _list_users(cur, token)
            if method == 'POST' and action == 'set_role':
                return _set_role(cur, token, body)
            if method == 'POST' and action == 'forgot':
                return _forgot(cur, body)
            if method == 'POST' and action == 'reset':
                return _reset(cur, body)
            return _json(400, {'error': 'Unknown action'})
    finally:
        conn.close()


def _public_user(u):
    return {
        'id': u['id'],
        'email': u['email'],
        'name': u['name'],
        'role': u['role'],
    }


def _create_session(cur, user_id):
    token = secrets.token_hex(48)
    expires = datetime.utcnow() + timedelta(days=SESSION_DAYS)
    cur.execute(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)',
        (user_id, token, expires),
    )
    return token


def _register(cur, body):
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    name = (body.get('name') or '').strip()

    if not email or '@' not in email:
        return _json(400, {'error': 'Введите корректный email'})
    if len(password) < 6:
        return _json(400, {'error': 'Пароль должен быть не короче 6 символов'})
    if not name:
        name = email.split('@')[0]

    cur.execute('SELECT id FROM users WHERE email = %s', (email,))
    if cur.fetchone():
        return _json(409, {'error': 'Пользователь с таким email уже существует'})

    admin_email = (os.environ.get('ADMIN_EMAIL') or '').strip().lower()
    role = 'admin' if admin_email and email == admin_email else 'member'

    cur.execute(
        'INSERT INTO users (email, password_hash, name, role) VALUES (%s, %s, %s, %s) RETURNING id, email, name, role',
        (email, _make_hash(password), name, role),
    )
    user = cur.fetchone()
    token = _create_session(cur, user['id'])
    return _json(200, {'token': token, 'user': _public_user(user)})


def _login(cur, body):
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    cur.execute(
        'SELECT id, email, name, role, password_hash, is_active FROM users WHERE email = %s',
        (email,),
    )
    user = cur.fetchone()
    if not user or not _verify_password(password, user['password_hash']):
        return _json(401, {'error': 'Неверный email или пароль'})
    if not user['is_active']:
        return _json(403, {'error': 'Аккаунт заблокирован'})

    # Sinhronizaciya roli admina, esli email sovpal
    admin_email = (os.environ.get('ADMIN_EMAIL') or '').strip().lower()
    if admin_email and user['email'] == admin_email and user['role'] != 'admin':
        cur.execute('UPDATE users SET role = %s WHERE id = %s', ('admin', user['id']))
        user['role'] = 'admin'

    token = _create_session(cur, user['id'])
    return _json(200, {'token': token, 'user': _public_user(user)})


def _me(cur, token):
    if not token:
        return _json(401, {'error': 'Не авторизован'})
    cur.execute(
        '''
        SELECT u.id, u.email, u.name, u.role
        FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE
        ''',
        (token,),
    )
    user = cur.fetchone()
    if not user:
        return _json(401, {'error': 'Сессия недействительна'})
    return _json(200, {'user': _public_user(user)})


def _logout(cur, token):
    if token:
        cur.execute('DELETE FROM sessions WHERE token = %s', (token,))
    return _json(200, {'ok': True})


def _current_user(cur, token):
    if not token:
        return None
    cur.execute(
        '''
        SELECT u.id, u.email, u.name, u.role
        FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE
        ''',
        (token,),
    )
    return cur.fetchone()


VALID_ROLES = ('admin', 'manager', 'builder', 'moderator', 'forum', 'member')


def _list_users(cur, token):
    me = _current_user(cur, token)
    if not me:
        return _json(401, {'error': 'Не авторизован'})
    if me['role'] != 'admin':
        return _json(403, {'error': 'Недостаточно прав'})

    cur.execute(
        'SELECT id, email, name, role, is_active, created_at FROM users ORDER BY created_at DESC'
    )
    users = [
        {
            'id': u['id'],
            'email': u['email'],
            'name': u['name'],
            'role': u['role'],
            'is_active': u['is_active'],
            'created_at': u['created_at'].isoformat() if u['created_at'] else None,
        }
        for u in cur.fetchall()
    ]
    return _json(200, {'users': users})


def _set_role(cur, token, body):
    me = _current_user(cur, token)
    if not me:
        return _json(401, {'error': 'Не авторизован'})
    if me['role'] != 'admin':
        return _json(403, {'error': 'Недостаточно прав'})

    user_id = body.get('user_id')
    new_role = body.get('role')
    if new_role not in VALID_ROLES:
        return _json(400, {'error': 'Неизвестная роль'})
    if user_id == me['id'] and new_role != 'admin':
        return _json(400, {'error': 'Нельзя снять роль администратора с самого себя'})

    cur.execute('UPDATE users SET role = %s WHERE id = %s RETURNING id', (new_role, user_id))
    if not cur.fetchone():
        return _json(404, {'error': 'Пользователь не найден'})
    return _json(200, {'ok': True})


def _forgot(cur, body):
    '''Zapros koda vosstanovleniya: generiruem kod i shlem na pochtu.'''
    email = (body.get('email') or '').strip().lower()
    if not email or '@' not in email:
        return _json(400, {'error': 'Введите корректный email'})

    cur.execute('SELECT id, name, is_active FROM users WHERE email = %s', (email,))
    user = cur.fetchone()

    # Ne raskryvaem, sushchestvuet li email - vsegda otvechaem ok
    if user and user['is_active']:
        code = f'{secrets.randbelow(1000000):06d}'
        expires = datetime.utcnow() + timedelta(minutes=RESET_CODE_TTL_MIN)
        # Gasim starye neispolzovannye kody
        cur.execute(
            'UPDATE password_resets SET used = TRUE WHERE user_id = %s AND used = FALSE',
            (user['id'],),
        )
        cur.execute(
            'INSERT INTO password_resets (user_id, code, expires_at) VALUES (%s, %s, %s)',
            (user['id'], code, expires),
        )
        text = (
            f"Здравствуйте, {user['name']}!\n\n"
            f"Код для восстановления доступа к аккаунту RazPC: {code}\n\n"
            f"Код действует {RESET_CODE_TTL_MIN} минут. "
            f"Если вы не запрашивали восстановление — просто проигнорируйте это письмо."
        )
        _send_email(email, 'Восстановление доступа RazPC', text)

    return _json(200, {'ok': True})


def _reset(cur, body):
    '''Sbros parolya po kodu iz pisma.'''
    email = (body.get('email') or '').strip().lower()
    code = (body.get('code') or '').strip()
    password = body.get('password') or ''

    if len(password) < 6:
        return _json(400, {'error': 'Пароль должен быть не короче 6 символов'})
    if not code:
        return _json(400, {'error': 'Введите код из письма'})

    cur.execute('SELECT id FROM users WHERE email = %s AND is_active = TRUE', (email,))
    user = cur.fetchone()
    if not user:
        return _json(400, {'error': 'Неверный код или email'})

    cur.execute(
        '''
        SELECT id, code, attempts FROM password_resets
        WHERE user_id = %s AND used = FALSE AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1
        ''',
        (user['id'],),
    )
    reset = cur.fetchone()
    if not reset:
        return _json(400, {'error': 'Код устарел или не найден. Запросите новый.'})

    if reset['attempts'] >= RESET_MAX_ATTEMPTS:
        cur.execute('UPDATE password_resets SET used = TRUE WHERE id = %s', (reset['id'],))
        return _json(400, {'error': 'Слишком много попыток. Запросите новый код.'})

    if not hmac.compare_digest(reset['code'], code):
        cur.execute('UPDATE password_resets SET attempts = attempts + 1 WHERE id = %s', (reset['id'],))
        return _json(400, {'error': 'Неверный код'})

    # Kod verniy - menyaem parol, gasim kod, sbrasyvaem vse sessii
    cur.execute('UPDATE users SET password_hash = %s WHERE id = %s', (_make_hash(password), user['id']))
    cur.execute('UPDATE password_resets SET used = TRUE WHERE id = %s', (reset['id'],))
    cur.execute('DELETE FROM sessions WHERE user_id = %s', (user['id'],))

    return _json(200, {'ok': True})