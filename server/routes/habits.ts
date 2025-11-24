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

export const habitRoutes = AutoRouter({ base: "/api/habits" });


habitRoutes.all("*", (request: WorkerRequest, env: Env, ctx: ExecutionContext) => {
    console.log(`Habits Route: ${request.method} ${request.url}`);
    console.log("User: ", request.token);
});

/**
 * GET /api/habits
 * Get habits with pagination
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 20, max 100)
 *   - user_id: filter by user ID (trainers only)
 */
habitRoutes.get('/', async (request, env, ctx) => {
    try {

        console.log(`Habits Route: ${request.method} ${request.url}`);
        console.log("Env: ", env);

        const user = request.token;
        const url = new URL(request.url);

        // Parse pagination
        const { page, limit, offset } = parsePaginationParams(request);

        // Parse filters
        const targetUserId = url.searchParams.get('user_id');

        // Determine which user's data to fetch
        let userId = user.sub;
        if (targetUserId && targetUserId !== user.sub) {
            // Check if requester can access target user's data
            const canAccess = await canAccessUserData(user.sub, user.role, targetUserId, env.DB);
            if (!canAccess) {
                return new Response(
                    JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this user\'s habits' } }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
            userId = targetUserId;
        }

        // Get total count
        const countResult = await env.DB
            .prepare('SELECT COUNT(*) as total FROM habits WHERE user_id = ?')
            .bind(userId)
            .first();

        const total = (countResult as any)?.total || 0;

        // Get paginated results
        const results = await env.DB
            .prepare(
                `SELECT * FROM habits
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`
            )
            .bind(userId, limit, offset)
            .all();

        const habits = results.results || [];
        const response = buildPaginatedResponse(habits, total, page, limit);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error fetching habits:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * POST /api/habits
 * Create a new habit
 * Body: { name, frequency, target, unit }
 */
habitRoutes.post('/', async (request: IRequest, env: Env) => {
    try {
        const { DB } = env;
        const user = request.token!;
        const body: any = await request.json();

        // Validate required fields
        if (!body.name || !body.frequency || body.target === undefined || !body.unit) {
            return new Response(
                JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: name, frequency, target, unit' } }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate frequency
        const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];
        if (!validFrequencies.includes(body.frequency)) {
            return new Response(
                JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: `frequency must be one of: ${validFrequencies.join(', ')}` } }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const habitId = randomUUID();
        const now = new Date().toISOString();

        await DB
            .prepare(
                `INSERT INTO habits
         (id, user_id, name, frequency, target, current, streak, unit, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
                habitId,
                user.user_id,
                body.name,
                body.frequency,
                body.target,
                body.current || 0,
                body.streak || 0,
                body.unit,
                now,
                now
            )
            .run();

        const habit = {
            id: habitId,
            user_id: user.user_id,
            name: body.name,
            frequency: body.frequency,
            target: body.target,
            current: body.current || 0,
            streak: body.streak || 0,
            unit: body.unit,
            created_at: now,
            updated_at: now,
        };

        return new Response(JSON.stringify(habit), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error creating habit:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * GET /api/habits/:id
 * Get single habit by ID
 */
habitRoutes.get('/:id', async (request: IRequest, env: Env) => {
    try {
        const { DB } = env;
        const user = request.token!;
        const habitId = request.params?.id;

        const result = await DB
            .prepare('SELECT * FROM habits WHERE id = ?')
            .bind(habitId)
            .first();

        if (!result) {
            return new Response(
                JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Habit not found' } }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const habit = result as any;

        // Check access
        const canAccess = await canAccessUserData(user.user_id, user.role, habit.user_id, DB);
        if (!canAccess) {
            return new Response(
                JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this habit' } }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify(habit), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error fetching habit:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * PATCH /api/habits/:id
 * Update habit (typically for progress/streak updates)
 * Allowed fields: name, current, streak, target
 */
habitRoutes.patch('/:id', async (request: IRequest, env: Env) => {
    try {
        const { DB } = env;
        const user = request.token!;
        const habitId = request.params?.id;
        const body: any = await request.json();

        // Check habit exists and user has access
        const existing = await DB
            .prepare('SELECT * FROM habits WHERE id = ?')
            .bind(habitId)
            .first();

        if (!existing) {
            return new Response(
                JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Habit not found' } }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const habit = existing as any;

        // Only owner can update their habits
        if (habit.user_id !== user.user_id) {
            return new Response(
                JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot update this habit' } }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Build update query dynamically
        const allowedFields = ['name', 'current', 'streak', 'target'];
        const updates: string[] = [];
        const params: any[] = [];

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates.push(`${field} = ?`);
                params.push(body[field]);
            }
        }

        if (updates.length === 0) {
            return new Response(
                JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' } }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        updates.push('updated_at = ?');
        params.push(new Date().toISOString());
        params.push(habitId);

        await DB
            .prepare(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`)
            .bind(...params)
            .run();

        // Fetch updated habit
        const updated = await DB
            .prepare('SELECT * FROM habits WHERE id = ?')
            .bind(habitId)
            .first();

        return new Response(JSON.stringify(updated), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error updating habit:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * DELETE /api/habits/:id
 * Delete habit
 */
habitRoutes.delete('/:id', async (request: IRequest, env: Env) => {
    try {
        const { DB } = env;
        const user = request.token!;
        const habitId = request.params?.id;

        // Check habit exists and user has access
        const existing = await DB
            .prepare('SELECT * FROM habits WHERE id = ?')
            .bind(habitId)
            .first();

        if (!existing) {
            return new Response(
                JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Habit not found' } }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const habit = existing as any;

        // Only owner can delete their habits
        if (habit.user_id !== user.user_id) {
            return new Response(
                JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot delete this habit' } }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await DB
            .prepare('DELETE FROM habits WHERE id = ?')
            .bind(habitId)
            .run();

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error('Error deleting habit:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
