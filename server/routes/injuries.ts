import { AutoRouter, IRequest } from 'itty-router';
import { canAccessUserData } from '../helpers/accessControl';
import { createError } from '../middleware/errorHandler';
import { InjuryDefinitionModel, UserInjuryModel } from '../models/injuries';

export const injuryRoutes = AutoRouter({ base: '/api/injuries' });

/**
 * GET /api/injuries/definitions
 * Get all injury definitions
 */
injuryRoutes.get('/definitions', async (request: IRequest, env: Env) => {
  try {
    const model = new InjuryDefinitionModel(env.DB);
    const definitions = await model.getAll();

    // Parse JSON fields for frontend
    const parsed = definitions.map(def => ({
      ...def,
      affected_areas: JSON.parse(def.affected_areas || '[]'),
      recommended_modifications: JSON.parse(def.recommended_modifications || '[]'),
    }));

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: { code: 'INJURY_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * GET /api/injuries/user/:userId
 * Get all injuries for a specific user
 */
injuryRoutes.get('/user/:userId', async (request: IRequest, env: Env) => {
  try {
    const { userId } = request.params as any;
    const targetUserId = parseInt(userId);
    const user = request.user!;

    if (isNaN(targetUserId)) {
      throw createError(400, 'Invalid user ID', 'INVALID_REQUEST');
    }




    // Check access permissions
    const canAccess = await canAccessUserData(request.user.id, request.user.role, targetUserId, env.DB);
    if (!canAccess) {
      throw createError(403, 'Access denied', 'FORBIDDEN');
    }

    const model = new UserInjuryModel(env.DB);
    const injuries = await model.getByUserId(targetUserId);

    return new Response(JSON.stringify(injuries), {
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
    return new Response(JSON.stringify({ error: { code: 'INJURY_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * POST /api/injuries
 * Create a new injury record
 */
injuryRoutes.post('/', async (request: IRequest, env: Env) => {
  try {
    const body = await request.json() as any;
    const user = request.token!;
    const { user_id, injury_type, details, severity, status, date_reported } = body;

    if (!user_id || !injury_type || !date_reported) {
      throw createError(400, 'Missing required fields: user_id, injury_type, date_reported', 'INVALID_REQUEST');
    }



    const model = new UserInjuryModel(env.DB);
    const injury = await model.create({
      user_id: parseInt(user_id),
      injury_type,
      details: details || null,
      severity: severity || null,
      status: status || 'ACTIVE',
      date_reported,
      date_resolved: null,
    });

    return new Response(JSON.stringify(injury), {
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
    return new Response(JSON.stringify({ error: { code: 'INJURY_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * PATCH /api/injuries/:id
 * Update an injury record
 */
injuryRoutes.patch('/:id', async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params as any;
    const injuryId = parseInt(id);
    const body = await request.json() as any;
    const user = request.token!;

    if (isNaN(injuryId)) {
      throw createError(400, 'Invalid injury ID', 'INVALID_REQUEST');
    }

    // Get existing injury to check ownership
    const model = new UserInjuryModel(env.DB);
    const existing = await model.getById(injuryId);
    if (!existing) {
      throw createError(404, 'Injury not found', 'NOT_FOUND');
    }

    // Check access permissions
    const canAccess = await canAccessUserData(user.user_id, user.role, existing.user_id.toString(), env.DB);
    if (!canAccess) {
      throw createError(403, 'Access denied', 'FORBIDDEN');
    }

    const updated = await model.update(injuryId, body);

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
    return new Response(JSON.stringify({ error: { code: 'INJURY_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

/**
 * DELETE /api/injuries/:id
 * Delete an injury record
 */
injuryRoutes.delete('/:id', async (request: IRequest, env: Env) => {
  try {
    const { id } = request.params as any;
    const injuryId = parseInt(id);
    const user = request.token!;

    if (isNaN(injuryId)) {
      throw createError(400, 'Invalid injury ID', 'INVALID_REQUEST');
    }

    // Get existing injury to check ownership
    const model = new UserInjuryModel(env.DB);
    const existing = await model.getById(injuryId);
    if (!existing) {
      throw createError(404, 'Injury not found', 'NOT_FOUND');
    }

    // Check access permissions
    const canAccess = await canAccessUserData(user.user_id, user.role, existing.user_id.toString(), env.DB);
    if (!canAccess) {
      throw createError(403, 'Access denied', 'FORBIDDEN');
    }

    await model.delete(injuryId);

    return new Response(JSON.stringify({ message: 'Injury deleted successfully' }), {
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
    return new Response(JSON.stringify({ error: { code: 'INJURY_ERROR', message: error.message } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
