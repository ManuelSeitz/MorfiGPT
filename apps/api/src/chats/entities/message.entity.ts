import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Chat } from "./chat.entity";

export enum Role {
  ASSISTANT = "assistant",
  DEVELOPER = "developer",
  SYSTEM = "system",
  USER = "user",
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: Role })
  role: Role;

  @Column("varchar")
  content: string;

  @ManyToOne(() => Chat, (chat) => chat.messages, {
    onDelete: "CASCADE",
  })
  chat: Chat;

  @CreateDateColumn()
  createdAt: string;
}
