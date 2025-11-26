import { AutoRouter } from 'itty-router';

import { createError } from '../middleware/errorHandler';
import { UserModel } from '../models';
import { AuthenticatedRequest } from '../project';



export const authRoutes = AutoRouter({ base: "/api/auth" });


authRoutes.all("*", (request: AuthenticatedRequest) => {
  console.log(`Auth Route: ${request.method} ${request.url}`);
  console.log("Token: ", request.token);
  console.log("User: ", request.user);
});

/**
 * POST /api/auth/register
 * Create a new user after Firebase signup
 * Body: { firebaseUid, email, name, role?, avatar? }
 */
authRoutes.post('/register', async (request: AuthenticatedRequest, env: Env) => {
  try {
    const body = await request.json() as any;
    const { firebaseUid, email, name, role = 'CLIENT', avatar, notes } = body;

    if (!firebaseUid || !email || !name) {
      throw createError(400, 'Missing required fields: firebaseUid, email, name', 'INVALID_REQUEST');
    }


    // Check if user already exists

    if (request.user) {
      throw createError(409, 'User already exists', 'USER_EXISTS');
    }

    const userModel = new UserModel(env.DB);

    // Create new user
    const newUser = await userModel.create({
      firebase_uid: firebaseUid,
      email,
      name,
      role,
      avatar: avatar || null,
      notes: notes || null,
    });

    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.status) {
      return new Response(JSON.stringify({ error: { code: error.code, message: error.message } }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: { code: 'AUTH_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * GET /api/auth/user/:firebaseUid
 * Get user by Firebase UID
 */
authRoutes.get('/user/', async (request: AuthenticatedRequest, env: Env) => {
  try {

    if (request.user) {
      console.log('Authenticated user:', request.user);
      return new Response(JSON.stringify(request.user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userModel = new UserModel(env.DB);

    // Create new user
    const newUser = await userModel.create({
      firebase_uid: request.token.sub,
      email: request.token.email,
      name: request.token.email,
      role: 'CLIENT',
      avatar: null,
      notes: null,
    });

    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.status) {
      return new Response(JSON.stringify({ error: { code: error.code, message: error.message } }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: { code: 'AUTH_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
