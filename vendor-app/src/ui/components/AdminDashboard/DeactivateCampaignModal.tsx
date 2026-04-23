import { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import type { Campaign } from '../../../types';
import MobileModalShell from '../shared/MobileModalShell';
import { getErrorMessage } from './orderFormatters';

interface DeactivateCampaignModalProps {
  campaign: Campaign;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeactivateCampaignModal({
  campaign,
  onConfirm,
  onClose,
}: DeactivateCampaignModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleConfirm = async (): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to deactivate campaign.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileModalShell
      dialogRef={dialogRef}
      title="Deactivate campaign"
      description={`This will stop ${campaign.name} from staying active in the app.`}
      icon={<FiAlertTriangle size={18} />}
      onClose={onClose}
      footer={(
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error flex-1"
            onClick={() => {
              void handleConfirm();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Deactivate'}
          </button>
        </div>
      )}
    >
      <p className="text-sm text-base-content/70">
        The campaign will remain in your records, but customers will no longer see it as active.
      </p>

      {errorMessage ? (
        <div className="alert alert-error text-sm">
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </MobileModalShell>
  );
}

