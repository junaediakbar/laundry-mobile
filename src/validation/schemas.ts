import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const orderLineSchema = z.object({
  serviceTypeId: z.string().min(1, 'Layanan wajib'),
  quantity: z.number().positive('Qty harus > 0'),
  unitPrice: z.number().nonnegative(),
  discount: z.number().nonnegative(),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, 'Pilih pelanggan'),
  note: z.string().optional(),
  items: z.array(orderLineSchema).min(1, 'Minimal satu item'),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive('Nominal wajib'),
  method: z.string().min(2, 'Metode wajib'),
  note: z.string().optional(),
});
