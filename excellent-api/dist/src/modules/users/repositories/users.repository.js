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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let UsersRepository = class UsersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        return this.prisma.user.create({
            data: createUserDto,
        });
    }
    async findAll(params) {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = params;
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { corporateName: { contains: search } },
                    { cnpj: { contains: search } },
                    { email: { contains: search } },
                ],
            }
            : {};
        const [total, users] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                select: {
                    id: true,
                    corporateName: true,
                    cnpj: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: users,
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
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                corporateName: true,
                cnpj: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        return user;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
    async findByCnpj(cnpj) {
        const user = await this.prisma.user.findUnique({
            where: { cnpj },
            select: {
                id: true,
                corporateName: true,
                cnpj: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async update(id, updateUserDto) {
        const user = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
            select: {
                id: true,
                corporateName: true,
                cnpj: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async remove(id) {
        const user = await this.prisma.user.delete({
            where: { id },
            select: {
                id: true,
                corporateName: true,
                cnpj: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async updatePassword(id, password) {
        await this.prisma.user.update({
            where: { id },
            data: { password },
        });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map