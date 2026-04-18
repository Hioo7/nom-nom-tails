import { FiCamera, FiFileText, FiTag } from 'react-icons/fi';
import type { FieldErrors } from '../../../types';

interface DishFormStep1Props {
  name: string;
  onNameChange: (v: string) => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  price: string;
  onPriceChange: (v: string) => void;
  imagePreview: string | null;
  onImageClick: () => void;
  fieldErrors: FieldErrors;
  disabled: boolean;
}

export default function DishFormStep1({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  price,
  onPriceChange,
  imagePreview,
  onImageClick,
  fieldErrors,
  disabled,
}: DishFormStep1Props) {
  return (
    <>
      {/* Image upload */}
      <fieldset className="fieldset py-1">
        <legend className="fieldset-legend flex items-center gap-1.5">
          <FiCamera size={12} />
          Image
        </legend>
        {imagePreview ? (
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Dish preview"
              className="w-full h-28 object-cover rounded-xl border border-base-300"
            />
            <button
              type="button"
              className="btn btn-xs btn-ghost absolute top-2 right-2 bg-base-100/90 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onImageClick}
              disabled={disabled}
            >
              <FiCamera size={11} />
              Replace
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="w-full h-20 rounded-xl border-2 border-dashed border-base-300 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onImageClick}
            disabled={disabled}
          >
            <div className="w-9 h-9 rounded-full bg-base-200 flex items-center justify-center">
              <FiCamera size={15} className="text-base-content/50" />
            </div>
            <span className="text-xs text-base-content/40">Tap to upload an image</span>
          </button>
        )}
      </fieldset>

      {/* Name */}
      <fieldset className="fieldset py-1">
        <legend className="fieldset-legend flex items-center gap-1.5">
          <FiTag size={12} />
          Name <span className="text-error">*</span>
        </legend>
        <input
          type="text"
          className={`input input-sm w-full${fieldErrors['name'] ? ' input-error' : ''}`}
          placeholder="e.g. Chicken Rice Bowl"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          autoFocus
        />
        {fieldErrors['name'] && (
          <p className="text-error text-xs mt-1">{fieldErrors['name']}</p>
        )}
      </fieldset>

      {/* Description */}
      <fieldset className="fieldset py-1">
        <legend className="fieldset-legend flex items-center gap-1.5">
          <FiFileText size={12} />
          Description
        </legend>
        <textarea
          className="textarea textarea-sm w-full"
          placeholder="Optional — a short description of the dish"
          rows={2}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={disabled}
        />
      </fieldset>

      {/* Price */}
      <fieldset className="fieldset py-1">
        <legend className="fieldset-legend flex items-center gap-1.5">
          <span className="text-[11px] font-semibold leading-none">₹</span>
          Price <span className="text-error">*</span>
        </legend>
        <label
          className={`input input-sm w-full flex items-center gap-2${fieldErrors['price'] ? ' input-error' : ''}`}
        >
          <span className="text-base-content/40 text-sm font-medium select-none">₹</span>
          <input
            type="number"
            className="grow"
            placeholder="e.g. 150"
            min="1"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            disabled={disabled}
          />
        </label>
        {fieldErrors['price'] && (
          <p className="text-error text-xs mt-1">{fieldErrors['price']}</p>
        )}
      </fieldset>
    </>
  );
}
