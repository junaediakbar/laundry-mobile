import type { ServiceType } from '@/types/models';

import { apiFetch } from './api-client';

export function fetchServiceTypes(onlyActive = true) {
  const q = onlyActive ? '?active=true' : '';
  return apiFetch<ServiceType[]>(`/api/v1/service-types${q}`);
}
