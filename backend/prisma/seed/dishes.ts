import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { compressToAvif } from '../../src/lib/imageCompress';
import MinioStorage from '../../src/lib/minio';
import AppConfig from '../../src/config/AppConfig';
import { MINIO_BUCKET } from '../../src/config/constants';
import prisma from '../../src/lib/prisma';
import { IngredientsResult } from './ingredients';

export interface DishRecord {
  id: string;
  price: number;
  name: string;
}

export interface DishesResult {
  chickenBowl: DishRecord;
  dosa: DishRecord;
  idly: DishRecord;
  masalaDosa: DishRecord;
  sandwich: DishRecord;
}

const MEDIA_DIR = path.join(__dirname, '../media_seed');

async function uploadDishImage(dishId: string, filename: string): Promise<string> {
  const config = AppConfig.getInstance();
  const storage = MinioStorage.getInstance();

  const raw = fs.readFileSync(path.join(MEDIA_DIR, filename));
  const compressed = await compressToAvif(raw);
  const key = `products/${dishId}/${crypto.randomUUID()}.avif`;

  await storage.putObject(MINIO_BUCKET, key, compressed, 'image/avif');
  return `${config.imageBaseUrl}/${key}`;
}

export async function seedDishes(ingredients: IngredientsResult): Promise<DishesResult> {
  // Chicken Bowl — storefront + Weekly Wellness
  const chickenBowl = await prisma.dish.create({
    data: {
      name: 'Chicken Bowl',
      description: 'Tender chicken served over fluffy basmati rice with aromatic spices.',
      price: 18000,
      isActive: true,
      ingredients: {
        create: [
          { ingredientId: ingredients.chicken.id, quantity: 200 },
          { ingredientId: ingredients.rice.id, quantity: 150 },
          { ingredientId: ingredients.onion.id, quantity: 50 },
          { ingredientId: ingredients.tomato.id, quantity: 80 },
          { ingredientId: ingredients.spiceMix.id, quantity: 5000 },
          { ingredientId: ingredients.cookingOil.id, quantity: 30 },
        ],
      },
    },
  });
  const chickenBowlUrl = await uploadDishImage(chickenBowl.id, 'chicken_bowl.jpeg');
  await prisma.dish.update({ where: { id: chickenBowl.id }, data: { imageUrl: chickenBowlUrl } });

  // Dosa — storefront + South Indian Special + Quick Bites
  const dosa = await prisma.dish.create({
    data: {
      name: 'Dosa',
      description: 'Crispy fermented crepe served with coconut chutney and hot sambar.',
      price: 8000,
      isActive: true,
      ingredients: {
        create: [
          { ingredientId: ingredients.uradDal.id, quantity: 80 },
          { ingredientId: ingredients.rice.id, quantity: 120 },
          { ingredientId: ingredients.fenugreekSeeds.id, quantity: 2000 },
          { ingredientId: ingredients.cookingOil.id, quantity: 20 },
          { ingredientId: ingredients.coconutChutney.id, quantity: 50 },
          { ingredientId: ingredients.sambar.id, quantity: 100 },
        ],
      },
    },
  });
  const dosaUrl = await uploadDishImage(dosa.id, 'dosa.jpeg');
  await prisma.dish.update({ where: { id: dosa.id }, data: { imageUrl: dosaUrl } });

  // Idly — meal plan only (isActive=false), in Weekly Wellness + South Indian Special
  const idly = await prisma.dish.create({
    data: {
      name: 'Idly',
      description: 'Soft steamed rice cakes served with sambar and coconut chutney.',
      price: 6000,
      isActive: false,
      ingredients: {
        create: [
          { ingredientId: ingredients.uradDal.id, quantity: 60 },
          { ingredientId: ingredients.rice.id, quantity: 100 },
          { ingredientId: ingredients.fenugreekSeeds.id, quantity: 1000 },
          { ingredientId: ingredients.sambar.id, quantity: 100 },
          { ingredientId: ingredients.coconutChutney.id, quantity: 50 },
        ],
      },
    },
  });
  const idlyUrl = await uploadDishImage(idly.id, 'idly.jpeg');
  await prisma.dish.update({ where: { id: idly.id }, data: { imageUrl: idlyUrl } });

  // Masala Dosa — storefront + Weekly Wellness + South Indian Special
  const masalaDosa = await prisma.dish.create({
    data: {
      name: 'Masala Dosa',
      description: 'Golden dosa stuffed with spiced potato filling, served with chutneys.',
      price: 12000,
      isActive: true,
      ingredients: {
        create: [
          { ingredientId: ingredients.uradDal.id, quantity: 80 },
          { ingredientId: ingredients.rice.id, quantity: 120 },
          { ingredientId: ingredients.fenugreekSeeds.id, quantity: 2000 },
          { ingredientId: ingredients.cookingOil.id, quantity: 25 },
          { ingredientId: ingredients.onion.id, quantity: 60 },
          { ingredientId: ingredients.tomato.id, quantity: 70 },
          { ingredientId: ingredients.spiceMix.id, quantity: 3000 },
        ],
      },
    },
  });
  const masalaDosaUrl = await uploadDishImage(masalaDosa.id, 'masala_dosa.jpeg');
  await prisma.dish.update({
    where: { id: masalaDosa.id },
    data: { imageUrl: masalaDosaUrl },
  });

  // Sandwich — storefront only (no meal plan)
  const sandwich = await prisma.dish.create({
    data: {
      name: 'Sandwich',
      description: 'Hearty whole wheat sandwich loaded with fresh veggies and cheese.',
      price: 10000,
      isActive: true,
      ingredients: {
        create: [
          { ingredientId: ingredients.wheatBread.id, quantity: 2000 },
          { ingredientId: ingredients.cheeseSlice.id, quantity: 2000 },
          { ingredientId: ingredients.lettuce.id, quantity: 50 },
          { ingredientId: ingredients.cucumber.id, quantity: 40 },
          { ingredientId: ingredients.butter.id, quantity: 15 },
        ],
      },
    },
  });
  const sandwichUrl = await uploadDishImage(sandwich.id, 'sandwitch.jpeg');
  await prisma.dish.update({ where: { id: sandwich.id }, data: { imageUrl: sandwichUrl } });

  console.log('  Created 5 dishes with images uploaded to MinIO.');

  return {
    chickenBowl: { id: chickenBowl.id, price: chickenBowl.price, name: chickenBowl.name },
    dosa: { id: dosa.id, price: dosa.price, name: dosa.name },
    idly: { id: idly.id, price: idly.price, name: idly.name },
    masalaDosa: { id: masalaDosa.id, price: masalaDosa.price, name: masalaDosa.name },
    sandwich: { id: sandwich.id, price: sandwich.price, name: sandwich.name },
  };
}
