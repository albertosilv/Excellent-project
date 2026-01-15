import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, req: any): Promise<import("./dtos/product-response.dto").ProductResponseDto>;
    findAll(req: any, page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<import("../../common/interfaces/pagination.interface").PaginatedResponse<import("./dtos/product-response.dto").ProductResponseDto>>;
    findOne(id: string, req: any): Promise<import("./dtos/product-response.dto").ProductResponseDto>;
    update(id: string, updateProductDto: UpdateProductDto, req: any): Promise<import("./dtos/product-response.dto").ProductResponseDto>;
    remove(id: string, req: any): Promise<void>;
}
