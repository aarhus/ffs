import { error, IRequest } from 'itty-router';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { UserModel } from '../models';

/**
 * Middleware to verify Firebase ID tokens
 *
 * Uses jose library for secure JWT verification (CRITICAL - DO NOT implement custom verification)
 *
 * Verifies:
 * - Token signature using Firebase's public JWKS (RS256)
 * - Token expiration (exp claim)
 * - Token issuer (iss claim)
 * - Token audience (aud claim)
 * - Required claims present (sub = Firebase UID)
 */
export const authMiddleware = async (request: IRequest, env: Env): Promise<Response | undefined> => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return error(401, 'Missing or invalid authorization header');
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  console.log("Verifying token:", token);

  try {
    // Use jose to verify JWT signature against Firebase's JWKS
    // jose handles all certificate fetching, caching, and signature verification
    const JWKS = createRemoteJWKSet(
      new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
    );

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: (import.meta as any).env.VITE_FIREBASE_ISSUER,
      audience: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    });

    if (!payload || !payload.sub) {
      return error(401, 'Token payload missing required claims');
    }

    // Attach verified payload to request for use in route handlers
    request.token = payload;

    const userModel = new UserModel(env.DB);
    request.user = await userModel.getByFirebaseUid(payload.sub);

    // Middleware success - continue to route handler
    return;
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    return error(401, 'Invalid or expired token');
  }
};
