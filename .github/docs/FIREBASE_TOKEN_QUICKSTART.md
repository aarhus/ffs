# Firebase Token Authentication - Quick Start Checklist

## ✅ Implementation Checklist

### Backend Changes

- [x] Added JWT decoding function (`decodeJWT()`)
- [x] Updated auth middleware to validate tokens
- [x] Extracts Firebase UID from `sub` claim
- [x] Validates token expiration
- [x] Improved error messages
- [x] No external dependencies needed

**File:** `server/middleware/auth.ts` ✅

### Frontend Changes

- [x] Updated `registerUser()` to use full URL with Bearer token
- [x] Updated `getUserByFirebaseUid()` to use full URL with Bearer token
- [x] Updated `getUserById()` to use full URL with Bearer token
- [x] Updated `updateUser()` to use full URL with Bearer token
- [x] Updated `deleteUser()` to use full URL with Bearer token
- [x] Updated `storeFCMToken()` to use full URL with Bearer token
- [x] Updated `healthCheck()` to use full URL
- [x] Already have `getAuthToken()` function
- [x] Already have `createHeaders()` function
- [x] Already have `handleResponse()` function

**File:** `src/services/api.ts` ✅

### Integration Points

- [x] Pinia store calls API functions (already integrated)
- [x] LoginPage uses Pinia store (already integrated)
- [x] App.vue uses Pinia store (already integrated)
- [x] All components have access to authenticated state

### Documentation

- [x] Created `FIREBASE_TOKEN_AUTH.md` - Architecture & implementation guide
- [x] Created `FIREBASE_TOKEN_TESTING.md` - Testing instructions
- [x] Created `FIREBASE_TOKEN_IMPLEMENTATION.md` - Configuration details
- [x] Created `CODE_CHANGES_REFERENCE.md` - Before/after code
- [x] Created `FIREBASE_TOKEN_COMPLETE.md` - Project status
- [x] Created `FIREBASE_TOKEN_QUICKSTART.md` - This checklist

---

## 🧪 Testing Checklist

### Basic Authentication Test

- [ ] User can log in with email/password
- [ ] User can log in with Google OAuth
- [ ] User is redirected to dashboard on success
- [ ] User can log out
- [ ] Token is cleared on logout

### Token Verification Test

- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Log in to the app
- [ ] Make an API call (should happen automatically)
- [ ] Check request for `Authorization: Bearer eyJhbGc...`
- [ ] Verify token starts with "Bearer "
- [ ] Verify token is a valid JWT (3 parts with dots)

### Backend Validation Test

- [ ] Check backend logs for successful decoding
- [ ] Verify Firebase UID is extracted correctly
- [ ] Confirm token expiration is checked
- [ ] Test with invalid token (should get 401)
- [ ] Test with expired token (should get 401)
- [ ] Test with missing header (should get 401)

### API Endpoint Test

- [ ] `/api/auth/register` - Creates user with token
- [ ] `/api/auth/user/:uid` - Fetches user with token
- [ ] `/api/users/:id` - Fetches user with token
- [ ] `/api/users/:id` - Updates user with token
- [ ] `/api/users/:id` - Deletes user with token
- [ ] `/api/notifications/tokens` - Stores FCM token with token

### Error Handling Test

- [ ] 401 on missing Authorization header
- [ ] 401 on invalid token format
- [ ] 401 on malformed JWT
- [ ] 401 on expired token
- [ ] Error messages are descriptive

---

## 🔍 Verification Steps

### Step 1: Check Frontend Code

```bash
# Verify all API functions use full URL
grep -n "API_BASE_URL" src/services/api.ts
# Should show 7 occurrences (one per function)

# Verify all use createHeaders(true)
grep -n "createHeaders(true)" src/services/api.ts
# Should show 6 occurrences (registerUser doesn't have it but calls createHeaders)
```

### Step 2: Check Backend Code

```bash
# Verify auth middleware has decodeJWT function
grep -n "function decodeJWT" server/middleware/auth.ts
# Should find the function definition

# Verify it checks for 'sub' claim
grep -n "decoded.sub" server/middleware/auth.ts
# Should find the claim extraction
```

### Step 3: Test in Browser

1. Open http://localhost:3000 (or your dev URL)
2. Open DevTools (F12)
3. Go to Network tab
4. Click Sign Up
5. Enter test credentials
6. Click submit
7. Look for request to `/api/auth/register`
8. Check Request Headers section
9. Scroll down to find `Authorization: Bearer ...`
10. Copy the token
11. Paste at https://jwt.io (safely, don't share!)
12. Verify payload has "sub" field matching your Firebase UID

### Step 4: Test Error Cases

```bash
# Test without token (should fail)
curl http://localhost:8787/api/auth/user/test

# Test with invalid token (should fail)
curl -H "Authorization: Bearer invalid" \
  http://localhost:8787/api/auth/user/test

# Test with valid token (should work)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8787/api/auth/user/YOUR_UID
```

---

## 🔧 Configuration Checklist

### Frontend Environment

- [ ] `.env.local` has `VITE_API_URL` set (or using default)
- [ ] `VITE_FIREBASE_API_KEY` is set
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` is set
- [ ] `VITE_FIREBASE_PROJECT_ID` is set

### Backend Environment

- [ ] `.env` has `ENVIRONMENT=development`
- [ ] Backend is running on port 8787 (or configured in VITE_API_URL)
- [ ] D1 database is initialized
- [ ] Wrangler is configured correctly

---

## 📊 Success Criteria

✅ **All** of these must be true:

- [ ] API requests include `Authorization: Bearer <token>` header
- [ ] Token format is valid JWT (3 parts separated by dots)
- [ ] Backend successfully decodes token
- [ ] Backend extracts Firebase UID from `sub` claim
- [ ] Backend validates token expiration
- [ ] User data returned for valid tokens
- [ ] 401 errors returned for invalid tokens
- [ ] App redirects to dashboard after login
- [ ] User profile shows correct information
- [ ] No TypeScript errors
- [ ] No console errors in browser

---

## 🚀 Deployment Checklist

### Before Production

- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Update Firebase config for production domain
- [ ] Test with production database
- [ ] Configure CORS for production domain
- [ ] Set up monitoring for auth failures
- [ ] Test token refresh on production

### Production Considerations

- [ ] Consider Firebase Admin SDK for token verification
- [ ] Implement request retry on 401 with token refresh
- [ ] Add rate limiting per user
- [ ] Log all auth failures
- [ ] Monitor token decode failures
- [ ] Set up alerts for unusual auth patterns

---

## 📝 Documentation Links

| Document                           | Purpose                 | Read Time |
| ---------------------------------- | ----------------------- | --------- |
| `FIREBASE_TOKEN_AUTH.md`           | Architecture & overview | 10 min    |
| `FIREBASE_TOKEN_TESTING.md`        | Testing instructions    | 10 min    |
| `CODE_CHANGES_REFERENCE.md`        | Code comparisons        | 5 min     |
| `FIREBASE_TOKEN_IMPLEMENTATION.md` | Implementation details  | 10 min    |
| `FIREBASE_TOKEN_COMPLETE.md`       | Project status          | 5 min     |
| `FIREBASE_TOKEN_QUICKSTART.md`     | This checklist          | 5 min     |

---

## 🎯 Next Steps

### Immediate (Next 30 minutes)

1. [ ] Verify backend changes are correct
2. [ ] Verify frontend changes are correct
3. [ ] Test login flow in browser
4. [ ] Check DevTools Network tab for tokens
5. [ ] Verify backend logs show successful validation

### Short-term (Next 1-2 hours)

1. [ ] Test all error cases
2. [ ] Test all API endpoints
3. [ ] Implement role-based authorization
4. [ ] Add retry logic for failed requests
5. [ ] Create additional resource stores

### Production (Next week)

1. [ ] Deploy to production
2. [ ] Monitor auth failures
3. [ ] Set up alerts
4. [ ] Implement Admin SDK verification
5. [ ] Document operational procedures

---

## 💡 Quick Debug Tips

### Token Not Appearing in Headers?

```javascript
// Check if user is logged in
firebase.auth().currentUser // Should not be null

// Get current token manually
firebase
  .auth()
  .currentUser?.getIdToken()
  .then((t) => console.log(t))

// Check createHeaders is working
const headers = await createHeaders(true)
console.log(headers) // Should have Authorization header
```

### Backend Saying Token is Invalid?

1. Check token format: `Bearer eyJhbGc...`
2. Verify token has 3 parts (separated by dots)
3. Check token isn't truncated
4. Verify Firebase config matches
5. Try getting fresh token (logout/login)

### Still Having Issues?

1. Read `FIREBASE_TOKEN_TESTING.md` for detailed steps
2. Check console for specific error messages
3. Check backend logs for decode errors
4. Verify all files were edited correctly
5. Clear browser cache and refresh

---

## ✨ Success!

When everything is working:

✅ User logs in
✅ Token appears in DevTools Network tab
✅ API calls succeed with 200 responses
✅ User data displays correctly
✅ No console errors
✅ Backend logs show successful token validation

**You're done! 🎉**

---

## Need Help?

Check these in order:

1. **For implementation details:** Read `FIREBASE_TOKEN_IMPLEMENTATION.md`
2. **For testing help:** Read `FIREBASE_TOKEN_TESTING.md`
3. **For code changes:** Read `CODE_CHANGES_REFERENCE.md`
4. **For architecture:** Read `FIREBASE_TOKEN_AUTH.md`
5. **For status:** Read `FIREBASE_TOKEN_COMPLETE.md`
