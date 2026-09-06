import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

import {
    AUTH_PROVIDER,
} from './providers/auth-provider.interface.js';

import { FakeAuthProvider } from './providers/fake-auth.provider.js';

import { PlayerModule } from '../players/players.module.js';

@Module({
    imports: [
        PlayerModule,
    ],

    controllers: [
        AuthController,
    ],

    providers: [
        AuthService,

        {
            provide: AUTH_PROVIDER,
            useClass: FakeAuthProvider,
        },
    ],
})
export class AuthModule {}