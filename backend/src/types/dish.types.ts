export interface SafeDishIngredient {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface SafeDish {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  ingredients: SafeDishIngredient[];
  createdAt: Date;
  updatedAt: Date;
}
