/*
 * Swagger Setup
 */

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const fs = require('fs');

export const setupSwagger = (app: INestApplication, globalPrefix: string): void => {
  const options = new DocumentBuilder()
    .setTitle('Fraxioned API')
    .setDescription('Welcome to Fraxioned')
    .setVersion('1.0')
    .addTag('Fraxioned')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
  SwaggerModule.setup(`${globalPrefix}`, app, document);
};
