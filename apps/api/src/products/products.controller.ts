import { Controller, Get, Query } from "@nestjs/common";
import { OrderBy, SearchProductDto } from "./dtos/search-product.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async find(
    @Query() { name, perSource, blacklist, orderBy }: SearchProductDto,
  ) {
    if (!name) return [];

    const products = await this.productsService.getAll({
      query: name,
      perSource,
      blacklist,
    });

    if (orderBy === OrderBy.PRICE) {
      return products.sort((a, b) => a.price - b.price);
    }

    return products;
  }
}
