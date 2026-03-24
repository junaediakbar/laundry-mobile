export const qk = {
  me: ['auth', 'me'] as const,
  dashboard: ['dashboard', 'summary'] as const,
  orders: (params: { q: string; page: number }) => ['orders', params] as const,
  order: (id: string) => ['orders', id] as const,
  customers: (params: { q: string; page: number }) => ['customers', params] as const,
  customer: (id: string) => ['customers', id] as const,
  customerOrders: (id: string) => ['customers', id, 'orders'] as const,
  serviceTypes: ['service-types'] as const,
};
