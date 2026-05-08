import type { ReactNode } from 'react';
import { FiClipboard, FiUser } from 'react-icons/fi';
import type { ChefDashboardTab } from './chefNavigation';

interface ChefBottomNavProps {
  activeTab: ChefDashboardTab;
  onTabChange: (tab: ChefDashboardTab) => void;
}

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${
        active ? 'text-primary' : 'text-base-content/40 hover:text-base-content/70'
      }`}
    >
      <span className={`transition-transform ${active ? 'scale-110' : ''}`}>{icon}</span>
      <span className={`text-[11px] font-medium tracking-wide ${active ? 'text-primary' : ''}`}>
        {label}
      </span>
      {active ? (
        <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
      ) : null}
    </button>
  );
}

export default function ChefBottomNav({ activeTab, onTabChange }: ChefBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 border-t border-base-200 bg-base-100 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <NavItem
        icon={<FiClipboard size={22} />}
        label="Orders"
        active={activeTab === 'orders'}
        onClick={() => onTabChange('orders')}
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
