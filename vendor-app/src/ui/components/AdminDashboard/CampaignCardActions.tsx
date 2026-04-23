import { FiEdit2, FiEye, FiSlash } from 'react-icons/fi';

interface CampaignCardActionsProps {
  onPreview: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  disableDeactivate: boolean;
}

export default function CampaignCardActions({
  onPreview,
  onEdit,
  onDeactivate,
  disableDeactivate,
}: CampaignCardActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="btn btn-neutral btn-md w-full justify-center gap-2"
        onClick={onPreview}
      >
        <FiEye size={14} />
        Preview
      </button>
      <button
        type="button"
        className="btn btn-outline btn-md w-full justify-center gap-2"
        onClick={onEdit}
      >
        <FiEdit2 size={14} />
        Edit
      </button>
      <button
        type="button"
        className="btn btn-outline btn-md w-full justify-center gap-2"
        onClick={onDeactivate}
        disabled={disableDeactivate}
      >
        <FiSlash size={14} />
        Deactivate
      </button>
    </div>
  );
}

