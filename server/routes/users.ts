import { Router } from 'itty-router';
import { UserModel } from '../models';
import { createError } from '../middleware/errorHandler';

interface UserRequest extends Request {
  env: {
    DB: any;
  };
}

export const userRoutes = Router<UserRequest>();

/**
 * GET /api/users/:id
 * Get user by ID
 */
userRoutes.get('/:id', async (request: UserRequest, env: Env) => {
  try {
    const { id } = request.params as any;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      throw createError(400, 'Invalid user ID', 'INVALID_REQUEST');
    }

    const userModel = new UserModel(env.DB);
    const user = await userModel.getById(userId);

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
    return new Response(JSON.stringify({ error: { code: 'USER_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * PATCH /api/users/:id
 * Update user profile
 */
userRoutes.patch('/:id', async (request: UserRequest, env: Env) => {
  try {
    const { id } = request.params as any;
    const userId = parseInt(id);
    const body = await request.json() as any;

    if (isNaN(userId)) {
      throw createError(400, 'Invalid user ID', 'INVALID_REQUEST');
    }

    const userModel = new UserModel(env.DB);
    const updated = await userModel.update(userId, body);

    return new Response(JSON.stringify(updated), {
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
    return new Response(JSON.stringify({ error: { code: 'USER_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user account
 */
userRoutes.delete('/:id', async (request: UserRequest) => {
  try {
    const { id } = request.params as any;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      throw createError(400, 'Invalid user ID', 'INVALID_REQUEST');
    }

    const userModel = new UserModel(env.DB);
    await userModel.delete(userId);

    return new Response(JSON.stringify({ success: true }), {
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
    return new Response(JSON.stringify({ error: { code: 'USER_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
