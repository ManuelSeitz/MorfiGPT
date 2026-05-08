import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsModule } from "../products/products.module";
import { Fridge } from "./entities/fridge.entity";
import { FridgeItem } from "./entities/item.entity";
import { FridgesController } from "./fridges.controller";
import { FridgesService } from "./fridges.service";

@Module({
  imports: [TypeOrmModule.forFeature([Fridge, FridgeItem]), ProductsModule],
  providers: [FridgesService],
  controllers: [FridgesController],
  exports: [FridgesService],
})
export class FridgesModule {}
