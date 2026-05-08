import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChefBottomNav from '../components/ChefDashboard/ChefBottomNav';
import ChefOrdersTab from '../components/ChefDashboard/ChefOrdersTab';
import { parseChefDashboardTab } from '../components/ChefDashboard/chefNavigation';
import ProfileTab from '../components/shared/ProfileTab';

export default function ChefDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseChefDashboardTab(searchParams.get('tab'));

  const handleTabChange = useCallback(
    (tab: 'orders' | 'profile') => {
      const params = new URLSearchParams();
      params.set('tab', tab);
      setSearchParams(params, { replace: true });
    },
    [setSearchParams],
  );

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'orders' ? <ChefOrdersTab /> : <ProfileTab />}
      </div>
      <ChefBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
