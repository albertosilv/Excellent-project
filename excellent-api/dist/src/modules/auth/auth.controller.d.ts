import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
