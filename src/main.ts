import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.config';
import { seedRole } from './commons/seeds/roleSeeder';
import { seedUser } from './commons/seeds/userSeeder';
import { DataSource } from 'typeorm';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './commons/exceptions/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Seeder
  const dataSource = app.get(DataSource);
  await seedRole(dataSource);
  await seedUser(dataSource);

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

  // Swagger configuration
  setupSwagger(app);

  // Enabled the CORS
  app.enableCors();

  await app.listen(3008);
  console.log(
    `Application is running on: ${(await app.getUrl()).replace('[::1]', 'localhost')}/api`,
  );
}

bootstrap();
