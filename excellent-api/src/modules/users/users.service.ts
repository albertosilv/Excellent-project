import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { UsersRepository } from './repositories/users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { CnpjApiResponseDto } from './dtos/cnpj-api-response.dto';
import { PaginationParams, PaginatedResponse } from '../../common/interfaces/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar se CNPJ já existe
    const existingCnpj = await this.usersRepository.findByCnpj(createUserDto.cnpj);
    if (existingCnpj) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    // Verificar se email já existe
    const existingEmail = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const userData = {
      ...createUserDto,
      password: hashedPassword,
    };

    const user = await this.usersRepository.create(userData);
    return this.mapToResponseDto(user);
  }

  async findAll(params: PaginationParams): Promise<PaginatedResponse<UserResponseDto>> {
    const result = await this.usersRepository.findAll(params);
    
    return {
      data: result.data.map(user => this.mapToResponseDto(user)),
      meta: result.meta,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne(id);
    
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    
    return this.mapToResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    // Verificar se email está sendo alterado e se já existe
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.usersRepository.findByEmail(updateUserDto.email);
      if (userWithEmail) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Verificar se CNPJ está sendo alterado e se já existe
    if (updateUserDto.cnpj && updateUserDto.cnpj !== existingUser.cnpj) {
      const userWithCnpj = await this.usersRepository.findByCnpj(updateUserDto.cnpj);
      if (userWithCnpj) {
        throw new ConflictException('CNPJ já está em uso');
      }
    }

    // Se estiver atualizando a senha, fazer hash
    let updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.usersRepository.update(id, updateData);
    return this.mapToResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.usersRepository.remove(id);
  }

  async getCnpjInfo(cnpj: string): Promise<{ corporateName: string; email: string }> {
    try {
      // Remover caracteres não numéricos do CNPJ
      const cleanCnpj = cnpj.replace(/\D/g, '');
      
      if (cleanCnpj.length !== 14) {
        throw new BadRequestException('CNPJ deve ter 14 dígitos');
      }

      // Consultar API pública de CNPJ
      const response = await axios.get<CnpjApiResponseDto>(
        `https://publica.cnpj.ws/cnpj/${cleanCnpj}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'ExcellentApp/1.0',
          },
        }
      );

      const data = response.data;
      
      // Extrair email (pode estar em vários lugares na resposta)
      let email = '';
      if (data.email) {
        email = data.email;
      } else if (data.estabelecimento?.email) {
        email = data.estabelecimento.email;
      }

      return {
        corporateName: data.razao_social,
        email: email || '',
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NotFoundException('CNPJ não encontrado na base de dados');
        }
        if (error.code === 'ECONNABORTED') {
          throw new BadRequestException('Tempo limite excedido ao consultar CNPJ');
        }
      }
      throw new BadRequestException('Erro ao consultar CNPJ. Tente novamente.');
    }
  }

  async findByEmailWithPassword(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  private mapToResponseDto(user: any): UserResponseDto {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}