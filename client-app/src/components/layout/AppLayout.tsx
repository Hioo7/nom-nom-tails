import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { InstallBanner } from '../ui/InstallBanner';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        <Outlet />
      </div>
      <InstallBanner />
      <BottomNav />
    </div>
  );
}
