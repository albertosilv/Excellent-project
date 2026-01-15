import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { PaginationParams, PaginatedResponse } from '../../common/interfaces/pagination.interface';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(params: PaginationParams): Promise<PaginatedResponse<UserResponseDto>>;
    findOne(id: string): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: string): Promise<void>;
    getCnpjInfo(cnpj: string): Promise<{
        corporateName: string;
        email: string;
    }>;
    findByEmailWithPassword(email: string): Promise<{
        id: string;
        corporateName: string;
        cnpj: string;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    private mapToResponseDto;
}
