-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "slotId" TEXT;

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxOrders" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "date" TIMESTAMP(3),

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
