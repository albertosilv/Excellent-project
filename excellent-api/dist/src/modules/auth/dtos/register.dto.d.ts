import { UserRole } from '@prisma/client/index-browser';
export declare class RegisterDto {
    corporateName: string;
    cnpj: string;
    email: string;
    password: string;
    role?: UserRole;
}
