import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.config';
import { seedRole } from './main/commons/seeds/roleSeed';
import { DataSource } from 'typeorm';
import { seedUser } from './main/commons/seeds/userSeed';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  setupSwagger(app);

  const dataSource = app.get(DataSource);
  await seedRole(dataSource);
  await seedUser(dataSource);

  // Enabled the CORS
  app.enableCors();

  await app.listen(3008);
  console.log(
    `Application is running on: ${(await app.getUrl()).replace('[::1]', 'localhost')}/api`,
  );
}

bootstrap();
