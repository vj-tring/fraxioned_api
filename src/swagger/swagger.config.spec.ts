import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { setupSwagger } from './swagger.config';

describe('Swagger', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({}).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('setupSwagger', () => {
    it('should setup swagger correctly', () => {
      const options = new DocumentBuilder()
        .setTitle('Fraxioned')
        .setDescription('Welcome to Fraxioned')
        .setVersion('1.0')
        .addTag('Fraxioned')
        .addBearerAuth()
        .build();

      const setupSpy = jest.spyOn(SwaggerModule, 'setup');

      setupSwagger(app);

      expect(setupSpy).toHaveBeenCalledWith(
        'api',
        app,
        SwaggerModule.createDocument(app, options),
      );
    });
  });
});
