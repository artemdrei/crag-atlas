import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

// Unset means any origin, which local development and the e2e suite need.
// Leaving it unset in production opens the API to any site.
const allowedOrigins = process.env.WEB_ORIGIN?.split(',').map((origin) =>
  origin.trim()
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(allowedOrigins ? { origin: allowedOrigins } : undefined);
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
