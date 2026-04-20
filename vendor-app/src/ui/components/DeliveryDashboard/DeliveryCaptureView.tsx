import { useState } from 'react';
import { FiArrowLeft, FiCamera, FiCheckCircle, FiRefreshCcw, FiUpload } from 'react-icons/fi';
import { useDeliveryProofCapture } from '../../../hooks/useDeliveryProofCapture';
import type { DeliveryPartnerTaskSummary } from '../../../types';
import { formatDate, formatTimeSlotLabel } from '../AdminDashboard/orderFormatters';

interface DeliveryCaptureViewProps {
  task: DeliveryPartnerTaskSummary;
  isSubmitting: boolean;
  error: string;
  onBack: () => void;
  onConfirm: (taskId: string, file: File) => Promise<void>;
}

export default function DeliveryCaptureView({
  task,
  isSubmitting,
  error,
  onBack,
  onConfirm,
}: DeliveryCaptureViewProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const {
    videoRef,
    fileInputRef,
    previewUrl,
    capturedFile,
    isStarting,
    cameraError,
    hasCameraSupport,
    capturePhoto,
    retakePhoto,
    openPicker,
    handleFileSelect,
  } = useDeliveryProofCapture();

  const handleConfirm = async () => {
    if (!capturedFile) {
      return;
    }

    await onConfirm(task.taskId, capturedFile);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <button type="button" className="btn btn-ghost btn-sm rounded-full" onClick={onBack}>
          <FiArrowLeft size={16} />
          Back
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-base-content">Take Photo</h2>
          <p className="text-sm text-base-content/60">#{task.orderNumber}</p>
        </div>
      </div>

      <div className="card border border-base-200 bg-base-100 shadow-sm">
        <div className="card-body gap-2 p-4 text-sm text-base-content/70">
          <p className="font-semibold text-base-content">{task.customerName}</p>
          <p>{formatDate(task.deliveryDate)}</p>
          <p>{formatTimeSlotLabel(task.timeSlot)}</p>
        </div>
      </div>

      {error ? (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      ) : null}

      {cameraError && !previewUrl ? (
        <div className="alert alert-warning">
          <span>{cameraError}</span>
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isSubmitting}
      />

      <div className="overflow-hidden rounded-[1.75rem] border border-base-200 bg-neutral text-neutral-content shadow-sm">
        <div className="relative aspect-[3/4] w-full bg-neutral">
          {previewUrl ? (
            <img src={previewUrl} alt="Delivery proof" className="h-full w-full object-cover" />
          ) : hasCameraSupport ? (
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-neutral-content/70">
              Open the phone camera below and take a clear photo.
            </div>
          )}

          {isStarting && !previewUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral/60">
              <span className="loading loading-spinner loading-lg text-neutral-content" />
            </div>
          ) : null}
        </div>
      </div>

      {!previewUrl ? (
        <div className="grid gap-3">
          <button
            type="button"
            className="btn btn-primary btn-lg w-full"
            onClick={() => {
              void capturePhoto();
            }}
            disabled={isSubmitting || isStarting || !hasCameraSupport}
          >
            <FiCamera size={18} />
            Take Photo
          </button>
          <button
            type="button"
            className="btn btn-outline btn-lg w-full"
            onClick={openPicker}
            disabled={isSubmitting}
          >
            <FiUpload size={18} />
            Use Phone Camera
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          <button
            type="button"
            className="btn btn-outline btn-lg w-full"
            onClick={() => {
              void retakePhoto();
            }}
            disabled={isSubmitting}
          >
            <FiRefreshCcw size={18} />
            Retake
          </button>
          <button
            type="button"
            className="btn btn-success btn-lg w-full"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isSubmitting}
          >
            <FiCheckCircle size={18} />
            Mark Delivered
          </button>
        </div>
      )}

      {isConfirmOpen ? (
        <dialog className="modal modal-open">
          <div className="modal-box w-full max-w-sm">
            <h3 className="text-lg font-bold text-base-content">Finish delivery?</h3>
            <p className="mt-2 text-sm text-base-content/70">
              This will mark order #{task.orderNumber} as delivered.
            </p>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => {
                  void handleConfirm();
                }}
                disabled={isSubmitting || !capturedFile}
              >
                {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Yes, Mark'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button type="button" onClick={() => setIsConfirmOpen(false)}>
              close
            </button>
          </form>
        </dialog>
      ) : null}
    </div>
  );
}
