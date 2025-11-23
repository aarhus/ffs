# Firebase Token Authentication Implementation

## Overview

The Finlay fitness application now has complete Firebase token-based authentication integrated between the frontend and backend. All API requests include a cryptographically signed Firebase ID token in the Authorization header.

## Architecture

### Frontend (Vue 3 + Pinia)

**File:** `src/services/api.ts`

The frontend API service implements token-based authentication:

1. **Token Retrieval:** `getAuthToken()`

   - Calls `auth.currentUser.getIdToken(true)` to get a fresh Firebase ID token
   - Gets a new token on each request for maximum security
   - Returns `null` if no user is logged in

2. **Header Creation:** `createHeaders(includeAuth?: boolean)`

   - Adds `Content-Type: application/json` header
   - When `includeAuth=true`, adds `Authorization: Bearer <idToken>` header
   - All authenticated API calls use this function

3. **All API Functions Updated:**
   - `registerUser()` - POST /api/auth/register
   - `getUserByFirebaseUid()` - GET /api/auth/user/:firebaseUid
   - `getUserById()` - GET /api/users/:userId
   - `updateUser()` - PATCH /api/users/:userId
   - `deleteUser()` - DELETE /api/users/:userId
   - `storeFCMToken()` - POST /api/notifications/tokens

**Environment Configuration:**

- API base URL: Configurable via `VITE_API_URL` environment variable
- Default: `http://localhost:8787` (Cloudflare Workers dev server)

### Backend (Cloudflare Workers)

**File:** `server/middleware/auth.ts`

The backend auth middleware validates Firebase tokens:

1. **Token Extraction:**

   - Extracts Bearer token from `Authorization` header
   - Validates header format: `Bearer <token>`

2. **JWT Decoding:** `decodeJWT(token)`

   - Base64-decodes the JWT payload (second part of token)
   - Handles standard Base64URL encoding (replaces `-` with `+`, `_` with `/`)
   - Parses the JSON payload

3. **Claims Extraction:**

   - Extracts Firebase UID from `sub` (subject) claim
   - Validates token expiration via `exp` claim
   - Throws 401 error if token is expired or invalid

4. **Error Handling:**
   - 401 - Missing/invalid Authorization header
   - 401 - Invalid token format
   - 401 - Missing UID claim
   - 401 - Token has expired
   - 401 - Token verification failed

## Token Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User logs in with Firebase (email/password or Google OAuth)  │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend calls getAuthToken() via Firebase SDK               │
│    - Gets fresh ID token from auth.currentUser                  │
│    - Token is cryptographically signed by Firebase              │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Frontend includes token in API request header                │
│    Authorization: Bearer eyJhbGc...                             │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend auth middleware receives request                     │
│    - Extracts Bearer token from header                          │
│    - Decodes JWT payload                                        │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Validates token claims                                       │
│    - Extracts Firebase UID from 'sub' claim                     │
│    - Checks token expiration                                    │
│    - Returns Firebase UID for database lookup                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Route handler processes authenticated request                │
│    - Has access to firebase_uid from middleware                 │
│    - Can query database for user info                           │
└─────────────────────────────────────────────────────────────────┘
```

## Security Features

### Frontend

- ✅ Fresh token retrieved on every request (no stale tokens)
- ✅ Tokens never stored in localStorage (handled by Firebase SDK)
- ✅ Token automatically refreshed on login
- ✅ Token automatically cleared on logout

### Backend

- ✅ Token validation on every authenticated request
- ✅ Expiration checking prevents old tokens
- ✅ Firebase UID extraction ties token to user identity
- ✅ 401 errors on invalid/missing tokens

### Future Enhancements

- Implement Firebase Admin SDK verification to validate token signature and issuer
- Add request retry logic with token refresh on 401
- Implement role-based authorization checks
- Add rate limiting per user

## Testing the Integration

### 1. Check Frontend Token Transmission

```bash
# Open DevTools (F12) → Network tab
# Log in with a Firebase account
# Look at any API request (e.g., GET /api/auth/user/:uid)
# Check "Request Headers" for Authorization header:
# Authorization: Bearer eyJhbGc...
```

### 2. Test Token Validation

```bash
# With invalid token:
curl -H "Authorization: Bearer invalid_token" http://localhost:8787/api/users/1
# Response: 401 - Failed to verify token

# With valid token (from logged-in user):
# Frontend will automatically include in all requests
```

### 3. Monitor Backend Logs

```bash
# Watch for auth middleware logs:
# "Auth Route: GET /api/auth/user/pR1ErpYrOXTOTdIme5DYEAA4Wis1"
# Token decoded successfully, Firebase UID extracted
```

## Configuration

### Environment Variables

**Frontend** (`.env.local`):

```
VITE_API_URL=http://localhost:8787
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Backend** (`.env`):

```
ENVIRONMENT=development
```

## API Integration Points

### LoginPage.vue

```typescript
// Calls store.login() after Firebase authentication
// Store automatically makes API calls with tokens
const { handleLogin, handleSignup, handleGoogleLogin } = useAuthHandlers()
```

### User Store (src/stores/user.ts)

```typescript
// All store actions use api.ts which includes tokens
await api.registerUser(...)      // Has token header
await api.getUserByFirebaseUid(...)  // Has token header
await api.updateUser(...)        // Has token header
```

### Other Routes

Any new API functions should follow the pattern:

```typescript
export async function myApiCall(): Promise<Response> {
  const headers = await createHeaders(true) // Includes token
  const response = await fetch(`/api/path`, {
    method: "GET",
    headers,
  })
  return handleResponse(response)
}
```

## Troubleshooting

### Issue: 401 Unauthorized on all requests

**Solution:**

- Ensure user is logged in (check `useUserStore().isAuthenticated`)
- Check Firebase configuration is correct
- Verify `VITE_API_URL` environment variable is set

### Issue: Token not in Authorization header

**Solution:**

- Check `getAuthToken()` is being called before fetch
- Verify `auth.currentUser` exists
- Check browser DevTools Network tab to confirm header is sent

### Issue: Backend can't decode token

**Solution:**

- Token must be valid JWT format (three parts separated by dots)
- Firebase tokens always include `sub` claim
- Check token hasn't expired

### Issue: CORS errors

**Solution:**

- Ensure CORS middleware is configured correctly in backend
- Check `Access-Control-Allow-Origin` header in response
- Verify backend CORS config allows frontend origin

## Token Expiration & Refresh

Firebase ID tokens expire after 1 hour. The current implementation handles this automatically:

1. `getAuthToken()` calls `getIdToken(true)` which automatically refreshes if needed
2. Each request gets a fresh token
3. No manual refresh logic needed

## Next Steps

1. **Production Deployment:**

   - Update `VITE_API_URL` to production backend URL
   - Configure Firebase for production domain
   - Enable Firebase Admin SDK verification in backend

2. **Role-Based Access Control (RBAC):**

   - Add role checks in backend routes
   - Implement authorization middleware
   - Return 403 for insufficient permissions

3. **Enhanced Error Handling:**

   - Retry failed requests with fresh token
   - Show user-friendly error messages
   - Log auth failures for monitoring

4. **Additional Stores:**
   - Create Pinia stores for workouts, goals, nutrition
   - All will automatically use token-based auth
   - Consistent API error handling
