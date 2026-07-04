import json
import os
import io
import urllib.request
from collections import deque

import boto3
from PIL import Image


def handler(event: dict, context) -> dict:
    '''Удаляет светлый фон с фото ПК (flood fill от углов) и сохраняет PNG в S3.'''
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': {**cors_headers, 'Access-Control-Max-Age': '86400'}, 'body': ''}

    source_url = 'https://cdn.poehali.dev/projects/ceee2e70-3669-48d3-bf57-9e84dc7c6151/bucket/14b76b1f-4f43-48bc-ae73-555b03711e9a.jpg'

    req = urllib.request.Request(source_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read()

    img = Image.open(io.BytesIO(raw)).convert('RGBA')
    w, h = img.size
    px = img.load()

    def is_light(r, g, b):
        return r > 175 and g > 175 and b > 175

    visited = bytearray(w * h)
    q = deque()

    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y))

    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        idx = y * w + x
        if visited[idx]:
            continue
        visited[idx] = 1
        r, g, b, a = px[x, y]
        if not is_light(r, g, b):
            continue
        px[x, y] = (r, g, b, 0)
        q.append((x + 1, y))
        q.append((x - 1, y))
        q.append((x, y + 1))
        q.append((x, y - 1))

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    out_buf = io.BytesIO()
    img.save(out_buf, format='PNG', optimize=True)
    png_bytes = out_buf.getvalue()

    access_key = os.environ['AWS_ACCESS_KEY_ID']
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=access_key,
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    key = 'hero/razpc-cutout.png'
    s3.put_object(Bucket='files', Key=key, Body=png_bytes, ContentType='image/png')

    cdn_url = f'https://cdn.poehali.dev/projects/{access_key}/bucket/{key}'

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'url': cdn_url, 'size': len(png_bytes)}),
        'isBase64Encoded': False,
    }