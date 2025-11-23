# React vs Vue 3 - Side-by-Side Examples

This file shows common patterns from your app converted from React to Vue 3.

## Table of Contents
1. [State Management](#state-management)
2. [Event Handling](#event-handling)
3. [Component Props](#component-props)
4. [Conditional Rendering](#conditional-rendering)
5. [Lists and Loops](#lists-and-loops)
6. [Computed Properties](#computed-properties)
7. [Watchers](#watchers)
8. [Component Composition](#component-composition)

---

## State Management

### Example: Authentication State

**React (Original)**
```tsx
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };
  
  return (
    <div>
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard user={currentUser} />
      )}
    </div>
  );
};
```

**Vue 3 (New)**
```vue
<template>
  <div>
    <LoginPage v-if="!isAuthenticated" @login="handleLogin" />
    <Dashboard v-else :user="currentUser" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '@/types';

const isAuthenticated = ref(false);
const currentUser = ref<User | null>(null);

const handleLogin = (user: User) => {
  currentUser.value = user;
  isAuthenticated.value = true;
};
</script>
```

---

## Event Handling

### Example: Message Sending

**React (Original)**
```tsx
const handleSendMessage = (chat: Chat, text: string) => {
  if (!currentUser || !text.trim()) return;

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    chatId: chat.id,
    senderId: currentUser.id,
    text,
    createdAt: new Date().toISOString(),
    readBy: [currentUser.id],
  };
  setMessages(prev => [...prev, newMessage]);
};

return (
  <ChatView
    chat={chat}
    messages={messages}
    currentUser={currentUser}
    onSendMessage={(text) => handleSendMessage(chat, text)}
  />
);
```

**Vue 3 (New)**
```vue
<template>
  <ChatView
    :chat="chat"
    :messages="messages"
    :currentUser="currentUser"
    @sendMessage="(text) => handleSendMessage(chat, text)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Chat, Message, User } from '@/types';

const messages = ref<Message[]>([]);

const handleSendMessage = (chat: Chat, text: string) => {
  if (!currentUser.value || !text.trim()) return;

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    chatId: chat.id,
    senderId: currentUser.value.id,
    text,
    createdAt: new Date().toISOString(),
    readBy: [currentUser.value.id],
  };
  messages.value.push(newMessage);
};
</script>
```

---

## Component Props

### Example: Navigation Item

**React (Original)**
```tsx
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  isCollapsed,
  onClick
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 ${isActive ? 'text-primary' : ''}`}
  >
    {icon}
    <span className={isCollapsed ? 'sr-only' : 'inline'}>{label}</span>
  </button>
);
```

**Vue 3 (New)**
```vue
<template>
  <button
    @click="$emit('click')"
    :class="[
      'flex items-center space-x-3',
      isActive ? 'text-primary' : ''
    ]"
  >
    <component :is="item.icon" class="w-5 h-5" />
    <span :class="isCollapsed ? 'sr-only' : 'inline'">{{ item.label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  item: { id: string; label: string; icon: any };
  isActive: boolean;
  isCollapsed: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>
```

---

## Conditional Rendering

### Example: Screen Routing Logic

**React (Original)**
```tsx
const renderContent = () => {
  if (isClientView) {
    switch (activeScreen) {
      case 'home':
        return <ClientHome currentUser={currentUser} goals={goals} />;
      case 'coaching': {
        const trainer = users.find(u => u.role === Role.TRAINER);
        if (!trainer) {
          return <EmptyState title="No Coach Available" />;
        }
        return <ChatView chat={chatToRender} />;
      }
      case 'training':
        return <TrainingLog workouts={workouts} />;
      default:
        return <div>Coming Soon</div>;
    }
  } else { // Trainer view
    switch (activeScreen) {
      case 'dashboard':
        return <TrainerDashboard sessions={sessions} />;
      // ...more cases
      default:
        return <div>Coming Soon</div>;
    }
  }
};

return renderContent();
```

**Vue 3 (New)**
```vue
<template>
  <component
    :is="currentComponent"
    v-bind="currentComponentProps"
    v-on="currentComponentEmits"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ClientHome from '@/components/ClientHome.vue';
import ChatView from '@/components/ChatView.vue';
import TrainingLog from '@/components/TrainingLog.vue';
import TrainerDashboard from '@/components/TrainerDashboard.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const currentComponent = computed(() => {
  const isClientView = currentUser.value?.role === Role.CLIENT;

  if (isClientView) {
    switch (activeScreen.value) {
      case 'home': return ClientHome;
      case 'coaching':
        return trainer.value ? ChatView : EmptyState;
      case 'training': return TrainingLog;
      default: return EmptyState;
    }
  } else {
    switch (activeScreen.value) {
      case 'dashboard': return TrainerDashboard;
      default: return EmptyState;
    }
  }
});

const currentComponentProps = computed(() => {
  if (activeScreen.value === 'home') {
    return {
      currentUser: currentUser.value,
      goals: goals.value,
    };
  }
  // ...more cases
  return {};
});
</script>
```

---

## Lists and Loops

### Example: Rendering Navigation Items

**React (Original)**
```tsx
const navItems = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'coaching', label: '1:1 Coaching', icon: <MessageSquareIcon /> },
  { id: 'training', label: 'Training', icon: <DumbbellIcon /> },
];

return (
  <nav className="space-y-2">
    {navItems.map((item) => (
      <NavItem
        key={item.id}
        icon={item.icon}
        label={item.label}
        isActive={activeScreen === item.id}
        onClick={() => setActiveScreen(item.id as Screen)}
      />
    ))}
  </nav>
);
```

**Vue 3 (New)**
```vue
<template>
  <nav class="space-y-2">
    <NavItem
      v-for="item in navItems"
      :key="item.id"
      :item="item"
      :isActive="activeScreen === item.id"
      @click="handleSetScreen(item.id)"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import MessageSquareIcon from '@/components/icons/MessageSquareIcon.vue';
import DumbbellIcon from '@/components/icons/DumbbellIcon.vue';

const navItems = computed(() => [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'coaching', label: '1:1 Coaching', icon: MessageSquareIcon },
  { id: 'training', label: 'Training', icon: DumbbellIcon },
]);
</script>
```

---

## Computed Properties

### Example: Filtering Goals

**React (Original)**
```tsx
const activeGoals = goals.filter(g => g.status === GoalStatus.ACTIVE);
const completedGoals = goals.filter(g => g.status === GoalStatus.COMPLETED);

const totalProgress = useMemo(() => {
  return activeGoals.reduce((sum, g) => sum + g.current, 0) / activeGoals.length;
}, [activeGoals]);

return (
  <div>
    <p>Progress: {totalProgress}%</p>
  </div>
);
```

**Vue 3 (New)**
```vue
<template>
  <div>
    <p>Progress: {{ totalProgress }}%</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const activeGoals = computed(() => 
  goals.value.filter(g => g.status === GoalStatus.ACTIVE)
);

const completedGoals = computed(() =>
  goals.value.filter(g => g.status === GoalStatus.COMPLETED)
);

const totalProgress = computed(() => {
  if (activeGoals.value.length === 0) return 0;
  return activeGoals.value.reduce((sum, g) => sum + g.current, 0) / activeGoals.value.length;
});
</script>
```

---

## Watchers

### Example: Dark Mode Toggle

**React (Original)**
```tsx
const [isDarkMode, setIsDarkMode] = useState(false);

useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDarkMode]);

const toggleTheme = () => setIsDarkMode(!isDarkMode);

return (
  <button onClick={toggleTheme}>
    {isDarkMode ? <SunIcon /> : <MoonIcon />}
  </button>
);
```

**Vue 3 (New)**
```vue
<template>
  <button @click="isDarkMode = !isDarkMode">
    <SunIcon v-if="isDarkMode" />
    <MoonIcon v-else />
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const isDarkMode = ref(false);

watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script>
```

---

## Component Composition

### Example: Complex Goal Update Logic

**React (Original)**
```tsx
const handleBulkUpdateGoals = (updates: { goalId: string; newCurrent: number }[]) => {
  setGoals(prevGoals => {
    const newGoals = [...prevGoals];
    updates.forEach(update => {
      const goalIndex = newGoals.findIndex(g => g.id === update.goalId);
      if (goalIndex !== -1) {
        newGoals[goalIndex].current = update.newCurrent;
      }
    });
    return newGoals;
  });
};

return (
  <Goals
    currentUser={currentUser}
    goals={goals}
    onBulkUpdateGoals={handleBulkUpdateGoals}
  />
);
```

**Vue 3 (New)**
```vue
<template>
  <Goals
    :currentUser="currentUser"
    :goals="goals"
    @bulkUpdateGoals="handleBulkUpdateGoals"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Goal } from '@/types';

const goals = ref<Goal[]>([]);

const handleBulkUpdateGoals = (
  updates: { goalId: string; newCurrent: number }[]
) => {
  updates.forEach((update) => {
    const goalIndex = goals.value.findIndex(g => g.id === update.goalId);
    if (goalIndex !== -1) {
      goals.value[goalIndex].current = update.newCurrent;
    }
  });
};
</script>
```

---

## Key Takeaways

| React | Vue 3 |
|-------|-------|
| `useState()` | `ref()` / `reactive()` |
| `useEffect()` | `watch()` / `onMounted()` |
| `useMemo()` | `computed()` |
| JSX syntax | Template syntax + `<script setup>` |
| `props` parameter | `defineProps<{}>()` |
| Callbacks | `defineEmits<{}>()` |
| `.map()` | `v-for` directive |
| Ternary `?:` | `v-if` / `v-else` |
| `className={}` | `:class="[]"` or `:class="{}"` |
| `onClick={}` | `@click` |
| Component composition | `<component :is="comp" />` |

---

## Running Your Vue App

```bash
cd /home/matt/finlay/app-vue
npm install
npm run dev
```

Visit `http://localhost:3000` to see your Vue app!

## Tips for Implementation

1. **Start with LoginPage** - The entry point is simple
2. **Use the React code as reference** - Look at your original components
3. **Implement one page at a time** - Don't try to do everything at once
4. **Use Vue DevTools** - Install Vue DevTools browser extension for debugging
5. **Reference CONVERSION_GUIDE.md** - When stuck on syntax

Good luck! 🚀
