import { Module } from "@nestjs/common";
import { VtexService } from "./vtex.service";

@Module({ providers: [VtexService], exports: [VtexService] })
export class VtexModule {}
