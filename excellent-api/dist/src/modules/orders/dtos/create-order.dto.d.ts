export declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    userId: string;
    items: OrderItemDto[];
}
