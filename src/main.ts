import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import expressListRoutes from 'express-list-routes';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // set up helmet protection
  app.use(helmet());

  // set up validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Swagger OpenAPI doc generator
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TF API')
    .setDescription('Thaíza Francischini Shoes Store platform API webservice')
    .setVersion('1.0')
    .addTag('tf-api')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // inject logger service
  const logger = app.get(ConsoleLogger);
  logger.setContext('Bootstrap');

  // run the app
  const config: ConfigService = app.get(ConfigService);
  const port = config.get('PORT') || 3000;
  await app.listen(port);
  logger.log(`Listening on port ${port}`);

  // list available routes
  logger.log('Available Routes');
  expressListRoutes(app.getHttpAdapter().getInstance());
}
bootstrap();
