import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { FridgeItem } from "./item.entity";

@Entity()
export class Fridge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User, (user) => user.fridge)
  @JoinColumn()
  user: User;

  @OneToMany(() => FridgeItem, (item) => item.fridge, { cascade: true })
  items: FridgeItem[];

  @CreateDateColumn()
  createdAt: Date;
}
