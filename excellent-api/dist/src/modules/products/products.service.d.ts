import { ProductsRepository } from './repositories/products.repository';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductResponseDto } from './dtos/product-response.dto';
import { PaginationParams, PaginatedResponse } from '../../common/interfaces/pagination.interface';
import { UserRole } from '@prisma/client';
export declare class ProductsService {
    private readonly productsRepository;
    constructor(productsRepository: ProductsRepository);
    create(createProductDto: CreateProductDto, userRole: UserRole): Promise<ProductResponseDto>;
    findAll(params: PaginationParams, userRole: UserRole): Promise<PaginatedResponse<ProductResponseDto>>;
    findOne(id: string, userRole: UserRole): Promise<ProductResponseDto>;
    update(id: string, updateProductDto: UpdateProductDto, userRole: UserRole): Promise<ProductResponseDto>;
    remove(id: string, userRole: UserRole): Promise<void>;
    checkStock(id: string, quantity: number): Promise<boolean>;
    updateStock(id: string, quantity: number): Promise<void>;
    restoreStock(id: string, quantity: number): Promise<void>;
    private mapToResponseDto;
}
