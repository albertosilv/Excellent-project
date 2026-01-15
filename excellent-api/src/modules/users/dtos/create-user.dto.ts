import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client/index-browser';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Razão Social é obrigatória' })
  @IsString({ message: 'Razão Social deve ser uma string' })
  @MinLength(3, { message: 'Razão Social deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Razão Social não pode exceder 200 caracteres' })
  corporateName: string;

  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato 00.000.000/0000-00',
  })
  cnpj: string;

  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role deve ser ADMIN ou USER' })
  role?: UserRole = 'USER';
}