import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CartsModule } from "./carts/carts.module";
import { Cart } from "./carts/entities/cart.entity";
import { CartItem } from "./carts/entities/item.entity";
import { ChatsModule } from "./chats/chats.module";
import { Chat } from "./chats/entities/chat.entity";
import { Message } from "./chats/entities/message.entity";
import { EmbeddingsModule } from "./embeddings/embeddings.module";
import { Fridge } from "./fridges/entities/fridge.entity";
import { FridgeItem } from "./fridges/entities/item.entity";
import { FridgesModule } from "./fridges/fridges.module";
import { OrderItem } from "./orders/entities/item.entity";
import { Order } from "./orders/entities/order.entity";
import { OrdersModule } from "./orders/orders.module";
import { ProductsModule } from "./products/products.module";
import { Recipe } from "./recipes/entities/recipe.entity";
import { RecipesModule } from "./recipes/recipes.module";
import { User } from "./users/entities/user.entity";
import { UsersModule } from "./users/users.module";
import { VtexModule } from "./vtex/vtex.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        User,
        Recipe,
        Chat,
        Message,
        Cart,
        CartItem,
        Order,
        OrderItem,
        Fridge,
        FridgeItem,
      ],
      synchronize: process.env.NODE_ENV === "production" ? false : true,
    }),
    ScheduleModule.forRoot(),
    RecipesModule,
    ProductsModule,
    EmbeddingsModule,
    ChatsModule,
    VtexModule,
    AuthModule,
    UsersModule,
    CartsModule,
    OrdersModule,
    FridgesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
