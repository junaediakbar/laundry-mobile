import type { DeliveryPlanListItem } from '@/types/models';

import { apiFetch } from './api-client';

export function fetchDeliveryPlans(limit = 50) {
  return apiFetch<DeliveryPlanListItem[]>(
    `/api/v1/delivery-plans?limit=${encodeURIComponent(String(limit))}`,
  );
}


export function deleteDeliveryPlan(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/delivery-plans/${id}`, { method: 'DELETE' });
}
