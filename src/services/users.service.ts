import type { User } from '@/types/models';

import { apiFetch } from './api-client';

export function fetchUsers() {
  return apiFetch<User[]>(`/api/v1/users`);
}


export function updateUser(id: string, payload: { name: string; email: string; role: string; isActive: boolean; password?: string }) {
  return apiFetch<User>(`/api/v1/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/users/${id}`, { method: 'DELETE' });
}
