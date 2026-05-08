import { IsInt, IsNotEmpty, IsPositive } from "class-validator";

export class EditProductDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
