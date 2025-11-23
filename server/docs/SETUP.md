# Finlay Backend Setup Guide

## Overview

The backend is built on **Cloudflare Workers** with **D1 SQLite database**. It provides RESTful API endpoints for user management, workouts, goals, nutrition tracking, and notifications.

## Architecture

```
/server
├── migrations/          # Database schema migrations
│   └── 0001_init.sql   # D1 schema (users, workouts, goals, etc.)
├── src/
│   ├── index.ts        # Main Worker entry point
│   ├── middleware/     # Request handlers (CORS, errors, auth)
│   ├── routes/         # API endpoints (auth, users, workouts, etc.)
│   └── models/         # Database models and queries
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
└── wrangler.toml       # Cloudflare Workers config
```

## Prerequisites

1. **Node.js 18+** - https://nodejs.org
2. **Wrangler CLI** - `npm install -g wrangler`
3. **Cloudflare Account** - https://dash.cloudflare.com
4. **Authentication** - `wrangler login`

## Setup Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Create D1 Database

Create a new D1 database in Cloudflare:

```bash
wrangler d1 create finlay-db
```

This will output:

```
✅ Successfully created DB 'finlay-db'
Add this to your wrangler.toml:

[[d1_databases]]
binding = "DB"
database_name = "finlay-db"
database_id = "YOUR_DATABASE_ID"
```

### 3. Update wrangler.toml

Copy the `database_id` from step 2 and update `/server/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "finlay-db"
database_id = "YOUR_DATABASE_ID_HERE"  # ← Update this
```

### 4. Run Database Migration

Apply the schema to create tables:

```bash
wrangler d1 execute finlay-db --file=./migrations/0001_init.sql
```

Verify the tables were created:

```bash
wrangler d1 execute finlay-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### 5. Local Development

Start the local development server:

```bash
npm run dev
```

This will start on `http://localhost:8787` by default.

### 6. Test the API

```bash
# Health check
curl http://localhost:8787/health

# Register a new user (after Firebase signup)
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseUid": "user-uid-from-firebase",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT",
    "avatar": null
  }'

# Get user by Firebase UID
curl http://localhost:8787/api/auth/user/user-uid-from-firebase
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user after Firebase signup
- `GET /api/auth/user/:firebaseUid` - Get user by Firebase UID

### Users

- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Workouts (Coming Soon)

- `GET /api/workouts` - List user workouts
- `POST /api/workouts` - Create workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Goals (Coming Soon)

- `GET /api/goals` - List user goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Nutrition (Coming Soon)

- `GET /api/nutrition` - List nutrition logs
- `POST /api/nutrition` - Log meal
- `DELETE /api/nutrition/:id` - Delete log

### Notifications (Coming Soon)

- `POST /api/notifications/tokens` - Store FCM token
- `GET /api/notifications/tokens` - Get user tokens

## Database Schema

### users

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('TRAINER', 'CLIENT', 'ADMIN')) NOT NULL,
  avatar TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### notification_tokens

```sql
CREATE TABLE notification_tokens (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  fcm_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### workouts

```sql
CREATE TABLE workouts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  trainer_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  duration_minutes INTEGER,
  intensity TEXT CHECK(intensity IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### goals

```sql
CREATE TABLE goals (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  metric TEXT CHECK(metric IN ('kg', 'reps', 'cm', 'mins', '%')) NOT NULL,
  target REAL NOT NULL,
  current REAL NOT NULL DEFAULT 0,
  status TEXT CHECK(status IN ('ACTIVE', 'COMPLETED', 'ARCHIVED')) NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### nutrition_logs

```sql
CREATE TABLE nutrition_logs (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Environment Variables

Create a `.env.local` file for local development:

```
FRONTEND_URL=http://localhost:3001
ENVIRONMENT=development
```

These are automatically loaded by `wrangler dev`.

## Deployment

### 1. Build the Worker

```bash
npm run build
```

### 2. Deploy to Cloudflare

```bash
npm run deploy
```

This will deploy to your Cloudflare Workers account.

### 3. Update Frontend API URL

Update the API client in frontend (`src/services/api.js`) to point to the api

````

## Troubleshooting

### Database connection issues

```bash
# Test database connection
wrangler d1 execute finlay-db --command "SELECT 1"
````

### Missing database_id

```bash
# List all databases
wrangler d1 list

# Then update wrangler.toml with correct database_id
```

### Port already in use

```bash
# Use a different port
wrangler dev --port 8788
```

### CORS errors in frontend

Check that `wrangler.toml` includes your frontend URL in allowed origins, or update the CORS middleware in `src/middleware/cors.ts`.

## Next Steps

1. ✅ Complete basic user CRUD
2. ⏳ Implement Firebase token verification middleware
3. ⏳ Add workout CRUD endpoints
4. ⏳ Add goals CRUD endpoints
5. ⏳ Add nutrition CRUD endpoints
6. ⏳ Add FCM notification endpoints
7. ⏳ Add trainer-client relationship management

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/cli-wrangler/)
- [itty-router Documentation](https://github.com/kwhitley/itty-router)
