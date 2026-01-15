"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.enableCors({
        origin: 'http://localhost:3001',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, Accept',
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Excellent API')
        .setDescription('API completa para sistema de pedidos com autenticação JWT')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('auth', 'Autenticação e autorização')
        .addTag('users', 'Gestão de usuários/clientes')
        .addTag('products', 'Gestão de produtos')
        .addTag('orders', 'Gestão de pedidos')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/v1/docs', app, document, {
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
//# sourceMappingURL=main.js.map