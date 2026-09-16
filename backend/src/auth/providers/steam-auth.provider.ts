import { BadGatewayException, UnauthorizedException } from '@nestjs/common';
import type { AuthCredentials, AuthProvider, AuthResult } from './auth-provider.interface.js';

export interface SteamAuthConfig {
  appId: string;
  publisherKey: string;
  identity: string;
}

interface SteamAuthResponse {
  response?: {
    params?: { steamid?: string };
    error?: { errordesc?: string };
  };
}

export class SteamAuthProvider implements AuthProvider {
  constructor(private readonly config: SteamAuthConfig) {}

  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    const query = new URLSearchParams({
      key: this.config.publisherKey,
      appid: this.config.appId,
      ticket: credentials.ticket,
      identity: this.config.identity,
      format: 'json',
    });
    const response = await fetch(`https://partner.steam-api.com/ISteamUserAuth/AuthenticateUserTicket/v1/?${query}`);
    const payload = await response.json() as SteamAuthResponse;
    const steamId = payload.response?.params?.steamid;
    if (response.ok && steamId) return { steamId };
    if (response.status >= 500) throw new BadGatewayException('Steam authentication is unavailable');
    throw new UnauthorizedException(payload.response?.error?.errordesc ?? 'Invalid Steam authentication ticket');
  }
}
