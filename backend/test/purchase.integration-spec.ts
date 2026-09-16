import 'reflect-metadata';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

const execFileAsync = promisify(execFile);

describe('OrderService integration', () => {
  let container: StartedPostgreSqlContainer;
  let db: any;
  let orderService: any;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('game_transactions')
      .withUsername('postgres')
      .withPassword('postgres')
      .start();
    process.env.DATABASE_URL = container.getConnectionUri();

    await execFileAsync(process.execPath, ['node_modules/prisma/dist/prisma.js', 'db', 'init', '--db', process.env.DATABASE_URL], {
      cwd: process.cwd(),
    });

    const [{ db: database }, { OrderService }, { FakePaymentProvider }] = await Promise.all([
      import('../src/prisma/db.js'),
      import('../src/orders/orders.service.js'),
      import('../src/payments/fake-payment.provider.js'),
    ]);
    db = database;
    orderService = new OrderService({ db } as never, new FakePaymentProvider());
  }, 120_000);

  afterAll(async () => {
    await db?.close();
    await container?.stop();
  });

  it('delivers an order only once when confirmations happen concurrently', async () => {
    const player = await db.orm.public.Player.create({ username: 'Player', steamId: '76561198000000001' });
    const product = await db.orm.public.Product.create({
      name: 'Coin pack', type: 'CONSUMABLE', priceInCents: 199, currency: 'EUR',
    });
    const order = await orderService.createPurchase(player.id, { productId: product.id, quantity: 2 });

    await expect(Promise.all([
      orderService.confirmPurchase(player.id, order.orderId),
      orderService.confirmPurchase(player.id, order.orderId),
    ])).resolves.toEqual([
      { orderId: order.orderId, status: 'PAID' },
      { orderId: order.orderId, status: 'PAID' },
    ]);

    const inventory = await db.orm.public.Inventory.where({ playerId: player.id, productId: product.id }).first();
    expect(inventory?.quantity).toBe(2);
    expect(await db.orm.public.Fulfillment.where({ orderId: order.orderId }).all()).toHaveLength(1);
  }, 30_000);
});
