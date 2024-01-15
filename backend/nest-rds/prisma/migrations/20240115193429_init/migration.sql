-- CreateEnum
CREATE TYPE "Cart_Status" AS ENUM ('OPEN', 'ORDERED');

-- CreateEnum
CREATE TYPE "Order_Status" AS ENUM ('OPEN', 'APPROVED', 'CONFIRMED', 'SENT', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Cart" (
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "Cart_Status" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Cart_Item" (
    "cart_id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,

    CONSTRAINT "Cart_Item_pkey" PRIMARY KEY ("product_id")
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
    "userId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "payment" JSONB NOT NULL,
    "delivery" JSONB NOT NULL,
    "total" INTEGER NOT NULL,
    "id" UUID NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order_Item" (
    "id" UUID NOT NULL,
    "order_Id" UUID NOT NULL,
    "productId" UUID,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Order_Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryStamp" (
    "status" "Order_Status" NOT NULL DEFAULT 'OPEN',
    "timestamp" TIMESTAMP(3) NOT NULL,
    "comment" TEXT NOT NULL,
    "order_id" UUID NOT NULL,
    "id" UUID NOT NULL,

    CONSTRAINT "HistoryStamp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_user_id_key" ON "Cart"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_Item_product_id_key" ON "Cart_Item"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart_Item" ADD CONSTRAINT "Cart_Item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Item" ADD CONSTRAINT "Order_Item_order_Id_fkey" FOREIGN KEY ("order_Id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order_Item" ADD CONSTRAINT "Order_Item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryStamp" ADD CONSTRAINT "HistoryStamp_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
