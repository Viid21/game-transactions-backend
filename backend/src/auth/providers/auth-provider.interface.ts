export interface AuthCredentials {
    ticket: string;
}

export interface AuthResult {
    steamId: string;
}

export interface AuthProvider {
    authenticate(credentials: AuthCredentials): Promise<AuthResult>;
}

export const AUTH_PROVIDER = 'AUTH_PROVIDER';