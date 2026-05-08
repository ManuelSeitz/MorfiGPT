import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { ProductsService } from "../products/products.service";
import { AddItemsDto, ItemDto } from "./dtos/add-items.dto";
import { Cart } from "./entities/cart.entity";
import { CartItem } from "./entities/item.entity";

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private itemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async findByUser(userId: string) {
    return await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ["items"],
      order: { items: { createdAt: "ASC" } },
    });
  }

  async findOrCreate(userId: string) {
    let cart = await this.findByUser(userId);
    if (!cart) {
      await this.cartRepository.save({ user: { id: userId } });
      cart = (await this.findByUser(userId)) as Cart;
    }
    return cart;
  }

  async getCartWithItems(cartId: string) {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ["items"],
      order: { items: { createdAt: "ASC" } },
    });

    if (!cart) return null;

    const items = await Promise.all(
      cart.items.map(async (item) => this.productsService.mapItem(item)),
    );

    // eslint-disable-next-line @typescript-eslint/no-misused-spread
    return { ...cart, items };
  }

  async updateItems(cart: Cart, items: AddItemsDto["items"]) {
    for (const item of items) {
      const existing = await this.itemRepository.findOne({
        where: { productId: item.id, cart: { id: cart.id } },
      });

      if (existing) {
        existing.quantity += item.quantity;
        await this.itemRepository.save(existing);
      } else {
        const newItem = this.itemRepository.create({
          productId: item.id,
          name: item.name,
          cart: cart,
          quantity: item.quantity,
        });
        await this.itemRepository.save(newItem);
      }
    }
  }

  async decreaseItemQuantity(
    cart: Cart,
    itemId: string,
    quantity: number,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(CartItem)
      : this.itemRepository;

    const item = await repository.findOne({
      where: { productId: itemId, cart: { id: cart.id } },
    });

    if (!item) return;

    item.quantity = Math.max(0, item.quantity - quantity);

    if (item.quantity === 0) {
      await repository.remove(item);
      return;
    }

    await repository.save(item);
  }

  async addItem(cart: Cart, item: ItemDto) {
    if (cart.items.some((i) => i.productId === item.id)) {
      await this.updateItems(cart, [item]);
      return;
    }

    const newItem = this.itemRepository.create({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      cart,
    });
    await this.itemRepository.save(newItem);
  }
}
