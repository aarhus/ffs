import { randomUUID } from 'crypto';
import { AutoRouter, IRequest } from 'itty-router';
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

export const workoutRoutes = AutoRouter({ base: "/api/workouts" });

/**
 * GET /api/workouts
 * Get workouts with pagination and filters
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 20, max 100)
 *   - user_id: filter by user ID (trainers only)
 *   - date_from: filter by start date (ISO string)
 *   - date_to: filter by end date (ISO string)
 *   - completed: filter by completion status (0 or 1)
 */
workoutRoutes.get('/', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const url = new URL(request.url);

    // Parse pagination
    const { page, limit, offset } = parsePaginationParams(request);

    // Parse filters
    const { date_from, date_to } = parseDateRangeParams(request);
    const targetUserId = url.searchParams.get('user_id');
    const completedFilter = url.searchParams.get('completed');

    console.log('Parsed filters:', { date_from, date_to, targetUserId, completedFilter, user });

    // Determine which user's data to fetch
    let userId = user.user_id;
    if (targetUserId && targetUserId !== user.user_id) {
      // Check if requester can access target user's data
      const canAccess = await canAccessUserData(user.user_id, user.role, targetUserId, DB);
      if (!canAccess) {
        return new Response(
          JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this user\'s workouts' } }),
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

    if (completedFilter !== null) {
      queryConditions.push('completed = ?');
      queryParams.push(parseInt(completedFilter, 10));
    }

    const whereClause = queryConditions.join(' AND ');

    // Get total count
    const countResult = await DB
      .prepare(`SELECT COUNT(*) as total FROM workouts WHERE ${whereClause}`)
      .bind(...queryParams)
      .first();

    const total = (countResult as any)?.total || 0;

    // Get paginated results
    const results = await DB
      .prepare(
        `SELECT * FROM workouts
         WHERE ${whereClause}
         ORDER BY date DESC
         LIMIT ? OFFSET ?`
      )
      .bind(...queryParams, limit, offset)
      .all();

    const workouts = results.results?.map((row: any) => ({
      ...row,
      exercises: row.exercises ? JSON.parse(row.exercises) : [],
      completed: Boolean(row.completed),
    })) || [];

    const response = buildPaginatedResponse(workouts, total, page, limit);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching workouts:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * POST /api/workouts
 * Create a new workout
 * Body: { name, description?, date, exercises, duration_minutes?, intensity?, perceived_exertion?, notes? }
 */
workoutRoutes.post('/', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const body: any = await request.json();

    // Validate required fields
    if (!body.name || !body.date || !body.exercises) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: name, date, exercises' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate exercises array
    if (!Array.isArray(body.exercises) || body.exercises.length === 0) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'exercises must be a non-empty array' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const workoutId = randomUUID();
    const now = new Date().toISOString();

    await DB
      .prepare(
        `INSERT INTO workouts
         (id, user_id, name, description, date, exercises, duration_minutes, intensity, perceived_exertion, notes, completed, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        workoutId,
        user.user_id,
        body.name,
        body.description || null,
        body.date,
        JSON.stringify(body.exercises),
        body.duration_minutes || null,
        body.intensity || null,
        body.perceived_exertion || null,
        body.notes || null,
        body.completed ? 1 : 0,
        now,
        now
      )
      .run();

    const workout = {
      id: workoutId,
      user_id: user.user_id,
      name: body.name,
      description: body.description || null,
      date: body.date,
      exercises: body.exercises,
      duration_minutes: body.duration_minutes || null,
      intensity: body.intensity || null,
      perceived_exertion: body.perceived_exertion || null,
      notes: body.notes || null,
      completed: Boolean(body.completed),
      created_at: now,
      updated_at: now,
    };

    return new Response(JSON.stringify(workout), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating workout:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * GET /api/workouts/:id
 * Get single workout by ID
 */
workoutRoutes.get('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const workoutId = request.params?.id;

    const result = await DB
      .prepare('SELECT * FROM workouts WHERE id = ?')
      .bind(workoutId)
      .first();

    if (!result) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Workout not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const workout = result as any;

    // Check access
    const canAccess = await canAccessUserData(user.user_id, user.role, workout.user_id, DB);
    if (!canAccess) {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this workout' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = {
      ...workout,
      exercises: workout.exercises ? JSON.parse(workout.exercises) : [],
      completed: Boolean(workout.completed),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching workout:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * PATCH /api/workouts/:id
 * Update workout
 * Allowed fields: name, description, exercises, duration_minutes, intensity, perceived_exertion, notes, completed
 */
workoutRoutes.patch('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const workoutId = request.params?.id;
    const body: any = await request.json();

    // Check workout exists and user has access
    const existing = await DB
      .prepare('SELECT * FROM workouts WHERE id = ?')
      .bind(workoutId)
      .first();

    if (!existing) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Workout not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const workout = existing as any;

    // Only owner can update their workouts
    if (workout.user_id !== user.user_id) {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot update this workout' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build update query dynamically
    const allowedFields = ['name', 'description', 'duration_minutes', 'intensity', 'perceived_exertion', 'notes'];
    const updates: string[] = [];
    const params: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(body[field]);
      }
    }

    if (body.exercises !== undefined) {
      updates.push('exercises = ?');
      params.push(JSON.stringify(body.exercises));
    }

    if (body.completed !== undefined) {
      updates.push('completed = ?');
      params.push(body.completed ? 1 : 0);
    }

    if (updates.length === 0) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(workoutId);

    await DB
      .prepare(`UPDATE workouts SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...params)
      .run();

    // Fetch updated workout
    const updated = await DB
      .prepare('SELECT * FROM workouts WHERE id = ?')
      .bind(workoutId)
      .first();

    const response = updated as any;
    response.exercises = response.exercises ? JSON.parse(response.exercises) : [];
    response.completed = Boolean(response.completed);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating workout:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * DELETE /api/workouts/:id
 * Delete workout
 */
workoutRoutes.delete('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.token!;
    const workoutId = request.params?.id;

    // Check workout exists and user has access
    const existing = await DB
      .prepare('SELECT * FROM workouts WHERE id = ?')
      .bind(workoutId)
      .first();

    if (!existing) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Workout not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const workout = existing as any;

    // Only owner can delete their workouts
    if (workout.user_id !== user.user_id) {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot delete this workout' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DB
      .prepare('DELETE FROM workouts WHERE id = ?')
      .bind(workoutId)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting workout:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
