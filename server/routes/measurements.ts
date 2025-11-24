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

export const measurementRoutes = AutoRouter({ base: '/api/measurements' });

/**
 * GET /api/measurements
 * Get measurements with pagination and filters
 * Query params:
 *   - page: page number (default 1)
 *   - limit: items per page (default 20, max 100)
 *   - user_id: filter by user ID (trainers only)
 *   - date_from: filter by start date (ISO string)
 *   - date_to: filter by end date (ISO string)
 */
measurementRoutes.get('/', async (request: IRequest, env: Env) => {
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
                    JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this user\'s measurements' } }),
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
            .prepare(`SELECT COUNT(*) as total FROM measurements WHERE ${whereClause}`)
            .bind(...queryParams)
            .first();

        const total = (countResult as any)?.total || 0;

        // Get paginated results
        const results = await DB
            .prepare(
                `SELECT * FROM measurements
         WHERE ${whereClause}
         ORDER BY date DESC
         LIMIT ? OFFSET ?`
            )
            .bind(...queryParams, limit, offset)
            .all();

        const measurements = results.results || [];
        const response = buildPaginatedResponse(measurements, total, page, limit);

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error fetching measurements:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * POST /api/measurements
 * Create a new measurement
 * Body: { weight?, body_fat_percentage?, muscle_mass?, chest?, waist?, hips?,
 *         bicep_left?, bicep_right?, thigh_left?, thigh_right?, notes?, date? }
 */
measurementRoutes.post('/', async (request: IRequest, env: Env) => {
    try {
        const { DB } = env;
        const user = request.token!;
        const body: any = await request.json();

        // Validate at least one measurement field is provided
        const measurementFields = [
            'weight', 'body_fat_percentage', 'muscle_mass', 'chest',
            'waist', 'hips', 'bicep_left', 'bicep_right', 'thigh_left', 'thigh_right'
        ];

        const hasAtLeastOneField = measurementFields.some(field => body[field] !== undefined);

        if (!hasAtLeastOneField) {
            return new Response(
                JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'At least one measurement field is required' } }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const measurementId = randomUUID();
        const now = new Date().toISOString();
        const measurementDate = body.date || now;

        await DB
            .prepare(
                `INSERT INTO measurements
         (id, user_id, weight, body_fat_percentage, muscle_mass, chest, waist, hips,
          bicep_left, bicep_right, thigh_left, thigh_right, notes, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
                measurementId,
                user.user_id,
                body.weight || null,
                body.body_fat_percentage || null,
                body.muscle_mass || null,
                body.chest || null,
                body.waist || null,
                body.hips || null,
                body.bicep_left || null,
                body.bicep_right || null,
                body.thigh_left || null,
                body.thigh_right || null,
                body.notes || null,
                measurementDate,
                now
            )
            .run();

        const measurement = {
            id: measurementId,
            user_id: user.user_id,
            weight: body.weight || null,
            body_fat_percentage: body.body_fat_percentage || null,
            muscle_mass: body.muscle_mass || null,
            chest: body.chest || null,
            waist: body.waist || null,
            hips: body.hips || null,
            bicep_left: body.bicep_left || null,
            bicep_right: body.bicep_right || null,
            thigh_left: body.thigh_left || null,
            thigh_right: body.thigh_right || null,
            notes: body.notes || null,
            date: measurementDate,
            created_at: now,
        };

        return new Response(JSON.stringify(measurement), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error creating measurement:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * GET /api/measurements/:id
 * Get single measurement by ID
 */
measurementRoutes.get('/:id', async (request: IRequest, env: Env) => {
    try {
        const { DB } = env;
        const user = request.token!;
        const measurementId = request.params?.id;

        const result = await DB
            .prepare('SELECT * FROM measurements WHERE id = ?')
            .bind(measurementId)
            .first();

        if (!result) {
            return new Response(
                JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Measurement not found' } }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const measurement = result as any;

        // Check access
        const canAccess = await canAccessUserData(user.user_id, user.role, measurement.user_id, DB);
        if (!canAccess) {
            return new Response(
                JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot access this measurement' } }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(JSON.stringify(measurement), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error fetching measurement:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

/**
 * DELETE /api/measurements/:id
 * Delete measurement
 */
measurementRoutes.delete('/:id', async (request: IRequest, env: Env) => {
    try {
        const { DB } = env;
        const user = request.token!;
        const measurementId = request.params?.id;

        // Check measurement exists and user has access
        const existing = await DB
            .prepare('SELECT * FROM measurements WHERE id = ?')
            .bind(measurementId)
            .first();

        if (!existing) {
            return new Response(
                JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Measurement not found' } }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const measurement = existing as any;

        // Only owner can delete their measurements
        if (measurement.user_id !== user.user_id) {
            return new Response(
                JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Cannot delete this measurement' } }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await DB
            .prepare('DELETE FROM measurements WHERE id = ?')
            .bind(measurementId)
            .run();

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error('Error deleting measurement:', error);
        return new Response(
            JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
