import {
    AuthCredentials,
    AuthProvider,
    AuthResult,
} from './auth-provider.interface.js';

export class FakeAuthProvider implements AuthProvider {

    private readonly fakeUsers = new Map<string, string>([
        ['fake-ticket-001', '76561198000000001'],
        ['fake-ticket-002', '76561198000000002'],
    ]);

    async authenticate(
        credentials: AuthCredentials,
    ): Promise<AuthResult> {

        const steamId = this.fakeUsers.get(credentials.ticket);

        if (!steamId) {
            throw new Error('Invalid authentication ticket');
        }

        return {
            steamId,
        };
    }
}