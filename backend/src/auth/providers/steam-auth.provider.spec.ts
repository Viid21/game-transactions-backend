import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SteamAuthProvider } from './steam-auth.provider.js';

describe('SteamAuthProvider', () => {
  const fetchMock = vi.fn();
  const provider = new SteamAuthProvider({ appId: '480', publisherKey: 'publisher-key', identity: 'game-backend' });

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('validates a ticket on Steam and returns its Steam id', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ response: { params: { steamid: '76561198000000001' } } }), { status: 200 }));

    await expect(provider.authenticate({ ticket: 'ab12' })).resolves.toEqual({ steamId: '76561198000000001' });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('AuthenticateUserTicket/v1/?'));
    expect(fetchMock.mock.calls[0][0]).toContain('identity=game-backend');
  });
});
