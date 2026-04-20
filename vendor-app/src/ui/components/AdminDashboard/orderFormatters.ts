import type { AdminOrderTimeSlot } from '../../../types';

export function formatCurrency(amount: number): string {
  return (amount / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDay(day: string): string {
  return day
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatTimeSlotLabel(timeSlot: AdminOrderTimeSlot): string {
  return `${formatDay(timeSlot.day)} • ${timeSlot.startTime} - ${timeSlot.endTime}`;
}

export function formatQuantity(quantity: number, unit: string): string {
  const normalized = Number.isInteger(quantity)
    ? quantity.toLocaleString('en-IN')
    : quantity.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      });

  return `${normalized} ${unit}`;
}

export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallbackMessage;
}

export function toDateTimeLocalValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
