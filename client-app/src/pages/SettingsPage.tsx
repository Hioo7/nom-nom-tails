import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';

const APP_VERSION = '1.0.0';

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-orange-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(
    () => localStorage.getItem('nom_nom_analytics') !== 'false',
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleAnalytics = () => {
    const next = !analyticsEnabled;
    setAnalyticsEnabled(next);
    localStorage.setItem('nom_nom_analytics', String(next));
  };

  const handleClearCache = () => {
    const keysToKeep = ['nom_nom_token'];
    const saved: Record<string, string> = {};
    keysToKeep.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) saved[k] = v;
    });
    localStorage.clear();
    Object.entries(saved).forEach(([k, v]) => localStorage.setItem(k, v));
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Preferences
          </p>
          <div className="px-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Usage Analytics</p>
              <p className="text-xs text-gray-400 mt-0.5">Help us improve by sharing anonymous data</p>
            </div>
            <Toggle enabled={analyticsEnabled} onChange={toggleAnalytics} />
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Legal
          </p>
          {[
            { label: 'Privacy Policy' },
            { label: 'Terms of Service' },
            { label: 'Cookie Policy' },
          ].map((item, i, arr) => (
            <button
              key={item.label}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors ${
                i < arr.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <FiChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Data */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <p className="px-4 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Data
          </p>
          <div className="px-4 pb-4">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 text-red-500 text-sm font-medium"
              >
                <FiTrash2 size={15} />
                Clear App Data
              </button>
            ) : (
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">Are you sure?</p>
                <p className="text-xs text-gray-400 mb-3">
                  This will clear saved addresses, preferences, and notification settings. Your account and orders are not affected.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearCache}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl text-sm transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">About</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">App Version</span>
            <span className="text-gray-700 font-medium">{APP_VERSION}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-500">Made with</span>
            <span className="text-gray-700 font-medium">🐾 Nom Nom Tails</span>
          </div>
        </div>
      </div>
    </div>
  );
}
