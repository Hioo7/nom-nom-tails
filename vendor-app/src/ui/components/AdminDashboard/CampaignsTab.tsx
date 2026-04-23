import { useState } from 'react';
import { useCampaignContributionBreakdown } from '../../../hooks/useCampaignContributionBreakdown';
import { useCampaignActions } from '../../../hooks/useCampaignActions';
import { useCampaigns } from '../../../hooks/useCampaigns';
import type { Campaign, CreateCampaignPayload } from '../../../types';
import CampaignContributionModal from './CampaignContributionModal';
import CampaignGrid from './CampaignGrid';
import CampaignHeader from './CampaignHeader';
import CampaignPreviewModal from './CampaignPreviewModal';
import CreateEditCampaignModal from './CreateEditCampaignModal';
import DeactivateCampaignModal from './DeactivateCampaignModal';

type ModalMode = 'create' | 'edit' | 'preview' | 'deactivate' | null;

export default function CampaignsTab() {
  const { campaigns, isLoading, error, refetch } = useCampaigns();
  const { createCampaign, updateCampaign, deactivateCampaign } = useCampaignActions(refetch);
  const contributionBreakdown = useCampaignContributionBreakdown();

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeModal, setActiveModal] = useState<ModalMode>(null);

  const openCreate = (): void => {
    setSelectedCampaign(null);
    setActiveModal('create');
  };

  const openPreview = (campaign: Campaign): void => {
    setSelectedCampaign(campaign);
    setActiveModal('preview');
  };

  const openEdit = (campaign: Campaign): void => {
    setSelectedCampaign(campaign);
    setActiveModal('edit');
  };

  const openDeactivate = (campaign: Campaign): void => {
    setSelectedCampaign(campaign);
    setActiveModal('deactivate');
  };

  const closeModal = (): void => {
    setActiveModal(null);
    setSelectedCampaign(null);
  };

  const handleSave = async (
    payload: CreateCampaignPayload,
    imageFile?: File,
  ): Promise<void> => {
    if (activeModal === 'create') {
      await createCampaign(payload, imageFile);
      return;
    }

    if (activeModal === 'edit' && selectedCampaign) {
      await updateCampaign(selectedCampaign.id, payload, imageFile);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <CampaignHeader count={campaigns.length} onAddCampaign={openCreate} />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : (
        <CampaignGrid
          campaigns={campaigns}
          onPreview={openPreview}
          onEdit={openEdit}
          onDeactivate={openDeactivate}
          onOpenContributions={(campaign) => {
            void contributionBreakdown.openContributionBreakdown(campaign);
          }}
          onAddFirst={openCreate}
        />
      )}

      {(activeModal === 'create' || activeModal === 'edit') ? (
        <CreateEditCampaignModal
          mode={activeModal}
          campaign={selectedCampaign ?? undefined}
          onClose={closeModal}
          onSaved={handleSave}
        />
      ) : null}

      {activeModal === 'preview' && selectedCampaign ? (
        <CampaignPreviewModal campaign={selectedCampaign} onClose={closeModal} />
      ) : null}

      {activeModal === 'deactivate' && selectedCampaign ? (
        <DeactivateCampaignModal
          campaign={selectedCampaign}
          onConfirm={() => deactivateCampaign(selectedCampaign.id)}
          onClose={closeModal}
        />
      ) : null}

      {contributionBreakdown.selectedCampaign ? (
        <CampaignContributionModal
          campaign={contributionBreakdown.selectedCampaign}
          breakdown={contributionBreakdown.breakdown}
          isLoading={contributionBreakdown.isLoading}
          error={contributionBreakdown.error}
          onRetry={contributionBreakdown.retryContributionBreakdown}
          onClose={contributionBreakdown.closeContributionBreakdown}
        />
      ) : null}
    </div>
  );
}

