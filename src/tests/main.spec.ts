import { NestFactory } from '@nestjs/core';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppModule } from 'src/app.module';
import { GlobalExceptionFilter } from 'src/main/commons/exceptions/filters/http-exception.filter';
import { seedRole } from 'src/main/commons/seeds/roleSeed';
import { seedUser } from 'src/main/commons/seeds/userSeed';
import { setupSwagger } from 'src/swagger/swagger.config';
import { INestApplication } from '@nestjs/common';
import { seedProperties } from 'src/main/commons/seeds/propertySeed';
import { seedPropertyDetails } from 'src/main/commons/seeds/propertDetailSeed';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('src/swagger/swagger.config', () => ({
  setupSwagger: jest.fn(),
}));

jest.mock('src/main/commons/seeds/roleSeed', () => ({
  seedRole: jest.fn(),
}));

jest.mock('src/main/commons/seeds/userSeed', () => ({
  seedUser: jest.fn(),
}));

jest.mock('src/main/commons/seeds/propertySeed', () => ({
  seedProperties: jest.fn(),
}));

jest.mock('src/main/commons/seeds/propertDetailSeed', () => ({
  seedPropertyDetails: jest.fn(),
}));

jest.mock('typeorm', () => {
  const actualTypeorm = jest.requireActual('typeorm');
  return {
    ...actualTypeorm,
    DataSource: jest.fn().mockImplementation(() => ({
      getRepository: jest.fn(),
      initialize: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('Bootstrap', () => {
  let app: INestApplication;
  let mockDataSource: DataSource;

  beforeEach(async () => {
    app = {
      useGlobalPipes: jest.fn(),
      useGlobalFilters: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockResolvedValue('http://localhost:3008/api'),
      get: jest.fn().mockImplementation((token) => {
        if (token === DataSource) {
          return mockDataSource;
        }
      }),
    } as unknown as INestApplication;

    jest.spyOn(NestFactory, 'create').mockResolvedValue(app);

    const options: DataSourceOptions = {
      type: 'sqlite',
      database: ':memory:',
    };
    mockDataSource = new DataSource(options);
  });

  it('should bootstrap the application', async () => {
    const { bootstrap } = await import('src/main');
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(app.useGlobalFilters).toHaveBeenCalledWith(
      new GlobalExceptionFilter(),
    );
    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(setupSwagger).toHaveBeenCalledWith(app, 'api');
    expect(app.enableCors).toHaveBeenCalled();
    expect(app.listen).toHaveBeenCalledWith(3008);
    expect(seedRole).toHaveBeenCalledWith(mockDataSource);
    expect(seedUser).toHaveBeenCalledWith(mockDataSource);
    expect(seedProperties).toHaveBeenCalledWith(mockDataSource);
    expect(seedPropertyDetails).toHaveBeenCalledWith(mockDataSource);

    const url = await app.getUrl();
    expect(url.replace('[::1]', 'localhost')).toBe('http://localhost:3008/api');
  });
});
