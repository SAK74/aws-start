import { Injectable, NotFoundException } from '@nestjs/common';

import { OrderPayload, OrderResponse, StoredOrder } from '../models';
import { PrismaService } from 'src/prisma/prisma.service';
import { Order_Status, Prisma } from '@prisma/client';

function adjustOrderFormat(order: StoredOrder): OrderResponse {
  return {
    id: order.id,
    items: order.items.map(({ count, productId }) => ({
      count,
      productId: productId,
    })),
    address: {
      address: (order.delivery as Prisma.JsonObject).addres as string,
      comment: (order.delivery as Prisma.JsonObject).comment as string,
      firstName: (order.delivery as Prisma.JsonObject).firstName as string,
      lastName: (order.delivery as Prisma.JsonObject).lastName as string,
    },
    statusHistory: order.history.map((el) => ({
      ...el,
      timestamp: new Date(el.timestamp).getTime(),
    })),
  };
}

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(orderId: string): Promise<OrderResponse> {
    console.log('Order ID in find by id: ', orderId);
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        history: true,
      },
    });
    return adjustOrderFormat(order);
  }

  async create(
    data: OrderPayload & { total: number; userId: string },
  ): Promise<OrderResponse> {
    return this.prisma.$transaction(async (tx) => {
      // console.log('Data: ', data);

      const newOrder = await tx.order.create({
        data: {
          items: {
            createMany: {
              data: data.items.map(({ count, productId }) => ({
                count,
                productId,
              })),
            },
          },

          delivery: data.address as Prisma.JsonObject,
          payment: {},
          total: data.total,
          cart: { connect: { user_id: data.userId } },
          User: { connect: { id: data.userId } },
          history: {
            create: {
              comment: `some comment to ${Order_Status.OPEN}`,
            },
          },
        },
        include: {
          items: true,
          history: true,
        },
      });

      if (newOrder) {
        await tx.cart.update({
          where: { user_id: data.userId },
          data: { status: 'ORDERED', items: { deleteMany: {} } },
        });
        return adjustOrderFormat(newOrder);
      }
    });
  }

  async update(
    orderId: string,
    data: Omit<OrderPayload['statusHistory'][0], 'timestamp'>,
  ) {
    // console.log('Order ID, data: ', orderId, data);

    if (!(await this.prisma.order.findUnique({ where: { id: orderId } }))) {
      throw new NotFoundException('Order does not exist.');
    }
    await this.prisma.order.update({
      where: { id: orderId },
      data: { history: { create: data } },
    });
  }

  async getAllOrders(): Promise<OrderResponse[]> {
    return (
      await this.prisma.order.findMany({
        include: {
          items: true,
          history: true,
        },
      })
    ).map((order) => adjustOrderFormat(order));
  }
}
