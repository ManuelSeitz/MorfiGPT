import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export enum OrderBy {
  SOURCE = "source",
  PRICE = "price",
}

export class SearchProductDto {
  @IsString()
  @IsOptional()
  name: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  perSource?: number;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value as string[];
    }
    return typeof value === "string" ? [value] : [];
  })
  @Type(() => String)
  blacklist?: string[];

  @IsEnum(OrderBy)
  @IsOptional()
  orderBy?: OrderBy;
}
