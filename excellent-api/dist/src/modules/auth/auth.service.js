"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const users_repository_1 = require("../users/repositories/users.repository");
let AuthService = class AuthService {
    prisma;
    jwtService;
    usersRepository;
    constructor(prisma, jwtService, usersRepository) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.usersRepository = usersRepository;
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const existingCnpj = await this.prisma.user.findUnique({
            where: { cnpj: registerDto.cnpj },
        });
        if (existingCnpj) {
            throw new common_1.ConflictException('CNPJ já cadastrado');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                corporateName: registerDto.corporateName,
                cnpj: registerDto.cnpj,
                email: registerDto.email,
                password: hashedPassword,
                role: registerDto.role || 'USER',
            },
        });
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
    async login(loginDto) {
        const user = await this.usersRepository.findByEmail(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        console.log(user);
        const passwordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
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
    generateToken(user) {
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
    async validateUser(userId) {
        return this.prisma.user.findUnique({
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        users_repository_1.UsersRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map