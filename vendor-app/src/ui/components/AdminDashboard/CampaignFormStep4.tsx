import type { CampaignStatus } from '../../../types';
import { formatCurrency } from './orderFormatters';
import {
  formatCampaignDateRange,
  formatCampaignStatusLabel,
  getCampaignStatusBadgeClass,
} from './campaignFormatters';

interface CampaignFormStep4Props {
  name: string;
  description: string;
  cost: string;
  startDate: string;
  endDate: string;
  runForever: boolean;
  status: CampaignStatus;
  imagePreview: string | null;
  errorMessage: string;
}

export default function CampaignFormStep4({
  name,
  description,
  cost,
  startDate,
  endDate,
  runForever,
  status,
  imagePreview,
  errorMessage,
}: CampaignFormStep4Props) {
  const costDisplay = cost.trim() ? Number(cost).toLocaleString('en-IN') : '—';

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-3xl border border-base-200 bg-base-100">
        <div className="aspect-[16/9] bg-base-200">
          {imagePreview ? (
            <img src={imagePreview} alt="Campaign preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-base-content/20">
              🎯
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-base-content">{name || '—'}</h3>
              {description ? (
                <p className="mt-1 text-sm text-base-content/60">{description}</p>
              ) : (
                <p className="mt-1 text-sm text-base-content/40">No description added yet.</p>
              )}
            </div>
            <span className="badge badge-primary badge-md font-semibold">
              {cost.trim() ? formatCurrency(Math.round(Number(cost) * 100)) : `₹${costDisplay}`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={getCampaignStatusBadgeClass(status)}>
              {formatCampaignStatusLabel(status)}
            </span>
          </div>

          <div className="rounded-2xl bg-base-200/70 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">Schedule</p>
            <p className="mt-1 text-sm text-base-content">
              {startDate
                ? formatCampaignDateRange(startDate, endDate || null, runForever)
                : 'Add schedule details to preview the campaign timeline.'}
            </p>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="alert alert-error text-sm">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}

