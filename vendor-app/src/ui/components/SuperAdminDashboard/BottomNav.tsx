import { FiUser, FiUsers } from 'react-icons/fi';
import type { SuperAdminDashboardTab } from './superAdminNavigation';

interface BottomNavProps {
  activeTab: SuperAdminDashboardTab;
  onTabChange: (tab: SuperAdminDashboardTab) => void;
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
      <span className={`text-[11px] font-medium tracking-wide ${active ? 'text-primary' : ''}`}>
        {label}
      </span>
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
      )}
    </button>
  );
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-16 max-w-screen-md border-t border-base-200 bg-base-100/95 shadow-[0_-1px_8px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
      <NavItem
        icon={<FiUsers size={22} />}
        label="Staff"
        active={activeTab === 'users'}
        onClick={() => onTabChange('users')}
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
