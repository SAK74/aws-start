import { Injectable, NotFoundException } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart } from '../models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  // private userCarts: Record<string, Cart> = {};
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<Cart> {
    console.log(userId);
    // return this.userCarts[userId];
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: {
        user_id: userId,
      },
      include: { items: { include: { product: true } } },
    });
    console.log(cart);
    return cart;
  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = v4();
    // const userCart = {
    //   id,
    //   items: [],
    // };

    // this.userCarts[userId] = userCart;
    const userCart = await this.prisma.cart.create({
      data: {
        user_id: userId,
        status: 'OPEN',
      },
    });

    return { ...userCart, items: [] };
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    // if (userCart) {
    //   // return userCart;
    // }
    try {
      const userCart = await this.findByUserId(userId);
      return userCart;
    } catch {
      return this.createByUserId(userId);
    }
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    // const { id, ...rest } = await this.findOrCreateByUserId(userId);

    // const updatedCart = {
    //   id,
    //   ...rest,
    //   items: [...items],
    // };

    // this.userCarts[userId] = { ...updatedCart };

    const products = await this.prisma.product.findMany({
      where: { id: { in: items.map((item) => item.product.id) } },
    });

    if (!products.length) {
      throw new NotFoundException('NO product found...');
    }

    const updatedCart = await this.prisma.cart.upsert({
      where: {
        user_id: userId,
      },
      create: {
        status: 'OPEN',
        user_id: userId,
      },
      update: {
        items: {
          create: items.map((item) => {
            const {
              product: { id },
              count,
            } = item;
            return {
              count,
              product_id: id,
            };
          }),
        },
      },
      include: { items: { include: { product: true } } },
    });
    console.log(updatedCart);
    return updatedCart;
  }

  async removeByUserId(userId): Promise<void> {
    // this.userCarts[userId] = null;
    await this.prisma.cart.delete({
      where: {
        user_id: userId,
      },
    });
  }

  async setStatusById(id: string, status: Cart['status']) {
    await this.prisma.cart.update({
      where: { id },
      data: { status },
    });
  }
}
