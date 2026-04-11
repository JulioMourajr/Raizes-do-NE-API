import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './api/middlewares/httpException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       
      forbidNonWhitelisted: true, 
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Raízes do Nordeste — API')
    .setDescription('API REST da rede de lanchonetes Raízes do Nordeste')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Aplicação rodando em: http://localhost:${port}`);
  console.log(`Swagger disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();