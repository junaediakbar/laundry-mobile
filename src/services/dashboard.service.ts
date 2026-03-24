import type { DashboardSummary } from '@/types/models';

import { apiFetch } from './api-client';

export function fetchDashboardSummary() {
  return apiFetch<DashboardSummary>('/api/v1/dashboard/summary');
}
