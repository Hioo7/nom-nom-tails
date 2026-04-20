import AppError from '../lib/AppError';
import prisma from '../lib/prisma';
import {
  AdjustIngredientStockInput,
  CreateIngredientInput,
  UpdateIngredientInput,
} from '../schema/ingredient.schema';
import { SafeIngredient } from '../types/ingredient.types';

class IngredientService {
  private static instance: IngredientService;

  static getInstance(): IngredientService {
    if (!IngredientService.instance) {
      IngredientService.instance = new IngredientService();
    }

    return IngredientService.instance;
  }

  async listIngredients(): Promise<SafeIngredient[]> {
    return prisma.ingredient.findMany({
      select: { id: true, name: true, unit: true, availableQty: true },
      orderBy: { name: 'asc' },
    });
  }

  async createIngredient(data: CreateIngredientInput): Promise<SafeIngredient> {
    return prisma.ingredient.create({
      data: {
        name: data.name,
        unit: data.unit,
        availableQty: data.availableQty,
      },
      select: { id: true, name: true, unit: true, availableQty: true },
    });
  }

  async updateIngredient(
    ingredientId: string,
    data: UpdateIngredientInput,
  ): Promise<SafeIngredient> {
    await this.findIngredientOrThrow(ingredientId);

    return prisma.ingredient.update({
      where: { id: ingredientId },
      data,
      select: { id: true, name: true, unit: true, availableQty: true },
    });
  }

  async increaseStock(
    ingredientId: string,
    input: AdjustIngredientStockInput,
  ): Promise<SafeIngredient> {
    await this.findIngredientOrThrow(ingredientId);

    return prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        availableQty: {
          increment: input.quantity,
        },
      },
      select: { id: true, name: true, unit: true, availableQty: true },
    });
  }

  async decreaseStock(
    ingredientId: string,
    input: AdjustIngredientStockInput,
  ): Promise<SafeIngredient> {
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.ingredient.updateMany({
        where: {
          id: ingredientId,
          availableQty: {
            gte: input.quantity,
          },
        },
        data: {
          availableQty: {
            decrement: input.quantity,
          },
        },
      });

      if (result.count !== 1) {
        const existing = await tx.ingredient.findUnique({
          where: { id: ingredientId },
          select: { id: true, availableQty: true },
        });

        if (!existing) {
          throw new AppError(404, 'Ingredient not found');
        }

        throw new AppError(400, 'Quantity to reduce exceeds the available stock');
      }

      return tx.ingredient.findUniqueOrThrow({
        where: { id: ingredientId },
        select: { id: true, name: true, unit: true, availableQty: true },
      });
    });

    return updated;
  }

  private async findIngredientOrThrow(ingredientId: string): Promise<void> {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
      select: { id: true },
    });

    if (!ingredient) {
      throw new AppError(404, 'Ingredient not found');
    }
  }
}

export default IngredientService;
