from db import resp


def get_stats(cur):
    '''Svodnaya statistika dlya dashboarda CRM: prodazhi, lidy, finansy.'''
    data = {}

    # Zakazy po statusam
    cur.execute("SELECT status, COUNT(*) AS cnt FROM orders GROUP BY status")
    data['orders_by_status'] = {r['status']: r['cnt'] for r in cur.fetchall()}

    # Finansy (bez otmenennyh)
    cur.execute(
        '''
        SELECT
            COALESCE(SUM(total_amount), 0) AS revenue,
            COALESCE(SUM(paid_amount), 0) AS paid,
            COALESCE(SUM(cost_amount), 0) AS cost,
            COUNT(*) AS orders_total
        FROM orders WHERE status <> 'canceled'
        '''
    )
    fin = cur.fetchone()
    data['finance'] = {
        'revenue': int(fin['revenue']),
        'paid': int(fin['paid']),
        'cost': int(fin['cost']),
        'profit': int(fin['paid']) - int(fin['cost']),
        'debt': int(fin['revenue']) - int(fin['paid']),
        'orders_total': fin['orders_total'],
    }

    # Lidy
    cur.execute("SELECT status, COUNT(*) AS cnt FROM leads GROUP BY status")
    leads_by = {r['status']: r['cnt'] for r in cur.fetchall()}
    data['leads'] = leads_by
    total_leads = sum(leads_by.values())
    converted = leads_by.get('converted', 0)
    data['conversion'] = round(converted / total_leads * 100, 1) if total_leads else 0

    # Klienty
    cur.execute("SELECT COUNT(*) AS cnt FROM customers")
    data['customers_total'] = cur.fetchone()['cnt']

    # Vyruchka po mesyacam (poslednie 6)
    cur.execute(
        '''
        SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
               COALESCE(SUM(paid_amount), 0) AS paid,
               COUNT(*) AS orders
        FROM orders
        WHERE status <> 'canceled' AND created_at > NOW() - INTERVAL '6 months'
        GROUP BY 1 ORDER BY 1
        '''
    )
    data['revenue_by_month'] = [
        {'month': r['month'], 'paid': int(r['paid']), 'orders': r['orders']}
        for r in cur.fetchall()
    ]

    # Istochniki lidov
    cur.execute("SELECT source, COUNT(*) AS cnt FROM leads GROUP BY source ORDER BY cnt DESC")
    data['lead_sources'] = [{'source': r['source'], 'count': r['cnt']} for r in cur.fetchall()]

    return resp(200, data)
