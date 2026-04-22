import type { DeliveryPartnerTaskSummary } from '../../../types';

export function hasValidTaskCoordinates(task: DeliveryPartnerTaskSummary): boolean {
  return Number.isFinite(task.latitude) && Number.isFinite(task.longitude);
}

export function buildGoogleMapsEmbedUrl(task: DeliveryPartnerTaskSummary): string {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const q = `${task.latitude},${task.longitude}`;
  return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(q)}&zoom=16`;
}
