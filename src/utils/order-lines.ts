import type { ServiceType } from '@/types/models';

export type OrderLineDraft = {
  serviceTypeId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  length?: number;
  width?: number;
};

export function isM2Unit(unit: string): boolean {
  return unit.trim().toLowerCase() === 'm2';
}

export function isM1Unit(unit: string): boolean {
  return unit.trim().toLowerCase() === 'm1';
}

export function lineSubtotal(line: OrderLineDraft): number {
  return Math.max(line.quantity * line.unitPrice - line.discount, 0);
}

export function orderTotal(lines: OrderLineDraft[]): number {
  return lines.reduce((sum, line) => sum + lineSubtotal(line), 0);
}

export function getServiceForLine(
  lines: OrderLineDraft[],
  index: number,
  services: ServiceType[],
): ServiceType | undefined {
  const id = lines[index]?.serviceTypeId;
  if (!id) return undefined;
  return services.find((s) => s.id === id);
}

/** Mirror web OrderItemsForm: qty from dimensions for m2/m1. */
export function applyLengthWidthM2(
  line: OrderLineDraft,
  length: number,
  width: number,
): OrderLineDraft {
  const qty = Math.max(length * width, 0);
  return { ...line, length, width, quantity: qty };
}

export function applyLengthM1(line: OrderLineDraft, length: number): OrderLineDraft {
  return { ...line, length, quantity: Math.max(length, 0) };
}
