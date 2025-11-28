/**
 * Measurement conversion utilities
 * Handles normalization of measurement values to base units (seconds, meters, kg, watts, points)
 */

export interface MeasurementType {
  id: string;
  name: string;
  category: string;
  base_unit: string;
  display_unit: string;
  conversion_factor: number;
  description: string;
}

/**
 * Get a measurement type by ID from the database
 */
export async function getMeasurementType(db: D1Database, typeId: string): Promise<MeasurementType | null> {
  const result = await db
    .prepare('SELECT * FROM measurement_types WHERE id = ?')
    .bind(typeId)
    .first();

  if (!result) return null;

  return {
    id: result.id as string,
    name: result.name as string,
    category: result.category as string,
    base_unit: result.base_unit as string,
    display_unit: result.display_unit as string,
    conversion_factor: result.conversion_factor as number,
    description: result.description as string,
  };
}

/**
 * Normalize a measurement value to its base unit
 * @param displayValue - The value entered by the user (e.g., 5 for "5 minutes")
 * @param measurementTypeId - The measurement type ID (e.g., 'measure_time_minutes')
 * @param db - Database instance
 * @returns The normalized value in base units (e.g., 300 seconds)
 */
export async function normalizeMeasurement(
  db: D1Database,
  displayValue: number,
  measurementTypeId: string
): Promise<number> {
  const measurementType = await getMeasurementType(db, measurementTypeId);
  
  if (!measurementType) {
    console.warn(`Unknown measurement type: ${measurementTypeId}, returning raw value`);
    return displayValue;
  }

  // Multiply display value by conversion factor to get base unit value
  // e.g., 5 minutes * 60 = 300 seconds
  return displayValue * measurementType.conversion_factor;
}

/**
 * Denormalize a measurement value from base unit to display unit
 * @param baseValue - The value stored in base units (e.g., 300 seconds)
 * @param measurementTypeId - The measurement type ID (e.g., 'measure_time_minutes')
 * @param db - Database instance
 * @returns The display value (e.g., 5 minutes)
 */
export async function denormalizeMeasurement(
  db: D1Database,
  baseValue: number,
  measurementTypeId: string
): Promise<number> {
  const measurementType = await getMeasurementType(db, measurementTypeId);
  
  if (!measurementType) {
    console.warn(`Unknown measurement type: ${measurementTypeId}, returning raw value`);
    return baseValue;
  }

  // Divide base value by conversion factor to get display value
  // e.g., 300 seconds / 60 = 5 minutes
  return baseValue / measurementType.conversion_factor;
}
