import {
  Controller,
  Put,
  Get,
  UseGuards,
  Req,
  Param,
  Body,
} from '@nestjs/common';
import { OrderService } from './services';
import { BasicAuthGuard } from 'src/auth';
import { AppRequest } from 'src/shared';
import { Order_Status } from '@prisma/client';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Get()
  getAllOrders(@Req() req: AppRequest) {
    return this.orderService.getAllOrders();
  }

  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(BasicAuthGuard)
  async updateOrder(
    @Param('id') id: string,
    @Body() body: { status: Order_Status; comment: string }, // to validate body
  ) {
    await this.orderService.update(id, body);
  }
}
