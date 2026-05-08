import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { CreateOrderDto } from "../orders/dtos/create-order.dto";
import { Fridge } from "./entities/fridge.entity";
import { FridgeItem } from "./entities/item.entity";

@Injectable()
export class FridgesService {
  constructor(
    @InjectRepository(Fridge) private fridgeRepository: Repository<Fridge>,
    @InjectRepository(FridgeItem)
    private itemRepository: Repository<FridgeItem>,
  ) {}

  async findOrCreate(userId: string) {
    let fridge = await this.fridgeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["items"],
    });

    if (!fridge) {
      fridge = await this.fridgeRepository.save({
        user: { id: userId },
        items: [],
      });
    }

    return fridge;
  }

  async addItems(
    userId: string,
    items: CreateOrderDto["items"],
    manager?: EntityManager,
  ) {
    const itemRepository = manager
      ? manager.getRepository(FridgeItem)
      : this.itemRepository;

    const existing = await this.findOrCreate(userId);

    for (const item of items) {
      const existingItem = await itemRepository.findOneBy({
        productId: item.id,
        fridge: { id: existing.id },
      });

      if (existingItem) {
        await itemRepository.increment(
          { id: existingItem.id },
          "quantity",
          item.quantity,
        );
        continue;
      }

      const newItem = itemRepository.create({
        productId: item.id,
        fridge: existing,
        name: item.name,
        quantity: item.quantity,
      });

      await itemRepository.save(newItem);
    }

    return existing;
  }

  async editItem(fridge: Fridge, itemId: string, quantity: number) {
    const item = await this.itemRepository.findOne({
      where: { fridge: { id: fridge.id }, productId: itemId },
    });

    if (!item) return null;

    item.quantity = quantity;
    await this.itemRepository.save(item);

    return item;
  }

  async deleteItem(fridge: Fridge, itemId: string) {
    const item = await this.itemRepository.findOne({
      where: { fridge: { id: fridge.id }, productId: itemId },
    });

    if (!item) return null;

    await this.itemRepository.delete({
      fridge: { id: fridge.id },
      productId: itemId,
    });

    return item;
  }
}
