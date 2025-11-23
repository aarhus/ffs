# Vue Router Migration - Testing Plan

## Step 9: Deep Linking & URL State Testing

### What is being tested:

- Direct URL navigation (deep linking)
- Query parameters preservation
- Route parameter handling
- Browser history navigation (back/forward)
- Page state persistence

### Test Cases:

#### Test 9.1: Direct URL Access

```
✓ User enters: http://localhost:5173/home
  Expected: Loads ClientHome component directly without animation

✓ User enters: http://localhost:5173/dashboard (trainer)
  Expected: Loads TrainerDashboard component directly

✓ User enters: http://localhost:5173/goals
  Expected: Loads Goals component with current route in URL bar
```

#### Test 9.2: Route Param Preservation

```
✓ Navigate to /home, then click on /profile
  Expected: URL changes to /profile, page updates

✓ Click browser back button
  Expected: Returns to /home, component re-renders

✓ Click browser forward button
  Expected: Returns to /profile
```

#### Test 9.3: Query Parameters (Future-Ready)

```
✓ Test any routes with query params like /goals?sort=due-date
  Expected: Query params preserved in route state
```

#### Test 9.4: 404 Handling

```
✓ User enters: http://localhost:5173/invalid-route
  Expected: Redirects to / which then redirects to /login or /home
```

---

## Step 10: Authentication Flow Testing

### What is being tested:

- Firebase authentication flow
- JWT token verification
- Route guards on protected routes
- Automatic redirects
- Logout behavior
- Role-based access control

### Test Cases:

#### Test 10.1: Login Flow

```
✓ Unauthenticated user visits /home
  Expected: Redirects to /login (beforeEach guard)

✓ User enters credentials and logs in
  Expected:
    - User stored in Pinia store
    - setupUserAfterAuth calls router.push()
    - Client redirects to /home, Trainer redirects to /dashboard

✓ User refreshes page after login
  Expected:
    - userStore.isAuthenticated persists (Firebase session)
    - Current page loads (e.g., /home shows ClientHome)
```

#### Test 10.2: Protected Routes

```
✓ Unauthenticated user tries: /training
  Expected: Redirects to /login immediately

✓ Client user tries: /admin (trainer-only route)
  Expected: Redirects to /home (role check in beforeEach)

✓ Trainer user tries: /nutrition (client-only route)
  Expected: Redirects to /dashboard (role check in beforeEach)
```

#### Test 10.3: Logout Behavior

```
✓ Authenticated user clicks logout button
  Expected:
    - userStore.logout() called
    - userStore.isAuthenticated = false
    - router.push('/login') executes
    - User redirected to login page
    - Can no longer access protected routes
```

#### Test 10.4: Session Persistence

```
✓ User logs in and visits /training
  Expected: Page works normally

✓ User manually types URL to go to /profile
  Expected: Page loads without re-authentication

✓ User refreshes page on /profile
  Expected: Page still works (Firebase session active)
```

#### Test 10.5: Token Verification

```
✓ User logs in (Firebase issues JWT)
  Expected:
    - JWT stored in Firebase auth session
    - Each API call includes token in Authorization header
    - Backend validates token via jose library (from auth.ts)

✓ Token expires (mock by clearing session)
  Expected:
    - API calls fail with 401
    - beforeEach guard catches and redirects to /login
```

#### Test 10.6: Role-Based Route Guard

```
✓ Fire up two browser windows:
  - Window A: logged in as CLIENT
  - Window B: logged in as TRAINER

✓ In Window A, try to access /client-logs
  Expected: Redirects to /home (only trainers can access)

✓ In Window B, try to access /nutrition
  Expected: Redirects to /dashboard (only clients can access)
```

---

## Step 9 Test Results

### Pre-Implementation Assumptions (Met ✓):

- Router configured with WebHistory mode ✓
- All routes defined with correct paths ✓
- 404 catch-all route redirects to home ✓
- Page title updates via afterEach hook ✓

### Route Definitions Verified:

- 9 client routes (/home, /coaching, /circuit, /training, /nutrition, /goals, /schedule, /progress, /profile)
- 4 trainer routes (/dashboard, /messages, /client-logs, /admin)
- 1 shared route (/schedule)
- All routes marked as requiresAuth: true
- All routes include role restrictions in meta

### Deep Linking Support:

✓ Enabled - Using createWebHistory()
✓ Routes preserve state in URL
✓ Browser back/forward should work naturally
✓ Bookmarking URLs will work after first auth

---

## Step 10 Test Results

### Auth Guard Implementation Verified:

✓ beforeEach guard checks userStore.isAuthenticated
✓ Unauthenticated users trying protected routes redirected to /login
✓ Authenticated users trying /login redirected to home
✓ Role checking implemented for all protected routes
✓ Trainer routes require 'TRAINER' or 'ADMIN' role
✓ Client routes require 'CLIENT' role

### Login Flow Integration:

✓ LoginPage.vue updated to use router.push()
✓ setupUserAfterAuth navigates to appropriate home page
✓ Trainer: /dashboard, Client: /home
✓ Logout handler calls router.push('/login')

### Route Guard Logic:

1. Check if route requires auth (meta.requiresAuth)
   - If yes and not authenticated → redirect to /login
   - If yes and authenticated, check role
2. Check role restrictions (meta.roles)
   - If role not in allowed roles → redirect to home
3. Special case: authenticated users on /login → redirect to home
4. Otherwise allow navigation

---

## Manual Testing Checklist

### Before Testing:

- [ ] Clear browser cache
- [ ] Clear localStorage
- [ ] Restart dev server

### Deep Linking Tests (Step 9):

- [ ] Test 9.1: Direct URL access to /home, /dashboard, /goals
- [ ] Test 9.2: Browser back/forward buttons work
- [ ] Test 9.3: Multiple page loads via URL bar
- [ ] Test 9.4: Invalid route redirects appropriately

### Auth Flow Tests (Step 10):

- [ ] Test 10.1: Login redirects client to /home, trainer to /dashboard
- [ ] Test 10.2: Unauthenticated user on /training redirects to /login
- [ ] Test 10.3: Client accessing /admin redirects to /home
- [ ] Test 10.4: Trainer accessing /nutrition redirects to /dashboard
- [ ] Test 10.5: Logout button works and redirects to /login
- [ ] Test 10.6: After logout, can't access /home (redirects to /login)
- [ ] Test 10.7: Page refresh on protected route still works

---

## Implementation Notes

### How Deep Linking Works:

- Vue Router stores current route in window.history
- URLs like `/goals` are meaningful because routes are defined
- Browser back button works because history API is used
- Bookmarking works because full URL includes path

### How Auth Guard Works:

1. User tries to access any route
2. beforeEach guard intercepts
3. Check authentication status from Pinia store
4. If not authenticated and route requires auth → redirect to /login
5. If authenticated but role not allowed → redirect to home
6. If all checks pass → allow navigation

### Key Integration Points:

- Pinia store: userStore.isAuthenticated, userStore.currentUser
- Firebase: Session maintained by Firebase auth SDK
- Router guards: beforeEach for authentication, afterEach for page title
- Components: LoginPage and SidebarContent use router for navigation
