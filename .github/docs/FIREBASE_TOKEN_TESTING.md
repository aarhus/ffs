# Firebase Token Authentication - Testing Guide

## Quick Start Testing

### 1. Verify Token is Sent in Requests

**Step 1: Open DevTools**

- Press `F12` to open Developer Tools in your browser
- Go to the **Network** tab

**Step 2: Log In**

- Navigate to your app at `http://localhost:3000` (or wherever it's running)
- Click "Sign Up" or "Log In"
- Enter credentials and authenticate with Firebase

**Step 3: Check Network Request**

- After successful login, the app will make API calls
- Look for a request to `localhost:8787/api/auth/user/...`
- Click on that request
- Go to **Request Headers** tab
- Look for: `Authorization: Bearer eyJhbGc...`

**Expected Result:** ✅ Authorization header is present with Bearer token

### 2. Test Token in Request Body

**Via Network Tab:**

```
GET http://localhost:8787/api/auth/user/pR1ErpYrOXTOTdIme5DYEAA4Wis1

Request Headers:
- Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1In0.eyJzdWIiOiJwUjFFcnBZck9YVFRVZG1lNURZRUFBNFdpczEiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZmlubGF5LWZpdG5lc3MifQ.signature...
- Content-Type: application/json
```

### 3. Decode Token (Optional - For Debugging)

You can decode a Firebase token at https://jwt.io (don't share your token!):

1. Copy the token from the Authorization header
2. Paste in jwt.io
3. You'll see the decoded payload:

```json
{
  "sub": "pR1ErpYrOXTOTdIme5DYEAA4Wis1",
  "iss": "https://securetoken.google.com/finlay-fitness",
  "aud": "finlay-fitness",
  "auth_time": 1700700000,
  "user_id": "pR1ErpYrOXTOTdIme5DYEAA4Wis1",
  "sub": "pR1ErpYrOXTOTdIme5DYEAA4Wis1",
  "iat": 1700700000,
  "exp": 1700703600,
  "email": "user@example.com",
  "email_verified": false,
  "firebase": {
    "identities": {
      "email": ["user@example.com"]
    },
    "sign_in_provider": "password"
  }
}
```

### 4. Test Without Token (Should Fail)

**Using curl:**

```bash
# Without token - should return 401
curl -H "Content-Type: application/json" \
  http://localhost:8787/api/users/1

# Response: 401 Unauthorized

# With valid token - should return user data
curl -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8787/api/users/1

# Response: 200 OK with user data
```

### 5. Test Invalid Token

**Using curl:**

```bash
# With invalid/expired token - should return 401
curl -H "Authorization: Bearer invalid_token_here" \
  http://localhost:8787/api/auth/user/12345

# Response:
# {
#   "error": {
#     "code": "TOKEN_VERIFICATION_FAILED",
#     "message": "Failed to verify token"
#   }
# }
```

## Backend Token Validation Flow

The backend auth middleware follows this flow:

```
1. Request received with Authorization header
   ↓
2. Middleware checks for "Bearer " prefix
   ↓
3. Extracts JWT token (removes "Bearer " prefix)
   ↓
4. Decodes JWT payload (base64 decode middle part)
   ↓
5. Extracts Firebase UID from "sub" claim
   ↓
6. Checks token expiration (exp claim)
   ↓
7. Returns Firebase UID to route handler
   ↓
8. Route handler uses Firebase UID to look up user in database
```

## Expected Behavior After Changes

### Login Flow

1. ✅ User enters credentials in LoginPage
2. ✅ Firebase authenticates user
3. ✅ Frontend calls `registerUser()` or `getUserByFirebaseUid()`
4. ✅ `createHeaders(true)` adds Authorization header with token
5. ✅ Backend receives token in Authorization header
6. ✅ Middleware decodes token and extracts Firebase UID
7. ✅ Route handler looks up user in database
8. ✅ User data returned to frontend
9. ✅ Pinia store updated with user info
10. ✅ App redirects to dashboard

### API Calls

1. ✅ Every authenticated API call includes token
2. ✅ Backend validates token on each request
3. ✅ 401 errors returned for invalid/missing tokens
4. ✅ User data returned for valid tokens

## Monitoring & Debugging

### Browser Console

```javascript
// Check current user
firebase.auth().currentUser

// Get current token
firebase
  .auth()
  .currentUser.getIdToken()
  .then((token) => console.log(token))

// Check store state
import { useUserStore } from "@/stores/user"
const store = useUserStore()
console.log(store.currentUser)
console.log(store.isAuthenticated)
```

### Backend Logs (in terminal running dev server)

```
X Incoming request: GET http://localhost:8787/api/auth/user/pR1ErpYrOXTOTdIme5DYEAA4Wis1
Y Request: GET http://localhost:8787/api/auth/user/pR1ErpYrOXTOTdIme5DYEAA4Wis1
Z Auth Route: GET http://localhost:8787/api/auth/user/pR1ErpYrOXTOTdIme5DYEAA4Wis1
Auth Route: GET http://localhost:8787/api/auth/user/pR1ErpYrOXTOTdIme5DYEAA4Wis1
```

## Common Issues & Solutions

### Issue: "401 Missing or invalid authorization header"

**Cause:** No Authorization header in request
**Solution:**

- Verify user is logged in: `firebase.auth().currentUser` should exist
- Check `createHeaders(true)` is called before fetch
- Verify token is being retrieved: Add console.log in `getAuthToken()`

### Issue: "401 Failed to verify token"

**Cause:** Token can't be decoded
**Solution:**

- Token must be a valid JWT (3 parts separated by dots)
- Check token isn't truncated or corrupted
- Try getting a fresh token by logging out/in

### Issue: "401 Invalid token: missing UID claim"

**Cause:** Token doesn't have Firebase UID in 'sub' claim
**Solution:**

- Shouldn't happen with Firebase tokens
- Token may be from different auth provider
- Try re-authenticating

### Issue: "401 Token has expired"

**Cause:** Token is older than 1 hour
**Solution:**

- `getIdToken(true)` should get fresh token
- Try logging out and back in
- Check system clock is correct

### Issue: Requests working in DevTools but not in app

**Cause:** Token expiration or session issue
**Solution:**

- Refresh the page to reset Firebase session
- Clear browser cache
- Check `VITE_API_URL` environment variable
- Verify backend is running on correct port

## Success Criteria

✅ All API requests include Authorization header
✅ Token is in format: `Bearer eyJhbGc...`
✅ Backend can decode token and extract Firebase UID
✅ User data is returned on login
✅ No 401 errors on authenticated requests
✅ 401 errors returned for invalid tokens
✅ Token is fresh on each request (no cache)

## Next Steps

1. ✅ Frontend sends tokens - DONE
2. ✅ Backend validates tokens - DONE
3. 🔄 Test end-to-end flow - IN PROGRESS
4. ⬜ Implement role-based authorization
5. ⬜ Add token refresh retry logic
6. ⬜ Deploy to production
