import prisma from '../../src/lib/prisma';
import MinioStorage from '../../src/lib/minio';
import { MINIO_BUCKET } from '../../src/config/constants';
import { clearAll } from './clear';
import { seedAdminAndDelivery } from './adminAndDelivery';
import { seedIngredients } from './ingredients';
import { seedDishes } from './dishes';
import { seedMealPlans } from './mealPlans';
import { seedTimeSlots } from './timeSlots';
import { seedCustomers } from './customers';
import { seedSubscriptions } from './subscriptions';
import { seedStandaloneOrders } from './standaloneOrders';

async function populate(): Promise<void> {
  console.log('Ensuring MinIO bucket exists...');
  await MinioStorage.getInstance().ensureBucket(MINIO_BUCKET);

  console.log('Clearing existing seeded data and MinIO objects...');
  await clearAll();

  console.log('Seeding admin and delivery partners...');
  const staff = await seedAdminAndDelivery();

  console.log('Seeding ingredients...');
  const ingredients = await seedIngredients();

  console.log('Seeding dishes with images...');
  const dishes = await seedDishes(ingredients);

  console.log('Seeding meal plans with images...');
  const mealPlans = await seedMealPlans(dishes);

  console.log('Seeding time slots...');
  const timeSlots = await seedTimeSlots();

  console.log('Seeding customers...');
  const customers = await seedCustomers();

  console.log('Seeding subscriptions and their auto-generated orders...');
  await seedSubscriptions({ customers, mealPlans, timeSlots, staff });

  console.log('Seeding standalone orders...');
  await seedStandaloneOrders({ customers, dishes, timeSlots, staff });

  console.log('\nDone! Database populated with test data.');
  console.log('  Admin:            admin@dogdash.com     / Admin@123456');
  console.log('  Delivery Partner: delivery1@dogdash.com / Delivery@123');
  console.log('  Delivery Partner: delivery2@dogdash.com / Delivery@123');
}

async function clear(): Promise<void> {
  console.log('Clearing all seeded data and MinIO objects...');
  await clearAll();
  console.log('\nDone! Database cleared. SuperAdmin credentials are preserved.');
}

async function main(): Promise<void> {
  const action = process.argv[2];

  if (action === 'populate') {
    await populate();
  } else if (action === 'clear') {
    await clear();
  } else {
    console.error('Usage: tsx prisma/seed/index.ts [populate|clear]');
    process.exit(1);
  }
}

main()
  .catch((err: Error) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
