export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER' | 'DELIVERY_PARTNER';

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  isLoyalty: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Dish {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanDishEntry {
  id: string;
  dishId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  isActive: boolean;
  dishes: MealPlanDishEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface OrderItem {
  id: string;
  dishId: string;
  quantity: number;
  dish: Dish;
}

export interface Order {
  id: string;
  customerId: string;
  deliveryDate: string;
  status: string;
  items: OrderItem[];
  settlement: { totalAmount: number; status: string } | null;
  createdAt: string;
}

// ── API envelope types ────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorField {
  path: string;
  message: string;
}

export interface ApiError {
  message: string;
  fields?: ApiErrorField[];
}

export interface ApiErrorResponse {
  error: ApiError;
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  user: SafeUser;
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface CreateOrderPayload {
  items: { dishId: string; quantity: number }[];
  deliveryDate: string;
  addressId: string;
}

// ── Context value types ───────────────────────────────────────────────────────

export interface AuthContextValue {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SafeUser>;
  register: (name: string, email: string, password: string) => Promise<SafeUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (dish: Dish) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}
