"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const index_browser_1 = require("@prisma/client/index-browser");
class RegisterDto {
    corporateName;
    cnpj;
    email;
    password;
    role = 'USER';
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Razão Social é obrigatória' }),
    (0, class_validator_1.IsString)({ message: 'Razão Social deve ser uma string' }),
    (0, class_validator_1.Length)(3, 200, { message: 'Razão Social deve ter entre 3 e 200 caracteres' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "corporateName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'CNPJ é obrigatório' }),
    (0, class_validator_1.IsString)({ message: 'CNPJ deve ser uma string' }),
    (0, class_validator_1.Matches)(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
        message: 'CNPJ deve estar no formato 00.000.000/0000-00',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "cnpj", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'E-mail é obrigatório' }),
    (0, class_validator_1.IsEmail)({}, { message: 'E-mail inválido' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Senha é obrigatória' }),
    (0, class_validator_1.IsString)({ message: 'Senha deve ser uma string' }),
    (0, class_validator_1.MinLength)(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
//# sourceMappingURL=register.dto.js.map