import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmbeddingsModule } from "../embeddings/embeddings.module";
import { ProductsModule } from "../products/products.module";
import { Recipe } from "./entities/recipe.entity";
import { RecipesService } from "./recipes.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe]),
    ProductsModule,
    EmbeddingsModule,
  ],
  exports: [RecipesService],
  providers: [RecipesService],
})
export class RecipesModule {}
