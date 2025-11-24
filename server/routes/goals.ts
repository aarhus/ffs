import { randomUUID } from 'crypto';
import { AutoRouter, IRequest } from 'itty-router';
import { canAccessUserData } from '../helpers/accessControl';
import { buildPaginatedResponse, parsePaginationParams } from '../helpers/pagination';

interface WorkerRequest extends Request {
  env: { DB: D1Database };
  user?: {
    uid: string;
    role: string;
    email: string;
  };
  params?: any;
}

export const goalRoutes = AutoRouter({ base: '/api/goals' });

/**
 * GET /api/goals
 * Get goals with pagination and filters
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 20, max 100)
 *   - user_id: filter by user ID (trainers only)
 *   - status: filter by status (ACTIVE, COMPLETED, ARCHIVED)
 */
goalRoutes.get('/', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const url = new URL(request.url);

    // Parse pagination
    const { page, limit, offset } = parsePaginationParams(request);

    // Parse filters
    const targetUserId = url.searchParams.get('user_id');
    const statusFilter = url.searchParams.get('status');

    // Determine which user's data to fetch
    let userId = user.user_id;
    if (targetUserId && targetUserId !== user.user_id) {
      // Check if requester can access target user's data
      const canAccess = await canAccessUserData(user.user_id, user.role, targetUserId, DB);
      if (!canAccess) {
        return new Response(
          JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this user\'s goals' } }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      userId = targetUserId;
    }

    // Build query with filters
    let queryConditions = ['user_id = ?'];
    let queryParams: any[] = [userId];

    if (statusFilter) {
      queryConditions.push('status = ?');
      queryParams.push(statusFilter);
    }

    const whereClause = queryConditions.join(' AND ');

    // Get total count
    const countResult = await DB
      .prepare(`SELECT COUNT(*) as total FROM goals WHERE ${whereClause}`)
      .bind(...queryParams)
      .first();

    const total = (countResult as any)?.total || 0;

    // Get paginated results
    const results = await DB
      .prepare(
        `SELECT * FROM goals
         WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...queryParams, limit, offset)
      .all();

    const goals = results.results || [];
    const response = buildPaginatedResponse(goals, total, page, limit);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * POST /api/goals
 * Create a new goal
 * Body: { title, metric, target, due_date?, status? }
 */
goalRoutes.post('/', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const body: any = await request.json();

    // Validate required fields
    if (!body.title || !body.metric || body.target === undefined) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: title, metric, target' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate metric
    const validMetrics = ['kg', 'reps', 'cm', 'mins', '%'];
    if (!validMetrics.includes(body.metric)) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: `metric must be one of: ${validMetrics.join(', ')}` } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate status if provided
    const validStatuses = ['ACTIVE', 'COMPLETED', 'ARCHIVED'];
    const status = body.status || 'ACTIVE';
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: `status must be one of: ${validStatuses.join(', ')}` } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const goalId = randomUUID();
    const now = new Date().toISOString();

    await DB
      .prepare(
        `INSERT INTO goals
         (id, user_id, title, metric, target, current, status, due_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        goalId,
        user.user_id,
        body.title,
        body.metric,
        body.target,
        body.current || 0,
        status,
        body.due_date || null,
        now,
        now
      )
      .run();

    const goal = {
      id: goalId,
      user_id: user.user_id,
      title: body.title,
      metric: body.metric,
      target: body.target,
      current: body.current || 0,
      status,
      due_date: body.due_date || null,
      created_at: now,
      updated_at: now,
    };

    return new Response(JSON.stringify(goal), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating goal:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * GET /api/goals/:id
 * Get single goal by ID
 */
goalRoutes.get('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const goalId = request.params?.id;

    const result = await DB
      .prepare('SELECT * FROM goals WHERE id = ?')
      .bind(goalId)
      .first();

    if (!result) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Goal not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const goal = result as any;

    // Check access
    const canAccess = await canAccessUserData(user.user_id, user.role, goal.user_id, DB);
    if (!canAccess) {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this goal' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(goal), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching goal:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * PATCH /api/goals/:id
 * Update goal
 * Allowed fields: title, current, status, due_date
 */
goalRoutes.patch('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const goalId = request.params?.id;
    const body: any = await request.json();

    // Check goal exists and user has access
    const existing = await DB
      .prepare('SELECT * FROM goals WHERE id = ?')
      .bind(goalId)
      .first();

    if (!existing) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Goal not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const goal = existing as any;

    // Only owner can update their goals
    if (goal.user_id !== user.user_id) {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot update this goal' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build update query dynamically
    const allowedFields = ['title', 'current', 'due_date'];
    const updates: string[] = [];
    const params: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(body[field]);
      }
    }

    if (body.status !== undefined) {
      const validStatuses = ['ACTIVE', 'COMPLETED', 'ARCHIVED'];
      if (!validStatuses.includes(body.status)) {
        return new Response(
          JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: `status must be one of: ${validStatuses.join(', ')}` } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      updates.push('status = ?');
      params.push(body.status);
    }

    if (updates.length === 0) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(goalId);

    await DB
      .prepare(`UPDATE goals SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    // Fetch updated goal
    const updated = await DB
      .prepare('SELECT * FROM goals WHERE id = ?')
      .bind(goalId)
      .first();

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating goal:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * DELETE /api/goals/:id
 * Delete goal
 */
goalRoutes.delete('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const goalId = request.params?.id;

    // Check goal exists and user has access
    const existing = await DB
      .prepare('SELECT * FROM goals WHERE id = ?')
      .bind(goalId)
      .first();

    if (!existing) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Goal not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const goal = existing as any;

    // Only owner can delete their goals
    if (goal.user_id !== user.user_id) {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot delete this goal' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DB
      .prepare('DELETE FROM goals WHERE id = ?')
      .bind(goalId)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
