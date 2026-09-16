import 'reflect-metadata';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import request from 'supertest';

const execFileAsync = promisify(execFile);

describe('purchase flow (e2e)', () => {
  let container: StartedPostgreSqlContainer;
  let app: Awaited<ReturnType<typeof createApplication>>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('game_transactions')
      .withUsername('postgres')
      .withPassword('postgres')
      .start();

    process.env.DATABASE_URL = container.getConnectionUri();
    process.env.AUTH_PROVIDER = 'fake';
    process.env.PAYMENT_PROVIDER = 'fake';
    process.env.JWT_SECRET = 'e2e-test-secret';
    await execFileAsync(process.execPath, ['node_modules/prisma/dist/prisma.js', 'db', 'init', '--db', process.env.DATABASE_URL], {
      cwd: process.cwd(),
    });

    app = await createApplication();
    const { PrismaService } = await import('../src/prisma/prisma.service.js');
    const prisma = app.get(PrismaService);
    await prisma.db.orm.public.Product.create({
      name: 'Coin pack',
      description: '100 coins',
      type: 'CONSUMABLE',
      priceInCents: 199,
      currency: 'EUR',
    });
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    await container?.stop();
  });

  it('authenticates, purchases, confirms, and grants inventory exactly once', async () => {
    const http = app.getHttpServer();
    const auth = await request(http).post('/api/auth').send({ ticket: 'fake-ticket-001' }).expect(201);
    const products = await request(http).get('/api/products').expect(200);
    const token = auth.body.accessToken;

    const order = await request(http)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: products.body[0].id, quantity: 2 })
      .expect(201);
    expect(order.body.status).toBe('PENDING');

    await request(http)
      .post(`/api/orders/${order.body.orderId}/confirm`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201, { orderId: order.body.orderId, status: 'PAID' });

    await request(http)
      .post(`/api/orders/${order.body.orderId}/confirm`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201, { orderId: order.body.orderId, status: 'PAID' });

    const inventory = await request(http)
      .get('/api/inventories/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(inventory.body).toEqual([expect.objectContaining({ productId: products.body[0].id, quantity: 2 })]);
  }, 30_000);
});

async function createApplication() {
  const { AppModule } = await import('../src/app.module.js');
  const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = module.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  await app.init();
  return app;
}
