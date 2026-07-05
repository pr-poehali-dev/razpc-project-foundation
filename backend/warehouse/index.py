import json

from db import CORS, resp, connect, cursor, require_warehouse
import items as items_mod
import operations as ops_mod
import dashboard as dash_mod
import audits as audits_mod


def handler(event: dict, context) -> dict:
    '''Sklad RazPC: tovary, dvizheniya, inventarizacii, dashboard. Dostup: admin, manager.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', '')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except (ValueError, TypeError):
            body = {}

    conn = connect()
    try:
        cur = cursor(conn)
        user = require_warehouse(cur, token)
        if not user:
            return resp(401, {'error': 'Нет доступа к складу'})
        uid = user['id']

        if resource == 'dashboard' and method == 'GET':
            return dash_mod.dashboard(cur)

        if resource == 'refs' and method == 'GET':
            return items_mod.refs(cur)

        if resource == 'items':
            if method == 'GET':
                item_id = params.get('id')
                if item_id:
                    return items_mod.get_item(cur, item_id)
                return items_mod.list_items(cur, params)
            if method == 'POST':
                return items_mod.create_item(cur, uid, body)
            if method == 'PUT':
                return items_mod.update_item(cur, uid, body)

        if resource == 'operation' and method == 'POST':
            return ops_mod.do_operation(cur, uid, body)

        if resource == 'movements' and method == 'GET':
            return ops_mod.list_movements(cur, params)

        if resource == 'audits':
            if method == 'GET':
                audit_id = params.get('id')
                if audit_id:
                    return audits_mod.get_audit(cur, audit_id)
                return audits_mod.list_audits(cur)
            if method == 'POST':
                act = params.get('action')
                if act == 'start':
                    return audits_mod.start_audit(cur, uid, body)
                if act == 'line':
                    return audits_mod.save_audit_line(cur, uid, body)
                if act == 'complete':
                    return audits_mod.complete_audit(cur, uid, body)

        return resp(400, {'error': 'Неизвестный запрос'})
    finally:
        conn.close()
