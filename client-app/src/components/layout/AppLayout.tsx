import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiDownload } from 'react-icons/fi';
import { BottomNav } from './BottomNav';
import { InstallBanner } from '../ui/InstallBanner';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export function AppLayout() {
  const { canInstall } = usePWAInstall();
  const [showInstall, setShowInstall] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top-right install button */}
      {canInstall && (
        <button
          onClick={() => setShowInstall(true)}
          className="fixed top-4 right-4 z-30 bg-orange-400 hover:bg-orange-500 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors"
          aria-label="Install app"
        >
          <FiDownload size={18} />
        </button>
      )}

      <div className="pb-20">
        <Outlet />
      </div>

      <InstallBanner open={showInstall} onClose={() => setShowInstall(false)} />
      <BottomNav />
    </div>
  );
}
