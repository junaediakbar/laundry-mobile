import type { Customer, CustomerOrderSummary, Paged } from '@/types/models';

import { apiFetch } from './api-client';

export function fetchCustomers(q?: string, page = 1, pageSize = 20) {
  const sp = new URLSearchParams();
  if (q) sp.set('q', q);
  sp.set('page', String(page));
  sp.set('pageSize', String(pageSize));
  return apiFetch<Paged<Customer>>(`/api/v1/customers?${sp.toString()}`);
}

export function fetchCustomer(id: string) {
  return apiFetch<Customer>(`/api/v1/customers/${id}`);
}

export function fetchCustomerRecentOrders(id: string, limit = 10) {
  return apiFetch<CustomerOrderSummary[]>(
    `/api/v1/customers/${id}/orders?limit=${encodeURIComponent(String(limit))}`,
  );
}
