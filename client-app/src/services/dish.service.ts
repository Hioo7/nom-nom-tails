import type { Dish } from '../types';
import { BASE_URL, handleResponse, jsonHeaders } from './api';

export interface IDishService {
  list(): Promise<Dish[]>;
}

export class DishService implements IDishService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async list(): Promise<Dish[]> {
    const res = await fetch(`${this.baseUrl}/api/dishes`, {
      headers: jsonHeaders(),
    });
    return handleResponse<Dish[]>(res);
  }
}
