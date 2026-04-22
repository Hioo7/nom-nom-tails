import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { compressToAvif } from '../../src/lib/imageCompress';
import MinioStorage from '../../src/lib/minio';
import AppConfig from '../../src/config/AppConfig';
import { MINIO_BUCKET } from '../../src/config/constants';
import prisma from '../../src/lib/prisma';
import { DishesResult, DishRecord } from './dishes';

export interface MealPlanRecord {
  id: string;
  price: number;
  dishes: DishRecord[];
}

export interface MealPlansResult {
  weeklyWellness: MealPlanRecord;
  southIndianSpecial: MealPlanRecord;
  quickBites: MealPlanRecord;
}

const MEDIA_DIR = path.join(__dirname, '../media_seed');

async function uploadPlanImage(filename: string): Promise<string> {
  const config = AppConfig.getInstance();
  const storage = MinioStorage.getInstance();

  const raw = fs.readFileSync(path.join(MEDIA_DIR, filename));
  const compressed = await compressToAvif(raw);
  const key = `meal-plans/${crypto.randomUUID()}.avif`;

  await storage.putObject(MINIO_BUCKET, key, compressed, 'image/avif');
  return `${config.imageBaseUrl}/${key}`;
}

export async function seedMealPlans(dishes: DishesResult): Promise<MealPlansResult> {
  const wellnessUrl = await uploadPlanImage('meal_plan1.jpeg');
  const southIndianUrl = await uploadPlanImage('meal_plan2.jpeg');
  const quickBitesUrl = await uploadPlanImage('meal_plan1.jpeg');

  // Weekly Wellness — Chicken Bowl + Masala Dosa + Idly
  const weeklyWellness = await prisma.mealPlan.create({
    data: {
      name: 'Weekly Wellness',
      description: 'A balanced weekly plan featuring hearty proteins and wholesome South Indian staples.',
      imageUrl: wellnessUrl,
      price: 150000,
      isActive: true,
      dishes: {
        create: [
          { dishId: dishes.chickenBowl.id },
          { dishId: dishes.masalaDosa.id },
          { dishId: dishes.idly.id },
        ],
      },
    },
  });

  // South Indian Special — Dosa + Idly + Masala Dosa
  const southIndianSpecial = await prisma.mealPlan.create({
    data: {
      name: 'South Indian Special',
      description: 'Pure vegetarian plan celebrating the best of South Indian breakfast cuisine.',
      imageUrl: southIndianUrl,
      price: 120000,
      isActive: true,
      dishes: {
        create: [
          { dishId: dishes.dosa.id },
          { dishId: dishes.idly.id },
          { dishId: dishes.masalaDosa.id },
        ],
      },
    },
  });

  // Quick Bites — Sandwich + Dosa (inactive plan for testing)
  const quickBites = await prisma.mealPlan.create({
    data: {
      name: 'Quick Bites',
      description: 'Light and quick meals for busy weekdays.',
      imageUrl: quickBitesUrl,
      price: 80000,
      isActive: false,
      dishes: {
        create: [
          { dishId: dishes.sandwich.id },
          { dishId: dishes.dosa.id },
        ],
      },
    },
  });

  console.log('  Created 3 meal plans with images uploaded to MinIO.');

  return {
    weeklyWellness: {
      id: weeklyWellness.id,
      price: weeklyWellness.price,
      dishes: [dishes.chickenBowl, dishes.masalaDosa, dishes.idly],
    },
    southIndianSpecial: {
      id: southIndianSpecial.id,
      price: southIndianSpecial.price,
      dishes: [dishes.dosa, dishes.idly, dishes.masalaDosa],
    },
    quickBites: {
      id: quickBites.id,
      price: quickBites.price,
      dishes: [dishes.sandwich, dishes.dosa],
    },
  };
}
