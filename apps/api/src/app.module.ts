import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CartsModule } from "./carts/carts.module";
import { ChatsModule } from "./chats/chats.module";
import { EmbeddingsModule } from "./embeddings/embeddings.module";
import { FridgesModule } from "./fridges/fridges.module";
import { OrdersModule } from "./orders/orders.module";
import { ProductsModule } from "./products/products.module";
import { RecipesModule } from "./recipes/recipes.module";
import { UsersModule } from "./users/users.module";
import { VtexModule } from "./vtex/vtex.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "development"}.local`,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres",
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== "production",
      }),
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
