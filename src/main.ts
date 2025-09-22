/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { json, text } from 'express';
import helmet from 'helmet';
import pino from 'pino-http';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Safer defaults without blocking typical requests
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'same-origin' },
    }),
  );

  // Accept both JSON and text/plain (DHIS2 sometimes sends text/plain)
  app.use(text({ type: ['text/plain', 'text/*'] }));
  app.use(
    json({
      limit: '2mb',
      type: (req) =>
        /application\/json|text\/plain/i.test(
          req.headers['content-type'] || '',
        ),
    }),
  );

  // Structured logs
  app.use(pino() as any);

  // Global error filter (your implementation)
  app.useGlobalFilters(new HttpExceptionFilter());

  // Simple health endpoint for Docker healthcheck
  app
    .getHttpAdapter()
    .getInstance()
    .get('/health', (_req, res) => res.status(200).send({ ok: true }));

  // IMPORTANT: bind on all interfaces inside container
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
