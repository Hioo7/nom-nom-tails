import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const STORAGE_KEY = 'nom_nom_notifications';

interface NotifPrefs {
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
  newDishes: boolean;
}

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as NotifPrefs;
  } catch {
    // ignore
  }
  return { orderUpdates: true, deliveryUpdates: true, promotions: false, newDishes: true };
}

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

const ITEMS: { key: keyof NotifPrefs; label: string; description: string }[] = [
  {
    key: 'orderUpdates',
    label: 'Order Updates',
    description: 'Get notified when your order status changes',
  },
  {
    key: 'deliveryUpdates',
    label: 'Delivery Updates',
    description: 'Track your delivery in real time',
  },
  {
    key: 'promotions',
    label: 'Promotions & Offers',
    description: 'Discounts, deals, and special offers',
  },
  {
    key: 'newDishes',
    label: 'New Dishes',
    description: "Be the first to know when new meals are added",
  },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotifPrefs>(loadPrefs);

  const toggle = (key: keyof NotifPrefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
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
          <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {ITEMS.map((item, i) => (
            <div
              key={item.key}
              className={`flex items-center justify-between px-4 py-4 ${
                i < ITEMS.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="flex-1 mr-4">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
              </div>
              <Toggle enabled={prefs[item.key]} onChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
