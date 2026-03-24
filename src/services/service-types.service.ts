import type { ServiceType } from '@/types/models';

import { apiFetch } from './api-client';

export function fetchServiceTypes(onlyActive = true) {
  const q = onlyActive ? '?active=true' : '';
  return apiFetch<ServiceType[]>(`/api/v1/service-types${q}`);
}


export function updateServiceType(id: string, payload: { name: string; unit: string; defaultPrice: number; isActive: boolean }) {
  return apiFetch<ServiceType>(`/api/v1/service-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function deleteServiceType(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/service-types/${id}`, { method: 'DELETE' });
}
