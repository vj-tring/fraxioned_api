import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './main/commons/exceptions/filters/http-exception.filter';
import { seedRole } from './main/commons/seeds/roleSeed';
import { DataSource } from 'typeorm';
import { seedUser } from './main/commons/seeds/userSeed';
import { seedPropertyDetails } from './main/commons/seeds/propertDetailSeed';
import { seedProperties } from './main/commons/seeds/propertySeed';
import { seedUserPropertyDetails } from './main/commons/seeds/userPropertyDetailsSeed';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);
  await seedRole(dataSource);
  await seedUser(dataSource);
  await seedProperties(dataSource);
  await seedPropertyDetails(dataSource);
  await seedUserPropertyDetails(dataSource);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  setupSwagger(app, globalPrefix);

  app.enableCors();

  await app.listen(process.env.PORT || 3008);
  console.log(
    `Application is running on: ${(await app.getUrl()).replace('[::1]', 'localhost')}/api`,
  );
}

bootstrap();
