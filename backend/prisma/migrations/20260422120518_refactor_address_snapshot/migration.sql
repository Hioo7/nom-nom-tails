/*
  Warnings:

  - You are about to drop the column `lat` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `lng` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - Added the required column `deliveryAddressType` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryCity` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryFullName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryLat` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryLine1` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryLng` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryPhone` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryPin` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryState` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK', 'OTHER');

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "lat",
DROP COLUMN "lng",
ADD COLUMN     "deliveryAddressType" "AddressType" NOT NULL,
ADD COLUMN     "deliveryCity" TEXT NOT NULL,
ADD COLUMN     "deliveryFullName" TEXT NOT NULL,
ADD COLUMN     "deliveryLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "deliveryLine1" TEXT NOT NULL,
ADD COLUMN     "deliveryLine2" TEXT,
ADD COLUMN     "deliveryLng" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "deliveryPhone" TEXT NOT NULL,
ADD COLUMN     "deliveryPin" TEXT NOT NULL,
ADD COLUMN     "deliveryState" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone";

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'HOME',
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
