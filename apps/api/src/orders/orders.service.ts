import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { OrderItem } from "./entities/item.entity";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepository: Repository<OrderItem>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async save(
    userId: string,
    items: CreateOrderDto["items"],
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository(Order)
      : this.orderRepository;

    const itemRepository = manager
      ? manager.getRepository(OrderItem)
      : this.itemRepository;

    const userRepository = manager
      ? manager.getRepository(User)
      : this.userRepository;

    const user = await userRepository.findOneByOrFail({
      id: userId,
    });

    const order = await repository.save({ user, items: [] as OrderItem[] });

    const orderItems = items.map(({ id, name, quantity }) =>
      itemRepository.create({
        productId: id,
        name,
        quantity,
        order,
      }),
    );

    order.items = orderItems;

    return await repository.save(order);
  }
}
