import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartsModule } from "../carts/carts.module";
import { FridgesModule } from "../fridges/fridges.module";
import { User } from "../users/entities/user.entity";
import { OrderItem } from "./entities/item.entity";
import { Order } from "./entities/order.entity";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User]),
    CartsModule,
    FridgesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
