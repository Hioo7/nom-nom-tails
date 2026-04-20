import { OrderStatus, PaymentMethod, SettlementStatus } from '@prisma/client';

export interface SafeUpcomingOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryDate: Date;
  itemCount: number;
  status: OrderStatus;
  timeSlot: {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
  };
}

export interface SafeOrderDetailDish {
  id: string;
  dishId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  quantity: number;
}

export interface SafeOrderDetails {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryDate: Date;
  itemCount: number;
  timeSlot: {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
  };
  dishes: SafeOrderDetailDish[];
}

export interface SafeProcurementItem {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  requiredQty: number;
  availableQty: number;
  procurementQty: number;
}

export interface SafeProcurementSummary {
  orderCount: number;
  items: SafeProcurementItem[];
}

export interface SafeSettlementPayment {
  id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  note: string | null;
}

export interface SafeSettlementOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  deliveryDate: Date;
  status: SettlementStatus;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  timeSlot: {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
  };
  payments: SafeSettlementPayment[];
}
