-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CHEF';

-- AlterTable
ALTER TABLE "DeliveryTask" ADD COLUMN     "handlingNotes" TEXT;
