/*
  Warnings:

  - The values [BOTH] on the enum `MilkType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `totalPrice` on the `Sale` table. All the data in the column will be lost.
  - Added the required column `totalAmount` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerName` on table `Sale` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MilkType_new" AS ENUM ('COW', 'BUFFALO');
ALTER TABLE "public"."Farmer" ALTER COLUMN "milkType" DROP DEFAULT;
ALTER TABLE "Farmer" ALTER COLUMN "milkType" TYPE "MilkType_new" USING ("milkType"::text::"MilkType_new");
ALTER TYPE "MilkType" RENAME TO "MilkType_old";
ALTER TYPE "MilkType_new" RENAME TO "MilkType";
DROP TYPE "public"."MilkType_old";
ALTER TABLE "Farmer" ALTER COLUMN "milkType" SET DEFAULT 'COW';
COMMIT;

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_productId_fkey";

-- AlterTable
ALTER TABLE "MilkCollection" ALTER COLUMN "fat" SET DEFAULT 0,
ALTER COLUMN "snf" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "totalPrice",
ADD COLUMN     "fat" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "snf" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL,
ALTER COLUMN "customerName" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
