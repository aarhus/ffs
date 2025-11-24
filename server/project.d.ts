import type { IRequest } from 'itty-router';
import type { User } from '../models/UserModel';

export interface AuthenticatedRequest extends IRequest {
    token: {
        iss: string;
        aud: string;
        auth_time: number;
        sub: string;
        iat: number;
        exp: number;
        email: string;
        email_verified: boolean;
        firebase: any

    };
    user: User | null | undefined;
}