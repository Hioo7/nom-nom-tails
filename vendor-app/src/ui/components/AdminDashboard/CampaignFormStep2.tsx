import type { FieldErrors } from '../../../types';

interface CampaignFormStep2Props {
  cost: string;
  onCostChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  runForever: boolean;
  onRunForeverChange: (value: boolean) => void;
  fieldErrors: FieldErrors;
  disabled: boolean;
}

export default function CampaignFormStep2({
  cost,
  onCostChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  runForever,
  onRunForeverChange,
  fieldErrors,
  disabled,
}: CampaignFormStep2Props) {
  return (
    <div className="flex flex-col gap-4">
      <fieldset className="fieldset py-1">
        <legend className="fieldset-legend">
          Cost per contribution <span className="text-error">*</span>
        </legend>
        <label className={`input input-sm w-full${fieldErrors['cost'] ? ' input-error' : ''}`}>
          <span className="text-base-content/40 text-sm font-medium">₹</span>
          <input
            type="text"
            inputMode="decimal"
            className="grow"
            placeholder="e.g. 199"
            value={cost}
            onChange={(event) => onCostChange(event.target.value)}
            disabled={disabled}
          />
        </label>
        {fieldErrors['cost'] ? (
          <p className="mt-1 text-xs text-error">{fieldErrors['cost']}</p>
        ) : null}
      </fieldset>

      <fieldset className="fieldset py-1">
        <legend className="fieldset-legend">
          Start date <span className="text-error">*</span>
        </legend>
        <input
          type="date"
          className={`input input-sm w-full${fieldErrors['startDate'] ? ' input-error' : ''}`}
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          disabled={disabled}
        />
        {fieldErrors['startDate'] ? (
          <p className="mt-1 text-xs text-error">{fieldErrors['startDate']}</p>
        ) : null}
      </fieldset>

      <div className="rounded-2xl border border-base-200 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-base-content">Run forever</p>
            <p className="text-xs text-base-content/50">Disable the end date for ongoing campaigns.</p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={runForever}
            onChange={(event) => onRunForeverChange(event.target.checked)}
            disabled={disabled}
          />
        </div>

        <fieldset className="fieldset mt-3 py-1">
          <legend className="fieldset-legend">End date</legend>
          <input
            type="date"
            className={`input input-sm w-full${fieldErrors['endDate'] ? ' input-error' : ''}`}
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            disabled={disabled || runForever}
          />
          {fieldErrors['endDate'] ? (
            <p className="mt-1 text-xs text-error">{fieldErrors['endDate']}</p>
          ) : null}
        </fieldset>
      </div>
    </div>
  );
}

