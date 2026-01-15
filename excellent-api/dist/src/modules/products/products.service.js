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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const products_repository_1 = require("./repositories/products.repository");
let ProductsService = class ProductsService {
    productsRepository;
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    async create(createProductDto, userRole) {
        if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Apenas administradores podem criar produtos');
        }
        if (createProductDto.salePrice <= 0) {
            throw new common_1.BadRequestException('Valor de venda deve ser maior que zero');
        }
        if (createProductDto.stock < 0) {
            throw new common_1.BadRequestException('Estoque não pode ser negativo');
        }
        const product = await this.productsRepository.create(createProductDto);
        return this.mapToResponseDto(product);
    }
    async findAll(params, userRole) {
        const where = userRole === 'USER' ? { stock: { gt: 0 } } : {};
        const result = await this.productsRepository.findAll({
            ...params,
            ...(userRole === 'USER' && { where }),
        });
        return {
            data: result.data.map(product => this.mapToResponseDto(product)),
            meta: result.meta,
        };
    }
    async findOne(id, userRole) {
        const product = await this.productsRepository.findOne(id);
        if (!product) {
            throw new common_1.NotFoundException(`Produto com ID ${id} não encontrado`);
        }
        if (userRole === 'USER' && product.stock <= 0) {
            throw new common_1.ForbiddenException('Produto não disponível');
        }
        return this.mapToResponseDto(product);
    }
    async update(id, updateProductDto, userRole) {
        if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Apenas administradores podem atualizar produtos');
        }
        const existingProduct = await this.productsRepository.findOne(id);
        if (!existingProduct) {
            throw new common_1.NotFoundException(`Produto com ID ${id} não encontrado`);
        }
        if (updateProductDto.salePrice !== undefined && updateProductDto.salePrice <= 0) {
            throw new common_1.BadRequestException('Valor de venda deve ser maior que zero');
        }
        if (updateProductDto.stock !== undefined && updateProductDto.stock < 0) {
            throw new common_1.BadRequestException('Estoque não pode ser negativo');
        }
        const updatedProduct = await this.productsRepository.update(id, updateProductDto);
        return this.mapToResponseDto(updatedProduct);
    }
    async remove(id, userRole) {
        if (userRole !== 'ADMIN') {
            throw new common_1.ForbiddenException('Apenas administradores podem remover produtos');
        }
        const existingProduct = await this.productsRepository.findOne(id);
        if (!existingProduct) {
            throw new common_1.NotFoundException(`Produto com ID ${id} não encontrado`);
        }
        await this.productsRepository.remove(id);
    }
    async checkStock(id, quantity) {
        return this.productsRepository.checkStockAvailability(id, quantity);
    }
    async updateStock(id, quantity) {
        const product = await this.productsRepository.findOne(id);
        if (!product) {
            throw new common_1.NotFoundException(`Produto com ID ${id} não encontrado`);
        }
        const newStock = product.stock - quantity;
        if (newStock < 0) {
            throw new common_1.BadRequestException('Estoque insuficiente');
        }
        await this.productsRepository.updateStock(id, quantity);
    }
    async restoreStock(id, quantity) {
        const product = await this.productsRepository.findOne(id);
        if (!product) {
            throw new common_1.NotFoundException(`Produto com ID ${id} não encontrado`);
        }
        await this.productsRepository.restoreStock(id, quantity);
    }
    mapToResponseDto(product) {
        return {
            id: product.id,
            description: product.description,
            salePrice: Number(product.salePrice),
            stock: product.stock,
            images: product.images?.map((image) => ({
                id: image.id,
                url: image.url,
                createdAt: image.createdAt,
            })),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_repository_1.ProductsRepository])
], ProductsService);
//# sourceMappingURL=products.service.js.map