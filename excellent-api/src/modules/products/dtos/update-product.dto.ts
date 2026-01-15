import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsNumber, IsPositive, Min, IsArray, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsNumber({}, { message: 'Valor de venda deve ser um número' })
  @IsPositive({ message: 'Valor de venda deve ser maior que zero' })
  @Type(() => Number)
  salePrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Estoque deve ser um número' })
  @Min(0, { message: 'Estoque não pode ser negativo' })
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsArray({ message: 'Imagens deve ser um array' })
  @IsUrl({}, { each: true, message: 'Cada URL de imagem deve ser válida' })
  images?: string[];
}