import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedRole } from './commons/seeds/roleSeed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);
  await seedRole(dataSource);

  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Fraxioned API')
    .setDescription('The Fraxioned API description')
    .setVersion('1.0')
    .addTag('Fraxioned')
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(3001);
}

bootstrap();
