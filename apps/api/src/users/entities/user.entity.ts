import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Cart } from "../../carts/entities/cart.entity";
import { Chat } from "../../chats/entities/chat.entity";
import { Fridge } from "../../fridges/entities/fridge.entity";
import { Order } from "../../orders/entities/order.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { nullable: true })
  name: string | null;

  @Column("varchar", { unique: true })
  email: string;

  @Column("boolean", { default: false })
  emailVerified: boolean;

  @Column("varchar", { nullable: true, select: false })
  password: string | null;

  @Column("varchar", { nullable: true })
  avatar: string | null;

  @OneToMany(() => Chat, (chat) => chat.user, { nullable: true, cascade: true })
  chats: Chat[];

  @OneToOne(() => Cart, (cart) => cart.user, { nullable: true })
  cart: Cart;

  @OneToMany(() => Order, (order) => order.user, { nullable: true })
  orders: Order[];

  @OneToOne(() => Fridge, (fridge) => fridge.user, { nullable: true })
  fridge: Fridge;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
