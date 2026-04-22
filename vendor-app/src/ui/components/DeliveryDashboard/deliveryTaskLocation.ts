import type { DeliveryPartnerTaskSummary } from '../../../types';

export function hasValidTaskCoordinates(task: DeliveryPartnerTaskSummary): boolean {
  return Number.isFinite(task.latitude) && Number.isFinite(task.longitude);
}

export function buildGoogleMapsLocationUrl(task: DeliveryPartnerTaskSummary): string {
  const query = `${task.latitude},${task.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
