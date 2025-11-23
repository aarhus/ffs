# Frontend-Backend Integration: Quick Start

## Prerequisites

1. ✅ Backend created in `/server`
2. ✅ D1 database created and schema applied
3. ✅ Firebase configured
4. ✅ Frontend updated with API client

## Setup (First Time Only)

### 1. Backend Setup

```bash
cd /home/matt/finlay/server

# Install dependencies
npm install

# Create D1 database (if not already done)
wrangler d1 create finlay-db

# Update wrangler.toml with your database_id
# Then apply schema
wrangler d1 execute finlay-db --file=./migrations/0001_init.sql

# Verify database
wrangler d1 execute finlay-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### 2. Frontend Setup

```bash
cd /home/matt/finlay/app-vue

# Backend URL should be configured for dev
# .env.example already has: VITE_API_URL=http://localhost:8787

# No additional setup needed
```

## Running the Full Stack

### Terminal 1: Backend

```bash
cd /home/matt/finlay/server
npm run dev

# Output should show:
# ✓ Ready on http://localhost:8787
```

### Terminal 2: Frontend

```bash
cd /home/matt/finlay/app-vue
npm run dev

# Output should show:
# ✓ ready in XXXms.
# ➜  Local:   http://localhost:5173
```

## Testing the Integration

### Test 1: Health Check

```bash
curl http://localhost:8787/health
# Should return: {"status":"ok"}
```

### Test 2: Signup

1. Go to http://localhost:5173
2. Click "Sign up" tab
3. Enter:
   - Email: `testuser@example.com`
   - Password: `password123`
   - Confirm: `password123`
4. Click "Sign Up"
5. Should see success message and be logged in

### Test 3: Verify User Created

```bash
# In another terminal:
wrangler d1 execute finlay-db --command "SELECT * FROM users WHERE email = 'testuser@example.com';"

# Should show:
# id | firebase_uid | email | name | role | avatar | created_at | updated_at
```

### Test 4: Login

1. Go to http://localhost:5173
2. Click "Login" tab
3. Enter:
   - Email: `testuser@example.com`
   - Password: `password123`
4. Click "Login"
5. Should be logged in

### Test 5: Google Login

1. Go to http://localhost:5173
2. Click "Sign in with Google"
3. Complete Google auth flow
4. Should be logged in (and new user created if first time)

## Common Issues & Solutions

### ❌ Error: "API request failed"

**Problem**: Backend not running or unreachable

**Solution**:

```bash
# Check backend is running
ps aux | grep "wrangler dev"

# If not, start it:
cd /home/matt/finlay/server
npm run dev

# Check it's accessible
curl http://localhost:8787/health
```

### ❌ Error: "User profile not found on server"

**Problem**: D1 database not created or schema not applied

**Solution**:

```bash
# Check database exists
wrangler d1 list

# If missing, create it:
wrangler d1 create finlay-db

# Check schema applied
wrangler d1 execute finlay-db --command "SELECT name FROM sqlite_master WHERE type='table';"

# If no tables, apply schema:
wrangler d1 execute finlay-db --file=/home/matt/finlay/server/migrations/0001_init.sql
```

### ❌ Error: "Invalid email address" but email looks valid

**Problem**: Firebase auth rejected the email (usually weak password)

**Solution**:

- Ensure password is at least 6 characters
- Ensure password and confirm match exactly
- Try a different email if already registered

### ❌ Error: CORS or "net::ERR_BLOCKED_BY_CLIENT"

**Problem**: Frontend can't reach backend due to CORS or network

**Solution**:

```bash
# Check backend CORS config in /server/src/middleware/cors.ts
# Should allow localhost:5173

# If using different port, update:
# const allowedOrigins = [
#   'http://localhost:YOUR_PORT',
#   ...
# ]

# Then restart backend:
npm run dev
```

### ❌ TypeScript errors about "User" type

**Problem**: Type mismatch between backend UserResponse and frontend User

**Solution**: This is expected and handled

- Backend returns `UserResponse` with number ID
- Frontend `User` type accepts `string | number` for ID
- Casting `as User` is safe and intentional

## Verifying the Integration

### Check Signup Works

```bash
# 1. Signup on frontend
# 2. Check database
wrangler d1 execute finlay-db --command "SELECT COUNT(*) FROM users;"

# Should show count increased by 1
```

### Check Login Works

```bash
# 1. Login on frontend
# 2. Check browser console (F12)
# 3. Should NOT see auth errors
# 4. User should be logged in
```

### Check Database

```bash
# See all users
wrangler d1 execute finlay-db --command "SELECT id, email, name, role FROM users;"

# See specific user
wrangler d1 execute finaly-db --command "SELECT * FROM users WHERE email = 'test@example.com';"

# See notification tokens
wrangler d1 execute finlay-db --command "SELECT * FROM notification_tokens;"
```

## API Endpoints Being Used

| Endpoint              | Method | When Used    | Frontend Code                             |
| --------------------- | ------ | ------------ | ----------------------------------------- |
| `/health`             | GET    | Testing      | Manual curl                               |
| `/api/auth/register`  | POST   | Signup       | `registerUser()` in LoginPage.vue         |
| `/api/auth/user/:uid` | GET    | Login        | `getUserByFirebaseUid()` in LoginPage.vue |
| `/api/auth/user/:uid` | GET    | Google Login | `getUserByFirebaseUid()` in LoginPage.vue |

## File Locations

**Frontend API Client:**

- `/home/matt/finlay/app-vue/src/services/api.ts`

**LoginPage Integration:**

- `/home/matt/finlay/app-vue/src/components/LoginPage.vue`
- Functions: `handleLogin()`, `handleSignup()`, `handleGoogleLogin()`

**Backend Routes:**

- `/home/matt/finlay/server/src/routes/auth.ts` - `/api/auth/*` endpoints

**Database:**

- Schema: `/home/matt/finlay/server/migrations/0001_init.sql`
- Tables: users, notification_tokens, workouts, goals, nutrition_logs

## Next Steps

1. ✅ Test signup and login flows
2. ✅ Verify users appear in D1 database
3. ⏳ Implement workouts endpoints
4. ⏳ Implement goals endpoints
5. ⏳ Implement nutrition endpoints
6. ⏳ Add role-based access control
7. ⏳ Deploy to Cloudflare (backend + frontend)

## Debugging Tips

### Enable Backend Logs

```bash
# Backend logs appear in terminal where npm run dev is running
# Look for console.log() output from /server/src/routes/*.ts
```

### Check API Responses

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try signup/login
4. Click on API requests to see:
   - Request headers
   - Request body
   - Response status
   - Response body

### Manual API Testing

```bash
# Register user
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseUid": "test-uid-123",
    "email": "manual@example.com",
    "name": "Manual Test",
    "role": "CLIENT"
  }'

# Get user
curl http://localhost:8787/api/auth/user/test-uid-123
```

## Support

If something isn't working:

1. Check backend is running: `curl http://localhost:8787/health`
2. Check D1 has users: `wrangler d1 execute finlay-db --command "SELECT COUNT(*) FROM users;"`
3. Check browser console for errors (F12)
4. Check terminal where `npm run dev` is running for server errors
5. Refer to `/home/matt/finlay/app-vue/BACKEND_INTEGRATION.md` for detailed info
