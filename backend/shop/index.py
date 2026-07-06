import json

from db import CORS, resp, connect, cursor
from seed import ensure_seed
from logistics import calc_delivery


def _categories(cur):
    cur.execute('''
        SELECT c.id, c.code, c.title, c.icon, c.config_slot, c.sort_order,
               COUNT(p.id) FILTER (WHERE p.is_archived = FALSE) AS product_count
        FROM product_categories c
        LEFT JOIN products p ON p.category_id = c.id
        WHERE c.is_active = TRUE
        GROUP BY c.id ORDER BY c.sort_order
    ''')
    return resp(200, {'categories': cur.fetchall()})


def _row_to_product(r):
    return {
        'id': r['id'], 'slug': r['slug'], 'category_code': r['category_code'],
        'category_title': r['category_title'], 'category_icon': r['category_icon'],
        'config_slot': r['config_slot'], 'brand': r['brand'], 'name': r['name'],
        'condition': r['condition'], 'price': r['price'], 'old_price': r['old_price'],
        'in_stock': r['in_stock'], 'warranty_months': r['warranty_months'],
        'lead_days': 0 if r['in_stock'] else (r['supplier_lead'] or 3),
        'supplier_name': r['supplier_name'],
        'weight_g': r['weight_g'], 'length_mm': r['length_mm'], 'width_mm': r['width_mm'], 'height_mm': r['height_mm'],
        'short_desc': r['short_desc'], 'image_url': r['image_url'],
        'images': r['images'], 'short_specs': r['short_specs'], 'specs': r['specs'],
        'compat': r['compat'], 'perf_score': r['perf_score'], 'is_featured': r['is_featured'],
    }


SELECT_BASE = '''
    SELECT p.id, p.slug, p.brand, p.name, p.condition, p.price, p.old_price,
           p.in_stock, p.warranty_months, p.weight_g, p.length_mm, p.width_mm, p.height_mm,
           p.short_desc, p.image_url, p.images, p.short_specs, p.specs, p.compat,
           p.perf_score, p.is_featured,
           c.code AS category_code, c.title AS category_title, c.icon AS category_icon, c.config_slot,
           s.name AS supplier_name, s.lead_days AS supplier_lead
    FROM products p
    JOIN product_categories c ON c.id = p.category_id
    LEFT JOIN suppliers s ON s.id = p.supplier_id
'''


def _list_products(cur, params):
    where = ['p.is_archived = FALSE']
    args = []
    if params.get('category'):
        where.append('c.code = %s')
        args.append(params['category'])
    if params.get('slot'):
        where.append('c.config_slot = %s')
        args.append(params['slot'])
    search = (params.get('search') or '').strip()
    if search:
        where.append('(p.name ILIKE %s OR p.brand ILIKE %s)')
        args += [f'%{search}%', f'%{search}%']
    if params.get('condition'):
        where.append('p.condition = %s')
        args.append(params['condition'])
    if params.get('in_stock') == '1':
        where.append('p.in_stock = TRUE')

    sort = params.get('sort', 'popular')
    order = {'price_asc': 'p.price ASC', 'price_desc': 'p.price DESC',
             'popular': 'p.is_featured DESC, p.sort_order ASC, p.price ASC'}.get(sort, 'p.sort_order ASC')

    cur.execute(f"{SELECT_BASE} WHERE {' AND '.join(where)} ORDER BY {order} LIMIT 200", args)
    products = [_row_to_product(r) for r in cur.fetchall()]

    # Post-filtr po compat-polyam (dinamicheskie filtry kategorii)
    reserved = {'resource', 'category', 'slot', 'search', 'condition', 'in_stock', 'sort'}
    compat_filters = {k: v for k, v in params.items() if k not in reserved and v}
    if compat_filters:
        def norm(x):
            if isinstance(x, bool):
                return 'есть' if x else 'нет'
            return str(x).lower()

        def match(p):
            for k, v in compat_filters.items():
                pv = p['compat'].get(k)
                if pv is None:
                    return False
                if norm(pv) != norm(v):
                    return False
            return True
        products = [p for p in products if match(p)]

    return resp(200, {'products': products})


def _get_product(cur, slug):
    cur.execute(f"{SELECT_BASE} WHERE p.slug = %s", (slug,))
    r = cur.fetchone()
    if not r:
        return resp(404, {'error': 'not_found'})
    product = _row_to_product(r)
    # Pohozhie: ta zhe kategoriya, blizkaya cena
    cur.execute(
        f"{SELECT_BASE} WHERE c.id = (SELECT category_id FROM products WHERE slug = %s) "
        f"AND p.slug != %s AND p.is_archived = FALSE ORDER BY ABS(p.price - %s) LIMIT 4",
        (slug, slug, product['price']))
    similar = [_row_to_product(x) for x in cur.fetchall()]
    return resp(200, {'product': product, 'similar': similar})


def _cities(cur, params):
    search = (params.get('search') or '').strip()
    if search:
        cur.execute('SELECT id, name, region, zone FROM cities WHERE name ILIKE %s ORDER BY is_popular DESC, sort_order LIMIT 30',
                    (f'%{search}%',))
    else:
        cur.execute('SELECT id, name, region, zone, is_popular FROM cities ORDER BY sort_order LIMIT 40')
    return resp(200, {'cities': cur.fetchall()})


def _delivery(cur, body):
    city_id = body.get('city_id')
    items = body.get('items') or []
    if not city_id or not items:
        return resp(400, {'error': 'city_id и items обязательны'})
    cur.execute('SELECT zone, name FROM cities WHERE id = %s', (city_id,))
    row = cur.fetchone()
    if not row:
        return resp(404, {'error': 'Город не найден'})
    options = calc_delivery(row['zone'], items)
    return resp(200, {'city': row['name'], 'options': options})


def _pvz(cur, params):
    city_id = params.get('city_id')
    if not city_id:
        return resp(400, {'error': 'city_id обязателен'})
    cur.execute(
        '''SELECT id, provider, address, work_hours, lat, lon, is_available
           FROM pickup_points WHERE city_id = %s AND is_available = TRUE ORDER BY id''',
        (city_id,))
    return resp(200, {'points': cur.fetchall()})


def handler(event: dict, context) -> dict:
    '''Magazin RazPC: katalog komplektuyushchih, goroda, raschet dostavki, PVZ.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**CORS, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', 'products')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except (ValueError, TypeError):
            body = {}

    conn = connect()
    try:
        cur = cursor(conn)
        ensure_seed(cur)

        if resource == 'categories' and method == 'GET':
            return _categories(cur)
        if resource == 'products' and method == 'GET':
            slug = params.get('slug')
            return _get_product(cur, slug) if slug else _list_products(cur, params)
        if resource == 'cities' and method == 'GET':
            return _cities(cur, params)
        if resource == 'delivery' and method == 'POST':
            return _delivery(cur, body)
        if resource == 'pvz' and method == 'GET':
            return _pvz(cur, params)

        return resp(400, {'error': 'Неизвестный запрос'})
    finally:
        conn.close()