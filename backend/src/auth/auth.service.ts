import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
    AUTH_PROVIDER,
} from './providers/auth-provider.interface.js';

import type {
    AuthCredentials,
    AuthProvider,
} from './providers/auth-provider.interface.js';

import { PlayerService } from '../players/players.service.js';

@Injectable()
export class AuthService {
    constructor(
        @Inject(AUTH_PROVIDER)
        private readonly authProvider: AuthProvider,

        private readonly playerService: PlayerService,

        private readonly jwtService: JwtService,
    ) {}

    async authenticate(credentials: AuthCredentials) {
        const authResult =
            await this.authProvider.authenticate(credentials);

        const player =
            await this.playerService.findOrCreateBySteamId(
                authResult.steamId,
            );

        const accessToken = await this.jwtService.signAsync({
            sub: player.id,
        });

        return {
            accessToken,
        };
    }
}