import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Request,
    UsePipes,
    ValidationPipe,
    ParseIntPipe
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import type { PaginationParams } from '../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, OrderStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.USER)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Criar novo pedido' })
    @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos ou estoque insuficiente' })
    @ApiResponse({ status: 403, description: 'Usuário não autorizado' })
    @ApiResponse({ status: 404, description: 'Usuário ou produto não encontrado' })
    create(
        @Body() createOrderDto: CreateOrderDto,
        @Request() req,
    ) {
        return this.ordersService.create(createOrderDto, req.user.sub, req.user.role);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Listar pedidos' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
    @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
    async findAll(@Request() req,
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc') {
        const paginationParams: PaginationParams = {
            page,
            limit,
            search,
            sortBy,
            sortOrder
        }; return this.ordersService.findAll(paginationParams, req.user.sub, req.user.role);

    }


    @Get('my-orders')
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Listar meus pedidos' })
    findMyOrders(
        @Query() paginationParams: PaginationParams,
        @Request() req,
    ) {
        return this.ordersService.findUserOrders(req.user.sub, paginationParams);
    }

    @Get('summary')
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Resumo de pedidos' })
    getSummary(@Request() req) {
        return this.ordersService.getOrderSummary(req.user.sub, req.user.role);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Buscar pedido por ID' })
    @ApiResponse({ status: 200, description: 'Pedido encontrado' })
    @ApiResponse({ status: 403, description: 'Usuário não autorizado' })
    @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
    findOne(
        @Param('id') id: string,
        @Request() req,
    ) {
        return this.ordersService.findOne(id, req.user.sub, req.user.role);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Atualizar pedido (apenas ADMIN)' })
    @ApiResponse({ status: 200, description: 'Pedido atualizado' })
    @ApiResponse({ status: 400, description: 'Mudança de status inválida' })
    @ApiResponse({ status: 403, description: 'Usuário não autorizado' })
    @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
    update(
        @Param('id') id: string,
        @Body() updateOrderDto: UpdateOrderDto,
        @Request() req,
    ) {
        return this.ordersService.update(id, updateOrderDto, req.user.sub, req.user.role);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir pedido (apenas ADMIN, apenas cancelados)' })
    @ApiResponse({ status: 204, description: 'Pedido excluído' })
    @ApiResponse({ status: 400, description: 'Pedido não está cancelado' })
    @ApiResponse({ status: 403, description: 'Usuário não autorizado' })
    @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
    remove(
        @Param('id') id: string,
        @Request() req,
    ) {
        return this.ordersService.remove(id, req.user.sub, req.user.role);
    }
}