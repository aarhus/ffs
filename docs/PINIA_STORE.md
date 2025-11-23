# Pinia Store Implementation ✅

All user state has been moved from local component state to a centralized Pinia store. Here's what changed:

## Store Created

**`src/stores/user.ts`** - Centralized user state management

### State

```typescript
currentUser: User | null // Currently logged-in user
isAuthenticated: boolean // Is user logged in
isLoading: boolean // API calls in progress
error: string | null // Last error message
```

### Computed Properties

```typescript
isClient: boolean // Is user a CLIENT
isTrainer: boolean // Is user a TRAINER
isAdmin: boolean // Is user an ADMIN
userId: string | number | null // Current user ID
userEmail: string | null // Current user email
userName: string | null // Current user name
userRole: string | null // Current user role
```

### Actions

```typescript
login(user: User)               // Login user
logout()                        // Logout and clear state
fetchUserByFirebaseUid(uid)     // Fetch from backend by Firebase UID
registerAndLogin(...)           // Register new user and login
updateProfile(updates)          // Update current user profile
clearError()                    // Clear error message
```

## Files Updated

### 1. **src/main.ts** (UPDATED)

- Added `createPinia()` initialization
- Store now created before app mounts

```typescript
import { createPinia } from "pinia"

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
```

### 2. **src/App.vue** (UPDATED)

- `isAuthenticated` → computed from `userStore.isAuthenticated`
- `currentUser` → computed from `userStore.currentUser`
- `handleLogin()` → calls `userStore.login()`
- `handleLogout()` → calls `userStore.logout()`
- `handleUpdateProfile()` → calls `userStore.updateProfile()`
- All child components read from store, no prop drilling

**Before:**

```typescript
const isAuthenticated = ref(false)
const currentUser = ref<User | null>(null)

const handleLogin = (user: User) => {
  currentUser.value = user
  isAuthenticated.value = true
}
```

**After:**

```typescript
const userStore = useUserStore()
const isAuthenticated = computed(() => userStore.isAuthenticated)
const currentUser = computed(() => userStore.currentUser)

const handleLogin = (user: User) => {
  userStore.login(user)
}
```

### 3. **src/components/LoginPage.vue** (UPDATED)

- Now uses store for authentication
- Calls `userStore.login()` on successful auth
- Still emits event for parent (backwards compatible)
- `handleLogin()`, `handleSignup()`, `handleGoogleLogin()` integrated with store

## Usage in Components

### Access Store State

```typescript
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()

// Access state
const currentUser = computed(() => userStore.currentUser)
const isAuthenticated = computed(() => userStore.isAuthenticated)
const isClient = computed(() => userStore.isClient)

// Or directly use
userStore.currentUser // Direct access
userStore.isAuthenticated // Direct access
```

### Call Store Actions

```typescript
// Login
userStore.login(user)

// Logout
userStore.logout()

// Fetch user from backend
const user = await userStore.fetchUserByFirebaseUid(firebaseUid)

// Register new user
const user = await userStore.registerAndLogin(firebaseUid, email, name)

// Update profile
userStore.updateProfile({ name: "New Name", avatar: "url" })

// Clear error
userStore.clearError()
```

## Benefits of Pinia Store

✅ **Single Source of Truth** - One place for user state
✅ **No Prop Drilling** - All components access store directly
✅ **Type Safe** - Full TypeScript support
✅ **Reactive** - Automatic re-renders on state change
✅ **Composable** - Access from any component with `useUserStore()`
✅ **Persistent** - Can be easily persisted to localStorage
✅ **DevTools** - Debug state changes in Vue DevTools
✅ **Testable** - Easy to test actions and state

## Architecture

```
App.vue (Root)
  ├─ Pinia Store (useUserStore)
  │   ├─ State: currentUser, isAuthenticated, isLoading, error
  │   └─ Actions: login(), logout(), fetchUser(), etc.
  │
  ├─ LoginPage.vue
  │   ├─ Uses: userStore.login() on auth success
  │   └─ Emits: login event (parent listens)
  │
  ├─ SidebarContent.vue
  │   └─ Reads: userStore.currentUser, userStore.isClient
  │
  ├─ ClientHome.vue
  │   └─ Reads: userStore.currentUser
  │
  └─ Other Components...
      └─ All have direct access to userStore
```

## Migration Path

### Old Pattern (No Store)

```typescript
// App.vue
const currentUser = ref<User | null>(null)

// LoginPage.vue
emit("login", user)

// App.vue
const handleLogin = (user: User) => {
  currentUser.value = user
}

// Any child component needs props to access user
props: {
  currentUser: User
}
```

### New Pattern (With Store)

```typescript
// Pinia Store
const userStore = useUserStore()
userStore.login(user)

// Any component, anywhere
import { useUserStore } from "@/stores/user"
const userStore = useUserStore()
const currentUser = userStore.currentUser
```

## Installation Steps

Pinia was added to dependencies. If needed manually:

```bash
npm install pinia
```

## Next Steps

1. ✅ User store created and integrated
2. ⏳ Create additional stores as needed:
   - `workoutStore` - Workout state management
   - `goalStore` - Goal state management
   - `nutritionStore` - Nutrition logs state management
3. ⏳ Persist store to localStorage (for app reload)
4. ⏳ Add state reset on logout

## Advanced Usage (Future)

### Persist Store

```typescript
// plugins/persist.ts
import { createPinia } from "pinia"
import { createPersistedState } from "pinia-plugin-persistedstate"

const pinia = createPinia()
pinia.use(createPersistedState())
```

### Store Modules

```typescript
// Store for each major feature
import { useUserStore } from "@/stores/user"
import { useWorkoutStore } from "@/stores/workout"
import { useGoalStore } from "@/stores/goal"

// Use multiple stores in component
const userStore = useUserStore()
const workoutStore = useWorkoutStore()
```

## Testing Store

```typescript
import { setActivePinia, createPinia } from "pinia"
import { useUserStore } from "@/stores/user"

describe("User Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("should login user", () => {
    const userStore = useUserStore()
    const user = { id: 1, name: "John", email: "john@example.com" }

    userStore.login(user)

    expect(userStore.isAuthenticated).toBe(true)
    expect(userStore.currentUser).toEqual(user)
  })

  it("should logout user", () => {
    const userStore = useUserStore()
    userStore.logout()

    expect(userStore.isAuthenticated).toBe(false)
    expect(userStore.currentUser).toBeNull()
  })
})
```

## Documentation Files

- `PINIA_STORE.md` - This file
- Backend Integration: `/BACKEND_INTEGRATION.md`
- Testing Guide: `/TESTING_GUIDE.md`

## Resources

- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript Support in Pinia](https://pinia.vuejs.org/cookbook/type-safe-store.html)

## Summary

Your frontend now uses **Pinia for centralized state management**!

- User state is no longer scattered across components ✅
- All state accessible from anywhere via store ✅
- Type-safe and reactive ✅
- Ready for scaling with additional stores ✅
