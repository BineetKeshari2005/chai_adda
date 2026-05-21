-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('INSTANT', 'SCHEDULED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'INSTANT';
