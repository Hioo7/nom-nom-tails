import { useState } from 'react';
import BottomNav from '../components/SuperAdminDashboard/BottomNav';
import UsersTab from '../components/SuperAdminDashboard/UsersTab';
import ProfileTab from '../components/shared/ProfileTab';

type Tab = 'users' | 'profile';

export default function SuperAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'users' ? <UsersTab /> : <ProfileTab />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
