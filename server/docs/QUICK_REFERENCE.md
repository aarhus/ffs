# Quick Reference: Finlay Backend

## Start Backend Development

```bash
cd /home/matt/finlay/server
npm install                                    # Install deps
wrangler d1 create finlay-db                   # Create database
# Copy database_id to wrangler.toml
wrangler d1 execute finlay-db --file=./migrations/0001_init.sql  # Setup schema
npm run dev                                    # Start server
```

## Test Endpoints

```bash
# Health check
curl http://localhost:8787/health

# Register user (after Firebase signup)
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseUid": "firebase-uid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CLIENT"
  }'

# Get user
curl http://localhost:8787/api/auth/user/firebase-uid
```

## Important Files

| File                       | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `migrations/0001_init.sql` | Database schema (5 tables)                  |
| `src/index.ts`             | Main Worker entry point                     |
| `src/routes/auth.ts`       | Register & get user endpoints               |
| `src/routes/users.ts`      | User CRUD endpoints                         |
| `src/models/index.ts`      | Database models & queries                   |
| `wrangler.toml`            | Cloudflare config (update with database_id) |
| `package.json`             | Dependencies                                |

## Next Endpoints to Build

1. ⏳ Workouts CRUD (`src/routes/workouts.ts`)
2. ⏳ Goals CRUD (`src/routes/goals.ts`)
3. ⏳ Nutrition CRUD (`src/routes/nutrition.ts`)
4. ⏳ FCM tokens (`src/routes/notifications.ts`)

## Environment Setup

Create `.env.local` in `/home/matt/finlay/server/`:

```
FRONTEND_URL=http://localhost:3001
ENVIRONMENT=development
```

## Common Commands

```bash
npm run dev              # Local dev server (port 8787)
npm run typecheck        # Check TypeScript types
npm run deploy           # Deploy to Cloudflare
npm run build            # Dry run build

# Database queries
wrangler d1 execute finlay-db --interactive         # Shell mode
wrangler d1 execute finlay-db --command "SELECT * FROM users"
```

## Database Tables

```
users               # Registered users from Firebase
notification_tokens # FCM tokens for push notifications
workouts            # Logged workouts/exercises
goals               # User fitness goals
nutrition_logs      # Meal/nutrition tracking
```

## API Endpoints Status

| Endpoint                             | Status  | File             |
| ------------------------------------ | ------- | ---------------- |
| POST /api/auth/register              | ✅ Done | auth.ts          |
| GET /api/auth/me                     | ✅ Done | auth.ts          |
| GET /api/users/:id                   | ✅ Done | users.ts         |
| PATCH /api/users/:id                 | ✅ Done | users.ts         |
| DELETE /api/users/:id                | ✅ Done | users.ts         |
| GET /api/avatar/                     | ✅ Done | avatar.ts        |
| POST /api/avatar/upload              | ✅ Done | avatar.ts        |
| DELETE /api/avatar/                  | ✅ Done | avatar.ts        |
| POST /api/avatar/gravatar            | ✅ Done | avatar.ts        |
| GET /api/workouts                    | ✅ Done | workouts.ts      |
| POST /api/workouts                   | ✅ Done | workouts.ts      |
| GET /api/workouts/:id                | ✅ Done | workouts.ts      |
| PATCH /api/workouts/:id              | ✅ Done | workouts.ts      |
| DELETE /api/workouts/:id             | ✅ Done | workouts.ts      |
| GET /api/goals                       | ✅ Done | goals.ts         |
| POST /api/goals                      | ✅ Done | goals.ts         |
| GET /api/goals/:id                   | ✅ Done | goals.ts         |
| PATCH /api/goals/:id                 | ✅ Done | goals.ts         |
| DELETE /api/goals/:id                | ✅ Done | goals.ts         |
| GET /api/nutrition                   | ✅ Done | nutrition.ts     |
| POST /api/nutrition                  | ✅ Done | nutrition.ts     |
| GET /api/nutrition/:id               | ✅ Done | nutrition.ts     |
| PATCH /api/nutrition/:id             | ✅ Done | nutrition.ts     |
| DELETE /api/nutrition/:id            | ✅ Done | nutrition.ts     |
| GET /api/measurements                | ✅ Done | measurements.ts  |
| POST /api/measurements               | ✅ Done | measurements.ts  |
| GET /api/measurements/:id            | ✅ Done | measurements.ts  |
| PATCH /api/measurements/:id          | ✅ Done | measurements.ts  |
| DELETE /api/measurements/:id         | ✅ Done | measurements.ts  |
| GET /api/habits                      | ✅ Done | habits.ts        |
| POST /api/habits                     | ✅ Done | habits.ts        |
| GET /api/habits/:id                  | ✅ Done | habits.ts        |
| PATCH /api/habits/:id                | ✅ Done | habits.ts        |
| DELETE /api/habits/:id               | ✅ Done | habits.ts        |
| POST /api/notifications/tokens       | ✅ Done | notifications.ts |
| GET /api/notifications/tokens        | ✅ Done | notifications.ts |
| DELETE /api/notifications/tokens/:id | ✅ Done | notifications.ts |

## Frontend Integration

Frontend files that interact with backend:

- `src/services/firebase.ts` - Firebase auth
- `src/components/LoginPage.vue` - User signup/login
- `src/services/api.js` - API client (needs backend URL)

## Troubleshooting

**Module errors after npm install?**

```bash
npm install itty-router
npm run typecheck
```

**Database_id error in wrangler?**

```bash
wrangler d1 list  # See your database
# Copy database_id and update wrangler.toml
```

**Port 8787 in use?**

```bash
npm run dev -- --port 8788
```

## Documentation Files

- `README.md` - Full API documentation
- `SETUP.md` - Step-by-step setup guide
- `IMPLEMENTATION_SUMMARY.md` - What's done and next steps
- `QUICK_REFERENCE.md` - This file
