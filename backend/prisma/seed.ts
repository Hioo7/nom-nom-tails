import { Role } from '@prisma/client';
import AppConfig from '../src/config/AppConfig';
import prisma from '../src/lib/prisma';
import { hash } from '../src/lib/password';

async function main(): Promise<void> {
  const config = AppConfig.getInstance();

  const hashedPassword = await hash(config.superAdminPassword);

  await prisma.user.upsert({
    where: { email: config.superAdminEmail },
    update: {},
    create: {
      email: config.superAdminEmail,
      password: hashedPassword,
      name: config.superAdminName,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`Super admin seeded: ${config.superAdminEmail}`);
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
