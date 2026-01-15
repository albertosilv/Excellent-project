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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pt_BR_1 = require("@faker-js/faker/locale/pt_BR");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');
    console.log('🧹 Limpando dados existentes...');
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    console.log('👥 Criando usuários...');
    const defaultPassword = 'senha123';
    const hashedPasswordDefault = await bcrypt.hash(defaultPassword, 10);
    const adminUser = await prisma.user.create({
        data: {
            corporateName: 'Empresa Admin LTDA',
            cnpj: '00.000.000/0001-91',
            email: 'admin@excellent.com',
            password: await bcrypt.hash('admin123', 10),
            role: client_1.UserRole.ADMIN,
        },
    });
    const regularUser = await prisma.user.create({
        data: {
            corporateName: 'Empresa Teste LTDA',
            cnpj: '00.000.000/0001-92',
            email: 'user@excellent.com',
            password: await bcrypt.hash('user123', 10),
            role: client_1.UserRole.USER,
        },
    });
    console.log('👤 Criando usuários adicionais...');
    const additionalUsers = [];
    const totalUsers = 15;
    for (let i = 0; i < totalUsers - 2; i++) {
        const user = await prisma.user.create({
            data: {
                corporateName: pt_BR_1.faker.company.name(),
                cnpj: pt_BR_1.faker.string.numeric(14).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'),
                email: pt_BR_1.faker.internet.email().toLowerCase(),
                password: hashedPasswordDefault,
                role: pt_BR_1.faker.helpers.arrayElement([client_1.UserRole.USER, client_1.UserRole.ADMIN]),
            },
        });
        additionalUsers.push(user);
        console.log(`✅ Usuário ${i + 1}/${totalUsers - 2}: ${user.email} - ${user.role}`);
    }
    console.log('📦 Criando produtos...');
    const productCategories = [
        'Notebook', 'Smartphone', 'Monitor', 'Teclado', 'Mouse',
        'Mesa', 'Cadeira', 'Armário', 'Estante', 'Gaveteiro',
        'Papel A4', 'Caneta', 'Clips', 'Grampeador', 'Calculadora',
        'Detergente', 'Sabão', 'Desinfetante', 'Papel Toalha', 'Luvas',
        'Café', 'Açúcar', 'Biscoito', 'Chá', 'Leite',
        'Refrigerante', 'Suco', 'Água', 'Energético', 'Cerveja',
        'Camiseta', 'Calça', 'Jaqueta', 'Tênis', 'Boné',
        'Martelo', 'Chave de Fenda', 'Alicate', 'Furadeira', 'Serra',
        'Caderno', 'Lápis', 'Borracha', 'Apontador', 'Régua'
    ];
    const products = [];
    const totalProducts = 100;
    for (let i = 0; i < totalProducts; i++) {
        const category = pt_BR_1.faker.helpers.arrayElement(productCategories);
        const adjective = pt_BR_1.faker.commerce.productAdjective();
        const description = `${category} ${adjective}`;
        const salePrice = parseFloat(pt_BR_1.faker.commerce.price({ min: 5, max: 5000, dec: 2 }));
        const stock = pt_BR_1.faker.number.int({ min: 0, max: 1000 });
        const product = await prisma.product.create({
            data: {
                description,
                salePrice,
                stock,
                images: {
                    create: Array.from({
                        length: pt_BR_1.faker.number.int({ min: 1, max: 4 })
                    }).map(() => ({
                        url: pt_BR_1.faker.image.urlLoremFlickr({
                            category: 'product',
                            width: 640,
                            height: 480
                        })
                    })),
                },
            },
        });
        products.push(product);
        if ((i + 1) % 10 === 0) {
            console.log(`✅ Produtos ${i + 1}/${totalProducts} criados...`);
        }
    }
    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('📊 Resumo:');
    console.log(`👥 Total de Usuários: ${totalUsers}`);
    console.log(`📦 Total de Produtos: ${products.length}`);
    console.log(`🖼️  Total de Imagens: ${products.reduce((acc, p) => acc + p.images?.length || 0, 0)}`);
    console.log('\n🔑 Credenciais para teste:');
    console.log('========================================');
    console.log('ADMIN:');
    console.log('  Email: admin@excellent.com');
    console.log('  Senha: admin123');
    console.log('  CNPJ: 00.000.000/0001-91');
    console.log('\nUSUÁRIO COMUM:');
    console.log('  Email: user@excellent.com');
    console.log('  Senha: user123');
    console.log('  CNPJ: 00.000.000/0001-92');
    console.log('\nOUTROS USUÁRIOS:');
    console.log('  Email: email gerado');
    console.log('  Senha: senha123 (para todos)');
    console.log('========================================\n');
    console.log('🚀 Banco de dados pronto para uso!');
}
main()
    .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map