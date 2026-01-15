import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    findAll(page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<import("../../common/interfaces/pagination.interface").PaginatedResponse<UserResponseDto>>;
    findOne(id: string): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>;
    remove(id: string): Promise<void>;
    getCnpjInfo(cnpj: string): Promise<{
        corporateName: string;
        email: string;
    }>;
}
