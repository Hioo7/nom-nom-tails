import { useEffect, useRef } from 'react';
import { FiShare, FiPlusSquare, FiCheck, FiDownload } from 'react-icons/fi';
import MobileModalShell from './MobileModalShell';
import { usePWAInstall } from '../../../hooks/usePWAInstall';
import nomnomlogo from '../../../assets/nomnomlogo.webp';

interface PWAInstallModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PWAInstallModal({ open, onClose }: PWAInstallModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { canInstall, isIOS, promptInstall } = usePWAInstall();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  async function handleInstall() {
    await promptInstall();
    onClose();
  }

  return (
    <MobileModalShell
      dialogRef={dialogRef}
      title="Install NomNom Tails"
      description="Add to your home screen for the best experience — works offline too."
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-2">
          {canInstall && !isIOS && (
            <button className="btn btn-primary w-full gap-2" onClick={handleInstall}>
              <FiDownload size={18} />
              Install Now
            </button>
          )}
          <button className="btn btn-ghost w-full" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-6 py-2">
        <img src={nomnomlogo} alt="NomNom Tails" className="h-20 w-auto" />

        {isIOS && (
          <div className="flex flex-col gap-3 w-full">
            <p className="text-sm font-semibold text-base-content">Follow these steps in Safari:</p>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content text-xs font-bold">
                1
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/80 pt-1">
                <FiShare size={16} className="shrink-0 text-primary" />
                Tap the <strong>Share</strong> button in the toolbar
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content text-xs font-bold">
                2
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/80 pt-1">
                <FiPlusSquare size={16} className="shrink-0 text-primary" />
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content text-xs font-bold">
                3
              </div>
              <div className="flex items-center gap-2 text-sm text-base-content/80 pt-1">
                <FiCheck size={16} className="shrink-0 text-primary" />
                Tap <strong>"Add"</strong> to confirm
              </div>
            </div>
          </div>
        )}

        {!canInstall && !isIOS && (
          <p className="text-sm text-base-content/60 text-center">
            Your browser doesn't support automatic installation. Open this app in Chrome on Android
            for the best install experience.
          </p>
        )}
      </div>
    </MobileModalShell>
  );
}
