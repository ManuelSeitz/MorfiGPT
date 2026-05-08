import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedUser } from "@repo/types/auth";
import type { FastifyRequest } from "fastify";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CartsService } from "./carts.service";
import { AddItemsDto, ItemDto } from "./dtos/add-items.dto";

@Controller("carts")
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findByUser(@Req() req: FastifyRequest & { user: AuthenticatedUser }) {
    const user = req.user;
    const cart = await this.cartsService.findByUser(user.id);
    if (!cart) return null;
    return await this.cartsService.getCartWithItems(cart.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async add(
    @Body() item: ItemDto,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
  ) {
    const user = req.user;
    const cart = await this.cartsService.findOrCreate(user.id);
    await this.cartsService.addItem(cart, item);
    return await this.cartsService.getCartWithItems(cart.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @Body() { items }: AddItemsDto,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
  ) {
    const user = req.user;
    const cart = await this.cartsService.findOrCreate(user.id);
    await this.cartsService.updateItems(cart, items);
    return await this.cartsService.getCartWithItems(cart.id);
  }
}
