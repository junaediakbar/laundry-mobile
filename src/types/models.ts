/** Auth `/me` may only return id, email, role; list users returns full rows. */
export type User = {
  id: string;
  email: string;
  role: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardSummary = {
  customerCount: number;
  orderCount: number;
  unpaidCount: number;
  totalRevenue: string;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  email?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOrderSummary = {
  id: string;
  invoiceNumber: string;
  total: string;
  workflowStatus: string;
};

export type ServiceType = {
  id: string;
  name: string;
  unit: string;
  defaultPrice: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Employee = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryPlanListItem = {
  id: string;
  name: string;
  plannedDate: string;
  stopCount: number;
};

export type OrderListItem = {
  id: string;
  invoiceNumber: string;
  publicToken: string;
  customer: { id: string; name: string };
  firstItem?: {
    serviceType: { id: string; name: string };
  };
  itemCount: number;
  total: string;
  paymentStatus: string;
  workflowStatus: string;
  createdAt: string;
};

export type WorkAssignment = {
  id: string;
  orderItemId: string;
  taskType: string;
  employee: { id: string; name: string };
  percent: string;
  amount: string;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  serviceType: { id: string; name: string; unit: string };
  quantity: string;
  unitPrice: string;
  discount: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  workAssignments: WorkAssignment[];
};

export type Payment = {
  id: string;
  orderId: string;
  amount: string;
  method: string;
  paidAt: string;
  note?: string | null;
  createdAt: string;
};

export type OrderAttachment = {
  id: string;
  orderId: string;
  filePath: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
};

export type OrderDetail = {
  id: string;
  invoiceNumber: string;
  publicToken: string;
  customer: { id: string; name: string; phone?: string | null };
  total: string;
  paymentStatus: string;
  workflowStatus: string;
  receivedDate: string;
  completedDate?: string | null;
  pickupDate?: string | null;
  image?: string | null;
  images?: string[];
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payments: Payment[];
  attachments: OrderAttachment[];
};

export type Paged<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
