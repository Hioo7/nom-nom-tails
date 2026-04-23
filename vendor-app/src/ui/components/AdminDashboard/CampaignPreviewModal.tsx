import { useEffect, useRef } from 'react';
import { FiImage } from 'react-icons/fi';
import type { Campaign } from '../../../types';
import MobileModalShell from '../shared/MobileModalShell';
import { formatCurrency, formatDateTime } from './orderFormatters';
import {
  formatCampaignDateRange,
  formatCampaignStatusLabel,
  getCampaignStatusBadgeClass,
} from './campaignFormatters';

interface CampaignPreviewModalProps {
  campaign: Campaign;
  onClose: () => void;
}

export default function CampaignPreviewModal({
  campaign,
  onClose,
}: CampaignPreviewModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <MobileModalShell
      dialogRef={dialogRef}
      title={campaign.name}
      description="Preview how this campaign appears before you edit or deactivate it."
      icon={<FiImage size={18} />}
      onClose={onClose}
      maxWidthClassName="sm:max-w-lg"
      footer={(
        <button type="button" className="btn btn-neutral w-full" onClick={onClose}>
          Close preview
        </button>
      )}
    >
      <div className="overflow-hidden rounded-3xl border border-base-200 bg-base-100">
        <div className="aspect-[16/9] bg-base-200">
          {campaign.imageUrl ? (
            <img src={campaign.imageUrl} alt={campaign.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-base-content/20">
              🎯
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-lg font-bold text-base-content">{campaign.name}</h4>
              <p className="mt-1 text-sm text-base-content/60">
                {campaign.description || 'No description added yet.'}
              </p>
            </div>
            <span className="badge badge-primary badge-md font-semibold">
              {formatCurrency(campaign.costAmount)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={getCampaignStatusBadgeClass(campaign.status)}>
              {formatCampaignStatusLabel(campaign.status)}
            </span>
            <span className="badge badge-ghost badge-sm">
              {campaign.summary.totalContributionCount} contribution
              {campaign.summary.totalContributionCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-base-200/70 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">Schedule</p>
              <p className="mt-1 text-sm text-base-content">
                {formatCampaignDateRange(campaign.startDate, campaign.endDate, campaign.isOngoing)}
              </p>
            </div>
            <div className="rounded-2xl bg-base-200/70 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">Raised</p>
              <p className="mt-1 text-sm font-semibold text-base-content">
                {formatCurrency(campaign.summary.totalRaised)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-base-200/70 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Last updated
            </p>
            <p className="mt-1 text-sm text-base-content">{formatDateTime(campaign.updatedAt)}</p>
          </div>
        </div>
      </div>
    </MobileModalShell>
  );
}

