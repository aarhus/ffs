# Workout System Refactoring - Summary

## Overview

The workout system has been refactored to use a normalized database structure with a centralized exercise library managed by admins and workout components that reference exercises from this library.

## Database Changes

### New Tables

#### 1. `exercise_library`

Admin-managed central repository of exercises.

**Columns:**

- `id` (TEXT PRIMARY KEY)
- `name` (TEXT UNIQUE) - Exercise name
- `description` (TEXT) - Detailed description
- `category` (TEXT) - e.g., 'STRENGTH', 'CARDIO', 'FLEXIBILITY', 'SPORT'
- `muscle_groups` (TEXT) - JSON array of muscle groups targeted
- `equipment` (TEXT) - Required equipment
- `video_url` (TEXT) - Link to demonstration video
- `instructions` (TEXT) - How to perform the exercise
- `is_active` (INTEGER) - Boolean flag for active/inactive
- `created_at`, `updated_at` (DATETIME)

**Initial Data:** Seeded with 20 common exercises

#### 2. `workout_components`

Normalized exercise data within workouts.

**Columns:**

- `id` (TEXT PRIMARY KEY)
- `workout_id` (TEXT FK → workouts.id)
- `exercise_id` (TEXT FK → exercise_library.id)
- `order_index` (INTEGER) - Position in workout
- `sets` (INTEGER) - Number of sets
- `min_reps` (INTEGER) - Minimum reps for rep ranges
- `max_reps` (INTEGER) - Maximum reps for rep ranges
- `target_reps` (INTEGER) - Fixed rep target
- `measurement_type` (TEXT) - 'REPS', 'TIME', 'DISTANCE', 'WEIGHT'
- `measurement_value` (REAL) - Value for measurements
- `measurement_unit` (TEXT) - 'kg', 'lbs', 'seconds', 'minutes', 'meters', 'km'
- `rest_seconds` (INTEGER) - Rest time between sets
- `notes` (TEXT) - Exercise-specific notes
- `actual_sets` (INTEGER) - Actual sets completed
- `actual_reps` (TEXT) - JSON array of actual reps per set
- `actual_measurement` (TEXT) - JSON array of actual weights per set
- `completed` (INTEGER) - Boolean completion status
- `is_pr` (INTEGER) - Personal record flag (calculated by backend)
- `created_at`, `updated_at` (DATETIME)

### Modified Tables

#### `workouts`

- **Kept:** `exercises` column (JSON) for backward compatibility
- **New behavior:** Now also uses `workout_components` table for normalized data
- Both approaches supported to allow gradual migration

## Backend Changes

### New Models (`server/models/exercises.ts`)

#### `ExerciseLibraryModel`

CRUD operations for exercise library:

- `getAll(activeOnly)` - Get all exercises
- `getById(id)` - Get single exercise
- `getByCategory(category)` - Filter by category
- `search(query)` - Search by name/description
- `create(data)` - Create new exercise (admin only)
- `update(id, data)` - Update exercise (admin only)
- `delete(id)` - Delete exercise (admin only)

#### `WorkoutComponentModel`

CRUD operations for workout components:

- `getByWorkoutId(workoutId)` - Get all components for a workout
- `getById(id)` - Get single component
- `create(data)` - Create component
- `update(id, data)` - Update component
- `delete(id)` - Delete component
- `deleteByWorkoutId(workoutId)` - Delete all components for a workout

### New Routes (`server/routes/exercises.ts`)

**Exercise Library API:**

- `GET /api/exercises` - List exercises (supports filtering & search)
- `GET /api/exercises/:id` - Get single exercise
- `POST /api/exercises` - Create exercise (ADMIN only)
- `PATCH /api/exercises/:id` - Update exercise (ADMIN only)
- `DELETE /api/exercises/:id` - Delete exercise (ADMIN only)

### Modified Routes (`server/routes/workouts.ts`)

**Updated Workout API:**

- `POST /api/workouts` - Now creates workout_components in addition to workout

  - Accepts both old format (`exercises`) and new format (`components`)
  - Automatically creates normalized workout_components

- `GET /api/workouts` - Now includes `components` array with enriched exercise data

  - Each component includes full exercise details from exercise_library
  - Backward compatible (still returns `exercises` field)

- `GET /api/workouts/:id` - Returns components with exercise details

## Frontend Changes

### API Service (`src/services/api.ts`)

**New Types:**

```typescript
ExerciseLibraryResponse
WorkoutComponentResponse
```

**New Functions:**

- `getExercises(params?)` - Fetch exercise library
- `getExercise(id)` - Get single exercise
- `createExercise(data)` - Create exercise (admin)
- `updateExercise(id, data)` - Update exercise (admin)
- `deleteExercise(id)` - Delete exercise (admin)

**Modified:**

- `WorkoutResponse` now includes `components?: WorkoutComponentResponse[]`

### Components

#### `AddWorkout.vue`

**Changes:**

- Now fetches exercises from API on mount
- Stores exercise IDs when adding to workout
- Dropdown shows exercise objects from database
- Maintains backward compatibility with old format

**TODO:**

- Add fields for new workout component properties:
  - Rep ranges (min/max reps)
  - Measurement type selector
  - Rest timer input
  - Exercise-specific notes

#### `TrainingLog.vue`

**Changes:**

- Updated to display components when available
- Falls back to legacy exercises format
- Shows enriched exercise data (name, category, etc.)

## Migration Strategy

### Phase 1: Database ✅

- Run migration `0009_workout_refactor.sql`
- Creates new tables with seed data
- Existing workouts remain in old format

### Phase 2: Backend ✅

- Models and routes support both formats
- New workouts create normalized components
- Old workouts still work via exercises JSON column

### Phase 3: Frontend (In Progress)

- ✅ Exercise library integration
- ✅ Basic component creation
- 🔄 Enhanced UI for new fields
- ⏳ Display improvements in TrainingLog

### Phase 4: Admin UI (Deferred)

- Exercise library management interface
- Add/edit/delete exercises
- Category management
- Video URL management

## Benefits

1. **Data Normalization:** No duplicate exercise definitions
2. **Centralized Management:** Admins control exercise library
3. **Rich Metadata:** Exercises include categories, muscle groups, instructions
4. **PR Tracking:** Backend can calculate personal records
5. **Better Reporting:** Query exercises across all workouts
6. **Flexible Measurements:** Support reps, time, distance, weight
7. **Backward Compatible:** Old format still works

## Next Steps

1. **Enhance AddWorkout UI:**

   - Add rep range inputs (min/max)
   - Add measurement type selector
   - Add rest timer input
   - Display exercise details (category, muscle groups, instructions)

2. **Update TrainingLog Display:**

   - Show exercise categories
   - Display PR indicators
   - Show measurement details

3. **Create Admin Interface:**

   - Exercise library management page
   - Bulk import/export
   - Category management

4. **Data Migration Script:**
   - Convert old workouts to new format
   - Extract unique exercises into library
   - Create workout_components from old data

## API Examples

### Create Workout (New Format)

```json
POST /api/workouts
{
  "name": "Upper Body Push",
  "date": "2025-11-26T10:00:00Z",
  "components": [
    {
      "exercise_id": "ex_bench_press",
      "sets": 4,
      "min_reps": 8,
      "max_reps": 12,
      "measurement_type": "WEIGHT",
      "measurement_unit": "kg",
      "rest_seconds": 120
    },
    {
      "exercise_id": "ex_shoulder_press",
      "sets": 3,
      "target_reps": 10,
      "rest_seconds": 90
    }
  ],
  "perceived_exertion": 8,
  "completed": true
}
```

### Response

```json
{
  "id": "workout-uuid",
  "name": "Upper Body Push",
  "components": [
    {
      "id": "component-uuid-1",
      "exercise_id": "ex_bench_press",
      "exercise": {
        "id": "ex_bench_press",
        "name": "Bench Press",
        "category": "STRENGTH",
        "muscle_groups": ["chest", "triceps", "shoulders"],
        "equipment": "BARBELL"
      },
      "sets": 4,
      "min_reps": 8,
      "max_reps": 12,
      "order_index": 0
    }
  ]
}
```

## Files Changed

### New Files

- `migrations/0009_workout_refactor.sql`
- `server/models/exercises.ts`
- `server/routes/exercises.ts`
- `server/docs/workout-refactor-summary.md`

### Modified Files

- `server/index.ts` - Registered exercise routes
- `server/models/index.ts` - Export new models
- `server/routes/workouts.ts` - Support new format
- `src/services/api.ts` - New exercise API functions
- `src/components/AddWorkout.vue` - Load exercises from API
- `src/components/TrainingLog.vue` - Display components
