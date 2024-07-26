import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedRole } from './commons/seeds/roleSeed';
import { setupSwagger } from './swagger/swagger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Seeder
  // 1. To add the default role records(Admin & User) of Role details
  const dataSource = app.get(DataSource);
  await seedRole(dataSource);

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
