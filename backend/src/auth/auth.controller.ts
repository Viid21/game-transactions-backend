import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import type { AuthCredentials } from './providers/auth-provider.interface.js';

@Controller('api/auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post()
    authenticate(@Body() credentials: AuthCredentials) {
        return this.authService.authenticate(credentials);
    }
}
