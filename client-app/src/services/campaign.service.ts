import { BASE_URL, authHeaders, handleResponse } from './api';
import type { SafeCustomerCampaign } from '../types';

export class CampaignService {
  private base = `${BASE_URL}/api/customer/campaigns`;

  async list(token: string): Promise<SafeCustomerCampaign[]> {
    const res = await fetch(this.base, { headers: authHeaders(token) });
    return handleResponse<SafeCustomerCampaign[]>(res);
  }

  async contribute(token: string, campaignId: string): Promise<void> {
    const res = await fetch(`${this.base}/${campaignId}/contributions`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });
    return handleResponse<void>(res);
  }
}
