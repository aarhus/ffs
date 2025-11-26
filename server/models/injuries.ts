// Type definition for D1Database
type D1Database = any;

export interface UserInjury {
  id: number;
  user_id: number;
  injury_type: string;
  details: string | null;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | null;
  status: 'ACTIVE' | 'RECOVERING' | 'RESOLVED';
  date_reported: string;
  date_resolved: string | null;
  created_at: string;
  updated_at: string;
}

export interface InjuryDefinition {
  id: number;
  name: string;
  category: string;
  description: string | null;
  affected_areas: string; // JSON string
  recommended_modifications: string; // JSON string
  is_active: number;
  created_at: string;
  updated_at: string;
}

export class UserInjuryModel {
  constructor(private db: D1Database) {}

  async getByUserId(userId: number): Promise<UserInjury[]> {
    const result = await this.db
      .prepare('SELECT * FROM user_injuries WHERE user_id = ? ORDER BY date_reported DESC')
      .bind(userId)
      .all();
    return result.results || [];
  }

  async getById(id: number): Promise<UserInjury | null> {
    const result = await this.db
      .prepare('SELECT * FROM user_injuries WHERE id = ?')
      .bind(id)
      .first();
    return result || null;
  }

  async create(injury: Omit<UserInjury, 'id' | 'created_at' | 'updated_at'>): Promise<UserInjury> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `INSERT INTO user_injuries (user_id, injury_type, details, severity, status, date_reported, date_resolved, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`
      )
      .bind(
        injury.user_id,
        injury.injury_type,
        injury.details,
        injury.severity,
        injury.status,
        injury.date_reported,
        injury.date_resolved,
        now,
        now
      )
      .first();

    if (!result) throw new Error('Failed to create user injury');
    return result as UserInjury;
  }

  async update(
    id: number,
    updates: Partial<Omit<UserInjury, 'id' | 'user_id' | 'created_at'>>
  ): Promise<UserInjury> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.injury_type !== undefined) {
      fields.push('injury_type = ?');
      values.push(updates.injury_type);
    }
    if (updates.details !== undefined) {
      fields.push('details = ?');
      values.push(updates.details);
    }
    if (updates.severity !== undefined) {
      fields.push('severity = ?');
      values.push(updates.severity);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.date_reported !== undefined) {
      fields.push('date_reported = ?');
      values.push(updates.date_reported);
    }
    if (updates.date_resolved !== undefined) {
      fields.push('date_resolved = ?');
      values.push(updates.date_resolved);
    }

    if (fields.length === 0) {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Injury not found');
      return existing;
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const result = await this.db
      .prepare(`UPDATE user_injuries SET ${fields.join(', ')} WHERE id = ? RETURNING *`)
      .bind(...values)
      .first();

    if (!result) throw new Error('Failed to update user injury');
    return result as UserInjury;
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM user_injuries WHERE id = ?').bind(id).run();
  }

  async getActiveByUserId(userId: number): Promise<UserInjury[]> {
    const result = await this.db
      .prepare('SELECT * FROM user_injuries WHERE user_id = ? AND status != ? ORDER BY date_reported DESC')
      .bind(userId, 'RESOLVED')
      .all();
    return result.results || [];
  }
}

export class InjuryDefinitionModel {
  constructor(private db: D1Database) {}

  async getAll(): Promise<InjuryDefinition[]> {
    const result = await this.db
      .prepare('SELECT * FROM injury_definitions WHERE is_active = 1 ORDER BY category, name')
      .all();
    return result.results || [];
  }

  async getById(id: number): Promise<InjuryDefinition | null> {
    const result = await this.db
      .prepare('SELECT * FROM injury_definitions WHERE id = ?')
      .bind(id)
      .first();
    return result || null;
  }

  async getByCategory(category: string): Promise<InjuryDefinition[]> {
    const result = await this.db
      .prepare('SELECT * FROM injury_definitions WHERE category = ? AND is_active = 1 ORDER BY name')
      .bind(category)
      .all();
    return result.results || [];
  }

  async create(definition: Omit<InjuryDefinition, 'id' | 'created_at' | 'updated_at'>): Promise<InjuryDefinition> {
    const now = new Date().toISOString();
    const result = await this.db
      .prepare(
        `INSERT INTO injury_definitions (name, category, description, affected_areas, recommended_modifications, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING *`
      )
      .bind(
        definition.name,
        definition.category,
        definition.description,
        definition.affected_areas,
        definition.recommended_modifications,
        definition.is_active,
        now,
        now
      )
      .first();

    if (!result) throw new Error('Failed to create injury definition');
    return result as InjuryDefinition;
  }

  async update(
    id: number,
    updates: Partial<Omit<InjuryDefinition, 'id' | 'created_at'>>
  ): Promise<InjuryDefinition> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.affected_areas !== undefined) {
      fields.push('affected_areas = ?');
      values.push(updates.affected_areas);
    }
    if (updates.recommended_modifications !== undefined) {
      fields.push('recommended_modifications = ?');
      values.push(updates.recommended_modifications);
    }
    if (updates.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.is_active);
    }

    if (fields.length === 0) {
      const existing = await this.getById(id);
      if (!existing) throw new Error('Injury definition not found');
      return existing;
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const result = await this.db
      .prepare(`UPDATE injury_definitions SET ${fields.join(', ')} WHERE id = ? RETURNING *`)
      .bind(...values)
      .first();

    if (!result) throw new Error('Failed to update injury definition');
    return result as InjuryDefinition;
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM injury_definitions WHERE id = ?').bind(id).run();
  }
}
