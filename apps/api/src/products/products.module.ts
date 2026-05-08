import { Module } from "@nestjs/common";
import { VtexModule } from "../vtex/vtex.module";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  providers: [ProductsService],
  exports: [ProductsService],
  imports: [VtexModule],
  controllers: [ProductsController],
})
export class ProductsModule {}
