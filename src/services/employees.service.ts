import type { Employee } from '@/types/models';

import { apiFetch } from './api-client';

export function fetchEmployees(active?: boolean) {
  const q =
    active === undefined ? '' : active ? '?active=true' : '?active=false';
  return apiFetch<Employee[]>(`/api/v1/employees${q}`);
}


export function updateEmployee(id: string, payload: { name: string; isActive: boolean }) {
  return apiFetch<Employee>(`/api/v1/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function deleteEmployee(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/employees/${id}`, { method: 'DELETE' });
}
