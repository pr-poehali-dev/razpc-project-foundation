import json

from db import CORS, resp, connect, cursor, require_crm
import orders as orders_mod
import customers as customers_mod
import leads as leads_mod
import stats as stats_mod


def handler(event: dict, context) -> dict:
    '''CRM RazPC: zakazy, klienty, zayavki, statistika. Dostup: admin, manager. Sozdanie zayavki - publichno.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', 'orders')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except (ValueError, TypeError):
            body = {}

    conn = connect()
    try:
        cur = cursor(conn)

        # Publichnoe sozdanie zayavki s sayta
        if resource == 'lead' and method == 'POST':
            return leads_mod.create_lead(cur, body)

        # Vse ostalnoe - tolko dlya CRM-roley
        uid = require_crm(cur, token)
        if uid is None:
            return resp(403, {'error': 'Нет доступа к CRM'})

        if resource == 'orders':
            if method == 'GET':
                oid = params.get('id')
                return orders_mod.get_order(cur, oid) if oid else orders_mod.list_orders(cur, params)
            if method == 'POST':
                return orders_mod.create_order(cur, uid, body)
            if method == 'PUT':
                return orders_mod.update_order(cur, uid, body)

        if resource == 'customers':
            if method == 'GET':
                cid = params.get('id')
                return customers_mod.get_customer(cur, cid) if cid else customers_mod.list_customers(cur, params)
            if method in ('POST', 'PUT'):
                return customers_mod.save_customer(cur, body)

        if resource == 'leads':
            if method == 'GET':
                return leads_mod.list_leads(cur, params)
            if method == 'PUT':
                return leads_mod.update_lead(cur, uid, body)

        if resource == 'stats' and method == 'GET':
            return stats_mod.get_stats(cur)

        return resp(400, {'error': 'Неизвестный запрос'})
    finally:
        conn.close()
