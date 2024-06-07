import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalFilters(new AllExceptionsFilter());

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
