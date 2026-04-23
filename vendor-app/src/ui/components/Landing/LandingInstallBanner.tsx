import { FiDownload, FiSmartphone } from 'react-icons/fi';
import { usePWAInstall } from '../../../hooks/usePWAInstall';

interface LandingInstallBannerProps {
  onInstallClick: () => void;
}

export default function LandingInstallBanner({ onInstallClick }: LandingInstallBannerProps) {
  const { canInstall, isIOS, isStandalone } = usePWAInstall();

  if (isStandalone) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <section className="px-6 pt-6">
      <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <FiSmartphone size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-base-content">Install the app</p>
          <p className="text-xs text-base-content/60">Faster access, works offline</p>
        </div>
        <button
          className="btn btn-primary btn-sm gap-1.5 shrink-0"
          onClick={onInstallClick}
        >
          <FiDownload size={14} />
          Install
        </button>
      </div>
    </section>
  );
}
