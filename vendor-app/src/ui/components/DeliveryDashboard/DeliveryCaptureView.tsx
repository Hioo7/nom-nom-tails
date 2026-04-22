import { FiArrowLeft, FiCamera, FiCheckCircle, FiRefreshCcw, FiUpload } from 'react-icons/fi';
import { useDeliveryProofCapture } from '../../../hooks/useDeliveryProofCapture';
import type { DeliveryPartnerTaskSummary } from '../../../types';

interface DeliveryCaptureViewProps {
  task: DeliveryPartnerTaskSummary | null;
  isLoadingTask: boolean;
  taskError: string;
  isSubmitting: boolean;
  error: string;
  onBack: () => void;
  onConfirm: (taskId: string, file: File) => Promise<void>;
}

interface DeliveryCaptureReadyViewProps {
  task: DeliveryPartnerTaskSummary;
  isSubmitting: boolean;
  error: string;
  onBack: () => void;
  onConfirm: (taskId: string, file: File) => Promise<void>;
}

function DeliveryCaptureReadyView({
  task,
  isSubmitting,
  error,
  onBack,
  onConfirm,
}: DeliveryCaptureReadyViewProps) {
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
    <div className="relative min-h-[100dvh] overflow-hidden bg-neutral">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isSubmitting}
      />

      <div className="absolute inset-0 bg-neutral">
        {previewUrl ? (
          <img src={previewUrl} alt="Delivery proof" className="h-full w-full object-cover" />
        ) : hasCameraSupport ? (
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-neutral-content/80">
            Camera preview is not available here. You can still upload a proof photo from your gallery.
          </div>
        )}

        {isStarting && !previewUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral/55">
            <span className="loading loading-spinner loading-lg text-neutral-content" />
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.08)_24%,rgba(0,0,0,0)_42%,rgba(0,0,0,0.2)_68%,rgba(0,0,0,0.82)_100%)]" />

      <div className="absolute left-4 right-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-20 flex items-start justify-between gap-3">
        <button
          type="button"
          className="btn btn-sm rounded-full border-none bg-base-100/90 text-base-content shadow-lg backdrop-blur"
          onClick={onBack}
        >
          <FiArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="absolute left-4 right-4 top-[calc(env(safe-area-inset-top,0px)+4.5rem)] z-20 flex flex-col gap-2">
        {error ? (
          <div className="alert alert-error shadow-lg">
            <span>{error}</span>
          </div>
        ) : null}

        {cameraError && !previewUrl ? (
          <div className="alert alert-warning shadow-lg">
            <span>{cameraError}</span>
          </div>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-24">
          {!previewUrl ? (
            <div className="flex items-end gap-3">
              <button
                type="button"
                className="btn btn-primary btn-lg min-h-14 flex-1 rounded-full shadow-2xl"
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
                className="btn btn-circle btn-lg border-none bg-base-100/92 text-base-content shadow-2xl backdrop-blur"
                onClick={openPicker}
                disabled={isSubmitting}
                aria-label="Upload from gallery"
              >
                <FiUpload size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <button
                type="button"
                className="btn btn-success btn-lg min-h-14 flex-1 rounded-full shadow-2xl"
                onClick={() => {
                  void handleConfirm();
                }}
                disabled={isSubmitting || !capturedFile}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <FiCheckCircle size={18} />
                    Mark Delivered
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-circle btn-lg border-none bg-base-100/92 text-base-content shadow-2xl backdrop-blur"
                onClick={() => {
                  void retakePhoto();
                }}
                disabled={isSubmitting}
                aria-label="Retake photo"
              >
                <FiRefreshCcw size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DeliveryCaptureView({
  task,
  isLoadingTask,
  taskError,
  isSubmitting,
  error,
  onBack,
  onConfirm,
}: DeliveryCaptureViewProps) {
  if (!task) {
    return (
      <div className="relative min-h-[100dvh] overflow-hidden bg-neutral">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_48%),linear-gradient(180deg,_rgba(0,0,0,0.12)_0%,_rgba(0,0,0,0.62)_100%)]" />

        <div className="relative z-10 flex min-h-[100dvh] flex-col px-4 py-6">
          <div className="pt-[calc(env(safe-area-inset-top,0px)+0.25rem)]">
            <button
              type="button"
              className="btn btn-sm rounded-full border-none bg-base-100/90 text-base-content shadow-lg backdrop-blur"
              onClick={onBack}
            >
              <FiArrowLeft size={18} />
              Back
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="card w-full max-w-sm border border-base-100/10 bg-base-100/92 shadow-2xl backdrop-blur">
              <div className="card-body items-center gap-3 text-center">
                {isLoadingTask ? (
                  <>
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <h2 className="text-lg font-semibold text-base-content">Opening camera view</h2>
                    <p className="text-sm text-base-content/70">Getting your delivery task ready.</p>
                  </>
                ) : (
                  <>
                    <FiCamera size={28} className="text-base-content/70" />
                    <h2 className="text-lg font-semibold text-base-content">Delivery task unavailable</h2>
                    <p className="text-sm text-base-content/70">
                      {taskError || 'Go back to My Tasks and reopen the delivery proof page.'}
                    </p>
                    <button type="button" className="btn btn-primary mt-2 rounded-full" onClick={onBack}>
                      Back to My Tasks
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DeliveryCaptureReadyView
      task={task}
      isSubmitting={isSubmitting}
      error={error}
      onBack={onBack}
      onConfirm={onConfirm}
    />
  );
}
