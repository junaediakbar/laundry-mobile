import { theme } from '@/theme';

const workflowLabels: Record<string, string> = {
  received: 'Diterima',
  washing: 'Cuci',
  drying: 'Kering',
  ironing: 'Setrika',
  finished: 'Selesai',
  picked_up: 'Diambil',
};

export function workflowLabel(status: string): string {
  return workflowLabels[status] ?? status;
}

export function workflowColor(status: string): string {
  const key = status as keyof typeof theme.color.workflow;
  return theme.color.workflow[key] ?? theme.color.secondary;
}

const paymentLabels: Record<string, string> = {
  unpaid: 'Belum bayar',
  partial: 'Sebagian',
  paid: 'Lunas',
};

export function paymentLabel(status: string): string {
  return paymentLabels[status] ?? status;
}

export function paymentColor(status: string): string {
  const key = status as keyof typeof theme.color.payment;
  return theme.color.payment[key] ?? theme.color.secondary;
}
