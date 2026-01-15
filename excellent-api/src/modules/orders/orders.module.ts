// src/modules/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './repositories/orders.repository';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,     
    ProductsModule, 
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrdersRepository, 
  ],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}