import { randomUUID } from 'crypto';
import { AutoRouter } from 'itty-router';
import { canAccessUserData } from '../helpers/accessControl';
import { buildPaginatedResponse, parseDateRangeParams, parsePaginationParams } from '../helpers/pagination';

interface WorkerRequest extends Request {
  env: { DB: D1Database };
  user?: {
    uid: string;
    role: string;
    email: string;
  };
  params?: any;
}

export const nutritionRoutes = AutoRouter({ base: '/api/nutrition' });

/**
 * GET /api/nutrition
 * Get nutrition logs with pagination and filters
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 20, max 100)
 *   - user_id: filter by user ID (trainers only)
 *   - date_from: filter by start date (ISO string)
 *   - date_to: filter by end date (ISO string)
 */
nutritionRoutes.get('/', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const url = new URL(request.url);

    // Parse pagination
    const { page, limit, offset } = parsePaginationParams(request);

    // Parse filters
    const { date_from, date_to } = parseDateRangeParams(request);
    const targetUserId = url.searchParams.get('user_id');

    // Determine which user's data to fetch
    let userId = user.user_id;
    if (targetUserId && targetUserId !== user.user_id) {
      // Check if requester can access target user's data
      const canAccess = await canAccessUserData(user.user_id, user.role, targetUserId, DB);
      if (!canAccess) {
        return new Response(
          JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this user\'s nutrition logs' } }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      userId = targetUserId;
    }

    // Build query with filters
    let queryConditions = ['user_id = ?'];
    let queryParams: any[] = [userId];

    if (date_from) {
      queryConditions.push('date >= ?');
      queryParams.push(date_from);
    }

    if (date_to) {
      queryConditions.push('date <= ?');
      queryParams.push(date_to);
    }

    const whereClause = queryConditions.join(' AND ');

    // Get total count
    const countResult = await DB
      .prepare(`SELECT COUNT(*) as total FROM nutrition_logs WHERE ${whereClause}`)
      .bind(...queryParams)
      .first();

    const total = (countResult as any)?.total || 0;

    // Get paginated results
    const results = await DB
      .prepare(
        `SELECT * FROM nutrition_logs
         WHERE ${whereClause}
         ORDER BY date DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...queryParams, limit, offset)
      .all();

    const logs = results.results || [];
    const response = buildPaginatedResponse(logs, total, page, limit);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching nutrition logs:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * POST /api/nutrition
 * Create a new nutrition log
 * Body: { name, calories, protein?, carbs?, fat?, date? }
 */
nutritionRoutes.post('/', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const body: any = await request.json();

    // Validate required fields
    if (!body.name || body.calories === undefined) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: name, calories' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const logId = randomUUID();
    const now = new Date().toISOString();
    const logDate = body.date || now;

    await DB
      .prepare(
        `INSERT INTO nutrition_logs
         (id, user_id, name, calories, protein, carbs, fat, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        logId,
        user.user_id,
        body.name,
        body.calories,
        body.protein || null,
        body.carbs || null,
        body.fat || null,
        logDate,
        now
      )
      .run();

    const log = {
      id: logId,
      user_id: user.user_id,
      name: body.name,
      calories: body.calories,
      protein: body.protein || null,
      carbs: body.carbs || null,
      fat: body.fat || null,
      date: logDate,
      created_at: now,
    };

    return new Response(JSON.stringify(log), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating nutrition log:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * GET /api/nutrition/:id
 * Get single nutrition log by ID
 */
nutritionRoutes.get('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const logId = request.params?.id;

    const result = await DB
      .prepare('SELECT * FROM nutrition_logs WHERE id = ?')
      .bind(logId)
      .first();

    if (!result) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Nutrition log not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const log = result as any;

    // Check access
    const canAccess = await canAccessUserData(user.user_id, user.role, log.user_id, DB);
    if (!canAccess) {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this nutrition log' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(log), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching nutrition log:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * DELETE /api/nutrition/:id
 * Delete nutrition log
 */
nutritionRoutes.delete('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const logId = request.params?.id;

    // Check log exists and user has access
    const existing = await DB
      .prepare('SELECT * FROM nutrition_logs WHERE id = ?')
      .bind(logId)
      .first();

    if (!existing) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Nutrition log not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const log = existing as any;

    // Only owner can delete their logs
    if (log.user_id !== user.user_id) {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot delete this nutrition log' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DB
      .prepare('DELETE FROM nutrition_logs WHERE id = ?')
      .bind(logId)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting nutrition log:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
