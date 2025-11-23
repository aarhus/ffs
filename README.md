# FFS App - Vue 3 Conversion

This is a complete Vue 3 + TypeScript conversion of the original React application.

## Project Structure

```
src/
├── components/
│   ├── icons/           # SVG icon components
│   ├── common/          # Reusable components (Card, Modal, EmptyState)
│   ├── App.vue          # Main application component with router outlet
│   ├── SidebarContent.vue
│   ├── NavItem.vue
│   ├── LoginPage.vue
│   ├── ClientHome.vue
│   ├── TrainerDashboard.vue
│   ├── ChatView.vue
│   ├── CircuitGroup.vue
│   ├── TrainingLog.vue
│   ├── NutritionLog.vue
│   ├── Goals.vue
│   ├── Schedule.vue
│   ├── Progress.vue
│   ├── AddWorkout.vue
│   ├── TrainerMessages.vue
│   ├── TrainerClientLogs.vue
│   ├── AdminPage.vue
│   └── ProfilePage.vue
├── router/
│   └── index.ts         # Vue Router configuration with auth guards
├── stores/
│   └── user.ts          # Pinia store for authentication and user state
├── data/
│   └── mockData.ts      # Mock data and initial state
├── docs/                # Store all documents that are created here
├── server/              # The backend api - accessible via the /api/ router
├── types.ts             # TypeScript type definitions
└── main.ts              # Application entry point
```

## Key Changes from React to Vue

### 1. **Component System**

- **React**: Functional components with hooks
- **Vue**: Single File Components (`.vue`) with Composition API

### 2. **State Management**

- **React**: `useState` hooks
- **Vue**: `ref()` and `reactive()` from Composition API

### 3. **Props & Events**

- **React**: Props passed as object, callbacks with `onChange`, `onClick`
- **Vue**: Props via `defineProps`, emits via `defineEmits`

### 4. **Template Syntax**

- **React**: JSX with curly braces `{}`
- **Vue**: Template syntax with `{{ }}` for interpolation, `v-` directives

### 5. **Conditional Rendering**

- **React**: Ternary operators and logical AND (`&&`)
- **Vue**: `v-if`, `v-else`, `v-show` directives

### 6. **Lists**

- **React**: `.map()` in JSX
- **Vue**: `v-for` directive

### 7. **Effects**

- **React**: `useEffect()` hooks
- **Vue**: `watch()` and lifecycle hooks

### 8. **Icons**

- **React**: SVG components returning JSX
- **Vue**: SVG components with template syntax

## Setup & Installation

```bash
cd app-vue
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Key Features

- **Vue Router**: Full client-side routing with authentication guards and role-based access control
- **Pinia State Management**: Centralized user store for authentication and session state
- **Dark Mode**: Toggle via button in sidebar
- **Responsive Layout**: Mobile-first design with collapsible sidebar
- **Role-Based Navigation**: Different nav items and routes for trainers vs clients
- **Authentication Guards**: Protected routes with automatic redirect to login for unauthenticated users
- **TypeScript**: Full type safety throughout
- **Tailwind CSS**: Pre-configured styling with dark mode support

## Component Patterns

### Using Props

```vue
<script setup lang="ts">
import type { User } from "@/types"

defineProps<{
  user: User
}>()
</script>
```

### Emitting Events

```vue
<script setup lang="ts">
defineEmits<{
  click: []
  select: [id: string]
}>()
</script>
```

### Using Reactive State

```vue
<script setup lang="ts">
import { ref, computed } from "vue"

const count = ref(0)
const doubled = computed(() => count.value * 2)

const increment = () => {
  count.value++
}
</script>
```

### Watchers

```vue
<script setup lang="ts">
import { watch } from "vue"

watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add("dark")
  }
})
</script>
```

## Routing & Navigation

### Route Structure

The app uses Vue Router with the following route organization:

- **Client Routes** (`/home`, `/coaching`, `/circuit`, `/training`, `/nutrition`, `/goals`, `/schedule`, `/progress`, `/profile`)

  - Accessible only to users with `CLIENT` role
  - Automatic redirect to `/dashboard` if trainer tries to access

- **Trainer Routes** (`/dashboard`, `/messages`, `/client-logs`, `/admin`)

  - Accessible only to users with `TRAINER` or `ADMIN` role
  - Automatic redirect to `/home` if client tries to access

- **Shared Routes** (`/schedule`)

  - Accessible to both `CLIENT` and `TRAINER` roles

- **Auth Routes** (`/login`)
  - Publicly accessible
  - Authenticated users automatically redirected to appropriate home

### Navigation Guards

All routes are protected by authentication guards:

1. **Authentication Check**: Routes with `requiresAuth: true` redirect unauthenticated users to `/login`
2. **Role Validation**: Routes with role restrictions check user's role and redirect if unauthorized
3. **Login Prevention**: Authenticated users trying to access `/login` are redirected to their home page

### Using Router in Components

```typescript
import { useRouter, useRoute } from "vue-router"

// Get router instance for navigation
const router = useRouter()
router.push("/home")

// Get current route information
const route = useRoute()
const currentPath = route.path
const title = route.meta.title
```

For more details, see `src/router/index.ts` and `docs/ROUTER_MIGRATION_TESTING.md`.

## Notes

- All page components are currently placeholders with "Coming Soon" messages
- Implement individual page components by replacing the placeholder content
- The app uses Tailwind CSS with a custom theme defined in `index.html`
- Icon components are individual `.vue` files in `src/components/icons/`
- The original data structures and types remain unchanged for easy migration

## Next Steps

1. **Implement Individual Components**: Replace placeholder components with full implementations
2. **Add Backend Integration**: Connect to actual API endpoints (backend server code under `./server/`)
3. **Testing**: Add unit tests with Vitest and component tests with Vue Test Utils
4. **Performance Optimization**: Monitor bundle size and optimize lazy-loaded components
5. **API Integration**: Replace mock data with real API calls to backend endpoints
