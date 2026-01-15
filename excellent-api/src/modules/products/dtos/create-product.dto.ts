import { IsString, IsNumber, IsPositive, Min, IsOptional, IsArray, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'Descrição deve ser uma string' })
  @Min(3, { message: 'Descrição deve ter pelo menos 3 caracteres' })
  description: string;

  @IsNumber({}, { message: 'Valor de venda deve ser um número' })
  @IsPositive({ message: 'Valor de venda deve ser maior que zero' })
  @Type(() => Number)
  salePrice: number;

  @IsNumber({}, { message: 'Estoque deve ser um número' })
  @Min(0, { message: 'Estoque não pode ser negativo' })
  @Type(() => Number)
  stock: number;

  @IsOptional()
  @IsArray({ message: 'Imagens deve ser um array' })
  @IsUrl({}, { each: true, message: 'Cada URL de imagem deve ser válida' })
  images?: string[];
}