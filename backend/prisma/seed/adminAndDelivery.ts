import { Role } from '@prisma/client';
import prisma from '../../src/lib/prisma';
import { hash } from '../../src/lib/password';

export interface StaffResult {
  admin: { id: string };
  deliveryPartner1: { id: string };
  deliveryPartner2: { id: string };
}

export async function seedAdminAndDelivery(): Promise<StaffResult> {
  const adminPassword = await hash('Admin@123456');
  const deliveryPassword = await hash('Delivery@123');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@dogdash.com',
      password: adminPassword,
      name: 'Ravi Kumar',
      role: Role.ADMIN,
    },
  });

  const deliveryPartner1 = await prisma.user.create({
    data: {
      email: 'delivery1@dogdash.com',
      password: deliveryPassword,
      name: 'Suresh Patel',
      role: Role.DELIVERY_PARTNER,
    },
  });

  const deliveryPartner2 = await prisma.user.create({
    data: {
      email: 'delivery2@dogdash.com',
      password: deliveryPassword,
      name: 'Meena Sharma',
      role: Role.DELIVERY_PARTNER,
    },
  });

  console.log('  Created 1 admin and 2 delivery partners.');
  return { admin, deliveryPartner1, deliveryPartner2 };
}
