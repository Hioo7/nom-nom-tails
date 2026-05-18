import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiAlertCircle, FiBell } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { NotificationService } from '../services/notification.service';
import type { AppNotification } from '../types';

const notificationService = new NotificationService();

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'ORDER_DELIVERED') return (
    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
      <FiPackage size={18} className="text-green-600" />
    </div>
  );
  if (type === 'ORDER_FAILED') return (
    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
      <FiAlertCircle size={18} className="text-red-500" />
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
      <FiBell size={18} className="text-orange-500" />
    </div>
  );
}

export function NotificationInboxPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    notificationService
      .list(token)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));

    // Mark all read when the page opens
    notificationService.markAllRead(token).catch(() => {});
  }, [token]);

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
          <h1 className="text-lg font-bold text-gray-900 flex-1">Notifications</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBell size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We'll let you know when your order is delivered</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-sm border ${
                  n.isRead ? 'border-gray-50' : 'border-orange-100'
                }`}
              >
                <NotifIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
