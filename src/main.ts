import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './main/commons/exceptions/filters/http-exception.filter';
import { seedRole } from './main/commons/seeds/roleSeed';
import { DataSource } from 'typeorm';
import { seedUser } from './main/commons/seeds/userSeed';
import { seedProperties } from './main/commons/seeds/propertySeed';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Seeder
  const dataSource = app.get(DataSource);
  await seedRole(dataSource);
  await seedUser(dataSource);
  await seedProperties(dataSource);

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Exception Filters
  app.useGlobalFilters(new GlobalExceptionFilter());
  // Set global prefix for API endpoints
  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);

  // Swagger configuration
  setupSwagger(app);

  // Enable CORS
  app.enableCors();

  await app.listen(3008);
  console.log(
    `Application is running on: ${(await app.getUrl()).replace('[::1]', 'localhost')}/api`,
  );
}

bootstrap();
