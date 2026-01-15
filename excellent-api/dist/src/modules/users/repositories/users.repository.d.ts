import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { PaginationParams, PaginatedResponse } from '../../../common/interfaces/pagination.interface';
type UserWithoutPassword = Omit<User, 'password'>;
export declare class UsersRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(params: PaginationParams): Promise<PaginatedResponse<UserWithoutPassword>>;
    findOne(id: string): Promise<UserWithoutPassword | null>;
    findByEmail(email: string): Promise<User | null>;
    findByCnpj(cnpj: string): Promise<UserWithoutPassword | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserWithoutPassword>;
    remove(id: string): Promise<UserWithoutPassword>;
    updatePassword(id: string, password: string): Promise<void>;
}
export {};
