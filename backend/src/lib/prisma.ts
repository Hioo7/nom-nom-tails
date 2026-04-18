import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import AppConfig from '../config/AppConfig';

function createPrismaClient(): PrismaClient {
  const config = AppConfig.getInstance();
  const adapter = new PrismaPg(config.databaseUrl);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

export default prisma;
