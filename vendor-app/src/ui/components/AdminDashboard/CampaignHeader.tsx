import { FiPlus } from 'react-icons/fi';

interface CampaignHeaderProps {
  count: number;
  onAddCampaign: () => void;
}

export default function CampaignHeader({ count, onAddCampaign }: CampaignHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold text-base-content">Campaigns</h2>
          <span className="badge badge-neutral badge-sm">{count} total</span>
        </div>
        <p className="text-sm text-base-content/60">
          Promote donation campaigns with banner-first cards, schedule control, and mobile-native editing.
        </p>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-neutral sm:self-center"
        onClick={onAddCampaign}
      >
        <FiPlus size={16} />
        New campaign
      </button>
    </div>
  );
}

