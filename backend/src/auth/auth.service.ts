import { Inject, Injectable } from '@nestjs/common';

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
    ) {}

    async authenticate(credentials: AuthCredentials) {

        const authResult =
            await this.authProvider.authenticate(credentials);

        const player =
            await this.playerService.findOrCreateBySteamId(
                authResult.steamId,
            );

        return player;
    }
}