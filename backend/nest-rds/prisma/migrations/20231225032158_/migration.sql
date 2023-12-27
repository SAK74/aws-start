-- CreateEnum
CREATE TYPE "Order_Status" AS ENUM ('ORDERED', 'IN_PROGRESS', 'DELIVERED');

-- DropIndex
DROP INDEX "Product_id_key";

-- AlterTable
ALTER TABLE "Cart_Item" ADD COLUMN     "orderUser_id" UUID;

-- AlterTable
ALTER TABLE "Product" ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "payment" JSONB NOT NULL,
    "delivery" JSONB NOT NULL,
    "comments" TEXT NOT NULL,
    "status" "Order_Status",
    "total" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_key" ON "Order"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_cartId_key" ON "Order"("cartId");

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_orderUser_id_fkey" FOREIGN KEY ("orderUser_id") REFERENCES "Order"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
