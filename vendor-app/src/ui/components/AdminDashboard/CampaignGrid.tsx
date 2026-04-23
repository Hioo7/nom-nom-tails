import type { Campaign } from '../../../types';
import CampaignCard from './CampaignCard';

interface CampaignGridProps {
  campaigns: Campaign[];
  onPreview: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDeactivate: (campaign: Campaign) => void;
  onOpenContributions: (campaign: Campaign) => void;
  onAddFirst: () => void;
}

export default function CampaignGrid({
  campaigns,
  onPreview,
  onEdit,
  onDeactivate,
  onOpenContributions,
  onAddFirst,
}: CampaignGridProps) {
  if (campaigns.length === 0) {
    return (
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body items-center gap-3 py-12 text-center">
          <span className="text-5xl text-base-content/20">🎯</span>
          <div>
            <h3 className="font-semibold text-base-content/70">No campaigns yet</h3>
            <p className="mt-1 text-sm text-base-content/50">
              Create your first campaign to add a banner-led donation experience to the app.
            </p>
          </div>
          <button type="button" className="btn btn-neutral btn-sm mt-1" onClick={onAddFirst}>
            Create first campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onPreview={() => onPreview(campaign)}
          onEdit={() => onEdit(campaign)}
          onDeactivate={() => onDeactivate(campaign)}
          onOpenContributions={() => onOpenContributions(campaign)}
        />
      ))}
    </div>
  );
}

