import * as Minio from 'minio';
import { Role } from '@prisma/client';
import AppConfig from '../../src/config/AppConfig';
import prisma from '../../src/lib/prisma';
import { MINIO_BUCKET } from '../../src/config/constants';

async function drainMinioBucket(): Promise<void> {
  const config = AppConfig.getInstance();
  const client = new Minio.Client({
    endPoint: config.minioEndpoint,
    port: config.minioPort,
    useSSL: config.minioUseSsl,
    accessKey: config.minioAccessKey,
    secretKey: config.minioSecretKey,
  });

  const exists = await client.bucketExists(MINIO_BUCKET);
  if (!exists) return;

  const keys: string[] = [];
  const stream = client.listObjectsV2(MINIO_BUCKET, '', true);

  await new Promise<void>((resolve, reject) => {
    stream.on('data', (obj: Minio.BucketItem) => {
      if (obj.name) keys.push(obj.name);
    });
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  if (keys.length === 0) {
    console.log('  MinIO bucket is already empty.');
    return;
  }

  for (const key of keys) {
    await client.removeObject(MINIO_BUCKET, key);
  }

  console.log(`  Removed ${keys.length} object(s) from MinIO bucket "${MINIO_BUCKET}".`);
}

export async function clearAll(): Promise<void> {
  await prisma.deliveryPhoto.deleteMany();
  await prisma.deliveryTask.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.mealPlanDish.deleteMany();
  await prisma.dishIngredient.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.address.deleteMany();
  await prisma.campaignContribution.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany({ where: { role: { not: Role.SUPER_ADMIN } } });

  await drainMinioBucket();
}
