import type { OrderDetail, OrderListItem, Paged, Payment } from '@/types/models';

import { apiFetch } from './api-client';

export type OrderListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  dir?: 'asc' | 'desc' | string;
};

export function fetchOrders(params: OrderListParams = {}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.page != null) sp.set('page', String(params.page));
  if (params.pageSize != null) sp.set('pageSize', String(params.pageSize));
  if (params.sort) sp.set('sort', params.sort);
  if (params.dir) sp.set('dir', params.dir);
  const q = sp.toString();
  return apiFetch<Paged<OrderListItem>>(`/api/v1/orders${q ? `?${q}` : ''}`);
}

export function fetchOrderDetail(id: string) {
  return apiFetch<OrderDetail>(`/api/v1/orders/${id}`);
}

export type CreateOrderLine = {
  serviceTypeId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
};

export type CreateOrderBody = {
  customerId: string;
  receivedDate?: string | null;
  completedDate?: string | null;
  note?: string | null;
  items: CreateOrderLine[];
};

export function createOrder(body: CreateOrderBody) {
  return apiFetch<OrderDetail>('/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId: body.customerId,
      receivedDate: body.receivedDate || undefined,
      completedDate: body.completedDate || undefined,
      note: body.note || undefined,
      items: body.items.map((i) => ({
        serviceTypeId: i.serviceTypeId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount ?? 0,
      })),
    }),
  });
}

export function updateWorkflow(orderId: string, workflowStatus: string) {
  return apiFetch<{ ok: boolean }>(`/api/v1/orders/${orderId}/workflow`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflowStatus }),
  });
}

export function createPayment(
  orderId: string,
  payload: { amount: number; method: string; note?: string | null },
) {
  return apiFetch<Payment>(`/api/v1/orders/${orderId}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: payload.amount,
      method: payload.method,
      note: payload.note ?? undefined,
    }),
  });
}
