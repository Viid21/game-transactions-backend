import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import {
    AUTH_PROVIDER,
} from './providers/auth-provider.interface.js';
import { FakeAuthProvider } from './providers/fake-auth.provider.js';
import { SteamAuthProvider } from './providers/steam-auth.provider.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { PassportModule } from '@nestjs/passport';

import { PlayerModule } from '../players/players.module.js';

@Module({
    imports: [
        PlayerModule,

        PassportModule,

        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '1h',
            },
        }),
    ],

    controllers: [
        AuthController,
    ],

    providers: [
        AuthService,
        JwtStrategy,
        {
            provide: AUTH_PROVIDER,
            useFactory: () => {
                if ((process.env.AUTH_PROVIDER ?? 'fake') === 'fake') return new FakeAuthProvider();
                if (process.env.AUTH_PROVIDER !== 'steam') throw new Error('AUTH_PROVIDER must be fake or steam');

                const appId = process.env.STEAM_APP_ID;
                const publisherKey = process.env.STEAM_AUTH_KEY;
                const identity = process.env.STEAM_AUTH_IDENTITY;
                if (!appId || !publisherKey || !identity) {
                    throw new Error('STEAM_APP_ID, STEAM_AUTH_KEY and STEAM_AUTH_IDENTITY are required for Steam authentication');
                }
                return new SteamAuthProvider({ appId, publisherKey, identity });
            },
        },
    ],

    exports: [
        PassportModule,
        JwtModule,
    ],
})
export class AuthModule {}
