import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import {
    AUTH_PROVIDER,
} from './providers/auth-provider.interface.js';
import { FakeAuthProvider } from './providers/fake-auth.provider.js';
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
            useClass: FakeAuthProvider,
        },
    ],

    exports: [
        PassportModule,
        JwtModule,
    ],
})
export class AuthModule {}