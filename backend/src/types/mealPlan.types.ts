export interface SafeMealPlanDish {
  id: string;
  dishId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface SafeMealPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  dishes: SafeMealPlanDish[];
  createdAt: Date;
  updatedAt: Date;
}
