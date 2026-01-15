import { UserRole } from '@prisma/client/index-browser';
export declare class CreateUserDto {
    corporateName: string;
    cnpj: string;
    email: string;
    password: string;
    role?: UserRole;
}
