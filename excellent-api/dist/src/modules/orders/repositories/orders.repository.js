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
exports.OrdersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let OrdersRepository = class OrdersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOrderDto) {
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
        for (const item of createOrderDto.items) {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                throw new common_1.BadRequestException(`Produto ${item.productId} não encontrado`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Estoque insuficiente para ${product.description}. Disponível: ${product.stock}, Solicitado: ${item.quantity}`);
            }
        }
        const orderItems = createOrderDto.items.map(item => {
            const product = products.find(p => p.id === item.productId);
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
        return this.prisma.$transaction(async (tx) => {
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
    async findAll(params) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', userId, status } = params;
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOne(id) {
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
    async update(id, updateOrderDto) {
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
    async remove(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });
        if (!order) {
            throw new common_1.BadRequestException('Pedido não encontrado');
        }
        return this.prisma.$transaction(async (tx) => {
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
    async findByUserId(userId, params) {
        return this.findAll({ ...params, userId });
    }
    async updateStatus(id, status) {
        return this.prisma.order.update({
            where: { id },
            data: { status },
        });
    }
    async getOrderSummary(userId) {
        const where = userId ? { userId } : {};
        const [totalOrders, totalAmountResult, openOrders, confirmedOrders, cancelledOrders,] = await Promise.all([
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
};
exports.OrdersRepository = OrdersRepository;
exports.OrdersRepository = OrdersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersRepository);
//# sourceMappingURL=orders.repository.js.map