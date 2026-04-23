import { useEffect, useRef } from 'react';
import type { Campaign, CreateCampaignPayload } from '../../../types';
import { useCampaignForm } from '../../../hooks/useCampaignForm';
import MobileModalShell from '../shared/MobileModalShell';
import CampaignFormNav from './CampaignFormNav';
import CampaignFormProgress from './CampaignFormProgress';
import CampaignFormStep1 from './CampaignFormStep1';
import CampaignFormStep2 from './CampaignFormStep2';
import CampaignFormStep3 from './CampaignFormStep3';
import CampaignFormStep4 from './CampaignFormStep4';

interface CreateEditCampaignModalProps {
  mode: 'create' | 'edit';
  campaign?: Campaign;
  onClose: () => void;
  onSaved: (payload: CreateCampaignPayload, imageFile?: File) => Promise<void>;
}

export default function CreateEditCampaignModal({
  mode,
  campaign,
  onClose,
  onSaved,
}: CreateEditCampaignModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useCampaignForm({ campaign, onSaved, onClose });

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <>
      <MobileModalShell
        dialogRef={dialogRef}
        title={mode === 'create' ? 'Create campaign' : 'Edit campaign'}
        description="Use a few short steps to configure campaign details and the banner preview."
        onClose={onClose}
        maxWidthClassName="sm:max-w-lg"
        footer={(
          <CampaignFormNav
            step={form.step}
            canGoNext={form.canGoNext}
            isSubmitting={form.isSubmitting}
            isPreparingImage={form.isPreparingImage}
            mode={mode}
            onClose={onClose}
            onBack={form.goBack}
            onNext={form.goNext}
            onSubmit={form.handleSubmit}
          />
        )}
      >
        <CampaignFormProgress step={form.step} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            void form.handleImageSelect(event);
          }}
          disabled={form.isSubmitting || form.isPreparingImage}
        />

        {form.step === 1 ? (
          <CampaignFormStep1
            name={form.name}
            onNameChange={form.setName}
            description={form.description}
            onDescriptionChange={form.setDescription}
            isActive={form.isActive}
            onIsActiveChange={form.setIsActive}
            fieldErrors={form.fieldErrors}
            disabled={form.isSubmitting}
          />
        ) : null}

        {form.step === 2 ? (
          <CampaignFormStep2
            cost={form.cost}
            onCostChange={form.setCost}
            startDate={form.startDate}
            onStartDateChange={form.setStartDate}
            endDate={form.endDate}
            onEndDateChange={form.setEndDate}
            runForever={form.runForever}
            onRunForeverChange={form.setRunForever}
            fieldErrors={form.fieldErrors}
            disabled={form.isSubmitting}
          />
        ) : null}

        {form.step === 3 ? (
          <CampaignFormStep3
            editorImageUrl={form.editorImageUrl}
            onImageClick={() => {
              fileInputRef.current?.click();
            }}
            crop={form.crop}
            onCropChange={form.handleCropChange}
            zoom={form.zoom}
            onZoomChange={form.handleZoomChange}
            onCropComplete={form.handleCropComplete}
            disabled={form.isSubmitting || form.isPreparingImage}
          />
        ) : null}

        {form.step === 4 ? (
          <CampaignFormStep4
            name={form.name}
            description={form.description}
            cost={form.cost}
            startDate={form.startDate}
            endDate={form.endDate}
            runForever={form.runForever}
            status={form.isActive ? 'ACTIVE' : 'INACTIVE'}
            imagePreview={form.imagePreview}
            errorMessage={form.errorMessage}
          />
        ) : null}

        {form.step !== 4 && form.errorMessage ? (
          <div className="alert alert-error text-sm">
            <span>{form.errorMessage}</span>
          </div>
        ) : null}
      </MobileModalShell>
    </>
  );
}

