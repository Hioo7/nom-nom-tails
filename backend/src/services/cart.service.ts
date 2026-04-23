import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import AppError from '../lib/AppError';
import { UpsertCartItemInput, SyncCartInput } from '../schema/cart.schema';

const DISH_SELECT = {
  id: true,
  name: true,
  imageUrl: true,
  description: true,
  price: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

class CartService {
  private static instance: CartService;

  static getInstance(): CartService {
    if (!CartService.instance) CartService.instance = new CartService();
    return CartService.instance;
  }

  async getCart(
    userId: string,
  ): Promise<Prisma.CartItemGetPayload<{ include: { dish: { select: typeof DISH_SELECT } } }>[]> {
    return prisma.cartItem.findMany({
      where: { userId },
      include: { dish: { select: DISH_SELECT } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async upsertItem(
    userId: string,
    input: UpsertCartItemInput,
  ): Promise<Prisma.CartItemGetPayload<{ include: { dish: { select: typeof DISH_SELECT } } }>> {
    const dish = await prisma.dish.findUnique({ where: { id: input.dishId } });
    if (!dish) throw new AppError(404, 'Dish not found');
    if (!dish.isActive) throw new AppError(400, 'This dish is no longer available');

    return prisma.cartItem.upsert({
      where: { userId_dishId: { userId, dishId: input.dishId } },
      create: { userId, dishId: input.dishId, quantity: input.quantity },
      update: { quantity: input.quantity },
      include: { dish: { select: DISH_SELECT } },
    });
  }

  async removeItem(userId: string, dishId: string): Promise<void> {
    const item = await prisma.cartItem.findUnique({
      where: { userId_dishId: { userId, dishId } },
    });
    if (!item) throw new AppError(404, 'Cart item not found');
    await prisma.cartItem.delete({ where: { userId_dishId: { userId, dishId } } });
  }

  async clearCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { userId } });
  }

  async syncCart(
    userId: string,
    input: SyncCartInput,
  ): Promise<Prisma.CartItemGetPayload<{ include: { dish: { select: typeof DISH_SELECT } } }>[]> {
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId } });
      if (input.items.length > 0) {
        await tx.cartItem.createMany({
          data: input.items.map((i) => ({ userId, dishId: i.dishId, quantity: i.quantity })),
          skipDuplicates: true,
        });
      }
    });
    return this.getCart(userId);
  }
}

export default CartService;
