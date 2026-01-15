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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dtos/create-order.dto");
const update_order_dto_1 = require("./dtos/update-order.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    create(createOrderDto, req) {
        return this.ordersService.create(createOrderDto, req.user.sub, req.user.role);
    }
    async findAll(req, page, limit, search, sortBy, sortOrder) {
        const paginationParams = {
            page,
            limit,
            search,
            sortBy,
            sortOrder
        };
        return this.ordersService.findAll(paginationParams, req.user.sub, req.user.role);
    }
    findMyOrders(paginationParams, req) {
        return this.ordersService.findUserOrders(req.user.sub, paginationParams);
    }
    getSummary(req) {
        return this.ordersService.getOrderSummary(req.user.sub, req.user.role);
    }
    findOne(id, req) {
        return this.ordersService.findOne(id, req.user.sub, req.user.role);
    }
    update(id, updateOrderDto, req) {
        return this.ordersService.update(id, updateOrderDto, req.user.sub, req.user.role);
    }
    remove(id, req) {
        return this.ordersService.remove(id, req.user.sub, req.user.role);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo pedido' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Pedido criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dados inválidos ou estoque insuficiente' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Usuário não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuário ou produto não encontrado' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Listar pedidos' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.OrderStatus }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de pedidos retornada com sucesso' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-orders'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Listar meus pedidos' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findMyOrders", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Resumo de pedidos' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar pedido por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pedido encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Usuário não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar pedido (apenas ADMIN)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pedido atualizado' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Mudança de status inválida' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Usuário não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir pedido (apenas ADMIN, apenas cancelados)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Pedido excluído' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Pedido não está cancelado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Usuário não autorizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Pedido não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "remove", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map