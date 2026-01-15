import { PrismaService } from '../../../prisma/prisma.service';
import { Product, ProductImage } from '@prisma/client';
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { PaginationParams, PaginatedResponse } from '../../../common/interfaces/pagination.interface';
export declare class ProductsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(params: PaginationParams): Promise<PaginatedResponse<Product>>;
    findOne(id: string): Promise<Product | null>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<Product>;
    updateStock(id: string, quantity: number): Promise<Product>;
    restoreStock(id: string, quantity: number): Promise<Product>;
    checkStockAvailability(id: string, requestedQuantity: number): Promise<boolean>;
    addImage(productId: string, url: string): Promise<ProductImage>;
    removeImage(imageId: string): Promise<ProductImage>;
}
