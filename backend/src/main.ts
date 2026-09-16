import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module.js';

async function bootstrap() {
  validateEnvironment();
  const app = await NestFactory.create(AppModule);
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);
  if (corsOrigins.length > 0) {
    app.enableCors({
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      maxAge: 600,
    });
  }
  if (process.env.TRUST_PROXY === 'true') app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(rateLimit({
    windowMs: parsePositiveInteger('RATE_LIMIT_WINDOW_MS', 60_000),
    limit: parsePositiveInteger('RATE_LIMIT_MAX', 100),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: (request) => request.path === '/health',
  }));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

function validateEnvironment() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  for (const name of required) {
    if (!process.env[name]) throw new Error(`${name} is required`);
  }
  if (process.env.JWT_SECRET!.length < 32) throw new Error('JWT_SECRET must be at least 32 characters long');

  const authProvider = process.env.AUTH_PROVIDER ?? 'fake';
  const paymentProvider = process.env.PAYMENT_PROVIDER ?? 'fake';
  if (!['fake', 'steam'].includes(authProvider)) throw new Error('AUTH_PROVIDER must be fake or steam');
  if (!['fake', 'steam'].includes(paymentProvider)) throw new Error('PAYMENT_PROVIDER must be fake or steam');
  parseCorsOrigins(process.env.CORS_ORIGINS);
  parsePositiveInteger('RATE_LIMIT_WINDOW_MS', 60_000);
  parsePositiveInteger('RATE_LIMIT_MAX', 100);

  if (authProvider === 'steam') requireEnvironment('STEAM_APP_ID', 'STEAM_AUTH_KEY', 'STEAM_AUTH_IDENTITY');
  if (paymentProvider === 'steam') requireEnvironment('STEAM_APP_ID', 'STEAM_MICROTXN_KEY');
}

function requireEnvironment(...names: string[]) {
  for (const name of names) {
    if (!process.env[name]) throw new Error(`${name} is required for Steam integration`);
  }
}

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) return [];
  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (origins.includes('*')) throw new Error('CORS_ORIGINS must not contain *');
  for (const origin of origins) {
    try {
      new URL(origin);
    } catch {
      throw new Error('CORS_ORIGINS must contain comma-separated absolute URLs');
    }
  }
  return origins;
}

function parsePositiveInteger(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer`);
  return parsed;
}
