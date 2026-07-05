import { getToken } from './auth';

const CONTENT_URL = 'https://functions.poehali.dev/5408599e-f588-4316-b68a-07d0353aef87';

export type ContentMap = Record<string, string>;

export async function fetchContent(): Promise<ContentMap> {
  const res = await fetch(CONTENT_URL);
  if (!res.ok) return {};
  const data = await res.json();
  return (data.content || {}) as ContentMap;
}

export async function saveContent(
  updates: { key: string; value: string; type?: string }[],
): Promise<void> {
  const token = getToken();
  const res = await fetch(CONTENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
    body: JSON.stringify({ updates }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось сохранить');
}
