export type SuperAdminDashboardTab = 'users' | 'profile';

export interface SuperAdminDashboardState {
  tab: SuperAdminDashboardTab;
  search: string;
}

const validTabs: readonly SuperAdminDashboardTab[] = ['users', 'profile'];

export function parseSuperAdminDashboardTab(value: string | null): SuperAdminDashboardTab {
  return validTabs.find((tab) => tab === value) ?? 'users';
}

export function createSuperAdminDashboardSearchParams(
  state: SuperAdminDashboardState,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set('tab', state.tab);

  const trimmedSearch = state.search.trim();
  if (trimmedSearch) {
    params.set('q', trimmedSearch);
  }

  return params;
}
