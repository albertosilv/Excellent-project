import { PrismaService } from '../../../prisma/prisma.service';
import { Order, OrderStatus } from '@prisma/client';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { PaginationParams, PaginatedResponse } from '../../../common/interfaces/pagination.interface';
export declare class OrdersRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(params: PaginationParams & {
        userId?: string;
        status?: OrderStatus;
    }): Promise<PaginatedResponse<Order>>;
    findOne(id: string): Promise<Order | null>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: string): Promise<Order>;
    findByUserId(userId: string, params: PaginationParams): Promise<PaginatedResponse<Order>>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    getOrderSummary(userId?: string): Promise<{
        totalOrders: number;
        totalAmount: number;
        openOrders: number;
        confirmedOrders: number;
        cancelledOrders: number;
    }>;
}
