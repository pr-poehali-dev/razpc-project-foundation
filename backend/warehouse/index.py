import json

from db import CORS, resp, connect, cursor, require_warehouse
import models_units as mu
import lots as lots_mod
import machines as mach_mod
import sales as sales_mod
import finance as fin_mod
import dashboard as dash_mod


def handler(event: dict, context) -> dict:
    '''ERP-sklad RazPC: modeli, ekzemplyary, partii, kompyutery, prodazhi, finansy. Dostup: admin, manager.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', '')
    action = params.get('action', '')
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
            return mu.refs(cur)

        if resource == 'models':
            if method == 'GET':
                mid = params.get('id')
                return mu.get_model(cur, mid) if mid else mu.list_models(cur, params)
            if method in ('POST', 'PUT'):
                return mu.save_model(cur, uid, body)

        if resource == 'units':
            if method == 'GET':
                uid_ = params.get('id')
                return mu.get_unit(cur, uid_) if uid_ else mu.list_units(cur, params)
            if method == 'PUT':
                return mu.update_unit(cur, uid, body)
            if method == 'POST' and action == 'operation':
                return sales_mod.unit_operation(cur, uid, body)

        if resource == 'lots':
            if method == 'GET':
                lid = params.get('id')
                return lots_mod.get_lot(cur, lid) if lid else lots_mod.list_lots(cur, params)
            if method == 'POST' and action == 'receive':
                return lots_mod.receive(cur, uid, body)
            if method == 'POST' and action == 'disassembly':
                return lots_mod.create_disassembly(cur, uid, body)

        if resource == 'machines':
            if method == 'GET':
                mid = params.get('id')
                return mach_mod.get_machine(cur, mid) if mid else mach_mod.list_machines(cur, params)
            if method == 'POST' and action == 'build':
                return mach_mod.build_machine(cur, uid, body)
            if method == 'PUT':
                return mach_mod.update_machine(cur, uid, body)

        if resource == 'sell' and method == 'POST':
            return sales_mod.sell(cur, uid, body)

        if resource == 'accounts':
            if method == 'GET':
                return fin_mod.list_accounts(cur)
            if method in ('POST', 'PUT'):
                return fin_mod.save_account(cur, uid, body)
        if resource == 'transactions':
            if method == 'GET':
                return fin_mod.list_transactions(cur, params)
            if method == 'POST':
                return fin_mod.create_transaction(cur, uid, body)
        if resource == 'finance_summary' and method == 'GET':
            return fin_mod.finance_summary(cur)

        if resource == 'counterparties':
            if method == 'GET':
                cid = params.get('id')
                return fin_mod.get_counterparty(cur, cid) if cid else fin_mod.list_counterparties(cur)
            if method in ('POST', 'PUT'):
                return fin_mod.save_counterparty(cur, uid, body)
        if resource == 'debts' and method == 'POST':
            return fin_mod.save_debt(cur, uid, body)

        return resp(400, {'error': 'Неизвестный запрос'})
    finally:
        conn.close()
