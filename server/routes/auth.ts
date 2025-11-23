import { AutoRouter, IRequest } from 'itty-router';

import { createError } from '../middleware/errorHandler';
import { UserModel } from '../models';

interface AuthRequest extends Request {
  env: {
    DB: any;
  };
}

export const authRoutes = AutoRouter({ base: "/api/auth" });


authRoutes.all("*", (request: IRequest, env: Env, ctx: ExecutionContext) => {
  console.log(`Auth Route: ${request.method} ${request.url}`);
  console.log("User: ", request.user);
  console.log("User: ", request.user.firebase);
});

/**
 * POST /api/auth/register
 * Create a new user after Firebase signup
 * Body: { firebaseUid, email, name, role?, avatar? }
 */
authRoutes.post('/register', async (request: AuthRequest, env: Env) => {
  try {
    const body = await request.json() as any;
    const { firebaseUid, email, name, role = 'CLIENT', avatar } = body;

    if (!firebaseUid || !email || !name) {
      throw createError(400, 'Missing required fields: firebaseUid, email, name', 'INVALID_REQUEST');
    }

    const userModel = new UserModel(env.DB);

    // Check if user already exists
    const existingUser = await userModel.getByFirebaseUid(firebaseUid);
    if (existingUser) {
      throw createError(409, 'User already exists', 'USER_EXISTS');
    }

    // Create new user
    const newUser = await userModel.create({
      firebase_uid: firebaseUid,
      email,
      name,
      role,
      avatar: avatar || null,
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
authRoutes.get('/user/:firebaseUid', async (request: IRequest, env: Env) => {
  try {
    const { firebaseUid } = request.params as any;

    if (firebaseUid !== request.user.sub) {
      throw createError(400, 'Valid Firebase UID is required', 'INVALID_REQUEST');
    }

    const userModel = new UserModel(env.DB);
    const user = await userModel.getByFirebaseUid(firebaseUid);

    if (!user) {
      throw createError(404, 'User not found', 'USER_NOT_FOUND');
    }

    return new Response(JSON.stringify(user), {
      status: 200,
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
