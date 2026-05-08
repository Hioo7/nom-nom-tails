export type ChefDashboardTab = 'orders' | 'profile';

const validTabs: readonly ChefDashboardTab[] = ['orders', 'profile'];

export function parseChefDashboardTab(value: string | null): ChefDashboardTab {
  return validTabs.find((tab) => tab === value) ?? 'orders';
}
