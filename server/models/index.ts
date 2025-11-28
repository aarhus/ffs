// Type definition for D1Database (Cloudflare Workers D1)
type D1Database = any;

export { ExerciseLibraryModel, WorkoutComponentModel } from './exercises';
export { UserInjuryModel, InjuryDefinitionModel } from './injuries';

export interface User {
  id: number;
  firebase_uid: string;
  email: string;
  name: string;
  role: 'TRAINER' | 'CLIENT' | 'ADMIN';
  avatar: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationToken {
  id: number;
  user_id: number;
  fcm_token: string;
  device_name: string;
  created_at: string;
}

export interface Workout {
  id: number;
  user_id: number;
  trainer_id: number | null;
  name: string;
  description: string | null;
  date: string;
  duration_minutes: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  metric: 'kg' | 'reps' | 'cm' | 'mins' | '%';
  target: number;
  current: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface NutritionLog {
  id: number;
  user_id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  created_at: string;
}

export class UserModel {

  private db: D1Database

  constructor(db: D1Database) {
    this.db = db;
  }


  async getByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE firebase_uid = ?')
      .bind(firebaseUid)
      .first<User>();
    return result || null;
  }

  async getById(id: number): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<User>();
    return result || null;
  }

  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const now = new Date().toISOString();
    const result = await this.db.prepare(
      `INSERT INTO users (firebase_uid, email, name, role, avatar, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`
    )
      .bind(user.firebase_uid, user.email, user.name, user.role, user.avatar, user.notes || null, now, now)
      .first<User>();

    if (!result) throw new Error('Failed to create user');
    return result;
  }

  async update(id: number, updates: Partial<Omit<User, 'id' | 'firebase_uid' | 'email' | 'created_at'>>): Promise<User> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }
    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    if (fields.length === 0) {
      return this.getById(id) as Promise<User>;
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    console.log('Updating user ID:', id);
    console.log('Updating user with fields:', `UPDATE users SET ${fields.join(', ')} WHERE id = ? RETURNING *`);
    console.log('Updating user with values:', values);

    const result = await this.db
      .prepare(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ? RETURNING *`
      )
      .bind(...values)
      .first<User>();

    if (!result) throw new Error('Failed to update user');
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  }
}

export class NotificationTokenModel {
  constructor(private db: D1Database) { }

  async create(token: Omit<NotificationToken, 'id' | 'created_at'>): Promise<NotificationToken> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `INSERT INTO notification_tokens (user_id, fcm_token, device_name, created_at)
         VALUES (?, ?, ?, ?)
         RETURNING *`
      )
      .bind(token.user_id, token.fcm_token, token.device_name, now)
      .first<NotificationToken>();

    if (!result) throw new Error('Failed to create notification token');
    return result;
  }

  async getByUserId(userId: number): Promise<NotificationToken[]> {
    const result = await this.db
      .prepare('SELECT * FROM notification_tokens WHERE user_id = ?')
      .bind(userId)
      .all<NotificationToken>();

    return result.results || [];
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db.prepare('DELETE FROM notification_tokens WHERE fcm_token = ?').bind(token).run();
  }
}

export class WorkoutModel {
  constructor(private db: D1Database) { }

  async getByUserId(userId: number): Promise<Workout[]> {
    const result = await this.db
      .prepare('SELECT * FROM workouts WHERE user_id = ? ORDER BY date DESC')
      .bind(userId)
      .all<Workout>();

    return result.results || [];
  }

  async create(workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>): Promise<Workout> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `INSERT INTO workouts (user_id, trainer_id, name, description, date, duration_minutes, intensity, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`
      )
      .bind(
        workout.user_id,
        workout.trainer_id,
        workout.name,
        workout.description,
        workout.date,
        workout.duration_minutes,
        workout.intensity,
        now,
        now
      )
      .first<Workout>();

    if (!result) throw new Error('Failed to create workout');
    return result;
  }
}

export class GoalModel {

  constructor(private db: D1Database) { }

  async getByUserId(userId: number): Promise<Goal[]> {
    const result = await this.db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<Goal>();

    return result.results || [];
  }

  async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `INSERT INTO goals (user_id, title, metric, target, current, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`
      )
      .bind(goal.user_id, goal.title, goal.metric, goal.target, goal.current, goal.status, now, now)
      .first<Goal>();

    if (!result) throw new Error('Failed to create goal');
    return result;
  }
}

export class NutritionModel {
  constructor(private db: D1Database) { }

  async getByUserId(userId: number, limit: number = 100): Promise<NutritionLog[]> {
    const result = await this.db
      .prepare('SELECT * FROM nutrition_logs WHERE user_id = ? ORDER BY date DESC LIMIT ?')
      .bind(userId, limit)
      .all<NutritionLog>();

    return result.results || [];
  }

  async create(log: Omit<NutritionLog, 'id' | 'created_at'>): Promise<NutritionLog> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `INSERT INTO nutrition_logs (user_id, name, calories, protein, carbs, fat, date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`
      )
      .bind(log.user_id, log.name, log.calories, log.protein, log.carbs, log.fat, log.date, now)
      .first<NutritionLog>();

    if (!result) throw new Error('Failed to create nutrition log');
    return result;
  }
}
