import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
      }),
    }),
    EmbeddingsModule,
    RecipesModule,
  ],
  providers: [ChatsService],
  controllers: [ChatsController],
})
export class ChatsModule {}
