import { AutoRouter, IRequest } from 'itty-router';
import { ExerciseLibraryModel } from '../models/exercises';

export const exerciseLibraryRoutes = AutoRouter({ base: "/api/exercises" });

/**
 * GET /api/exercises
 * Get all exercises from library (active only by default)
 * Query params:
 *   - include_inactive: include inactive exercises (admin only)
 *   - category: filter by category
 *   - search: search by name or description
 */
exerciseLibraryRoutes.get('/', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.user!;
    const url = new URL(request.url);

    const includeInactive = url.searchParams.get('include_inactive') === '1';
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    const model = new ExerciseLibraryModel(DB);

    let exercises;

    if (search) {
      exercises = await model.search(search);
    } else if (category) {
      exercises = await model.getByCategory(category);
    } else {
      // Only admins can see inactive exercises
      const activeOnly = includeInactive ? (user.role !== 'ADMIN') : true;
      exercises = await model.getAll(activeOnly);
    }

    return new Response(
      JSON.stringify(exercises),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching exercises:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * GET /api/exercises/:id
 * Get single exercise by ID
 */
exerciseLibraryRoutes.get('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const exerciseId = request.params?.id;

    const model = new ExerciseLibraryModel(DB);
    const exercise = await model.getById(exerciseId);

    if (!exercise) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Exercise not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(exercise),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching exercise:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * POST /api/exercises
 * Create a new exercise (ADMIN only)
 */
exerciseLibraryRoutes.post('/', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.user!;

    // Only admins can create exercises
    if (user.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: any = await request.json();

    // Validate required fields
    if (!body.name) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Missing required field: name' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const model = new ExerciseLibraryModel(DB);
    const exercise = await model.create({
      name: body.name,
      description: body.description,
      category: body.category,
      muscle_groups: body.muscle_groups,
      equipment: body.equipment,
      video_url: body.video_url,
      instructions: body.instructions,
    });

    return new Response(
      JSON.stringify(exercise),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating exercise:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * PATCH /api/exercises/:id
 * Update an exercise (ADMIN only)
 */
exerciseLibraryRoutes.patch('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.user!;
    const exerciseId = request.params?.id;

    // Only admins can update exercises
    if (user.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: any = await request.json();
    const model = new ExerciseLibraryModel(DB);
    const exercise = await model.update(exerciseId, body);

    if (!exercise) {
      return new Response(
        JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Exercise not found' } }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(exercise),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating exercise:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * DELETE /api/exercises/:id
 * Delete an exercise (ADMIN only)
 */
exerciseLibraryRoutes.delete('/:id', async (request: IRequest, env: Env) => {
  try {
    const { DB } = env;
    const user = request.user!;
    const exerciseId = request.params?.id;

    // Only admins can delete exercises
    if (user.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Admin access required' } }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const model = new ExerciseLibraryModel(DB);
    await model.delete(exerciseId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting exercise:', error);
    return new Response(
      JSON.stringify({ error: { code: 'SERVER_ERROR', message: error.message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
