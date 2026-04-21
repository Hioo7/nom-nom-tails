import { Role } from '@prisma/client';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';
import { UpdateCustomerLoyaltyInput } from '../schema/customer.schema';
import { SafeUser } from '../types/user.types';

class CustomerService {
  private static instance: CustomerService;

  static getInstance(): CustomerService {
    if (!CustomerService.instance) {
      CustomerService.instance = new CustomerService();
    }

    return CustomerService.instance;
  }

  async listCustomers(): Promise<SafeUser[]> {
    return prisma.user.findMany({
      where: { role: Role.CUSTOMER },
      omit: { password: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCustomerLoyalty(
    customerId: string,
    data: UpdateCustomerLoyaltyInput,
  ): Promise<SafeUser> {
    await this.findCustomerOrThrow(customerId);

    return prisma.user.update({
      where: { id: customerId },
      data: { isLoyalty: data.isLoyalty },
      omit: { password: true },
    });
  }

  private async findCustomerOrThrow(customerId: string): Promise<void> {
    const customer = await prisma.user.findFirst({
      where: { id: customerId, role: Role.CUSTOMER },
      select: { id: true },
    });

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }
  }
}

export default CustomerService;
