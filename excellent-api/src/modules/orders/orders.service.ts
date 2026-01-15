import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrdersRepository } from './repositories/orders.repository';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderResponseDto, OrderItemResponseDto } from './dtos/order-response.dto';
import { PaginationParams, PaginatedResponse } from '../../common/interfaces/pagination.interface';
import { UserRole, OrderStatus } from '@prisma/client';
import { UsersRepository } from '../users/repositories/users.repository';
import { ProductsRepository } from '../products/repositories/products.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string, userRole: UserRole): Promise<OrderResponseDto> {
    // Verificar se usuário existe
    const user = await this.usersRepository.findOne(createOrderDto.userId);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${createOrderDto.userId} não encontrado`);
    }

    // ADMIN pode criar pedido para qualquer usuário
    // USER só pode criar pedido para si mesmo
    if (userRole === 'USER' && createOrderDto.userId !== userId) {
      throw new ForbiddenException('Você só pode criar pedidos para sua própria conta');
    }

    // Validar items
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('O pedido deve conter pelo menos um item');
    }

    // Verificar produtos duplicados
    const productIds = createOrderDto.items.map(item => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    if (productIds.length !== uniqueProductIds.length) {
      throw new BadRequestException('Não é permitido produtos duplicados no pedido');
    }

    // Verificar estoque antes de criar
    for (const item of createOrderDto.items) {
      const hasStock = await this.productsRepository.checkStockAvailability(item.productId, item.quantity);
      if (!hasStock) {
        const product = await this.productsRepository.findOne(item.productId);
        throw new BadRequestException(
          `Estoque insuficiente para ${product?.description}. Quantidade solicitada: ${item.quantity}`
        );
      }
    }

    const order = await this.ordersRepository.create(createOrderDto);
    return this.mapToResponseDto(order);
  }

  async findAll(
    params: PaginationParams & { status?: OrderStatus }, 
    userId: string, 
    userRole: UserRole
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    const queryParams = {
      ...params,
      ...(userRole === 'USER' && { userId }),
    };

    const result = await this.ordersRepository.findAll(queryParams);
    
    return {
      data: result.data.map(order => this.mapToResponseDto(order)),
      meta: result.meta,
    };
  }

  async findOne(id: string, userId: string, userRole: UserRole): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne(id);
    
    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    // ADMIN pode ver qualquer pedido
    // USER só pode ver seus próprios pedidos
    if (userRole === 'USER' && order.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar este pedido');
    }
    
    return this.mapToResponseDto(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, userId: string, userRole: UserRole): Promise<OrderResponseDto> {
    const existingOrder = await this.ordersRepository.findOne(id);
    if (!existingOrder) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    // ADMIN pode atualizar qualquer pedido
    // USER não pode atualizar pedidos
    if (userRole === 'USER') {
      throw new ForbiddenException('Apenas administradores podem atualizar pedidos');
    }

    // Validar mudança de status
    if (updateOrderDto.status) {
      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        OPEN: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['CANCELLED'],
        CANCELLED: [],
      };

      const allowedNextStatus = validTransitions[existingOrder.status];
      if (!allowedNextStatus.includes(updateOrderDto.status)) {
        throw new BadRequestException(
          `Não é possível mudar o status de ${existingOrder.status} para ${updateOrderDto.status}`
        );
      }

      // Se cancelar pedido, restaurar estoque (já feito no repository.remove)
      if (updateOrderDto.status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
        // Apenas validação, o repository já trata
      }
    }

    const updatedOrder = await this.ordersRepository.update(id, updateOrderDto);
    return this.mapToResponseDto(updatedOrder);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const existingOrder = await this.ordersRepository.findOne(id);
    if (!existingOrder) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    // ADMIN pode deletar qualquer pedido (só se estiver CANCELLED)
    // USER não pode deletar pedidos
    if (userRole === 'USER') {
      throw new ForbiddenException('Apenas administradores podem excluir pedidos');
    }

    // Só pode deletar pedidos cancelados
    if (existingOrder.status !== 'CANCELLED') {
      throw new BadRequestException('Só é possível excluir pedidos cancelados');
    }

    await this.ordersRepository.remove(id);
  }

  async findUserOrders(userId: string, params: PaginationParams): Promise<PaginatedResponse<OrderResponseDto>> {
    const result = await this.ordersRepository.findByUserId(userId, params);
    
    return {
      data: result.data.map(order => this.mapToResponseDto(order)),
      meta: result.meta,
    };
  }

  async getOrderSummary(userId: string, userRole: UserRole): Promise<any> {
    const userIdForQuery = userRole === 'USER' ? userId : undefined;
    return this.ordersRepository.getOrderSummary(userIdForQuery);
  }

  private mapToResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      userName: order.user?.corporateName || '',
      userCnpj: order.user?.cnpj || '',
      userEmail: order.user?.email || '',
      status: order.status,
      totalAmount: Number(order.totalAmount),
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}