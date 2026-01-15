import { OrdersRepository } from './repositories/orders.repository';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderResponseDto } from './dtos/order-response.dto';
import { PaginationParams, PaginatedResponse } from '../../common/interfaces/pagination.interface';
import { UserRole, OrderStatus } from '@prisma/client';
import { UsersRepository } from '../users/repositories/users.repository';
import { ProductsRepository } from '../products/repositories/products.repository';
export declare class OrdersService {
    private readonly ordersRepository;
    private readonly usersRepository;
    private readonly productsRepository;
    constructor(ordersRepository: OrdersRepository, usersRepository: UsersRepository, productsRepository: ProductsRepository);
    create(createOrderDto: CreateOrderDto, userId: string, userRole: UserRole): Promise<OrderResponseDto>;
    findAll(params: PaginationParams & {
        status?: OrderStatus;
    }, userId: string, userRole: UserRole): Promise<PaginatedResponse<OrderResponseDto>>;
    findOne(id: string, userId: string, userRole: UserRole): Promise<OrderResponseDto>;
    update(id: string, updateOrderDto: UpdateOrderDto, userId: string, userRole: UserRole): Promise<OrderResponseDto>;
    remove(id: string, userId: string, userRole: UserRole): Promise<void>;
    findUserOrders(userId: string, params: PaginationParams): Promise<PaginatedResponse<OrderResponseDto>>;
    getOrderSummary(userId: string, userRole: UserRole): Promise<any>;
    private mapToResponseDto;
}
