import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import AppConfig from '../config/AppConfig';
import { MINIO_BUCKET } from '../config/constants';
import { compressToAvif } from '../lib/imageCompress';
import MinioStorage from '../lib/minio';
import AppError from '../lib/AppError';
import { toPaise } from '../lib/money';
import prisma from '../lib/prisma';
import { CreateDishInput, IngredientInput, UpdateDishInput } from '../schema/dish.schema';
import { SafeDish, SafeDishIngredient } from '../types/dish.types';

type DishWithIngredients = Prisma.DishGetPayload<{
  include: { ingredients: { include: { ingredient: true } } };
}>;

function toSafeDish(dish: DishWithIngredients): SafeDish {
  const ingredients: SafeDishIngredient[] = dish.ingredients.map((di) => ({
    id: di.id,
    ingredientId: di.ingredientId,
    name: di.ingredient.name,
    quantity: di.quantity / 1000,
    unit: di.ingredient.unit,
  }));
  return {
    id: dish.id,
    name: dish.name,
    description: dish.description,
    price: dish.price,
    imageUrl: dish.imageUrl ?? null,
    isActive: dish.isActive,
    ingredients,
    createdAt: dish.createdAt,
    updatedAt: dish.updatedAt,
  };
}

const includeIngredients = {
  ingredients: { include: { ingredient: true } },
} satisfies Prisma.DishInclude;

class DishService {
  private static instance: DishService;

  static getInstance(): DishService {
    if (!DishService.instance) {
      DishService.instance = new DishService();
    }
    return DishService.instance;
  }

  async listDishes(): Promise<SafeDish[]> {
    const dishes = await prisma.dish.findMany({
      include: includeIngredients,
      orderBy: { createdAt: 'desc' },
    });
    return dishes.map(toSafeDish);
  }

  async getDish(id: string): Promise<SafeDish> {
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: includeIngredients,
    });
    if (!dish) throw new AppError(404, 'Dish not found');
    return toSafeDish(dish);
  }

  async createDish(data: CreateDishInput): Promise<SafeDish> {
    const dish = await prisma.$transaction(async (tx) => {
      const created = await tx.dish.create({
        data: {
          name: data.name,
          description: data.description,
          price: toPaise(data.price),
          imageUrl: data.imageUrl ?? null,
          isActive: data.isActive,
        },
      });
      await this.upsertIngredients(tx, created.id, data.ingredients);
      return tx.dish.findUniqueOrThrow({
        where: { id: created.id },
        include: includeIngredients,
      });
    });
    return toSafeDish(dish);
  }

  async updateDish(id: string, data: UpdateDishInput): Promise<SafeDish> {
    await this.findOrThrow(id);

    const dish = await prisma.$transaction(async (tx) => {
      const updateData: Prisma.DishUpdateInput = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = toPaise(data.price);
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if ('imageUrl' in data) updateData.imageUrl = data.imageUrl ?? null;

      if (Object.keys(updateData).length > 0) {
        await tx.dish.update({ where: { id }, data: updateData });
      }

      if (data.ingredients !== undefined) {
        await tx.dishIngredient.deleteMany({ where: { dishId: id } });
        await this.upsertIngredients(tx, id, data.ingredients);
      }

      return tx.dish.findUniqueOrThrow({
        where: { id },
        include: includeIngredients,
      });
    });
    return toSafeDish(dish);
  }

  async deleteDish(id: string): Promise<void> {
    const dish = await this.findOrThrow(id);
    await prisma.$transaction(async (tx) => {
      await tx.dishIngredient.deleteMany({ where: { dishId: id } });
      await tx.dish.delete({ where: { id } });
    });
    if (dish.imageUrl) {
      await this.removeImageFromStorage(dish.imageUrl);
    }
  }

  async uploadImage(dishId: string, buffer: Buffer): Promise<string> {
    const existing = await prisma.dish.findUnique({ where: { id: dishId } });
    if (!existing) throw new AppError(404, 'Dish not found');

    const compressed = await compressToAvif(buffer);
    const key = `products/${dishId}/${randomUUID()}.avif`;
    await MinioStorage.getInstance().putObject(MINIO_BUCKET, key, compressed, 'image/avif');

    if (existing.imageUrl) {
      await this.removeImageFromStorage(existing.imageUrl);
    }

    return `${AppConfig.getInstance().imageBaseUrl}/${key}`;
  }

  private async upsertIngredients(
    tx: Prisma.TransactionClient,
    dishId: string,
    ingredients: IngredientInput[],
  ): Promise<void> {
    for (const ing of ingredients) {
      const exists = await tx.ingredient.findUnique({ where: { id: ing.ingredientId } });
      if (!exists) throw new AppError(404, `Ingredient ${ing.ingredientId} not found`);
      await tx.dishIngredient.create({
        data: {
          dishId,
          ingredientId: ing.ingredientId,
          quantity: Math.round(ing.quantity * 1000),
        },
      });
    }
  }

  private async findOrThrow(id: string): Promise<{ imageUrl: string | null }> {
    const dish = await prisma.dish.findUnique({ where: { id } });
    if (!dish) throw new AppError(404, 'Dish not found');
    return { imageUrl: dish.imageUrl };
  }

  private async removeImageFromStorage(imageUrl: string): Promise<void> {
    const base = AppConfig.getInstance().imageBaseUrl;
    const key = imageUrl.replace(`${base}/`, '');
    try {
      await MinioStorage.getInstance().removeObject(MINIO_BUCKET, key);
    } catch {
      // Log but do not throw — image cleanup is best-effort
    }
  }
}

export default DishService;
