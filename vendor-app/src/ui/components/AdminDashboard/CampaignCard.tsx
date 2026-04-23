import { FiUsers } from 'react-icons/fi';
import type { Campaign } from '../../../types';
import { formatCurrency } from './orderFormatters';
import {
  formatCampaignDateRange,
  formatCampaignStatusLabel,
  getCampaignStatusBadgeClass,
} from './campaignFormatters';
import CampaignCardActions from './CampaignCardActions';

interface CampaignCardProps {
  campaign: Campaign;
  onPreview: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onOpenContributions: () => void;
}

export default function CampaignCard({
  campaign,
  onPreview,
  onEdit,
  onDeactivate,
  onOpenContributions,
}: CampaignCardProps) {
  return (
    <div className="card overflow-hidden border border-base-200 bg-base-100 shadow-sm transition-shadow hover:shadow-md">
      <figure className="aspect-[16/9] overflow-hidden bg-base-200">
        {campaign.imageUrl ? (
          <img
            src={campaign.imageUrl}
            alt={campaign.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-base-content/20">
            🎯
          </div>
        )}
      </figure>

      <div className="card-body gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-tight text-base-content">{campaign.name}</h3>
            {campaign.description ? (
              <p className="mt-1 text-sm text-base-content/60 line-clamp-2">{campaign.description}</p>
            ) : (
              <p className="mt-1 text-sm text-base-content/40">No description added yet.</p>
            )}
          </div>
          <span className="badge badge-primary badge-sm shrink-0 font-semibold">
            {formatCurrency(campaign.costAmount)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={getCampaignStatusBadgeClass(campaign.status)}>
            {formatCampaignStatusLabel(campaign.status)}
          </span>
          <span className="badge badge-ghost badge-sm">
            {campaign.summary.totalContributionCount} contribution
            {campaign.summary.totalContributionCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="rounded-2xl bg-base-200/70 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">Schedule</p>
          <p className="mt-1 text-sm text-base-content">
            {formatCampaignDateRange(campaign.startDate, campaign.endDate, campaign.isOngoing)}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Raised so far
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-base font-semibold text-base-content">
              {formatCurrency(campaign.summary.totalRaised)}
            </p>
            <button
              type="button"
              className="btn btn-circle btn-sm btn-ghost border border-base-300"
              onClick={onOpenContributions}
              aria-label={`View successful contributions for ${campaign.name}`}
              title="View successful contributions"
            >
              <FiUsers size={15} />
            </button>
          </div>
        </div>

        <div className="border-t border-base-200 pt-4">
          <CampaignCardActions
            onPreview={onPreview}
            onEdit={onEdit}
            onDeactivate={onDeactivate}
            disableDeactivate={campaign.status === 'INACTIVE'}
          />
        </div>
      </div>
    </div>
  );
}

