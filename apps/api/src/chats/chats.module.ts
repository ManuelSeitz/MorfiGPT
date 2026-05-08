import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmbeddingsModule } from "../embeddings/embeddings.module";
import { Recipe } from "../recipes/entities/recipe.entity";
import { RecipesModule } from "../recipes/recipes.module";
import { User } from "../users/entities/user.entity";
import { ChatsController } from "./chats.controller";
import { ChatsService } from "./chats.service";
import { Chat } from "./entities/chat.entity";
import { Message } from "./entities/message.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, Recipe, User]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    EmbeddingsModule,
    RecipesModule,
  ],
  providers: [ChatsService],
  controllers: [ChatsController],
})
export class ChatsModule {}
