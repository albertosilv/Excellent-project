export declare class ProductImageResponseDto {
    id: string;
    url: string;
    createdAt: Date;
}
export declare class ProductResponseDto {
    id: string;
    description: string;
    salePrice: number;
    stock: number;
    images?: ProductImageResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}
