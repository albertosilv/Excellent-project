import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, Length, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client/index-browser';

export class RegisterDto {
  @IsNotEmpty({ message: 'Razão Social é obrigatória' })
  @IsString({ message: 'Razão Social deve ser uma string' })
  @Length(3, 200, { message: 'Razão Social deve ter entre 3 e 200 caracteres' })
  corporateName: string;

  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato 00.000.000/0000-00',
  })
  cnpj: string;

  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  role?: UserRole = 'USER';
}