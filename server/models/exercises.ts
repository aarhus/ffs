import { randomUUID } from 'crypto';

export interface ExerciseLibrary {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    muscle_groups: string[]; // JSON parsed
    equipment: string | null;
    video_url: string | null;
    instructions: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    default_measurement_type: string | null;
    measurement_categories: string | null; // JSON string: '["WEIGHT"]', '["DISTANCE","TIME"]'
}

export interface WorkoutComponent {
    id: string;
    workout_id: string;
    exercise_id: string;
    order_index: number;
    sets: number;
    min_reps: number | null;
    max_reps: number | null;
    target_reps: number | null;
    measurement_type: 'REPS' | 'TIME' | 'DISTANCE' | 'WEIGHT' | null;
    measurement_value: number | null;
    measurement_unit: string | null;
    rest_seconds: number | null;
    notes: string | null;
    actual_sets: number | null;
    actual_reps: number[]; // JSON parsed
    actual_measurement: number[]; // JSON parsed
    completed: boolean;
    is_pr: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Exercise Library Model - Admin-managed exercise database
 */
export class ExerciseLibraryModel {
    constructor(private db: D1Database) { }

    async getAll(activeOnly: boolean = true): Promise<ExerciseLibrary[]> {
        const query = activeOnly
            ? 'SELECT * FROM exercise_library WHERE is_active = 1 ORDER BY category, name'
            : 'SELECT * FROM exercise_library ORDER BY category, name';

        const result = await this.db.prepare(query).all();
        return (result.results || []).map(row => this.mapRow(row));
    }

    async getById(id: string): Promise<ExerciseLibrary | null> {
        const result = await this.db
            .prepare('SELECT * FROM exercise_library WHERE id = ?')
            .bind(id)
            .first();

        return result ? this.mapRow(result) : null;
    }

    async getByCategory(category: string): Promise<ExerciseLibrary[]> {
        const result = await this.db
            .prepare('SELECT * FROM exercise_library WHERE category = ? AND is_active = 1 ORDER BY name')
            .bind(category)
            .all();

        return (result.results || []).map(row => this.mapRow(row));
    }

    async search(query: string): Promise<ExerciseLibrary[]> {
        const result = await this.db
            .prepare(
                `SELECT * FROM exercise_library
         WHERE is_active = 1
         AND (name LIKE ? OR description LIKE ?)
         ORDER BY name
         LIMIT 50`
            )
            .bind(`%${query}%`, `%${query}%`)
            .all();

        return (result.results || []).map(row => this.mapRow(row));
    }

    async create(data: {
        name: string;
        description?: string;
        category?: string;
        muscle_groups?: string[];
        equipment?: string;
        video_url?: string;
        instructions?: string;
    }): Promise<ExerciseLibrary> {
        const id = randomUUID();
        const now = new Date().toISOString();

        await this.db
            .prepare(
                `INSERT INTO exercise_library
         (id, name, description, category, muscle_groups, equipment, video_url, instructions, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
            )
            .bind(
                id,
                data.name,
                data.description || null,
                data.category || null,
                JSON.stringify(data.muscle_groups || []),
                data.equipment || null,
                data.video_url || null,
                data.instructions || null,
                now,
                now
            )
            .run();

        return (await this.getById(id))!;
    }

    async update(id: string, data: Partial<ExerciseLibrary>): Promise<ExerciseLibrary | null> {
        const now = new Date().toISOString();
        const updates: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description);
        }
        if (data.category !== undefined) {
            updates.push('category = ?');
            values.push(data.category);
        }
        if (data.muscle_groups !== undefined) {
            updates.push('muscle_groups = ?');
            values.push(JSON.stringify(data.muscle_groups));
        }
        if (data.equipment !== undefined) {
            updates.push('equipment = ?');
            values.push(data.equipment);
        }
        if (data.video_url !== undefined) {
            updates.push('video_url = ?');
            values.push(data.video_url);
        }
        if (data.instructions !== undefined) {
            updates.push('instructions = ?');
            values.push(data.instructions);
        }
        if (data.is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(data.is_active ? 1 : 0);
        }

        updates.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await this.db
            .prepare(`UPDATE exercise_library SET ${updates.join(', ')} WHERE id = ?`)
            .bind(...values)
            .run();

        return this.getById(id);
    }

    async delete(id: string): Promise<boolean> {
        await this.db.prepare('DELETE FROM exercise_library WHERE id = ?').bind(id).run();
        return true;
    }

    private mapRow(row: any): ExerciseLibrary {
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            muscle_groups: row.muscle_groups ? JSON.parse(row.muscle_groups) : [],
            equipment: row.equipment,
            video_url: row.video_url,
            instructions: row.instructions,
            is_active: Boolean(row.is_active),
            created_at: row.created_at,
            updated_at: row.updated_at,
            default_measurement_type: row.default_measurement_type,
            measurement_categories: row.measurement_categories,
        };
    }
}

/**
 * Workout Component Model - Individual exercises within a workout
 */
export class WorkoutComponentModel {
    constructor(private db: D1Database) { }

    async getByWorkoutId(workoutId: string): Promise<WorkoutComponent[]> {
        const result = await this.db
            .prepare('SELECT * FROM workout_components WHERE workout_id = ? ORDER BY order_index')
            .bind(workoutId)
            .all();

        return (result.results || []).map(row => this.mapRow(row));
    }

    async getById(id: string): Promise<WorkoutComponent | null> {
        const result = await this.db
            .prepare('SELECT * FROM workout_components WHERE id = ?')
            .bind(id)
            .first();

        return result ? this.mapRow(result) : null;
    }

    async create(data: {
        workout_id: string;
        exercise_id: string;
        order_index: number;
        sets: number;
        min_reps?: number;
        max_reps?: number;
        target_reps?: number;
        measurement_type?: string;
        measurement_value?: number;
        measurement_unit?: string;
        rest_seconds?: number;
        notes?: string;
    }): Promise<WorkoutComponent> {
        const id = randomUUID();
        const now = new Date().toISOString();

        console.log({ id, data })

        await this.db
            .prepare(
                `INSERT INTO workout_components
         (id, workout_id, exercise_id, order_index, sets, min_reps, max_reps, target_reps,
          measurement_type, measurement_value, measurement_unit, rest_seconds, notes,
          actual_sets, actual_reps, actual_measurement, completed, is_pr, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, '[]', '[]', 0, 0, ?, ?)`
            )
            .bind(
                id,
                data.workout_id,
                data.exercise_id,
                data.order_index,
                data.sets,
                data.min_reps || null,
                data.max_reps || null,
                data.target_reps || null,
                data.measurement_type || null,
                data.measurement_value || null,
                data.measurement_unit || null,
                data.rest_seconds || null,
                data.notes || null,
                now,
                now
            )
            .run();

        return (await this.getById(id))!;
    }

    async update(id: string, data: Partial<WorkoutComponent>): Promise<WorkoutComponent | null> {
        const now = new Date().toISOString();
        const updates: string[] = [];
        const values: any[] = [];

        if (data.sets !== undefined) {
            updates.push('sets = ?');
            values.push(data.sets);
        }
        if (data.min_reps !== undefined) {
            updates.push('min_reps = ?');
            values.push(data.min_reps);
        }
        if (data.max_reps !== undefined) {
            updates.push('max_reps = ?');
            values.push(data.max_reps);
        }
        if (data.target_reps !== undefined) {
            updates.push('target_reps = ?');
            values.push(data.target_reps);
        }
        if (data.measurement_type !== undefined) {
            updates.push('measurement_type = ?');
            values.push(data.measurement_type);
        }
        if (data.measurement_value !== undefined) {
            updates.push('measurement_value = ?');
            values.push(data.measurement_value);
        }
        if (data.measurement_unit !== undefined) {
            updates.push('measurement_unit = ?');
            values.push(data.measurement_unit);
        }
        if (data.rest_seconds !== undefined) {
            updates.push('rest_seconds = ?');
            values.push(data.rest_seconds);
        }
        if (data.notes !== undefined) {
            updates.push('notes = ?');
            values.push(data.notes);
        }
        if (data.actual_sets !== undefined) {
            updates.push('actual_sets = ?');
            values.push(data.actual_sets);
        }
        if (data.actual_reps !== undefined) {
            updates.push('actual_reps = ?');
            values.push(JSON.stringify(data.actual_reps));
        }
        if (data.actual_measurement !== undefined) {
            updates.push('actual_measurement = ?');
            values.push(JSON.stringify(data.actual_measurement));
        }
        if (data.completed !== undefined) {
            updates.push('completed = ?');
            values.push(data.completed ? 1 : 0);
        }
        if (data.is_pr !== undefined) {
            updates.push('is_pr = ?');
            values.push(data.is_pr ? 1 : 0);
        }

        updates.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await this.db
            .prepare(`UPDATE workout_components SET ${updates.join(', ')} WHERE id = ?`)
            .bind(...values)
            .run();

        return this.getById(id);
    }

    async delete(id: string): Promise<boolean> {
        await this.db.prepare('DELETE FROM workout_components WHERE id = ?').bind(id).run();
        return true;
    }

    async deleteByWorkoutId(workoutId: string): Promise<boolean> {
        await this.db
            .prepare('DELETE FROM workout_components WHERE workout_id = ?')
            .bind(workoutId)
            .run();
        return true;
    }

    private mapRow(row: any): WorkoutComponent {
        return {
            id: row.id,
            workout_id: row.workout_id,
            exercise_id: row.exercise_id,
            order_index: row.order_index,
            sets: row.sets,
            min_reps: row.min_reps,
            max_reps: row.max_reps,
            target_reps: row.target_reps,
            measurement_type: row.measurement_type,
            measurement_value: row.measurement_value,
            measurement_unit: row.measurement_unit,
            rest_seconds: row.rest_seconds,
            notes: row.notes,
            actual_sets: row.actual_sets,
            actual_reps: row.actual_reps ? JSON.parse(row.actual_reps) : [],
            actual_measurement: row.actual_measurement ? JSON.parse(row.actual_measurement) : [],
            completed: Boolean(row.completed),
            is_pr: Boolean(row.is_pr),
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    }
}
