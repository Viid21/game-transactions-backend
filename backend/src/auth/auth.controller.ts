import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { AuthenticateDto } from './dto/authenticate.dto.js';

@Controller('api/auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post()
    authenticate(@Body() credentials: AuthenticateDto) {
        return this.authService.authenticate(credentials);
    }
}
