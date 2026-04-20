import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import AppConfig from '../config/AppConfig';
import { MINIO_BUCKET } from '../config/constants';
import { compressToAvif } from '../lib/imageCompress';
import MinioStorage from '../lib/minio';
import AppError from '../lib/AppError';
import prisma from '../lib/prisma';
import { CreateMealPlanInput, UpdateMealPlanInput } from '../schema/mealPlan.schema';
import { SafeMealPlan, SafeMealPlanDish } from '../types/mealPlan.types';

type MealPlanWithDishes = Prisma.MealPlanGetPayload<{
  include: { dishes: { include: { dish: true } } };
}>;

function toSafeMealPlan(mp: MealPlanWithDishes): SafeMealPlan {
  const dishes: SafeMealPlanDish[] = mp.dishes.map((mpd) => ({
    id: mpd.id,
    dishId: mpd.dishId,
    name: mpd.dish.name,
    description: mpd.dish.description,
    price: mpd.dish.price,
    imageUrl: mpd.dish.imageUrl ?? null,
    isActive: mpd.dish.isActive,
  }));
  return {
    id: mp.id,
    name: mp.name,
    description: mp.description,
    price: mp.price,
    imageUrl: mp.imageUrl,
    isActive: mp.isActive,
    dishes,
    createdAt: mp.createdAt,
    updatedAt: mp.updatedAt,
  };
}

const includeDishes = {
  dishes: { include: { dish: true } },
} satisfies Prisma.MealPlanInclude;

class MealPlanService {
  private static instance: MealPlanService;

  static getInstance(): MealPlanService {
    if (!MealPlanService.instance) {
      MealPlanService.instance = new MealPlanService();
    }
    return MealPlanService.instance;
  }

  async listMealPlans(): Promise<SafeMealPlan[]> {
    const plans = await prisma.mealPlan.findMany({
      include: includeDishes,
      orderBy: { createdAt: 'desc' },
    });
    return plans.map(toSafeMealPlan);
  }

  async getMealPlan(id: string): Promise<SafeMealPlan> {
    const plan = await prisma.mealPlan.findUnique({
      where: { id },
      include: includeDishes,
    });
    if (!plan) throw new AppError(404, 'Meal plan not found');
    return toSafeMealPlan(plan);
  }

  async createMealPlan(data: CreateMealPlanInput): Promise<SafeMealPlan> {
    await this.validateDishIds(data.dishIds);

    const plan = await prisma.$transaction(async (tx) => {
      const created = await tx.mealPlan.create({
        data: {
          name: data.name,
          description: data.description,
          price: Math.round(data.price * 100),
          imageUrl: data.imageUrl,
          isActive: data.isActive,
        },
      });
      await this.upsertDishes(tx, created.id, data.dishIds);
      return tx.mealPlan.findUniqueOrThrow({
        where: { id: created.id },
        include: includeDishes,
      });
    });
    return toSafeMealPlan(plan);
  }

  async updateMealPlan(id: string, data: UpdateMealPlanInput): Promise<SafeMealPlan> {
    await this.findOrThrow(id);

    if (data.dishIds) {
      await this.validateDishIds(data.dishIds);
    }

    const plan = await prisma.$transaction(async (tx) => {
      const updateData: Prisma.MealPlanUpdateInput = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = Math.round(data.price * 100);
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      if (Object.keys(updateData).length > 0) {
        await tx.mealPlan.update({ where: { id }, data: updateData });
      }

      if (data.dishIds !== undefined) {
        await tx.mealPlanDish.deleteMany({ where: { mealPlanId: id } });
        await this.upsertDishes(tx, id, data.dishIds);
      }

      return tx.mealPlan.findUniqueOrThrow({
        where: { id },
        include: includeDishes,
      });
    });
    return toSafeMealPlan(plan);
  }

  async deleteMealPlan(id: string): Promise<void> {
    const plan = await this.findOrThrow(id);
    await prisma.$transaction(async (tx) => {
      await tx.mealPlanDish.deleteMany({ where: { mealPlanId: id } });
      await tx.mealPlan.delete({ where: { id } });
    });
    if (plan.imageUrl) {
      await this.removeImageFromStorage(plan.imageUrl);
    }
  }

  async uploadImage(mealPlanId: string, buffer: Buffer): Promise<string> {
    const existing = await prisma.mealPlan.findUnique({ where: { id: mealPlanId } });
    if (!existing) throw new AppError(404, 'Meal plan not found');

    const compressed = await compressToAvif(buffer);
    const key = `meal-plans/${mealPlanId}/${randomUUID()}.avif`;
    await MinioStorage.getInstance().putObject(MINIO_BUCKET, key, compressed, 'image/avif');

    if (existing.imageUrl) {
      await this.removeImageFromStorage(existing.imageUrl);
    }

    const url = `${AppConfig.getInstance().imageBaseUrl}/${key}`;
    await prisma.mealPlan.update({ where: { id: mealPlanId }, data: { imageUrl: url } });
    return url;
  }

  private async validateDishIds(dishIds: string[]): Promise<void> {
    for (const dishId of dishIds) {
      const exists = await prisma.dish.findUnique({ where: { id: dishId } });
      if (!exists) throw new AppError(404, `Dish ${dishId} not found`);
    }
  }

  private async upsertDishes(
    tx: Prisma.TransactionClient,
    mealPlanId: string,
    dishIds: string[],
  ): Promise<void> {
    for (const dishId of dishIds) {
      await tx.mealPlanDish.create({ data: { mealPlanId, dishId } });
    }
  }

  private async findOrThrow(id: string): Promise<{ imageUrl: string }> {
    const plan = await prisma.mealPlan.findUnique({ where: { id } });
    if (!plan) throw new AppError(404, 'Meal plan not found');
    return { imageUrl: plan.imageUrl };
  }

  private async removeImageFromStorage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;
    const base = AppConfig.getInstance().imageBaseUrl;
    const key = imageUrl.replace(`${base}/`, '');
    try {
      await MinioStorage.getInstance().removeObject(MINIO_BUCKET, key);
    } catch {
      // best-effort cleanup
    }
  }
}

export default MealPlanService;
