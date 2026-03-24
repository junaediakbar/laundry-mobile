import type { User } from '@/types/models';

import { apiFetch } from './api-client';

export type LoginResult = { token: string; user: User };

export async function loginRequest(email: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
}

export async function meRequest(): Promise<User> {
  const row = await apiFetch<{ id: string; email: string; role: string }>('/api/v1/auth/me');
  return { id: row.id, email: row.email, role: row.role };
}
