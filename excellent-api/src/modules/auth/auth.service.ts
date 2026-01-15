import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { UsersRepository } from '../users/repositories/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,  
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const existingCnpj = await this.prisma.user.findUnique({  
      where: { cnpj: registerDto.cnpj },
    });
    if (existingCnpj) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar usuário
    const user = await this.prisma.user.create({  // ← Corrigido
      data: {
        corporateName: registerDto.corporateName,
        cnpj: registerDto.cnpj,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role || 'USER',
      },
    });

    // Gerar token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        corporateName: user.corporateName,
        cnpj: user.cnpj,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log(user)

    // Verificar senha
    const passwordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        corporateName: user.corporateName,
        cnpj: user.cnpj,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '24h',
    });
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({  // ← Corrigido
      where: { id: userId },
      select: {
        id: true,
        email: true,
        corporateName: true,
        cnpj: true,
        role: true,
      },
    });
  }
}