import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCamera,
  FiClock,
  FiTruck,
  FiRefreshCw,
  FiXCircle,
  FiHeart,
  FiHeadphones,
  FiUser,
  FiMapPin,
  FiSettings,
  FiBell,
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-7xl mb-5">🐾</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Nom Nom Tails</h2>
        <p className="text-gray-400 text-sm mb-8">
          Login or create an account to manage your orders and profile
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full max-w-xs bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-colors mb-3 shadow-lg shadow-orange-200"
        >
          Login
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="w-full max-w-xs border-2 border-orange-400 text-orange-500 font-bold py-3.5 rounded-2xl transition-colors"
        >
          Create Account
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const orderQuickLinks = [
    {
      label: 'Pending',
      icon: <FiClock size={22} />,
      color: 'bg-amber-100 text-amber-500',
      filter: 'PENDING',
    },
    {
      label: 'Delivered',
      icon: <FiTruck size={22} />,
      color: 'bg-green-100 text-green-500',
      filter: 'DELIVERED',
    },
    {
      label: 'Processing',
      icon: <FiRefreshCw size={22} />,
      color: 'bg-blue-100 text-blue-500',
      filter: 'CONFIRMED',
    },
    {
      label: 'Cancelled',
      icon: <FiXCircle size={22} />,
      color: 'bg-red-100 text-red-500',
      filter: 'CANCELLED',
    },
    {
      label: 'Wishlist',
      icon: <FiHeart size={22} />,
      color: 'bg-pink-100 text-pink-500',
      filter: null,
    },
    {
      label: 'Support',
      icon: <FiHeadphones size={22} />,
      color: 'bg-purple-100 text-purple-500',
      filter: null,
    },
  ];

  const settingsItems = [
    { icon: <FiUser size={18} />, label: 'Edit Profile', action: () => navigate('/profile/edit') },
    { icon: <FiMapPin size={18} />, label: 'Shipping Address', action: () => navigate('/profile/address') },
    { icon: <FiBell size={18} />, label: 'Notifications', action: () => navigate('/profile/notifications') },
    { icon: <FiSettings size={18} />, label: 'Settings', action: () => navigate('/profile/settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header with wave ── */}
      <div className="relative bg-orange-500 pt-10 pb-20 px-4 text-center overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />

        {/* Avatar */}
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
            <span className="text-4xl font-bold text-orange-500">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center border border-gray-100">
            <FiCamera size={13} className="text-gray-500" />
          </button>
        </div>

        <h1 className="text-xl font-bold text-white">{user.name}</h1>
        <p className="text-orange-200 text-sm mt-0.5">{user.email}</p>
        {user.isLoyalty && (
          <span className="inline-block mt-1.5 bg-white/20 text-white text-xs px-3 py-0.5 rounded-full">
            ⭐ Loyalty Member
          </span>
        )}
      </div>

      {/* ── Wave shape ── */}
      <div className="-mt-10 overflow-hidden">
        <svg viewBox="0 0 390 40" className="w-full block" preserveAspectRatio="none" height="40">
          <path d="M0,0 C130,40 260,40 390,0 L390,40 L0,40 Z" fill="#f9fafb" />
        </svg>
      </div>

      <div className="px-4 -mt-2 max-w-lg mx-auto pb-8">
        {/* ── My Orders quick grid ── */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-base">My Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-orange-500 text-sm font-medium flex items-center gap-0.5"
            >
              View All <FiChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {orderQuickLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate('/orders', { state: { filter: item.filter } })}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-xs text-gray-600 font-medium text-center leading-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Settings list ── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {settingsItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors ${
                i < settingsItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <span className="text-gray-400">{item.icon}</span>
              <span className="flex-1 text-gray-700 font-medium text-sm">{item.label}</span>
              <FiChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* ── Logout ── */}
        {!confirmLogout ? (
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 font-semibold text-sm bg-white hover:bg-red-50 transition-colors"
          >
            <FiLogOut size={16} /> Logout
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-800 mb-1 text-center">Log out of your account?</p>
            <p className="text-xs text-gray-400 text-center mb-4">You'll need to login again to place orders.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
