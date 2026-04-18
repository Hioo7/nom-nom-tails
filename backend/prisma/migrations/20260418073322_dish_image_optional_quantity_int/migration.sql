/*
  Warnings:

  - You are about to alter the column `quantity` on the `DishIngredient` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Dish" ALTER COLUMN "imageUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DishIngredient" ALTER COLUMN "quantity" SET DATA TYPE INTEGER;
