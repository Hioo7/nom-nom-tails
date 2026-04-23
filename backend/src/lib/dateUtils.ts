import { DayOfWeek } from '@prisma/client';

export const JS_DAY_TO_DOW: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function nextOccurrenceOfDow(targetDow: DayOfWeek, minDate: Date): Date {
  const d = new Date(minDate);
  while (JS_DAY_TO_DOW[d.getDay()] !== targetDow) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}
