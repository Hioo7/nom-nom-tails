import type { SafeCustomerCampaign } from '../../types';
import { paiseToRupees } from '../../utils/currency';

interface Props {
  campaign: SafeCustomerCampaign;
}

export function CampaignCard({ campaign }: Props) {
  const raised = paiseToRupees(campaign.summary.totalRaised);
  const goal = paiseToRupees(campaign.costAmount);
  const percent = Math.min(100, goal > 0 ? Math.round((raised / goal) * 100) : 0);

  return (
    <div className="flex-shrink-0 w-64 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
      {/* Image */}
      <div className="relative h-32 bg-orange-50 flex items-center justify-center overflow-hidden">
        {campaign.imageUrl ? (
          <img
            src={campaign.imageUrl}
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">🐾</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-2 left-3 text-white text-xs font-bold bg-orange-500 px-2 py-0.5 rounded-full">
          ₹{paiseToRupees(campaign.costAmount)} / meal
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="font-bold text-gray-900 text-sm leading-tight truncate">{campaign.name}</p>
        {campaign.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        )}

        {/* Progress */}
        <div className="mt-2.5">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>₹{raised} raised</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-1.5">
          {campaign.summary.successfulContributionCount} supporter
          {campaign.summary.successfulContributionCount !== 1 ? 's' : ''}
          {campaign.isOngoing ? ' · Ongoing' : campaign.endDate ? ` · Ends ${new Date(campaign.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}
        </p>
      </div>
    </div>
  );
}
