import { getToken } from './auth';

const UPLOAD_URL = 'https://functions.poehali.dev/d76dfa4d-2fac-4b36-9f71-21628d29d248';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  const base64 = await fileToBase64(file);
  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() || '' },
    body: JSON.stringify({ file: base64, content_type: file.type || 'image/png' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось загрузить изображение');
  return data.url as string;
}
