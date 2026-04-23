export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DELIVERY_PARTNER' | 'CUSTOMER';

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

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorField {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    fields?: ApiErrorField[];
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: SafeUser;
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'DELIVERY_PARTNER';
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'DELIVERY_PARTNER';
}

export interface CustomerSummary {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'CUSTOMER';
  isActive: boolean;
  isLoyalty: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerLoyaltyPayload {
  isLoyalty: boolean;
}

export interface FieldErrors {
  [field: string]: string;
}

export interface DishIngredientItem {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface IngredientOption {
  id: string;
  name: string;
  unit: string;
  availableQty: number;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  ingredients: DishIngredientItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDishPayload {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  ingredients: { ingredientId: string; quantity: number }[];
}

export type UpdateDishPayload = Partial<CreateDishPayload>;

export interface AuthContextValue {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<SafeUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface ApiError {
  message: string;
  fields?: ApiErrorField[];
}

export interface MealPlanDishItem {
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
  price: number;
  imageUrl: string;
  isActive: boolean;
  dishes: MealPlanDishItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealPlanPayload {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  dishIds: string[];
}

export type UpdateMealPlanPayload = Partial<CreateMealPlanPayload>;

// ── TimeSlot ─────────────────────────────────────────────────────────────────

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface TimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeSlotPayload {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface UpdateTimeSlotPayload {
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

// ── DeliveryPartner ──────────────────────────────────────────────────────────

export type DeliveryTaskStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'FAILED';

export interface DeliveryOrderSummary {
  orderId: string;
  orderNumber: string;
  status: DeliveryTaskStatus;
}

export interface DeliveryPartnerSummary {
  id: string;
  name: string;
  assignedCount: number;
  completedCount: number;
  orders: DeliveryOrderSummary[];
}

export interface DeliveryPartnerTaskTimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface DeliveryPartnerTaskSummary {
  taskId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  deliveryDate: string;
  itemCount: number;
  status: DeliveryTaskStatus;
  locationLabel: string;
  latitude: number;
  longitude: number;
  timeSlot: DeliveryPartnerTaskTimeSlot;
}

export interface FailDeliveryTaskPayload {
  failureReason: string;
}

export type AdminOrderStatus =
  | 'AWAITING_APPROVAL'
  | 'PENDING'
  | 'CONFIRMED'
  | 'READY_FOR_DELIVERY'
  | 'IN_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface AdminOrderTimeSlot {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface AdminUpcomingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryDate: string;
  itemCount: number;
  status: AdminOrderStatus;
  timeSlot: AdminOrderTimeSlot;
}

export interface AdminOrderDish {
  id: string;
  dishId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  quantity: number;
}

export interface AdminOrderDetails {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryDate: string;
  itemCount: number;
  timeSlot: AdminOrderTimeSlot;
  dishes: AdminOrderDish[];
}

export interface ProcurementItem {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  requiredQty: number;
  availableQty: number;
  procurementQty: number;
}

export interface ProcurementSummary {
  orderCount: number;
  items: ProcurementItem[];
}

export type SettlementStatus = 'UNSETTLED' | 'PARTIAL' | 'SETTLED';
export type PaymentMethod = 'CASH' | 'ONLINE' | 'UPI';

export interface SettlementPaymentLog {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  note: string | null;
}

export interface PendingSettlementOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  deliveryDate: string;
  status: SettlementStatus;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  timeSlot: AdminOrderTimeSlot;
  payments: SettlementPaymentLog[];
}

export interface RecordSettlementPaymentPayload {
  amount: number;
  method: PaymentMethod;
  paidAt?: string;
  note?: string;
}

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'COMPLETED';

export interface CampaignSummary {
  totalRaised: number;
  totalContributionCount: number;
  successfulContributionCount: number;
  failedContributionCount: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  costAmount: number;
  startDate: string;
  endDate: string | null;
  isOngoing: boolean;
  status: CampaignStatus;
  summary: CampaignSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
  cost: number;
  startDate: string;
  endDate?: string | null;
  runForever: boolean;
  status: CampaignStatus;
  imageUrl?: string | null;
}

export type UpdateCampaignPayload = Partial<CreateCampaignPayload>;

export interface CampaignContributionCustomerTotal {
  customerId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  successfulContributionCount: number;
  failedContributionCount: number;
  lastContributionAt: string;
}

export interface CampaignContributionBreakdown {
  campaign: Campaign;
  customerBreakdown: CampaignContributionCustomerTotal[];
}
