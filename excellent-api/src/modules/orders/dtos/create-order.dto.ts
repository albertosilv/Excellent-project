import { IsString, IsArray, IsNotEmpty, ValidateNested, IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString({ message: 'Product ID deve ser uma string' })
  @IsNotEmpty({ message: 'Product ID é obrigatório' })
  productId: string;

  @IsNumber({}, { message: 'Quantidade deve ser um número' })
  @IsPositive({ message: 'Quantidade deve ser maior que zero' })
  @Min(1, { message: 'Quantidade deve ser pelo menos 1' })
  quantity: number;
}

export class CreateOrderDto {
  @IsString({ message: 'User ID deve ser uma string' })
  @IsNotEmpty({ message: 'User ID é obrigatório' })
  userId: string;

  @IsArray({ message: 'Items deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}