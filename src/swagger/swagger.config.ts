/*
 * Swagger Setup
 */

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
var fs = require('fs');

export const setupSwagger = (app: INestApplication<any>) => {
  const options = new DocumentBuilder()
    .setTitle('Tandem Infrastructure')
    .setDescription('Welcome to Tandem Infrastructure')
    .setVersion('1.0')
    .addTag('Tandem')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document));
  SwaggerModule.setup('api', app, document);
};
