import { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function InstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  const isDev = import.meta.env.DEV;
  if ((!canInstall && !isDev) || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-4 flex items-center gap-3">
        <img src="/nomnomlogo_192.png" alt="Nom Nom Tails" className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">Install Nom Nom Tails</p>
          <p className="text-gray-500 text-xs truncate">Add to home screen for a better experience</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 text-xs px-2 py-1 hover:text-gray-600"
          >
            Not now
          </button>
          <button
            onClick={install}
            className="bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
