import { NavLink } from 'react-router-dom';
import { FiHome, FiStar, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';

export function BottomNav() {
  const { totalItems } = useCart();

  const tabs = [
    { to: '/', label: 'Home', icon: <FiHome size={22} /> },
    { to: '/premium', label: 'Premium', icon: <FiStar size={22} /> },
    { to: '/cart', label: 'Cart', icon: <FiShoppingCart size={22} />, badge: totalItems },
    { to: '/profile', label: 'Account', icon: <FiUser size={22} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
              isActive ? 'text-orange-500' : 'text-gray-400'
            }`
          }
        >
          <span className="relative">
            {tab.icon}
            {tab.badge && tab.badge > 0 ? (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            ) : null}
          </span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
