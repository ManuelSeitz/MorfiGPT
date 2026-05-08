import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Message } from "./message.entity";

@Entity()
export class Chat {
  @PrimaryColumn("uuid")
  id: string;

  @Column("varchar", { nullable: true, default: null })
  title: string | null;

  @ManyToOne(() => User, (user) => user.chats, {
    onDelete: "CASCADE",
    nullable: true,
  })
  user: User | null;

  @OneToMany(() => Message, (message) => message.chat, { cascade: true })
  messages: Message[];

  @Column("timestamp", {
    nullable: true,
    default: () => "now() + interval '1 day'",
  })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
