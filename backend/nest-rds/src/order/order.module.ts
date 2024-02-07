import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderController } from './order.controller';

@Module({
  providers: [OrderService],
  exports: [OrderService],
  imports: [PrismaModule],
  controllers: [OrderController],
})
export class OrderModule {}
