from db import resp


def dashboard(cur):
    '''Svodnaya informaciya po skladu.'''
    cur.execute(
        '''
        SELECT
          COALESCE(SUM(quantity * avg_purchase_price), 0) AS purchase_value,
          COALESCE(SUM(quantity * sale_price), 0) AS sale_value,
          COALESCE(SUM(quantity), 0) AS total_units,
          COUNT(*) AS total_positions,
          COUNT(*) FILTER (WHERE quantity = 0) AS out_of_stock,
          COUNT(*) FILTER (WHERE quantity > 0 AND quantity <= low_stock_threshold) AS low_stock,
          COUNT(*) FILTER (WHERE received_at >= CURRENT_DATE - INTERVAL '7 days') AS new_arrivals
        FROM inventory_items
        ''',
    )
    row = cur.fetchone()

    purchase = float(row['purchase_value'] or 0)
    sale = float(row['sale_value'] or 0)
    profit = sale - purchase
    margin = round(profit / sale * 100, 1) if sale > 0 else 0

    summary = {
        'purchase_value': purchase,
        'sale_value': sale,
        'potential_profit': profit,
        'avg_margin': margin,
        'total_units': int(row['total_units'] or 0),
        'total_positions': int(row['total_positions'] or 0),
        'new_arrivals': int(row['new_arrivals'] or 0),
        'low_stock': int(row['low_stock'] or 0),
        'out_of_stock': int(row['out_of_stock'] or 0),
    }

    # Poslednie dvizheniya
    cur.execute(
        '''
        SELECT m.id, m.operation, m.qty_change, m.qty_after, m.comment, m.created_at,
               i.id AS item_id, i.name AS item_name, i.sku, u.name AS user_name
        FROM inventory_movements m
        JOIN inventory_items i ON i.id = m.item_id
        LEFT JOIN users u ON u.id = m.user_id
        ORDER BY m.created_at DESC LIMIT 15
        ''',
    )
    movements = cur.fetchall()

    # Tovary s nizkim ostatkom
    cur.execute(
        '''
        SELECT id, sku, name, quantity, low_stock_threshold
        FROM inventory_items
        WHERE quantity > 0 AND quantity <= low_stock_threshold
        ORDER BY quantity ASC LIMIT 10
        ''',
    )
    low_stock_items = cur.fetchall()

    # Raspredelenie po kategoriyam
    cur.execute(
        '''
        SELECT c.title, COUNT(i.id) AS positions, COALESCE(SUM(i.quantity),0) AS units
        FROM inventory_categories c
        LEFT JOIN inventory_items i ON i.category_id = c.id
        GROUP BY c.id, c.title, c.sort_order
        HAVING COUNT(i.id) > 0
        ORDER BY c.sort_order
        ''',
    )
    by_category = cur.fetchall()

    return resp(200, {
        'summary': summary,
        'movements': movements,
        'low_stock_items': low_stock_items,
        'by_category': by_category,
    })
