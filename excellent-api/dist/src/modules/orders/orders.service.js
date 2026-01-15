"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const orders_repository_1 = require("./repositories/orders.repository");
const users_repository_1 = require("../users/repositories/users.repository");
const products_repository_1 = require("../products/repositories/products.repository");
let OrdersService = class OrdersService {
    ordersRepository;
    usersRepository;
    productsRepository;
    constructor(ordersRepository, usersRepository, productsRepository) {
        this.ordersRepository = ordersRepository;
        this.usersRepository = usersRepository;
        this.productsRepository = productsRepository;
    }
    async create(createOrderDto, userId, userRole) {
        const user = await this.usersRepository.findOne(createOrderDto.userId);
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${createOrderDto.userId} não encontrado`);
        }
        if (userRole === 'USER' && createOrderDto.userId !== userId) {
            throw new common_1.ForbiddenException('Você só pode criar pedidos para sua própria conta');
        }
        if (!createOrderDto.items || createOrderDto.items.length === 0) {
            throw new common_1.BadRequestException('O pedido deve conter pelo menos um item');
        }
        const productIds = createOrderDto.items.map(item => item.productId);
        const uniqueProductIds = [...new Set(productIds)];
        if (productIds.length !== uniqueProductIds.length) {
            throw new common_1.BadRequestException('Não é permitido produtos duplicados no pedido');
        }
        for (const item of createOrderDto.items) {
            const hasStock = await this.productsRepository.checkStockAvailability(item.productId, item.quantity);
            if (!hasStock) {
                const product = await this.productsRepository.findOne(item.productId);
                throw new common_1.BadRequestException(`Estoque insuficiente para ${product?.description}. Quantidade solicitada: ${item.quantity}`);
            }
        }
        const order = await this.ordersRepository.create(createOrderDto);
        return this.mapToResponseDto(order);
    }
    async findAll(params, userId, userRole) {
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
    async findOne(id, userId, userRole) {
        const order = await this.ordersRepository.findOne(id);
        if (!order) {
            throw new common_1.NotFoundException(`Pedido com ID ${id} não encontrado`);
        }
        if (userRole === 'USER' && order.userId !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para visualizar este pedido');
        }
        return this.mapToResponseDto(order);
    }
    async update(id, updateOrderDto, userId, userRole) {
        const existingOrder = await this.ordersRepository.findOne(id);
        if (!existingOrder) {
            throw new common_1.NotFoundException(`Pedido com ID ${id} não encontrado`);
        }
        if (userRole === 'USER') {
            throw new common_1.ForbiddenException('Apenas administradores podem atualizar pedidos');
        }
        if (updateOrderDto.status) {
            const validTransitions = {
                OPEN: ['CONFIRMED', 'CANCELLED'],
                CONFIRMED: ['CANCELLED'],
                CANCELLED: [],
            };
            const allowedNextStatus = validTransitions[existingOrder.status];
            if (!allowedNextStatus.includes(updateOrderDto.status)) {
                throw new common_1.BadRequestException(`Não é possível mudar o status de ${existingOrder.status} para ${updateOrderDto.status}`);
            }
            if (updateOrderDto.status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
            }
        }
        const updatedOrder = await this.ordersRepository.update(id, updateOrderDto);
        return this.mapToResponseDto(updatedOrder);
    }
    async remove(id, userId, userRole) {
        const existingOrder = await this.ordersRepository.findOne(id);
        if (!existingOrder) {
            throw new common_1.NotFoundException(`Pedido com ID ${id} não encontrado`);
        }
        if (userRole === 'USER') {
            throw new common_1.ForbiddenException('Apenas administradores podem excluir pedidos');
        }
        if (existingOrder.status !== 'CANCELLED') {
            throw new common_1.BadRequestException('Só é possível excluir pedidos cancelados');
        }
        await this.ordersRepository.remove(id);
    }
    async findUserOrders(userId, params) {
        const result = await this.ordersRepository.findByUserId(userId, params);
        return {
            data: result.data.map(order => this.mapToResponseDto(order)),
            meta: result.meta,
        };
    }
    async getOrderSummary(userId, userRole) {
        const userIdForQuery = userRole === 'USER' ? userId : undefined;
        return this.ordersRepository.getOrderSummary(userIdForQuery);
    }
    mapToResponseDto(order) {
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
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_1.OrdersRepository,
        users_repository_1.UsersRepository,
        products_repository_1.ProductsRepository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map