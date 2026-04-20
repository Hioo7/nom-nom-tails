import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export const RecordSettlementPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  method: z.nativeEnum(PaymentMethod),
  paidAt: z.string().datetime('Paid at must be a valid date-time').optional(),
  note: z.string().trim().max(250, 'Note must be 250 characters or fewer').optional(),
});

export type RecordSettlementPaymentInput = z.infer<typeof RecordSettlementPaymentSchema>;
