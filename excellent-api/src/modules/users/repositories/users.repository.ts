import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { PaginationParams, PaginatedResponse } from '../../../common/interfaces/pagination.interface';

// Criamos um tipo User sem password para as respostas
type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(params: PaginationParams): Promise<PaginatedResponse<UserWithoutPassword>> {
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
          // NÃO inclui password
        },
      }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: users as UserWithoutPassword[],
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

  async findOne(id: string): Promise<UserWithoutPassword | null> {
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
        // NÃO inclui password
      },
    });
    
    return user as UserWithoutPassword | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // ESTE precisa do password para autenticação
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByCnpj(cnpj: string): Promise<UserWithoutPassword | null> {
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
        // NÃO inclui password
      },
    });
    
    return user as UserWithoutPassword | null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword> {
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
        // NÃO inclui password
      },
    });
    
    return user as UserWithoutPassword;
  }

  async remove(id: string): Promise<UserWithoutPassword> {
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
        // NÃO inclui password
      },
    });
    
    return user as UserWithoutPassword;
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password },
    });
  }
}