import { FiFileText, FiTag } from 'react-icons/fi';
import type { FieldErrors } from '../../../types';

interface CampaignFormStep1Props {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  isActive: boolean;
  onIsActiveChange: (value: boolean) => void;
  fieldErrors: FieldErrors;
  disabled: boolean;
}

export default function CampaignFormStep1({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  isActive,
  onIsActiveChange,
  fieldErrors,
  disabled,
}: CampaignFormStep1Props) {
  return (
    <>
      <fieldset className="fieldset py-1">
        <legend className="fieldset-legend flex items-center gap-1.5">
          <FiTag size={12} />
          Campaign name <span className="text-error">*</span>
        </legend>
        <input
          type="text"
          className={`input input-sm w-full${fieldErrors['name'] ? ' input-error' : ''}`}
          placeholder="e.g. Feed a shelter this month"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          disabled={disabled}
          autoFocus
        />
        {fieldErrors['name'] ? (
          <p className="mt-1 text-xs text-error">{fieldErrors['name']}</p>
        ) : null}
      </fieldset>

      <fieldset className="fieldset py-1">
        <legend className="fieldset-legend flex items-center gap-1.5">
          <FiFileText size={12} />
          Description
        </legend>
        <textarea
          className="textarea textarea-sm w-full"
          placeholder="Optional — explain what this campaign supports"
          rows={3}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={disabled}
        />
      </fieldset>

      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-medium text-base-content">Active in app</p>
          <p className="text-xs text-base-content/50">Turn this off to keep the campaign inactive.</p>
        </div>
        <input
          type="checkbox"
          className="toggle toggle-primary toggle-sm"
          checked={isActive}
          onChange={(event) => onIsActiveChange(event.target.checked)}
          disabled={disabled}
        />
      </div>
    </>
  );
}

