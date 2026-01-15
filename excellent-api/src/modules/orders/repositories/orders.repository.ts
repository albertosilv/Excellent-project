import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { CreateOrderDto, OrderItemDto } from '../dtos/create-order.dto';
import { UpdateOrderDto } from '../dtos/update-order.dto';
import { PaginationParams, PaginatedResponse } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class OrdersRepository {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const productIds = createOrderDto.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        description: true,
        salePrice: true,
        stock: true,
      },
    });

    // Validar se todos os produtos existem
    for (const item of createOrderDto.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new BadRequestException(`Produto ${item.productId} não encontrado`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para ${product.description}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`
        );
      }
    }

    // Calcular valores
    const orderItems = createOrderDto.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const unitPrice = Number(product.salePrice);
      const totalPrice = unitPrice * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Criar pedido em transação
    return this.prisma.$transaction(async (tx) => {
      // 1. Criar pedido
      const order = await tx.order.create({
        data: {
          userId: createOrderDto.userId,
          totalAmount,
          status: 'OPEN',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  description: true,
                  salePrice: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              corporateName: true,
              cnpj: true,
              email: true,
            },
          },
        },
      });

      // 2. Baixar estoque
      for (const item of createOrderDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }

  async findAll(params: PaginationParams & { userId?: string; status?: OrderStatus }): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', userId, status } = params;
    const skip = (page - 1) * limit;
    
    const where: Prisma.OrderWhereInput = {};
    
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { 
          user: { 
            OR: [
              { corporateName: { contains: search, mode: 'insensitive' } },
              { cnpj: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          } 
        },
      ];
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (status) {
      where.status = status;
    }
    
    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  description: true,
                  salePrice: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              corporateName: true,
              cnpj: true,
              email: true,
            },
          },
        },
      }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                description: true,
                salePrice: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            corporateName: true,
            cnpj: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: {
        status: updateOrderDto.status,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                description: true,
                salePrice: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            corporateName: true,
            cnpj: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Pedido não encontrado');
    }

    // Restaurar estoque em transação
    return this.prisma.$transaction(async (tx) => {
      // 1. Restaurar estoque dos produtos
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // 2. Deletar pedido
      return tx.order.delete({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  description: true,
                  salePrice: true,
                },
              },
            },
          },
          user: {
            select: {
              corporateName: true,
              cnpj: true,
              email: true,
            },
          },
        },
      });
    });
  }

  async findByUserId(userId: string, params: PaginationParams): Promise<PaginatedResponse<Order>> {
    return this.findAll({ ...params, userId });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async getOrderSummary(userId?: string): Promise<{
    totalOrders: number;
    totalAmount: number;
    openOrders: number;
    confirmedOrders: number;
    cancelledOrders: number;
  }> {
    const where: Prisma.OrderWhereInput = userId ? { userId } : {};
    
    const [
      totalOrders,
      totalAmountResult,
      openOrders,
      confirmedOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({ where: { ...where, status: 'OPEN' } }),
      this.prisma.order.count({ where: { ...where, status: 'CONFIRMED' } }),
      this.prisma.order.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    return {
      totalOrders,
      totalAmount: Number(totalAmountResult._sum.totalAmount || 0),
      openOrders,
      confirmedOrders,
      cancelledOrders,
    };
  }
}