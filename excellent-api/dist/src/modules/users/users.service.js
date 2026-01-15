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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const axios_1 = __importDefault(require("axios"));
const users_repository_1 = require("./repositories/users.repository");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto) {
        const existingCnpj = await this.usersRepository.findByCnpj(createUserDto.cnpj);
        if (existingCnpj) {
            throw new common_1.ConflictException('CNPJ já cadastrado');
        }
        const existingEmail = await this.usersRepository.findByEmail(createUserDto.email);
        if (existingEmail) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const userData = {
            ...createUserDto,
            password: hashedPassword,
        };
        const user = await this.usersRepository.create(userData);
        return this.mapToResponseDto(user);
    }
    async findAll(params) {
        const result = await this.usersRepository.findAll(params);
        return {
            data: result.data.map(user => this.mapToResponseDto(user)),
            meta: result.meta,
        };
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne(id);
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
        return this.mapToResponseDto(user);
    }
    async update(id, updateUserDto) {
        const existingUser = await this.usersRepository.findOne(id);
        if (!existingUser) {
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
        if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
            const userWithEmail = await this.usersRepository.findByEmail(updateUserDto.email);
            if (userWithEmail) {
                throw new common_1.ConflictException('Email já está em uso');
            }
        }
        if (updateUserDto.cnpj && updateUserDto.cnpj !== existingUser.cnpj) {
            const userWithCnpj = await this.usersRepository.findByCnpj(updateUserDto.cnpj);
            if (userWithCnpj) {
                throw new common_1.ConflictException('CNPJ já está em uso');
            }
        }
        let updateData = { ...updateUserDto };
        if (updateUserDto.password) {
            updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.usersRepository.update(id, updateData);
        return this.mapToResponseDto(updatedUser);
    }
    async remove(id) {
        const existingUser = await this.usersRepository.findOne(id);
        if (!existingUser) {
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado`);
        }
        await this.usersRepository.remove(id);
    }
    async getCnpjInfo(cnpj) {
        try {
            const cleanCnpj = cnpj.replace(/\D/g, '');
            if (cleanCnpj.length !== 14) {
                throw new common_1.BadRequestException('CNPJ deve ter 14 dígitos');
            }
            const response = await axios_1.default.get(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ExcellentApp/1.0',
                },
            });
            const data = response.data;
            let email = '';
            if (data.email) {
                email = data.email;
            }
            else if (data.estabelecimento?.email) {
                email = data.estabelecimento.email;
            }
            return {
                corporateName: data.razao_social,
                email: email || '',
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    throw new common_1.NotFoundException('CNPJ não encontrado na base de dados');
                }
                if (error.code === 'ECONNABORTED') {
                    throw new common_1.BadRequestException('Tempo limite excedido ao consultar CNPJ');
                }
            }
            throw new common_1.BadRequestException('Erro ao consultar CNPJ. Tente novamente.');
        }
    }
    async findByEmailWithPassword(email) {
        return this.usersRepository.findByEmail(email);
    }
    mapToResponseDto(user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository])
], UsersService);
//# sourceMappingURL=users.service.js.map