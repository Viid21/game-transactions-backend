import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SteamPaymentProvider } from './steam-payment.provider.js';

describe('SteamPaymentProvider', () => {
  const fetchMock = vi.fn();
  const provider = new SteamPaymentProvider({ appId: '480', publisherKey: 'publisher-key', sandbox: true, language: 'en' });

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('creates a Steam sandbox transaction using Steam item ids', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ response: { result: 'OK', params: { transid: '987' } } }), { status: 200 }));

    await expect(provider.initiate({
      orderId: '123', steamId: '76561198000000001', currency: 'EUR',
      items: [{ sku: '42', description: 'Coins', quantity: 2, unitAmount: 199 }],
    })).resolves.toEqual({ providerTransactionId: '987', status: 'PENDING', authorizationUrl: undefined });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://partner.steam-api.com/ISteamMicroTxnSandbox/InitTxn/v3',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(fetchMock.mock.calls[0][1].body.toString()).toContain('itemid%5B0%5D=42');
  });
});
