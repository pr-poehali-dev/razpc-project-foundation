const AUTH_URL = 'https://functions.poehali.dev/ef464d23-7a25-43a9-9521-db1329ed6c63';

export type UserRole = 'admin' | 'manager' | 'builder' | 'moderator' | 'forum' | 'member';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

const TOKEN_KEY = 'razpc_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function post(action: string, body: unknown) {
  const res = await fetch(`${AUTH_URL}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка авторизации');
  return data;
}

export async function apiRegister(email: string, password: string, name: string) {
  const data = await post('register', { email, password, name });
  setToken(data.token);
  return data.user as AuthUser;
}

export async function apiLogin(email: string, password: string) {
  const data = await post('login', { email, password });
  setToken(data.token);
  return data.user as AuthUser;
}

export async function apiMe(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${AUTH_URL}?action=me`, {
    headers: { 'X-Auth-Token': token },
  });
  if (!res.ok) {
    clearToken();
    return null;
  }
  const data = await res.json();
  return data.user as AuthUser;
}

export async function apiLogout() {
  const token = getToken();
  if (token) {
    await fetch(`${AUTH_URL}?action=logout`, {
      method: 'POST',
      headers: { 'X-Auth-Token': token },
    }).catch(() => undefined);
  }
  clearToken();
}

export async function apiForgotPassword(email: string): Promise<void> {
  await post('forgot', { email });
}

export async function apiResetPassword(email: string, code: string, password: string): Promise<void> {
  await post('reset', { email, code, password });
}

export interface ManagedUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string | null;
}

export async function apiListUsers(): Promise<ManagedUser[]> {
  const token = getToken();
  const res = await fetch(`${AUTH_URL}?action=users`, {
    headers: { 'X-Auth-Token': token || '' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось загрузить пользователей');
  return data.users as ManagedUser[];
}

export async function apiSetRole(userId: number, role: UserRole): Promise<void> {
  const token = getToken();
  const res = await fetch(`${AUTH_URL}?action=set_role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
    body: JSON.stringify({ user_id: userId, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Не удалось изменить роль');
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  builder: 'Сборщик',
  moderator: 'Модератор',
  forum: 'Участник форума',
  member: 'Участник',
};