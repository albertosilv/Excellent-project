import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductResponseDto, ProductImageResponseDto } from './dtos/product-response.dto';
import { PaginationParams, PaginatedResponse } from '../../common/interfaces/pagination.interface';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto, userRole: UserRole): Promise<ProductResponseDto> {
    // Apenas ADMIN pode criar produtos
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem criar produtos');
    }

    // Regra: Valor de venda deve ser maior que zero
    if (createProductDto.salePrice <= 0) {
      throw new BadRequestException('Valor de venda deve ser maior que zero');
    }

    // Regra: Estoque não pode ser negativo
    if (createProductDto.stock < 0) {
      throw new BadRequestException('Estoque não pode ser negativo');
    }

    const product = await this.productsRepository.create(createProductDto);
    return this.mapToResponseDto(product);
  }

  async findAll(params: PaginationParams, userRole: UserRole): Promise<PaginatedResponse<ProductResponseDto>> {
    // ADMIN vê tudo, USER vê apenas produtos com estoque
    const where = userRole === 'USER' ? { stock: { gt: 0 } } : {};
    
    const result = await this.productsRepository.findAll({
      ...params,
      ...(userRole === 'USER' && { where }),
    });
    
    return {
      data: result.data.map(product => this.mapToResponseDto(product)),
      meta: result.meta,
    };
  }

  async findOne(id: string, userRole: UserRole): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne(id);
    
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    // USER só pode ver produtos com estoque disponível
    if (userRole === 'USER' && product.stock <= 0) {
      throw new ForbiddenException('Produto não disponível');
    }
    
    return this.mapToResponseDto(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto, userRole: UserRole): Promise<ProductResponseDto> {
    // Apenas ADMIN pode atualizar produtos
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem atualizar produtos');
    }

    const existingProduct = await this.productsRepository.findOne(id);
    if (!existingProduct) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    // Regra: Valor de venda deve ser maior que zero
    if (updateProductDto.salePrice !== undefined && updateProductDto.salePrice <= 0) {
      throw new BadRequestException('Valor de venda deve ser maior que zero');
    }

    // Regra: Estoque não pode ser negativo
    if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
      throw new BadRequestException('Estoque não pode ser negativo');
    }

    const updatedProduct = await this.productsRepository.update(id, updateProductDto);
    return this.mapToResponseDto(updatedProduct);
  }

  async remove(id: string, userRole: UserRole): Promise<void> {
    // Apenas ADMIN pode remover produtos
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Apenas administradores podem remover produtos');
    }

    const existingProduct = await this.productsRepository.findOne(id);
    if (!existingProduct) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    await this.productsRepository.remove(id);
  }

  async checkStock(id: string, quantity: number): Promise<boolean> {
    return this.productsRepository.checkStockAvailability(id, quantity);
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    const newStock = product.stock - quantity;
    if (newStock < 0) {
      throw new BadRequestException('Estoque insuficiente');
    }

    await this.productsRepository.updateStock(id, quantity);
  }

  async restoreStock(id: string, quantity: number): Promise<void> {
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    await this.productsRepository.restoreStock(id, quantity);
  }

  private mapToResponseDto(product: any): ProductResponseDto {
    return {
      id: product.id,
      description: product.description,
      salePrice: Number(product.salePrice),
      stock: product.stock,
      images: product.images?.map((image: any) => ({
        id: image.id,
        url: image.url,
        createdAt: image.createdAt,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}