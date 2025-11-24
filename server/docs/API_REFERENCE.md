# API Reference

Complete reference for all Finlay backend API endpoints.

**Base URL**: `/api`

**Authentication**: All endpoints (except `/api/health`) require a Firebase JWT token in the `Authorization` header:

```
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
```

---

## Authentication

### POST /api/auth/register

Register a new user after Firebase signup.

**Request Body**:

```json
{
  "firebaseUid": "firebase-user-uid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CLIENT",
  "avatar": null
}
```

**Response** (201):

```json
{
  "id": 1,
  "firebase_uid": "firebase-user-uid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CLIENT",
  "avatar": null,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/auth/me

Get authenticated user information (from JWT token).

**Response** (200):

```json
{
  "id": 1,
  "firebase_uid": "firebase-user-uid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CLIENT",
  "avatar": "https://...",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

---

## Users

### GET /api/users/:id

Get user profile by ID.

**Parameters**:

- `id` - User ID (number)

**Response** (200):

```json
{
  "id": 1,
  "firebase_uid": "firebase-user-uid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CLIENT",
  "avatar": "https://...",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### PATCH /api/users/:id

Update user profile.

**Parameters**:

- `id` - User ID (number)

**Request Body** (partial update allowed):

```json
{
  "name": "Jane Doe",
  "avatar": "https://new-avatar-url.com"
}
```

**Response** (200):

```json
{
  "id": 1,
  "firebase_uid": "firebase-user-uid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "role": "CLIENT",
  "avatar": "https://new-avatar-url.com",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T12:30:00.000Z"
}
```

### DELETE /api/users/:id

Delete user account.

**Parameters**:

- `id` - User ID (number)

**Response** (200):

```json
{
  "message": "User deleted successfully"
}
```

---

## Avatar

### GET /api/avatar/

Get authenticated user's avatar URL with automatic Gravatar fallback.

**Response** (200):

```json
{
  "avatarUrl": "https://r2-signed-url-or-gravatar-url"
}
```

### POST /api/avatar/upload

Upload custom avatar image to R2 storage.

**Request**: FormData with `image` field

**Validation**:

- Max size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP
- Max dimensions: 2048x2048px

**Response** (200):

```json
{
  "success": true,
  "avatarUrl": "https://r2-bucket-url/avatars/firebase-uid"
}
```

### DELETE /api/avatar/

Delete custom avatar and revert to Gravatar.

**Response** (200):

```json
{
  "success": true,
  "message": "Avatar deleted, reverted to Gravatar"
}
```

### POST /api/avatar/gravatar

Explicitly set avatar to Gravatar (removes custom avatar).

**Response** (200):

```json
{
  "success": true,
  "gravatarUrl": "https://gravatar.com/avatar/..."
}
```

---

## Workouts

### GET /api/workouts

List workouts with pagination and filters.

**Query Parameters**:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `user_id` - Filter by user ID (trainers only)
- `date_from` - Start date (ISO string)
- `date_to` - End date (ISO string)
- `completed` - Filter by completion (0 or 1)

**Response** (200):

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "trainer_id": null,
      "name": "Morning Run",
      "description": "5K run in the park",
      "date": "2024-01-01",
      "duration_minutes": 30,
      "intensity": "MEDIUM",
      "completed": 1,
      "exercises": null,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### POST /api/workouts

Create new workout.

**Request Body**:

```json
{
  "name": "Morning Run",
  "description": "5K run in the park",
  "date": "2024-01-01",
  "duration_minutes": 30,
  "intensity": "MEDIUM",
  "completed": 1,
  "exercises": null
}
```

**Response** (201):

```json
{
  "id": 1,
  "user_id": 1,
  "trainer_id": null,
  "name": "Morning Run",
  "description": "5K run in the park",
  "date": "2024-01-01",
  "duration_minutes": 30,
  "intensity": "MEDIUM",
  "completed": 1,
  "exercises": null,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/workouts/:id

Get specific workout by ID.

**Response** (200): Same as single workout object above

### PATCH /api/workouts/:id

Update workout.

**Request Body** (partial update):

```json
{
  "completed": 1,
  "duration_minutes": 45
}
```

**Response** (200): Updated workout object

### DELETE /api/workouts/:id

Delete workout.

**Response** (200):

```json
{
  "message": "Workout deleted successfully"
}
```

---

## Goals

### GET /api/goals

List goals with pagination and filters.

**Query Parameters**:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `user_id` - Filter by user ID (trainers only)
- `status` - Filter by status (ACTIVE, COMPLETED, ARCHIVED)

**Response** (200):

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Lose 10kg",
      "metric": "kg",
      "target": 70,
      "current": 75,
      "status": "ACTIVE",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### POST /api/goals

Create new goal.

**Request Body**:

```json
{
  "title": "Lose 10kg",
  "metric": "kg",
  "target": 70,
  "current": 75,
  "status": "ACTIVE"
}
```

**Response** (201): Goal object

### GET /api/goals/:id

Get specific goal.

**Response** (200): Goal object

### PATCH /api/goals/:id

Update goal.

**Request Body** (partial):

```json
{
  "current": 72,
  "status": "ACTIVE"
}
```

**Response** (200): Updated goal object

### DELETE /api/goals/:id

Delete goal.

**Response** (200):

```json
{
  "message": "Goal deleted successfully"
}
```

---

## Nutrition

### GET /api/nutrition

List nutrition logs with pagination and filters.

**Query Parameters**:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `user_id` - Filter by user ID (trainers only)
- `date_from` - Start date (ISO string)
- `date_to` - End date (ISO string)

**Response** (200):

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Chicken Salad",
      "calories": 450,
      "protein": 35,
      "carbs": 25,
      "fat": 20,
      "date": "2024-01-01",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6
  }
}
```

### POST /api/nutrition

Log meal/nutrition.

**Request Body**:

```json
{
  "name": "Chicken Salad",
  "calories": 450,
  "protein": 35,
  "carbs": 25,
  "fat": 20,
  "date": "2024-01-01"
}
```

**Response** (201): Nutrition log object

### GET /api/nutrition/:id

Get specific nutrition log.

**Response** (200): Nutrition log object

### PATCH /api/nutrition/:id

Update nutrition log.

**Response** (200): Updated nutrition log object

### DELETE /api/nutrition/:id

Delete nutrition log.

**Response** (200):

```json
{
  "message": "Nutrition log deleted successfully"
}
```

---

## Measurements

### GET /api/measurements

List body measurements with pagination and filters.

**Query Parameters**:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `user_id` - Filter by user ID (trainers only)
- `date_from` - Start date (ISO string)
- `date_to` - End date (ISO string)

**Response** (200):

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "date": "2024-01-01",
      "weight_kg": 75.5,
      "height_cm": 175,
      "body_fat_percent": 18.5,
      "muscle_mass_kg": 60,
      "chest_cm": 95,
      "waist_cm": 80,
      "hips_cm": 95,
      "thigh_cm": 55,
      "arm_cm": 35,
      "notes": "Morning measurement",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "totalPages": 2
  }
}
```

### POST /api/measurements

Log body measurements.

**Request Body** (all fields optional except date):

```json
{
  "date": "2024-01-01",
  "weight_kg": 75.5,
  "height_cm": 175,
  "body_fat_percent": 18.5,
  "muscle_mass_kg": 60,
  "chest_cm": 95,
  "waist_cm": 80,
  "hips_cm": 95,
  "thigh_cm": 55,
  "arm_cm": 35,
  "notes": "Morning measurement"
}
```

**Response** (201): Measurement object

### GET /api/measurements/:id

Get specific measurement.

**Response** (200): Measurement object

### PATCH /api/measurements/:id

Update measurement.

**Response** (200): Updated measurement object

### DELETE /api/measurements/:id

Delete measurement.

**Response** (200):

```json
{
  "message": "Measurement deleted successfully"
}
```

---

## Habits

### GET /api/habits

List habits with pagination and filters.

**Query Parameters**:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `user_id` - Filter by user ID (trainers only)
- `status` - Filter by status (ACTIVE, COMPLETED, ARCHIVED)

**Response** (200):

```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Drink 2L water daily",
      "description": "Stay hydrated throughout the day",
      "frequency": "DAILY",
      "target_count": 1,
      "current_streak": 7,
      "best_streak": 14,
      "status": "ACTIVE",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

### POST /api/habits

Create new habit.

**Request Body**:

```json
{
  "name": "Drink 2L water daily",
  "description": "Stay hydrated throughout the day",
  "frequency": "DAILY",
  "target_count": 1,
  "current_streak": 0,
  "best_streak": 0,
  "status": "ACTIVE"
}
```

**Frequency values**: `DAILY`, `WEEKLY`, `MONTHLY`

**Response** (201): Habit object

### GET /api/habits/:id

Get specific habit.

**Response** (200): Habit object

### PATCH /api/habits/:id

Update habit.

**Request Body** (partial):

```json
{
  "current_streak": 8,
  "best_streak": 14
}
```

**Response** (200): Updated habit object

### DELETE /api/habits/:id

Delete habit.

**Response** (200):

```json
{
  "message": "Habit deleted successfully"
}
```

---

## Notifications

### POST /api/notifications/tokens

Store FCM notification token for push notifications.

**Request Body**:

```json
{
  "fcm_token": "firebase-cloud-messaging-token",
  "device_name": "iPhone 14 Pro"
}
```

**Response** (201):

```json
{
  "id": 1,
  "user_id": 1,
  "fcm_token": "firebase-cloud-messaging-token",
  "device_name": "iPhone 14 Pro",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/notifications/tokens

Get all notification tokens for authenticated user.

**Response** (200):

```json
[
  {
    "id": 1,
    "user_id": 1,
    "fcm_token": "firebase-cloud-messaging-token",
    "device_name": "iPhone 14 Pro",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### DELETE /api/notifications/tokens/:id

Delete notification token.

**Parameters**:

- `id` - Token ID (number)

**Response** (200):

```json
{
  "message": "Notification token deleted successfully"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "status": 400
  }
}
```

### Common Error Codes

- `INVALID_REQUEST` (400) - Missing or invalid request parameters
- `UNAUTHORIZED` (401) - Missing or invalid authentication token
- `FORBIDDEN` (403) - Insufficient permissions
- `USER_NOT_FOUND` (404) - User does not exist
- `NOT_FOUND` (404) - Resource not found
- `USER_EXISTS` (409) - User already registered
- `INTERNAL_ERROR` (500) - Server error

---

## Rate Limits

No rate limits currently enforced in development. Production limits TBD.

## Pagination

All list endpoints support pagination with the following query parameters:

- `page` - Page number (starts at 1)
- `limit` - Items per page (default: 20, max: 100)

Pagination response format:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

## Access Control

- **ADMIN** - Can access all users' data
- **TRAINER** - Can access their assigned clients' data
- **CLIENT** - Can only access their own data

Access is enforced automatically based on JWT token role.
