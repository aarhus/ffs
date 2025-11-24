# Finlay Backend API Documentation

This directory contains documentation for the Cloudflare Workers backend, including API routes, database schema, middleware, and deployment procedures.

## Quick Navigation

### Getting Started

- **[README.md](./README.md)** - Backend overview and quick start (this file)
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview

### Backend Development

- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Backend integration guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details

### Reference

- **[FILES_INVENTORY.md](./FILES_INVENTORY.md)** - File structure and organization
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference for common tasks

## Finlay Backend API

RESTful backend for the Finlay fitness tracking application, built on **Cloudflare Workers** with **D1 SQLite database**.

## Quick Start

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create and setup D1 database
wrangler d1 create finlay-db
# Update wrangler.toml with your database_id

# 3. Run migrations
wrangler d1 execute finlay-db --file=./migrations/0001_init.sql

# 4. Start local dev server
npm run dev

# 5. Server runs on http://localhost:8787
```

## Tech Stack

- **Runtime**: Cloudflare Workers (Edge Computing)
- **Database**: Cloudflare D1 (SQLite)
- **Router**: itty-router
- **Language**: TypeScript
- **Type Definitions**: Cloudflare Workers Types

## Features

✅ **User Management**

- Email/password user creation (Firebase signup integration)
- User profile retrieval and updates
- Role-based access (TRAINER, CLIENT, ADMIN)

✅ **Database Integration**

- D1 SQLite with proper schema
- Foreign key constraints
- Indexed queries for performance

✅ **API Standards**

- RESTful design
- JSON request/response
- Proper HTTP status codes
- Error handling with codes and messages

✅ **Security**

- CORS middleware
- Firebase authentication integration ready
- Type-safe request/response handling

## Project Structure

```
server/
├── migrations/
│   └── 0001_init.sql           # Database schema
├── src/
│   ├── index.ts                # Main Worker handler
│   ├── middleware/
│   │   ├── cors.ts             # CORS handling
│   │   ├── errorHandler.ts     # Error formatting
│   │   └── auth.ts             # Firebase auth validation
│   ├── routes/
│   │   ├── auth.ts             # User registration/auth
│   │   ├── users.ts            # User CRUD
│   │   ├── workouts.ts         # Workout endpoints
│   │   ├── goals.ts            # Goal endpoints
│   │   ├── nutrition.ts        # Nutrition log endpoints
│   │   └── notifications.ts    # FCM token management
│   └── models/
│       └── index.ts            # Database models
├── .gitignore
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## API Endpoints

### Authentication (POST endpoints return user object)

```
POST   /api/auth/register           Register new user (after Firebase signup)
GET    /api/auth/user/:firebaseUid  Get user by Firebase UID
```

### Users

```
GET    /api/users/:id               Get user profile
PATCH  /api/users/:id               Update user profile
DELETE /api/users/:id               Delete user account
```

### Workouts (In Progress)

```
GET    /api/workouts                Get all user workouts
POST   /api/workouts                Create new workout
PUT    /api/workouts/:id            Update workout
DELETE /api/workouts/:id            Delete workout
```

### Goals (In Progress)

```
GET    /api/goals                   Get all user goals
POST   /api/goals                   Create new goal
PUT    /api/goals/:id               Update goal
DELETE /api/goals/:id               Delete goal
```

### Nutrition (In Progress)

```
GET    /api/nutrition               Get nutrition logs
POST   /api/nutrition               Log meal/nutrition
DELETE /api/nutrition/:id           Delete log entry
```

### Notifications (In Progress)

```
POST   /api/notifications/tokens    Store FCM notification token
GET    /api/notifications/tokens    Retrieve user tokens
```

## Database Models

### User

```typescript
{
  id: number
  firebase_uid: string // Unique identifier from Firebase
  email: string // Unique email
  name: string // Display name
  role: "TRAINER" | "CLIENT" | "ADMIN"
  avatar: string | null // Profile picture URL
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}
```

### NotificationToken

```typescript
{
  id: number
  user_id: number // FK to users.id
  fcm_token: string // Firebase Cloud Messaging token
  device_name: string // Device identifier
  created_at: string
}
```

### Workout

```typescript
{
  id: number
  user_id: number // FK to users.id
  trainer_id: number | null // FK to trainer's users.id
  name: string
  description: string | null
  date: string // ISO date
  duration_minutes: number
  intensity: "LOW" | "MEDIUM" | "HIGH"
  created_at: string
  updated_at: string
}
```

### Goal

```typescript
{
  id: number
  user_id: number
  title: string
  metric: "kg" | "reps" | "cm" | "mins" | "%"
  target: number // Target value
  current: number // Current progress
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED"
  created_at: string
  updated_at: string
}
```

### NutritionLog

```typescript
{
  id: number
  user_id: number
  name: string // Food/meal name
  calories: number
  protein: number
  carbs: number
  fat: number
  date: string
  created_at: string
}
```

## Development

### Local Development

```bash
npm run dev
```

Runs on `http://localhost:8787` with automatic reload.

### Type Checking

```bash
npm run typecheck
```

Validates TypeScript without building.

### Database Queries

```bash
# Interactive D1 shell
wrangler d1 execute finlay-db --interactive

# Execute specific query
wrangler d1 execute finlay-db --command "SELECT * FROM users LIMIT 5"
```

## Deployment

### Prerequisites

1. Cloudflare account with verified domain
2. `wrangler` authenticated: `wrangler login`
3. D1 database created (see Setup section)

### Deploy

```bash
npm run deploy
```

### Production Environment

Create a production environment in `wrangler.toml`:

```toml
[env.production]
vars = { ENVIRONMENT = "production" }
```

Deploy to production:

```bash
wrangler publish --env production
```

## Integration with Frontend

The frontend (`src/services/api.js`) needs to be configured to call the backend

// User signup creates Firebase user, then calls:
POST /api/auth/register
Body: {
firebaseUid: user.user_id,
email: user.email,
name: user.displayName,
role: 'CLIENT'
}

````

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "status": 400
  }
}
````

Common error codes:

- `INVALID_REQUEST` - Missing or invalid input
- `UNAUTHORIZED` - Auth token missing/invalid
- `USER_NOT_FOUND` - User doesn't exist
- `USER_EXISTS` - User already registered
- `INTERNAL_ERROR` - Server error

## Security Considerations

1. **CORS**: Configured for localhost development, update for production
2. **Firebase Integration**: Token validation middleware ready to implement
3. **Database**: Uses parameterized queries to prevent SQL injection
4. **Type Safety**: Full TypeScript strict mode enforcement

## Contributing

When adding new endpoints:

1. Create route handler in `src/routes/`
2. Add model methods in `src/models/index.ts` if needed
3. Use error utilities from `src/middleware/errorHandler.ts`
4. Return proper HTTP status codes
5. Run `npm run typecheck` before committing

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Guide](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/cli-wrangler/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## License

Part of the Finlay fitness tracking application.

## Support

For issues or questions:

1. Check the SETUP.md guide for common issues
2. Review Cloudflare Workers documentation
3. Check D1 database status and quota
