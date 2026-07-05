from db import resp, add_transaction

OP_TYPES = ('income', 'expense', 'transfer', 'deposit', 'withdrawal', 'refund')


# ---------- Scheta ----------
def list_accounts(cur):
    cur.execute('''SELECT id, name, kind, balance, is_active FROM accounts
                   ORDER BY is_active DESC, name''')
    accounts = cur.fetchall()
    total = sum(float(a['balance'] or 0) for a in accounts if a['is_active'])
    return resp(200, {'accounts': accounts, 'total_balance': total})


def save_account(cur, uid, data):
    aid = data.get('id')
    if aid:
        cur.execute('UPDATE accounts SET name=%s, kind=%s, is_active=%s WHERE id=%s',
                    (data.get('name'), data.get('kind') or 'cash',
                     data.get('is_active', True), aid))
        return resp(200, {'ok': True, 'id': aid})
    name = (data.get('name') or '').strip()
    if not name:
        return resp(400, {'error': 'Введите название счёта'})
    start = float(data.get('balance') or 0)
    cur.execute('''INSERT INTO accounts (name, kind, balance, created_by)
                   VALUES (%s,%s,%s,%s) RETURNING id''',
                (name, data.get('kind') or 'cash', start, uid))
    return resp(200, {'ok': True, 'id': cur.fetchone()['id']})


# ---------- Operacii ----------
def list_transactions(cur, params):
    where, args = [], []
    if params.get('account_id'):
        where.append('(t.account_id = %s OR t.to_account_id = %s)')
        args += [params['account_id'], params['account_id']]
    if params.get('op_type'):
        where.append('t.op_type = %s')
        args.append(params['op_type'])
    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''
    cur.execute(f'''
        SELECT t.id, t.op_type, t.amount, t.direction, t.comment, t.created_at,
               a.name AS account_name, ta.name AS to_account_name,
               t.lot_id, l.lot_number, t.machine_id, m.machine_number,
               t.unit_id, u.unit_number, cp.name AS counterparty_name,
               us.name AS user_name
        FROM transactions t
        JOIN accounts a ON a.id = t.account_id
        LEFT JOIN accounts ta ON ta.id = t.to_account_id
        LEFT JOIN lots l ON l.id = t.lot_id
        LEFT JOIN machines m ON m.id = t.machine_id
        LEFT JOIN inventory_units u ON u.id = t.unit_id
        LEFT JOIN counterparties cp ON cp.id = t.counterparty_id
        LEFT JOIN users us ON us.id = t.user_id
        {where_sql}
        ORDER BY t.created_at DESC LIMIT 300
    ''', args)
    return resp(200, {'transactions': cur.fetchall()})


def create_transaction(cur, uid, data):
    op = data.get('op_type')
    if op not in OP_TYPES:
        return resp(400, {'error': 'Неизвестный тип операции'})
    amount = float(data.get('amount') or 0)
    if amount <= 0:
        return resp(400, {'error': 'Сумма должна быть больше нуля'})
    account_id = data.get('account_id')
    if not account_id:
        return resp(400, {'error': 'Выберите счёт'})
    comment = data.get('comment')

    if op == 'transfer':
        to_acc = data.get('to_account_id')
        if not to_acc or to_acc == account_id:
            return resp(400, {'error': 'Выберите счёт назначения'})
        add_transaction(cur, uid, account_id, 'transfer', amount, -1, comment=comment,
                        to_account_id=to_acc, counterparty_id=data.get('counterparty_id') or None)
        return resp(200, {'ok': True})

    direction = 1 if op in ('income', 'deposit', 'refund') else -1
    add_transaction(cur, uid, account_id, op, amount, direction, comment=comment,
                    counterparty_id=data.get('counterparty_id') or None,
                    lot_id=data.get('lot_id') or None, order_id=data.get('order_id') or None)
    return resp(200, {'ok': True})


def finance_summary(cur):
    cur.execute('SELECT COALESCE(SUM(balance),0) AS total FROM accounts WHERE is_active = TRUE')
    total = float(cur.fetchone()['total'] or 0)
    cur.execute('''
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE op_type='income' AND created_at >= date_trunc('month', CURRENT_DATE)),0) AS income_month,
          COALESCE(SUM(amount) FILTER (WHERE op_type='expense' AND created_at >= date_trunc('month', CURRENT_DATE)),0) AS expense_month
        FROM transactions
    ''')
    row = cur.fetchone()
    cur.execute('''SELECT
          COALESCE(SUM(amount) FILTER (WHERE kind='payable' AND NOT is_settled),0) AS total_payable,
          COALESCE(SUM(amount) FILTER (WHERE kind='receivable' AND NOT is_settled),0) AS total_receivable
        FROM debts''')
    debts = cur.fetchone()
    return resp(200, {
        'total_balance': total,
        'income_month': float(row['income_month'] or 0),
        'expense_month': float(row['expense_month'] or 0),
        'total_payable': float(debts['total_payable'] or 0),
        'total_receivable': float(debts['total_receivable'] or 0),
    })


# ---------- Kontragenty i dolgi ----------
def list_counterparties(cur):
    cur.execute('''
        SELECT cp.id, cp.name, cp.kind, cp.phone, cp.notes, cp.is_active,
               COALESCE(SUM(d.amount) FILTER (WHERE d.kind='payable' AND NOT d.is_settled),0) AS payable,
               COALESCE(SUM(d.amount) FILTER (WHERE d.kind='receivable' AND NOT d.is_settled),0) AS receivable
        FROM counterparties cp
        LEFT JOIN debts d ON d.counterparty_id = cp.id
        GROUP BY cp.id ORDER BY cp.name
    ''')
    return resp(200, {'counterparties': cur.fetchall()})


def save_counterparty(cur, uid, data):
    cid = data.get('id')
    if cid:
        cur.execute('UPDATE counterparties SET name=%s, kind=%s, phone=%s, notes=%s WHERE id=%s',
                    (data.get('name'), data.get('kind') or 'supplier',
                     data.get('phone'), data.get('notes'), cid))
        return resp(200, {'ok': True, 'id': cid})
    name = (data.get('name') or '').strip()
    if not name:
        return resp(400, {'error': 'Введите название'})
    cur.execute('''INSERT INTO counterparties (name, kind, phone, notes)
                   VALUES (%s,%s,%s,%s) RETURNING id''',
                (name, data.get('kind') or 'supplier', data.get('phone'), data.get('notes')))
    return resp(200, {'ok': True, 'id': cur.fetchone()['id']})


def get_counterparty(cur, cid):
    cur.execute('SELECT * FROM counterparties WHERE id = %s', (cid,))
    cp = cur.fetchone()
    if not cp:
        return resp(404, {'error': 'Контрагент не найден'})
    cur.execute('''SELECT id, kind, amount, comment, due_date, is_settled, created_at, lot_id
                   FROM debts WHERE counterparty_id = %s ORDER BY created_at DESC''', (cid,))
    debts = cur.fetchall()
    cur.execute('''SELECT t.id, t.op_type, t.amount, t.direction, t.comment, t.created_at,
                          a.name AS account_name
                   FROM transactions t JOIN accounts a ON a.id = t.account_id
                   WHERE t.counterparty_id = %s ORDER BY t.created_at DESC LIMIT 100''', (cid,))
    txs = cur.fetchall()
    payable = sum(float(d['amount']) for d in debts if d['kind'] == 'payable' and not d['is_settled'])
    receivable = sum(float(d['amount']) for d in debts if d['kind'] == 'receivable' and not d['is_settled'])
    return resp(200, {
        'counterparty': cp, 'debts': debts, 'transactions': txs,
        'payable': payable, 'receivable': receivable, 'balance': receivable - payable,
    })


def save_debt(cur, uid, data):
    did = data.get('id')
    if did and data.get('settle'):
        cur.execute('UPDATE debts SET is_settled = TRUE WHERE id = %s', (did,))
        return resp(200, {'ok': True})
    cp_id = data.get('counterparty_id')
    kind = data.get('kind')
    amount = float(data.get('amount') or 0)
    if not cp_id or kind not in ('payable', 'receivable') or amount <= 0:
        return resp(400, {'error': 'Проверьте данные обязательства'})
    cur.execute('''INSERT INTO debts (counterparty_id, kind, amount, comment, due_date)
                   VALUES (%s,%s,%s,%s,%s) RETURNING id''',
                (cp_id, kind, amount, data.get('comment'), data.get('due_date') or None))
    return resp(200, {'ok': True, 'id': cur.fetchone()['id']})
