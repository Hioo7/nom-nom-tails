import type { IngredientOption } from '../types';

interface CreateIngredientPayload {
  name: string;
  unit: string;
  availableQty?: number;
}

class IngredientService {
  async listIngredients(token: string): Promise<IngredientOption[]> {
    const res = await fetch('/api/ingredients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch ingredients');
    const json = await res.json() as { data: IngredientOption[] };
    return json.data;
  }

  async createIngredient(token: string, payload: CreateIngredientPayload): Promise<IngredientOption> {
    const res = await fetch('/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create ingredient');
    const json = await res.json() as { data: IngredientOption };
    return json.data;
  }
}

export default new IngredientService();
