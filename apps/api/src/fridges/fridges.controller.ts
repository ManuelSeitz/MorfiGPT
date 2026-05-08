import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedUser } from "@repo/types/auth";
import type { FastifyRequest } from "fastify";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SearchProductDto } from "../products/dtos/search-product.dto";
import { ProductsService } from "../products/products.service";
import { EditProductDto } from "./dtos/edit-product.dto";
import { FridgesService } from "./fridges.service";

@Controller("fridges")
export class FridgesController {
  constructor(
    private readonly fridgesService: FridgesService,
    private readonly productsService: ProductsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async find(
    @Query() { name, blacklist, orderBy }: SearchProductDto,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
  ) {
    const user = req.user;
    const fridge = await this.fridgesService.findOrCreate(user.id);

    if (name) {
      fridge.items = fridge.items.filter((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );
    }

    let items = await Promise.all(
      fridge.items.map(async (item) =>
        this.productsService.mapItem(item, orderBy),
      ),
    );

    if (blacklist) {
      items = items.filter((item) => !blacklist.includes(item.source.slug));
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    return { ...fridge, items };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async editProduct(
    @Body() editProductDto: EditProductDto,
    @Param("id") id: string,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
  ) {
    const user = req.user;
    const fridge = await this.fridgesService.findOrCreate(user.id);

    const editedItem = await this.fridgesService.editItem(
      fridge,
      id,
      editProductDto.quantity,
    );

    if (!editedItem) {
      throw new NotFoundException("Producto no encontrado");
    }

    return editedItem;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async deleteProduct(
    @Param("id") id: string,
    @Req() req: FastifyRequest & { user: AuthenticatedUser },
  ) {
    const user = req.user;
    const fridge = await this.fridgesService.findOrCreate(user.id);

    const deletedItem = await this.fridgesService.deleteItem(fridge, id);

    if (!deletedItem) {
      throw new NotFoundException("Producto no encontrado");
    }

    return deletedItem;
  }
}
