import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Product, ProductImage } from '@prisma/client';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { PaginationParams, PaginatedResponse } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { images, ...productData } = createProductDto;
    
    return this.prisma.product.create({
      data: {
        ...productData,
        salePrice: productData.salePrice,
        images: images && images.length > 0 ? {
          create: images.map(url => ({ url }))
        } : undefined,
      },
      include: {
        images: true,
      },
    });
  }

  async findAll(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;
    
    const where = search
      ? {
          description: { contains: search },
        }
      : {};
    
    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          images: true,
        },
      }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        orderItems: {
          include: {
            order: true,
          },
        },
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const { images, ...productData } = updateProductDto;
    
    // Se há imagens para atualizar
    if (images) {
      // Remove imagens antigas e cria novas
      await this.prisma.productImage.deleteMany({
        where: { productId: id },
      });
    }
    
    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        salePrice: productData.salePrice,
        images: images && images.length > 0 ? {
          create: images.map(url => ({ url }))
        } : undefined,
      },
      include: {
        images: true,
      },
    });
  }

  async remove(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  async restoreStock(id: string, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });
  }

  async checkStockAvailability(id: string, requestedQuantity: number): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { stock: true },
    });
    
    return product ? product.stock >= requestedQuantity : false;
  }

  async addImage(productId: string, url: string): Promise<ProductImage> {
    return this.prisma.productImage.create({
      data: {
        productId,
        url,
      },
    });
  }

  async removeImage(imageId: string): Promise<ProductImage> {
    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }
}