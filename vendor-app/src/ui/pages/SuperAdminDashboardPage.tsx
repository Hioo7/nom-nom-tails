import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import BottomNav from '../components/SuperAdminDashboard/BottomNav';
import SuperAdminProfileTab from '../components/SuperAdminDashboard/SuperAdminProfileTab';
import UsersTab from '../components/SuperAdminDashboard/UsersTab';
import {
  createSuperAdminDashboardSearchParams,
  parseSuperAdminDashboardTab,
} from '../components/SuperAdminDashboard/superAdminNavigation';

export default function SuperAdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseSuperAdminDashboardTab(searchParams.get('tab'));
  const searchValue = searchParams.get('q') ?? '';

  const updateDashboardState = useCallback(
    (
      updates: Partial<{
        tab: 'users' | 'profile';
        search: string;
      }>,
    ) => {
      setSearchParams(
        createSuperAdminDashboardSearchParams({
          tab: updates.tab ?? activeTab,
          search: updates.search ?? searchValue,
        }),
        { replace: true },
      );
    },
    [activeTab, searchValue, setSearchParams],
  );

  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto flex min-h-screen max-w-screen-md flex-col">
        <div className="flex-1 overflow-y-auto pb-24">
          {activeTab === 'users' ? (
            <UsersTab
              searchValue={searchValue}
              onSearchChange={(value) => updateDashboardState({ search: value })}
            />
          ) : (
            <SuperAdminProfileTab />
          )}
        </div>
        <BottomNav activeTab={activeTab} onTabChange={(tab) => updateDashboardState({ tab })} />
      </div>
    </div>
  );
}
