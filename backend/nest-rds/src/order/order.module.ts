import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [OrderService],
  exports: [OrderService],
  imports: [PrismaModule],
})
export class OrderModule {}
