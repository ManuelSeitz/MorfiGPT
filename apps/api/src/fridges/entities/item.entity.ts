import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Fridge } from "./fridge.entity";

@Entity()
export class FridgeItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar")
  productId: string;

  @Column("varchar")
  name: string;

  @ManyToOne(() => Fridge, (fridge) => fridge.items, { onDelete: "CASCADE" })
  fridge: Fridge;

  @Column("integer")
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
