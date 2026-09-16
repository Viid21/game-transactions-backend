import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  validateEnvironment();
  const app = await NestFactory.create(AppModule);
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

  const authProvider = process.env.AUTH_PROVIDER ?? 'fake';
  const paymentProvider = process.env.PAYMENT_PROVIDER ?? 'fake';
  if (!['fake', 'steam'].includes(authProvider)) throw new Error('AUTH_PROVIDER must be fake or steam');
  if (!['fake', 'steam'].includes(paymentProvider)) throw new Error('PAYMENT_PROVIDER must be fake or steam');

  if (authProvider === 'steam') requireEnvironment('STEAM_APP_ID', 'STEAM_AUTH_KEY', 'STEAM_AUTH_IDENTITY');
  if (paymentProvider === 'steam') requireEnvironment('STEAM_APP_ID', 'STEAM_MICROTXN_KEY');
}

function requireEnvironment(...names: string[]) {
  for (const name of names) {
    if (!process.env[name]) throw new Error(`${name} is required for Steam integration`);
  }
}
