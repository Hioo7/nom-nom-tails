import { Role } from '@prisma/client';
import prisma from '../../src/lib/prisma';
import { hash } from '../../src/lib/password';

export interface StaffResult {
  admin: { id: string };
  deliveryPartner1: { id: string };
  deliveryPartner2: { id: string };
  chef: { id: string };
}

export async function seedAdminAndDelivery(): Promise<StaffResult> {
  const adminPassword = await hash('Admin@123456');
  const deliveryPassword = await hash('Delivery@123');
  const chefPassword = await hash('Chef@123456');

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

  const chef = await prisma.user.create({
    data: {
      email: 'chef@dogdash.com',
      password: chefPassword,
      name: 'Lakshmi Nair',
      role: Role.CHEF,
    },
  });

  console.log('  Created 1 admin, 2 delivery partners, and 1 chef.');
  return { admin, deliveryPartner1, deliveryPartner2, chef };
}
