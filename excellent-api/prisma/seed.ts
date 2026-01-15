// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/pt_BR';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (na ordem correta devido às relações)
  console.log('🧹 Limpando dados existentes...');
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  console.log('👥 Criando usuários...');
  
  // Senha padrão para usuários gerados
  const defaultPassword = 'senha123';
  const hashedPasswordDefault = await bcrypt.hash(defaultPassword, 10);
  
  // Usuário ADMIN
  const adminUser = await prisma.user.create({
    data: {
      corporateName: 'Empresa Admin LTDA',
      cnpj: '00.000.000/0001-91',
      email: 'admin@excellent.com',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
    },
  });

  // Usuário comum
  const regularUser = await prisma.user.create({
    data: {
      corporateName: 'Empresa Teste LTDA',
      cnpj: '00.000.000/0001-92',
      email: 'user@excellent.com',
      password: await bcrypt.hash('user123', 10),
      role: UserRole.USER,
    },
  });

  // Criar mais usuários de exemplo
  console.log('👤 Criando usuários adicionais...');
  const additionalUsers:any = [];
  const totalUsers = 15; // Total de usuários incluindo admin e regular
  
  for (let i = 0; i < totalUsers - 2; i++) {
    const user = await prisma.user.create({
      data: {
        corporateName: faker.company.name(),
        cnpj: faker.string.numeric(14).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'),
        email: faker.internet.email().toLowerCase(),
        password: hashedPasswordDefault,
        role: faker.helpers.arrayElement([UserRole.USER, UserRole.ADMIN]),
      },
    });
    additionalUsers.push(user);
    
    console.log(`✅ Usuário ${i + 1}/${totalUsers - 2}: ${user.email} - ${user.role}`);
  }

  console.log('📦 Criando produtos...');
  
  // Categorias fictícias para descrição
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

  const products:any = [];
  const totalProducts = 100;
  
  for (let i = 0; i < totalProducts; i++) {
    const category = faker.helpers.arrayElement(productCategories);
    const adjective = faker.commerce.productAdjective();
    const description = `${category} ${adjective}`;
    
    // Preço de venda entre 5 e 5000
    const salePrice = parseFloat(faker.commerce.price({ min: 5, max: 5000, dec: 2 }));
    
    // Estoque entre 0 e 1000
    const stock = faker.number.int({ min: 0, max: 1000 });
    
    const product = await prisma.product.create({
      data: {
        description,
        salePrice,
        stock,
        images: {
          create: Array.from({ 
            length: faker.number.int({ min: 1, max: 4 }) 
          }).map(() => ({
            url: faker.image.urlLoremFlickr({
              category: 'product',
              width: 640,
              height: 480
            })
          })),
        },
      },
    });
    
    products.push(product);
    
    // Log a cada 10 produtos criados
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