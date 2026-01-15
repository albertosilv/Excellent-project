import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import type { PaginationParams } from '../../common/interfaces/pagination.interface';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<import("./dtos/order-response.dto").OrderResponseDto>;
    findAll(req: any, page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<import("../../common/interfaces/pagination.interface").PaginatedResponse<import("./dtos/order-response.dto").OrderResponseDto>>;
    findMyOrders(paginationParams: PaginationParams, req: any): Promise<import("../../common/interfaces/pagination.interface").PaginatedResponse<import("./dtos/order-response.dto").OrderResponseDto>>;
    getSummary(req: any): Promise<any>;
    findOne(id: string, req: any): Promise<import("./dtos/order-response.dto").OrderResponseDto>;
    update(id: string, updateOrderDto: UpdateOrderDto, req: any): Promise<import("./dtos/order-response.dto").OrderResponseDto>;
    remove(id: string, req: any): Promise<void>;
}
