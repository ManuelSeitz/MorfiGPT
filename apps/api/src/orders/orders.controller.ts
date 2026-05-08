import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedUser } from "@repo/types/auth";
import type { FastifyRequest } from "fastify";
import { DataSource } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CartsService } from "../carts/carts.service";
import { FridgesService } from "../fridges/fridges.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cartsService: CartsService,
    private readonly fridgesService: FridgesService,
    private readonly dataSource: DataSource,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() { items }: CreateOrderDto,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
  ) {
    const user = req.user;
    const cart = await this.cartsService.findByUser(user.id);

    if (!cart) {
      throw new NotFoundException("No se encontró un carrito");
    }

    return await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        await this.cartsService.decreaseItemQuantity(
          cart,
          item.id,
          item.quantity,
          manager,
        );
      }

      const order = await this.ordersService.save(user.id, items, manager);

      await this.fridgesService.addItems(user.id, items, manager);

      return order;
    });
  }
}
