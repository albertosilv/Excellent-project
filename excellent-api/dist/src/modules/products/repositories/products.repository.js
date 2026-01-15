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
exports.ProductsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ProductsRepository = class ProductsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto) {
        const { images, ...productData } = createProductDto;
        return this.prisma.product.create({
            data: {
                ...productData,
                salePrice: productData.salePrice,
                images: images && images.length > 0 ? {
                    create: images.map(url => ({ url }))
                } : undefined,
            },
            include: {
                images: true,
            },
        });
    }
    async findAll(params) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                description: { contains: search },
            }
            : {};
        const [total, products] = await Promise.all([
            this.prisma.product.count({ where }),
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    images: true,
                },
            }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: products,
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
        return this.prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                orderItems: {
                    include: {
                        order: true,
                    },
                },
            },
        });
    }
    async update(id, updateProductDto) {
        const { images, ...productData } = updateProductDto;
        if (images) {
            await this.prisma.productImage.deleteMany({
                where: { productId: id },
            });
        }
        return this.prisma.product.update({
            where: { id },
            data: {
                ...productData,
                salePrice: productData.salePrice,
                images: images && images.length > 0 ? {
                    create: images.map(url => ({ url }))
                } : undefined,
            },
            include: {
                images: true,
            },
        });
    }
    async remove(id) {
        return this.prisma.product.delete({
            where: { id },
        });
    }
    async updateStock(id, quantity) {
        return this.prisma.product.update({
            where: { id },
            data: {
                stock: {
                    decrement: quantity,
                },
            },
        });
    }
    async restoreStock(id, quantity) {
        return this.prisma.product.update({
            where: { id },
            data: {
                stock: {
                    increment: quantity,
                },
            },
        });
    }
    async checkStockAvailability(id, requestedQuantity) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            select: { stock: true },
        });
        return product ? product.stock >= requestedQuantity : false;
    }
    async addImage(productId, url) {
        return this.prisma.productImage.create({
            data: {
                productId,
                url,
            },
        });
    }
    async removeImage(imageId) {
        return this.prisma.productImage.delete({
            where: { id: imageId },
        });
    }
};
exports.ProductsRepository = ProductsRepository;
exports.ProductsRepository = ProductsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsRepository);
//# sourceMappingURL=products.repository.js.map