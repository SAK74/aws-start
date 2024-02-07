import { Injectable, NotFoundException } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart, CartItem } from '../models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Cart> {
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: {
        user_id: userId,
      },
      include: {
        items: { include: { product: true }, orderBy: { product_id: 'asc' } },
      },
    });
    // console.log(cart);
    return cart;
  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = v4();

    const userCart = await this.prisma.cart.create({
      data: {
        user_id: userId,
        status: 'OPEN',
      },
    });

    return { ...userCart, items: [] };
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    try {
      const userCart = await this.findByUserId(userId);
      return userCart;
    } catch {
      return this.createByUserId(userId);
    }
  }

  async updateByUserId(
    userId: string,
    { product, count }: CartItem,
  ): Promise<Cart> {
    const itemWithProductId = await this.prisma.cart_Item.findFirst({
      where: { product_id: product.id, cart_id: userId },
    });

    // console.log('Cart item: ', itemWithProductId);

    const existingProduct = await this.prisma.product.findUnique({
      where: { id: product.id },
    });

    // console.log('Product: ', existingProduct);

    const updatedCart = await this.prisma.cart.upsert({
      where: {
        user_id: userId,
      },
      create: {
        user_id: userId,
        items: { create: { count, product: { create: product } } },
      },
      update: {
        items: {
          ...(itemWithProductId
            ? {
                update: {
                  where: { id: itemWithProductId.id },
                  data: { count },
                },
              }
            : {
                create: {
                  count,
                  product: {
                    ...(existingProduct
                      ? {
                          connect: { id: product.id },
                        }
                      : {
                          create: product,
                        }),
                  },
                },
              }),
        },
        status: 'OPEN',
      },
      include: { items: { include: { product: true } } },
    });

    // console.log(updatedCart);
    return updatedCart;
  }

  // to do
  async removeByUserId(userId: string): Promise<void> {
    await this.prisma.cart.delete({
      where: {
        user_id: userId,
      },
    });
  }
}
