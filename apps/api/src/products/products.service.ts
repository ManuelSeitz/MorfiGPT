import { Injectable } from "@nestjs/common";
import { PRODUCT_SOURCES } from "@repo/constants";
import { Product, ProductResponse } from "@repo/types/products";
import { VtexService } from "../vtex/vtex.service";
import { OrderBy } from "./dtos/search-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly vtexService: VtexService) {}

  async getAll({
    query,
    perSource,
    blacklist,
  }: {
    query: string;
    perSource?: number;
    blacklist?: string[];
  }): Promise<Product[]> {
    const products: Product[] = [];

    for (const source of PRODUCT_SOURCES) {
      if (blacklist?.some((e) => source.slug === e)) {
        continue;
      }

      console.log(`> Searching ${query} on ${source.name}...`);

      const vtexUrl = this.vtexService.encode(source.baseUrl, query, perSource);
      let sourceProducts:
        | ProductResponse["data"]["productSuggestions"]["products"]
        | null = null;

      try {
        const response = await fetch(vtexUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
              "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          },
        });

        const res = (await response.json()) as ProductResponse;
        sourceProducts = res.data.productSuggestions.products;
      } catch (error) {
        console.error("Error fetching products:", error);
        continue;
      }

      const includedCategories = [
        "almacén",
        "desayuno",
        "merienda",
        "bebida",
        "gaseosa",
        "lácteo",
        "carne",
        "carnicería",
        "fresco",
        "pescado",
        "pescadería",
        "fruta",
        "verdura",
        "verdulería",
        "panadería",
        "panificado",
        "huevo",
        "conserva",
        "congelado",
        "pasta",
        "queso",
        "fiambre",
        "pastelería",
      ];

      sourceProducts = sourceProducts
        .filter((p) =>
          p.categories.some((c) =>
            includedCategories.some((i) =>
              c.toLowerCase().includes(i.toLowerCase()),
            ),
          ),
        )
        .slice(0, perSource);

      if (sourceProducts.length === 0) continue;

      for (const product of sourceProducts) {
        products.push({
          id: product.productId + source.slug,
          name: product.productName,
          brand: product.brand,
          price: product.priceRange.sellingPrice.lowPrice,
          imageUrl: product.items[0].images[0].imageUrl,
          link: new URL(product.linkText + "/p", source.baseUrl).toString(),
          source,
        });
      }
    }

    return products;
  }

  async mapItem(
    item: { name: string; productId: string; quantity: number },
    orderBy?: OrderBy,
  ) {
    const products = await this.getAll({
      query: item.name,
      perSource: 3,
    });

    if (orderBy === OrderBy.PRICE) {
      products.sort((a, b) => a.price - b.price);
    }

    const selected = products.find((p) => p.id === item.productId);
    return selected
      ? { ...selected, quantity: item.quantity }
      : { ...products[0], quantity: item.quantity };
  }
}
