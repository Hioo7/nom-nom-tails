import type { MealPlan } from '../types';
import { BASE_URL, handleResponse, jsonHeaders } from './api';

export interface IMealPlanService {
  list(): Promise<MealPlan[]>;
}

export class MealPlanService implements IMealPlanService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async list(): Promise<MealPlan[]> {
    const res = await fetch(`${this.baseUrl}/api/meal-plans`, {
      headers: jsonHeaders(),
    });
    return handleResponse<MealPlan[]>(res);
  }
}
