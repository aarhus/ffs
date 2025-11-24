import { error, IRequest } from 'itty-router';
import { createRemoteJWKSet, customFetch, jwtVerify } from 'jose';
import { cachedFetch, getCachedJson, setCachedJson } from '~/helpers/cache';
import { UserModel } from '~/models';

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

  console.log('Verifying token:', token);

  const tokenCacheKey = "_token_/" + token;

  try {
    let payload = await getCachedJson(env, tokenCacheKey);
    if (!payload) {

      // Use jose to verify JWT signature against Firebase's JWKS
      // jose handles all certificate fetching, caching, and signature verification
      const JWKS = createRemoteJWKSet(
        new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
        {
          [customFetch]: async (...args) => cachedFetch(env, ...args)




        }
      );

      const data = await jwtVerify(token, JWKS, {
        issuer: env.VITE_FIREBASE_ISSUER,
        audience: env.VITE_FIREBASE_PROJECT_ID,
      });
      payload = data.payload;
      await setCachedJson(env, tokenCacheKey, payload);
    }

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
