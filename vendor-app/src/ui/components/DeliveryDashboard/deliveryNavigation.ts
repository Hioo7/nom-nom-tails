import type {
  DayOfWeek,
  DeliveryPartnerTaskSummary,
  DeliveryPartnerTaskTimeSlot,
  DeliveryTaskStatus,
} from '../../../types';

export type DeliveryDashboardTab = 'orders' | 'profile';
export type DeliveryOrdersSection = 'available' | 'tasks' | 'all';

interface DeliveryDashboardPathOptions {
  tab?: DeliveryDashboardTab;
  section?: DeliveryOrdersSection;
  refreshToken?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const validTabs: readonly DeliveryDashboardTab[] = ['orders', 'profile'];
const validSections: readonly DeliveryOrdersSection[] = ['available', 'tasks', 'all'];
const validDays: readonly DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];
const validStatuses: readonly DeliveryTaskStatus[] = [
  'AVAILABLE',
  'ASSIGNED',
  'PICKED_UP',
  'DELIVERED',
  'FAILED',
];
const validDayValues = new Set<string>(validDays);
const validStatusValues = new Set<string>(validStatuses);

function isDayOfWeek(value: unknown): value is DayOfWeek {
  return typeof value === 'string' && validDayValues.has(value);
}

function isDeliveryTaskStatus(value: unknown): value is DeliveryTaskStatus {
  return typeof value === 'string' && validStatusValues.has(value);
}

export function parseDeliveryDashboardTab(value: string | null): DeliveryDashboardTab {
  return validTabs.find((tab) => tab === value) ?? 'orders';
}

export function parseDeliveryOrdersSection(value: string | null): DeliveryOrdersSection {
  return validSections.find((section) => section === value) ?? 'available';
}

export function createDeliveryDashboardSearchParams(
  tab: DeliveryDashboardTab,
  section: DeliveryOrdersSection,
  refreshToken?: string,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('tab', tab);
  params.set('section', section);

  if (refreshToken) {
    params.set('refresh', refreshToken);
  }

  return params;
}

export function buildDeliveryDashboardPath(options: DeliveryDashboardPathOptions = {}): string {
  const tab = options.tab ?? 'orders';
  const section = options.section ?? 'available';
  const params = createDeliveryDashboardSearchParams(tab, section, options.refreshToken);
  return `/delivery?${params.toString()}`;
}

export function getDeliveryProofPath(taskId: string): string {
  return `/delivery/tasks/${taskId}/proof`;
}

function isDeliveryTaskTimeSlot(value: unknown): value is DeliveryPartnerTaskTimeSlot {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.startTime === 'string' &&
    typeof value.endTime === 'string' &&
    isDayOfWeek(value.day)
  );
}

function isDeliveryPartnerTaskSummary(value: unknown): value is DeliveryPartnerTaskSummary {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.taskId === 'string' &&
    typeof value.orderId === 'string' &&
    typeof value.orderNumber === 'string' &&
    typeof value.customerName === 'string' &&
    typeof value.deliveryDate === 'string' &&
    typeof value.itemCount === 'number' &&
    isDeliveryTaskStatus(value.status) &&
    isDeliveryTaskTimeSlot(value.timeSlot)
  );
}

export function readDeliveryProofTaskFromState(state: unknown): DeliveryPartnerTaskSummary | null {
  if (!isRecord(state)) {
    return null;
  }

  return isDeliveryPartnerTaskSummary(state.task) ? state.task : null;
}
