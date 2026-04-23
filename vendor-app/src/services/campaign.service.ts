import type {
  ApiError,
  ApiErrorResponse,
  ApiSuccessResponse,
  Campaign,
  CampaignContributionBreakdown,
  UpdateCampaignPayload,
  CreateCampaignPayload,
} from '../types';

export interface ICampaignService {
  listCampaigns(token: string): Promise<Campaign[]>;
  getCampaign(token: string, id: string): Promise<Campaign>;
  createCampaign(token: string, payload: CreateCampaignPayload): Promise<Campaign>;
  updateCampaign(token: string, id: string, payload: UpdateCampaignPayload): Promise<Campaign>;
  deactivateCampaign(token: string, id: string): Promise<Campaign>;
  uploadImage(token: string, campaignId: string, file: File): Promise<string>;
  getCampaignContributionBreakdown(token: string, id: string): Promise<CampaignContributionBreakdown>;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let json: unknown;

  try {
    json = JSON.parse(text);
  } catch {
    throw { message: `Server error (${res.status})` } satisfies ApiError;
  }

  if (!res.ok) {
    throw (json as ApiErrorResponse).error satisfies ApiError;
  }

  return (json as ApiSuccessResponse<T>).data;
}

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export class CampaignService implements ICampaignService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async listCampaigns(token: string): Promise<Campaign[]> {
    const res = await fetch(`${this.baseUrl}/api/campaigns`, {
      headers: authHeaders(token),
    });

    return handleResponse<Campaign[]>(res);
  }

  async getCampaign(token: string, id: string): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${id}`, {
      headers: authHeaders(token),
    });

    return handleResponse<Campaign>(res);
  }

  async createCampaign(token: string, payload: CreateCampaignPayload): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}/api/campaigns`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });

    return handleResponse<Campaign>(res);
  }

  async updateCampaign(
    token: string,
    id: string,
    payload: UpdateCampaignPayload,
  ): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });

    return handleResponse<Campaign>(res);
  }

  async deactivateCampaign(token: string, id: string): Promise<Campaign> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${id}/deactivate`, {
      method: 'PATCH',
      headers: authHeaders(token),
    });

    return handleResponse<Campaign>(res);
  }

  async uploadImage(token: string, campaignId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${this.baseUrl}/api/campaigns/${campaignId}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await handleResponse<{ url: string }>(res);
    return result.url;
  }

  async getCampaignContributionBreakdown(
    token: string,
    id: string,
  ): Promise<CampaignContributionBreakdown> {
    const res = await fetch(`${this.baseUrl}/api/campaigns/${id}/contributions`, {
      headers: authHeaders(token),
    });

    return handleResponse<CampaignContributionBreakdown>(res);
  }
}
