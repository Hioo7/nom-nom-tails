import { FiClipboard, FiShoppingBag, FiTruck, FiUser, FiUsers } from 'react-icons/fi';

type Tab = 'products' | 'orders' | 'customers' | 'deliveries' | 'profile';

interface AdminBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
        active ? 'text-primary' : 'text-base-content/40 hover:text-base-content/70'
      }`}
    >
      <span className={`transition-transform ${active ? 'scale-110' : ''}`}>{icon}</span>
      <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-primary' : ''}`}>
        {label}
      </span>
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

export default function AdminBottomNav({ activeTab, onTabChange }: AdminBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-base-100 border-t border-base-200 flex h-16 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <NavItem
        icon={<FiShoppingBag size={22} />}
        label="Products"
        active={activeTab === 'products'}
        onClick={() => onTabChange('products')}
      />
      <NavItem
        icon={<FiClipboard size={22} />}
        label="Orders"
        active={activeTab === 'orders'}
        onClick={() => onTabChange('orders')}
      />
      <NavItem
        icon={<FiUsers size={22} />}
        label="Customers"
        active={activeTab === 'customers'}
        onClick={() => onTabChange('customers')}
      />
      <NavItem
        icon={<FiTruck size={22} />}
        label="Deliveries"
        active={activeTab === 'deliveries'}
        onClick={() => onTabChange('deliveries')}
      />
      <NavItem
        icon={<FiUser size={22} />}
        label="Profile"
        active={activeTab === 'profile'}
        onClick={() => onTabChange('profile')}
      />
    </nav>
  );
}
