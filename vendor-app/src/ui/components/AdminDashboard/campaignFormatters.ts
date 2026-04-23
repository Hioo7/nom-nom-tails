import type { CampaignStatus } from '../../../types';

export function formatCampaignDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCampaignDateRange(
  startDate: string,
  endDate: string | null,
  isOngoing: boolean,
): string {
  if (isOngoing) {
    return `Starts ${formatCampaignDate(startDate)} • Ongoing`;
  }

  if (!endDate) {
    return `Starts ${formatCampaignDate(startDate)}`;
  }

  return `${formatCampaignDate(startDate)} - ${formatCampaignDate(endDate)}`;
}

export function formatCampaignStatusLabel(status: CampaignStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function getCampaignStatusBadgeClass(status: CampaignStatus): string {
  if (status === 'ACTIVE') {
    return 'badge badge-success badge-sm';
  }

  if (status === 'INACTIVE') {
    return 'badge badge-ghost badge-sm';
  }

  if (status === 'COMPLETED') {
    return 'badge badge-secondary badge-sm';
  }

  return 'badge badge-warning badge-sm';
}

