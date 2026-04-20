import { useState } from 'react';
import AdminBottomNav from '../components/AdminDashboard/AdminBottomNav';
import DeliveriesTab from '../components/AdminDashboard/DeliveriesTab';
import OrdersTab from '../components/AdminDashboard/OrdersTab';
import ProductsTab from '../components/AdminDashboard/ProductsTab';
import ProfileTab from '../components/shared/ProfileTab';

type Tab = 'products' | 'orders' | 'deliveries' | 'profile';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'deliveries' && <DeliveriesTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
      <AdminBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
