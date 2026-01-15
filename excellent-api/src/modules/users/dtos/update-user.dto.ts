import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString({ message: 'Razão Social deve ser uma string' })
  @MinLength(3, { message: 'Razão Social deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'Razão Social não pode exceder 200 caracteres' })
  corporateName?: string;

  @IsOptional()
  @IsString({ message: 'CNPJ deve ser uma string' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato 00.000.000/0000-00',
  })
  cnpj?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password?: string;
}