import json
import os

import psycopg2
from psycopg2.extras import RealDictCursor


def handler(event: dict, context) -> dict:
    '''API kataloga RazPC: spisok sborok i detal sborki s konfiguraciey.'''
    method = event.get('httpMethod', 'GET')

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**cors, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    params = event.get('queryStringParameters') or {}
    slug = params.get('slug')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if slug:
                result = _get_build_detail(cur, slug)
                if result is None:
                    return {
                        'statusCode': 404,
                        'headers': {**cors, 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Build not found'}),
                        'isBase64Encoded': False,
                    }
                body = result
            else:
                body = {'builds': _get_builds_list(cur)}
    finally:
        conn.close()

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps(body, ensure_ascii=False),
        'isBase64Encoded': False,
    }


def _get_builds_list(cur):
    cur.execute(
        '''
        SELECT id, slug, name, tagline, price, old_price, image_url,
               tier, performance_badge, status, warranty, is_featured
        FROM builds
        ORDER BY sort_order ASC, id ASC
        '''
    )
    builds = cur.fetchall()

    build_ids = [b['id'] for b in builds]
    highlights_map = {bid: [] for bid in build_ids}
    if build_ids:
        ids_csv = ','.join(str(i) for i in build_ids)
        cur.execute(
            f'''
            SELECT bc.build_id, c.type, c.brand, c.name, c.spec, bc.position
            FROM build_components bc
            JOIN components c ON c.id = bc.component_id
            WHERE bc.build_id IN ({ids_csv}) AND bc.is_highlight = TRUE
            ORDER BY bc.build_id, bc.position
            '''
        )
        for row in cur.fetchall():
            highlights_map[row['build_id']].append({
                'type': row['type'],
                'brand': row['brand'],
                'name': row['name'],
                'spec': row['spec'],
            })

    for b in builds:
        b['highlights'] = highlights_map.get(b['id'], [])
    return builds


def _get_build_detail(cur, slug):
    cur.execute(
        '''
        SELECT id, slug, name, tagline, price, old_price, image_url,
               tier, performance_badge, status, warranty
        FROM builds WHERE slug = %s
        ''',
        (slug,),
    )
    build = cur.fetchone()
    if not build:
        return None

    cur.execute(
        '''
        SELECT c.type, c.brand, c.name, c.spec, c.role, c.key_specs, bc.position
        FROM build_components bc
        JOIN components c ON c.id = bc.component_id
        WHERE bc.build_id = %s
        ORDER BY bc.position ASC
        ''',
        (build['id'],),
    )
    build['components'] = [
        {
            'type': r['type'],
            'brand': r['brand'],
            'name': r['name'],
            'spec': r['spec'],
            'role': r['role'],
            'key_specs': [s for s in (r['key_specs'] or '').split(';') if s],
        }
        for r in cur.fetchall()
    ]
    return build