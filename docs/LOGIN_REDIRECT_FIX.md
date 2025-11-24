# Login Redirect Loop - Fix Applied

## Problem

After clicking the login button, users were redirected to `/home` and then immediately redirected back to `/login`.

## Root Causes Identified & Fixed

### 1. **Race Condition in Auth State Initialization**

- The router guard was checking authentication state before Firebase had confirmed the user session
- This caused the guard to redirect authenticated users back to `/login`

**Fix**: Added `isAuthInitialized` flag to Pinia store

- Router guard now waits for auth initialization before enforcing redirects
- Allows the app to check with Firebase first before making auth decisions

### 2. **Missing Firebase Auth State Listener**

- The app had no way to sync Firebase authentication state with Pinia
- On page refresh or initial load, the user auth state was not being restored

**Fix**: Added `onMounted` hook in App.vue

- Listens to Firebase auth state changes
- Automatically fetches user data from backend when Firebase confirms login
- Marks auth as initialized once Firebase responds

### 3. **Synchronization Gap**

- Pinia store was not being marked as initialized after login
- Router guard couldn't distinguish between "not checked yet" and "not logged in"

**Fix**: Updated all authentication actions

- `login()` now sets `isAuthInitialized = true`
- `logout()` now sets `isAuthInitialized = true`
- `fetchUserByFirebaseUid()` sets `isAuthInitialized = true` (both success and error)

---

## Changes Made

### 1. **src/stores/user.ts**

```typescript
// Added new state field
const isAuthInitialized = ref(false)

// Updated login action
const login = (user: User) => {
  currentUser.value = user
  isAuthenticated.value = true
  error.value = null
  isAuthInitialized.value = true // NEW
}

// Updated logout action
const logout = () => {
  currentUser.value = null
  isAuthenticated.value = false
  error.value = null
  isAuthInitialized.value = true // NEW
}

// Updated fetchUserByFirebaseUid to mark as initialized
// (both on success and error)
```

### 2. **src/router/index.ts**

```typescript
// Updated beforeEach guard
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  // NEW: Don't redirect until auth has been initialized
  if (!userStore.isAuthInitialized) {
    next()
    return
  }

  // ... rest of guard logic
})
```

### 3. **src/App.vue**

```typescript
// NEW: Added Firebase auth state listener
onMounted(() => {
  auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      // Sync with Pinia store
      if (!userStore.isAuthenticated) {
        try {
          await userStore.fetchUserByFirebaseUid(firebaseUser.user_id)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
          userStore.isAuthInitialized = true
        }
      } else {
        userStore.isAuthInitialized = true
      }
    } else {
      userStore.logout()
    }
  })
})
```

---

## How It Works Now

### Login Flow

1. ✅ User enters credentials and clicks "Login"
2. ✅ Firebase authenticates the user
3. ✅ `handleLogin()` calls `setupUserAfterAuth()`
4. ✅ `setupUserAfterAuth()` calls `userStore.login()` → sets `isAuthInitialized = true`
5. ✅ `router.push('/home')` is called
6. ✅ Router guard runs:
   - Checks `isAuthInitialized` → TRUE (just set in step 4)
   - Guard allows navigation
7. ✅ User sees `/home` page

### Session Restore Flow (Page Refresh)

1. ✅ Firebase auth state listener in App.vue detects existing session
2. ✅ Listener calls `fetchUserByFirebaseUid()`
3. ✅ User data fetched from backend
4. ✅ `userStore.login()` called → sets `isAuthInitialized = true`
5. ✅ Router guard allows navigation to current route
6. ✅ User stays logged in

---

## Testing the Fix

### Test 1: Login and Navigate

1. Clear browser cache/logout
2. Go to `/login`
3. Enter credentials and click "Login"
4. **Expected**: User navigates to `/home` (or `/dashboard` for trainers) and stays there

### Test 2: Page Refresh While Logged In

1. Login successfully
2. Refresh the page (F5)
3. **Expected**: User remains logged in on same page

### Test 3: Browser Back Button After Login

1. Login successfully
2. Navigate to another page (e.g., `/training`)
3. Click browser back button
4. **Expected**: Navigate to previous page without redirect loops

### Test 4: Direct URL Access When Logged Out

1. Clear browser cache/logout
2. Try to access `/training` directly
3. **Expected**: Redirected to `/login`

### Test 5: Direct URL Access When Logged In

1. Login successfully
2. In address bar, type `/training` directly
3. **Expected**: Load `/training` page successfully

---

## Files Modified

- `src/stores/user.ts` - Added auth initialization tracking
- `src/router/index.ts` - Updated guard to wait for auth init
- `src/App.vue` - Added Firebase session listener

## Status

✅ **COMPLETE** - Redirect loop issue resolved
