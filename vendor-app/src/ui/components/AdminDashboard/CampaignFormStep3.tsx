import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { FiCamera } from 'react-icons/fi';

interface CampaignFormStep3Props {
  editorImageUrl: string | null;
  onImageClick: () => void;
  crop: Point;
  onCropChange: (value: Point) => void;
  zoom: number;
  onZoomChange: (value: number) => void;
  onCropComplete: (_croppedArea: Area, croppedAreaPixels: Area) => void;
  disabled: boolean;
}

export default function CampaignFormStep3({
  editorImageUrl,
  onImageClick,
  crop,
  onCropChange,
  zoom,
  onZoomChange,
  onCropComplete,
  disabled,
}: CampaignFormStep3Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-base-200 bg-base-100 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-base-content">Banner image</p>
            <p className="text-xs text-base-content/50">
              Upload a banner and position the focal area for the campaign card.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline gap-2"
            onClick={onImageClick}
            disabled={disabled}
          >
            <FiCamera size={14} />
            {editorImageUrl ? 'Replace' : 'Upload'}
          </button>
        </div>
      </div>

      {editorImageUrl ? (
        <>
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-base-200">
            <Cropper
              image={editorImageUrl}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              showGrid={false}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="rounded-2xl border border-base-200 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-base-content">Zoom</span>
              <span className="text-xs text-base-content/50">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              className="range range-primary range-sm mt-3"
              disabled={disabled}
            />
          </div>
        </>
      ) : (
        <button
          type="button"
          className="flex h-44 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-base-300 bg-base-100 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
          onClick={onImageClick}
          disabled={disabled}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-base-200">
            <FiCamera size={18} className="text-base-content/50" />
          </div>
          <span className="text-sm font-medium text-base-content">Upload campaign banner</span>
          <span className="text-xs text-base-content/50">
            Choose an image, then crop and zoom it before saving.
          </span>
        </button>
      )}
    </div>
  );
}

