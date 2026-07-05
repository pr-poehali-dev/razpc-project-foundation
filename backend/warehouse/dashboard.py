from db import resp


def dashboard(cur):
    '''Svodka po skladu na osnove ekzemplyarov.'''
    cur.execute('''
        SELECT
          COALESCE(SUM(purchase_cost) FILTER (WHERE status IN ('in_stock','reserved','in_build')),0) AS purchase_value,
          COALESCE(SUM(sale_price) FILTER (WHERE status IN ('in_stock','reserved','in_build')),0) AS sale_value,
          COUNT(*) FILTER (WHERE status IN ('in_stock','reserved','in_build')) AS units_available,
          COUNT(*) FILTER (WHERE status = 'in_stock') AS in_stock,
          COUNT(*) FILTER (WHERE status = 'sold') AS sold,
          COUNT(*) FILTER (WHERE received_at >= CURRENT_DATE - INTERVAL '7 days') AS new_arrivals
        FROM inventory_units
    ''')
    row = cur.fetchone()
    purchase = float(row['purchase_value'] or 0)
    sale = float(row['sale_value'] or 0)
    profit = sale - purchase
    margin = round(profit / sale * 100, 1) if sale > 0 else 0

    cur.execute("SELECT COUNT(*) AS c FROM product_models")
    models_count = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) AS c FROM machines WHERE status IN ('assembling','in_stock','reserved')")
    machines_count = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) AS c FROM lots WHERE status = 'active'")
    lots_count = cur.fetchone()['c']

    summary = {
        'purchase_value': purchase, 'sale_value': sale,
        'potential_profit': profit, 'avg_margin': margin,
        'units_available': int(row['units_available'] or 0),
        'in_stock': int(row['in_stock'] or 0),
        'sold': int(row['sold'] or 0),
        'new_arrivals': int(row['new_arrivals'] or 0),
        'models_count': int(models_count or 0),
        'machines_count': int(machines_count or 0),
        'lots_count': int(lots_count or 0),
    }

    cur.execute('''
        SELECT pm.id, pm.name, pm.low_stock_threshold,
               COUNT(u.id) FILTER (WHERE u.status = 'in_stock') AS qty
        FROM product_models pm
        LEFT JOIN inventory_units u ON u.model_id = pm.id
        GROUP BY pm.id
        HAVING COUNT(u.id) FILTER (WHERE u.status='in_stock') > 0
           AND COUNT(u.id) FILTER (WHERE u.status='in_stock') <= pm.low_stock_threshold
        ORDER BY qty ASC LIMIT 10
    ''')
    low_stock = cur.fetchall()

    cur.execute('''
        SELECT e.id, e.event_type, e.comment, e.created_at,
               u.id AS unit_id, u.unit_number, pm.name AS model_name, us.name AS user_name
        FROM unit_events e
        JOIN inventory_units u ON u.id = e.unit_id
        JOIN product_models pm ON pm.id = u.model_id
        LEFT JOIN users us ON us.id = e.user_id
        ORDER BY e.created_at DESC LIMIT 15
    ''')
    events = cur.fetchall()

    return resp(200, {'summary': summary, 'low_stock': low_stock, 'events': events})
