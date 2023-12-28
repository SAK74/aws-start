import { Injectable } from '@nestjs/common';
// import { v4 } from 'uuid';

import { Order } from '../models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderService {
  // private orders: Record<string, Order> = {}
  constructor(private readonly prisma: PrismaService) {}

  async findById(orderId: string): Promise<Order> {
    // return this.orders[ orderId ];
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
    return {
      ...order,
      payment: order.payment as Order['payment'],
      delivery: order.delivery as Order['delivery'],
    };
  }

  async create(data: any) {
    // const id = v4();
    const order = {
      ...data,
      // id,
      status: 'IN_PROGRESS',
    };

    // this.orders[id] = order;

    // return order;
    // const createdOrder = await this.prisma.order.create({
    //   data: order,
    // });
    return this.prisma.$transaction((tx) => {
      tx.cart.update({
        where: { id: data.cartId },
        data: { status: 'ORDERED' },
      });
      return tx.order.create({ data: order });
    });
  }

  async update(orderId, data) {
    const order = this.findById(orderId);

    // if (!order) {
    //   throw new Error('Order does not exist.');
    // }
    try {
      const { id } = await this.prisma.order.findUniqueOrThrow({
        where: { id: orderId },
      });
      await this.prisma.order.update({ where: { id }, data });
    } catch {
      throw new Error('Order does not exist.');
    }

    // this.orders[orderId] = {
    //   ...data,
    //   id: orderId,
    // };
  }
}
