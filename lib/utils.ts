import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

export function formatDate(value: Timestamp | Date | null | undefined, fmt = 'MMM d, yyyy'): string {
  const date = toDate(value);
  if (!date) return '—';
  return format(date, fmt);
}

export function formatDateTime(value: Timestamp | Date | null | undefined): string {
  return formatDate(value, 'MMM d, yyyy HH:mm');
}

/** Converts any Firestore date representation to a JS Date, or null. */
export function normalizeFirestoreDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'object' && 'toDate' in (value as object)) {
    const d = (value as { toDate(): Date }).toDate();
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** True when two dates fall on the same calendar day (local time). */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return isNaN(n) || !isFinite(n) ? 0 : n;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function carStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    awaiting_owner_dropoff: 'Awaiting Drop-Off',
    awaiting_dropoff: 'Awaiting Drop-Off',
    awaiting_employee_verification: 'Awaiting Verification',
    delivery_rejected: 'Delivery Rejected',
    pending_inspection: 'Pending Inspection',
    at_hub: 'At Hub',
    ready_for_rental: 'Ready for Rental',
    available: 'Available',
    in_trip: 'In Trip',
    returned: 'Returned',
    maintenance: 'Under Maintenance',
    inactive: 'Inactive',
    unavailable: 'Unavailable',
  };
  return labels[status] ?? status;
}

export function carStatusColor(status: string): string {
  const colors: Record<string, string> = {
    awaiting_owner_dropoff: 'bg-amber-100 text-amber-800',
    awaiting_dropoff: 'bg-amber-100 text-amber-800',
    awaiting_employee_verification: 'bg-orange-100 text-orange-800',
    delivery_rejected: 'bg-red-100 text-red-800',
    pending_inspection: 'bg-orange-100 text-orange-800',
    at_hub: 'bg-blue-100 text-blue-800',
    ready_for_rental: 'bg-green-100 text-green-800',
    available: 'bg-green-100 text-green-800',
    in_trip: 'bg-purple-100 text-purple-800',
    returned: 'bg-teal-100 text-teal-800',
    maintenance: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-600',
    unavailable: 'bg-gray-100 text-gray-600',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-600';
}

export function bookingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    in_trip: 'In Trip',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  };
  return labels[status] ?? status;
}

export function bookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_trip: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-600';
}

export function payoutStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] ?? 'bg-gray-100 text-gray-600';
}
