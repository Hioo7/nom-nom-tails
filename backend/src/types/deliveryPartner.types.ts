import { DeliveryStatus } from '@prisma/client';

export interface DeliveryOrderSummary {
  orderId: string;
  orderNumber: string;
  status: DeliveryStatus;
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
  day: string;
  startTime: string;
  endTime: string;
}

export interface DeliveryPartnerTaskSummary {
  taskId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  deliveryDate: Date;
  itemCount: number;
  status: DeliveryStatus;
  locationLabel: string;
  latitude: number | null;
  longitude: number | null;
  timeSlot: DeliveryPartnerTaskTimeSlot;
  handlingNotes: string | null;
}
