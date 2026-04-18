import { FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff, FiImage } from 'react-icons/fi';

interface DishFormStep3Props {
  name: string;
  price: string;
  imagePreview: string | null;
  ingredientCount: number;
  isActive: boolean;
  onIsActiveChange: (v: boolean) => void;
  errorMessage: string;
  disabled: boolean;
}

export default function DishFormStep3({
  name,
  price,
  imagePreview,
  ingredientCount,
  isActive,
  onIsActiveChange,
  errorMessage,
  disabled,
}: DishFormStep3Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Review summary card */}
      <div className="rounded-xl bg-base-200 p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-3">
          <FiCheckCircle size={12} />
          <span>Summary</span>
        </div>
        <div className="flex gap-3 items-center">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt={name}
              className="w-16 h-16 object-cover rounded-lg shrink-0 border border-base-300"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-base-300 flex items-center justify-center shrink-0">
              <FiImage size={18} className="text-base-content/30" />
            </div>
          )}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-semibold truncate text-sm">{name || '\u2014'}</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge badge-ghost badge-sm font-medium">{'\u20B9'}{price}</span>
              <span className="text-xs text-base-content/40">
                {ingredientCount} ingredient{ingredientCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Storefront visibility */}
      <div className="rounded-xl border border-base-300 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-success/15' : 'bg-base-200'}`}>
              {isActive
                ? <FiEye size={15} className="text-success" />
                : <FiEyeOff size={15} className="text-base-content/40" />
              }
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">
                {isActive ? 'Visible in storefront' : 'Hidden from storefront'}
              </p>
              <p className="text-xs text-base-content/50 mt-0.5">
                {isActive
                  ? 'Customers can see and order this dish.'
                  : 'This dish is not visible to customers.'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-success toggle-sm shrink-0"
            checked={isActive}
            onChange={(e) => onIsActiveChange(e.target.checked)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Submit error */}
      {errorMessage && (
        <div className="alert alert-error text-sm py-2 gap-2">
          <FiAlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
