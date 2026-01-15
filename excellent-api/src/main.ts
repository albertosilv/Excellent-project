import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Versionamento da API
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Pipes globais
  app.useGlobalPipes(new ValidationPipe());

  // Filters globais
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  app.enableCors({
    origin: 'http://localhost:3001', // ← Especifica o frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Accept',
  });
  // SWAGGER CONFIGURAÇÃO
  const config = new DocumentBuilder()
    .setTitle('Excellent API')
    .setDescription('API completa para sistema de pedidos com autenticação JWT')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Este nome deve corresponder ao usado no @ApiBearerAuth()
    )
    .addTag('auth', 'Autenticação e autorização')
    .addTag('users', 'Gestão de usuários/clientes')
    .addTag('products', 'Gestão de produtos')
    .addTag('orders', 'Gestão de pedidos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Excellent API Documentation',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Documentation: http://localhost:${port}/api/v1/docs`);
  console.log(`🔐 JWT Authentication enabled`);
  console.log(`📊 Available endpoints:`);
  console.log(`   POST   /api/v1/auth/register`);
  console.log(`   POST   /api/v1/auth/login`);
  console.log(`   GET    /api/v1/users`);
  console.log(`   GET    /api/v1/products`);
  console.log(`   POST   /api/v1/orders`);
}
bootstrap();