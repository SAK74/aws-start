-- CreateEnum
CREATE TYPE "Card_Status" AS ENUM ('OPEN', 'ORDERED');

-- CreateEnum
CREATE TYPE "Order_Status" AS ENUM ('ORDERED', 'IN_PROGRESS', 'DELIVERED');

-- CreateTable
CREATE TABLE "Cart" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "Card_Status" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart_Item" (
    "product_id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "count" INTEGER NOT NULL,
    "orderUser_id" UUID,

    CONSTRAINT "Cart_Item_pkey" PRIMARY KEY ("cart_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "payment" JSONB NOT NULL,
    "delivery" JSONB NOT NULL,
    "comments" TEXT NOT NULL,
    "status" "Order_Status",
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_user_id_key" ON "Cart"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_Item_product_id_key" ON "Cart_Item"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_key" ON "Order"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_cartId_key" ON "Order"("cartId");

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_orderUser_id_fkey" FOREIGN KEY ("orderUser_id") REFERENCES "Order"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
