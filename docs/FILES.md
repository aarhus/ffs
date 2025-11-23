# Vue 3 Conversion - Complete File Structure

## Project Root (`/home/matt/finlay/app-vue/`)

```
app-vue/
├── src/
│   ├── components/
│   │   ├── icons/
│   │   │   ├── DumbbellIcon.vue
│   │   │   ├── HomeIcon.vue
│   │   │   ├── MessageSquareIcon.vue
│   │   │   ├── UsersIcon.vue
│   │   │   ├── ClipboardListIcon.vue
│   │   │   ├── AppleIcon.vue
│   │   │   ├── TargetIcon.vue
│   │   │   ├── CalendarIcon.vue
│   │   │   ├── TrendingUpIcon.vue
│   │   │   ├── LayoutDashboardIcon.vue
│   │   │   ├── SunIcon.vue
│   │   │   ├── MoonIcon.vue
│   │   │   ├── MenuIcon.vue
│   │   │   ├── ChevronsLeft.vue
│   │   │   ├── UserIcon.vue
│   │   │   ├── ShieldIcon.vue
│   │   │   └── LogOut.vue
│   │   ├── common/
│   │   │   ├── Card.vue
│   │   │   ├── Modal.vue
│   │   │   └── EmptyState.vue
│   │   ├── App.vue (in src, symlink to root)
│   │   ├── SidebarContent.vue
│   │   ├── NavItem.vue
│   │   ├── LoginPage.vue
│   │   ├── ClientHome.vue
│   │   ├── TrainerDashboard.vue
│   │   ├── ChatView.vue
│   │   ├── CircuitGroup.vue
│   │   ├── TrainingLog.vue
│   │   ├── NutritionLog.vue
│   │   ├── Goals.vue
│   │   ├── Schedule.vue
│   │   ├── Progress.vue
│   │   ├── AddWorkout.vue
│   │   ├── TrainerMessages.vue
│   │   ├── TrainerClientLogs.vue
│   │   ├── AdminPage.vue
│   │   └── ProfilePage.vue
│   ├── data/
│   │   └── mockData.ts
│   ├── types.ts
│   ├── main.ts
│   └── App.vue
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
├── CONVERSION_GUIDE.md
├── .gitignore
├── .env.example
└── node_modules/ (after npm install)
```

## File Descriptions

### Root Configuration Files

- **`package.json`** - Dependencies and scripts
  - Vue 3.4.0, TypeScript, Vite, date-fns
  - Scripts: `npm run dev`, `npm run build`

- **`vite.config.ts`** - Vite build configuration
  - Vue plugin setup
  - Path alias: `@` → `./src`
  - Environment variable loading

- **`tsconfig.json`** - TypeScript configuration
  - Strict mode enabled
  - Path mapping for `@/*` alias
  - Support for `.vue` files

- **`index.html`** - HTML entry point
  - Tailwind CSS CDN
  - Custom CSS variables for theming
  - Dark mode configuration

- **`.env.example`** - Environment variables template

### Source Files

#### `src/main.ts`
- Vue app initialization
- Mount to `#app` element

#### `src/types.ts`
- All TypeScript interfaces and enums
- Role, User, Goal, Workout, etc.
- Screen type union

#### `src/data/mockData.ts`
- Mock user data
- Initial empty arrays for other data types

#### `src/App.vue`
**The main application component** (~500 lines)
- Full state management with `ref()`
- All event handlers
- Dynamic component rendering
- Sidebar and layout management
- Dark mode toggle
- Mobile responsive design

### Components

#### `src/components/icons/` (17 files)
Individual Vue components for each icon
- Each is a simple SVG wrapper component
- Props: `className?: string`
- All SVG icons from the original React app

#### `src/components/common/` (3 files)

**`Card.vue`** - Reusable card container
- Props: `className?: string`
- Slot for content

**`Modal.vue`** - Dialog modal component
- Props: `modelValue: boolean`, `title?: string`
- Two-way binding with `v-model`
- Teleport to body
- Fade and scale transitions
- Named slot: `footer`

**`EmptyState.vue`** - Empty state placeholder
- Props: `title: string`, `message: string`
- Named slot: `icon`
- Default slot for actions

#### Page Components (placeholders)

**`LoginPage.vue`** - Login interface
**`ClientHome.vue`** - Client dashboard
**`TrainerDashboard.vue`** - Trainer dashboard
**`ChatView.vue`** - Chat interface
**`CircuitGroup.vue`** - Group circuit view
**`TrainingLog.vue`** - Workout history
**`NutritionLog.vue`** - Nutrition tracking
**`Goals.vue`** - Goals management
**`Schedule.vue`** - Schedule/calendar
**`Progress.vue`** - Progress tracking
**`AddWorkout.vue`** - Workout creation
**`TrainerMessages.vue`** - Trainer messaging
**`TrainerClientLogs.vue`** - Client workout logs
**`AdminPage.vue`** - Admin panel
**`ProfilePage.vue`** - User profile

All page components are currently **placeholders** and need implementation.

#### Layout Components

**`SidebarContent.vue`** - Sidebar navigation
- Props: isCollapsed, navItems, activeScreen, currentUser, isDarkMode
- Emits: setScreen, logout, toggleTheme
- Dynamic icon rendering

**`NavItem.vue`** - Single navigation item
- Props: item, isActive, isCollapsed
- Emits: click
- Dynamic component for icons

### Documentation

- **`README.md`** - Project overview, setup, and features
- **`CONVERSION_GUIDE.md`** - Detailed React-to-Vue patterns and examples

## Quick Start

```bash
# Navigate to Vue project
cd app-vue

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Key Differences from React Version

1. **No JSX** - Uses Vue template syntax instead
2. **No Hooks** - Uses Composition API instead
3. **No PropTypes** - Uses TypeScript interfaces with `defineProps`
4. **No Custom Event Names** - Uses `defineEmits`
5. **Single File Components** - All logic, template, styles in one `.vue` file
6. **Reactive References** - Use `ref()` and `computed()` instead of hooks
7. **Template Directives** - `v-if`, `v-for`, `v-model`, `@click`, etc.

## State Flow

All state is managed in `App.vue` using reactive `ref()`:
- User authentication & profile
- Navigation screens
- All data: users, workouts, goals, chats, etc.
- UI state: dark mode, sidebar collapse, mobile menu

To scale this, consider:
- Moving state to Pinia store
- Adding Vue Router for better navigation
- Breaking App.vue into smaller pieces

## Next Steps

1. Implement placeholder page components
2. Add Vue Router for better navigation
3. Set up Pinia for state management
4. Add API integration
5. Add unit and component tests
