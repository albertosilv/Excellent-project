import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UsersRepository } from '../users/repositories/users.repository';
export declare class AuthService {
    private prisma;
    private jwtService;
    private usersRepository;
    constructor(prisma: PrismaService, jwtService: JwtService, usersRepository: UsersRepository);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            corporateName: string;
            cnpj: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            corporateName: string;
            cnpj: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
    private generateToken;
    validateUser(userId: string): Promise<{
        id: string;
        corporateName: string;
        cnpj: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
    } | null>;
}
