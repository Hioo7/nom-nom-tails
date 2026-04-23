import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function InstallBanner({ open, onClose }: Props) {
  const { install } = usePWAInstall();

  if (!open) return null;

  const handleInstall = async () => {
    await install();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed bottom-24 right-4 z-50 w-72">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/nomnomlogo_192.png"
              alt="Nom Nom Tails"
              className="w-12 h-12 rounded-xl flex-shrink-0"
            />
            <div>
              <p className="font-bold text-gray-800 text-sm">Nom Nom Tails</p>
              <p className="text-gray-400 text-xs">Add to your home screen</p>
            </div>
          </div>

          <p className="text-gray-500 text-xs mb-4 leading-relaxed">
            Install the app for a faster, native-like experience — works offline too!
          </p>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
