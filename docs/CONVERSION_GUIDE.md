# React to Vue 3 Conversion Guide

## Overview

This document provides a detailed mapping of React patterns to Vue 3 patterns used in the FFS App conversion.

## Table of Contents

1. [Component Structure](#component-structure)
2. [State Management](#state-management)
3. [Props & Events](#props--events)
4. [Lifecycle & Effects](#lifecycle--effects)
5. [Conditional Rendering](#conditional-rendering)
6. [Loops & Lists](#loops--lists)
7. [Class Binding](#class-binding)
8. [Event Handling](#event-handling)
9. [Form Handling](#form-handling)
10. [Common Patterns](#common-patterns)

---

## Component Structure

### React

```tsx
import React from "react"

const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>
}

export default MyComponent
```

### Vue 3 with `<script setup>`

```vue
<template>
  <div>{{ prop1 }}</div>
</template>

<script setup lang="ts">
defineProps<{
  prop1: string
  prop2: number
}>()
</script>
```

---

## State Management

### React: useState

```tsx
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)

const increment = () => setCount(count + 1)
const updateUser = (newUser: User) => setUser(newUser)
```

### Vue 3: ref & reactive

```vue
<script setup lang="ts">
import { ref, reactive } from "vue"

const count = ref(0)
const user = ref<User | null>(null)

const increment = () => count.value++
const updateUser = (newUser: User) => {
  user.value = newUser
}

// For objects, you can also use:
const state = reactive({
  count: 0,
  user: null as User | null,
})
</script>
```

---

## Props & Events

### React

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
)
```

### Vue 3

```vue
<template>
  <button @click="$emit('click')">{{ label }}</button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()

defineEmits<{
  click: []
}>()
</script>
```

### React Parent

```tsx
<Button label="Submit" onClick={() => handleSubmit()} />
```

### Vue 3 Parent

```vue
<Button label="Submit" @click="handleSubmit" />
```

---

## Lifecycle & Effects

### React: useEffect

```tsx
useEffect(() => {
  console.log("Component mounted")
  return () => console.log("Cleanup")
}, [])

useEffect(() => {
  console.log("Value changed:", value)
}, [value])
```

### Vue 3: watch & lifecycle hooks

```vue
<script setup lang="ts">
import { watch, onMounted, onUnmounted } from "vue"

onMounted(() => {
  console.log("Component mounted")
})

onUnmounted(() => {
  console.log("Cleanup")
})

watch(value, (newVal) => {
  console.log("Value changed:", newVal)
})
</script>
```

---

## Conditional Rendering

### React

```tsx
{
  isLoggedIn && <Dashboard />
}
{
  isLoading ? <Spinner /> : <Content />
}
{
  status === "active" ? (
    <Active />
  ) : status === "pending" ? (
    <Pending />
  ) : (
    <Inactive />
  )
}
```

### Vue 3

```vue
<Dashboard v-if="isLoggedIn" />
<Spinner v-if="isLoading" />
<Content v-else />
<Active v-if="status === 'active'" />
<Pending v-else-if="status === 'pending'" />
<Inactive v-else />
```

---

## Loops & Lists

### React

```tsx
{
  items.map((item) => <Item key={item.id} item={item} />)
}
```

### Vue 3

```vue
<Item v-for="item in items" :key="item.id" :item="item" />
```

---

## Class Binding

### React

```tsx
<div
  className={`
  flex items-center
  ${isActive ? "bg-primary text-white" : "bg-gray-200"}
  ${isCollapsed ? "w-20" : "w-64"}
`}
></div>
```

### Vue 3

```vue
<div
  :class="[
    'flex items-center',
    {
      'bg-primary text-white': isActive,
      'bg-gray-200': !isActive,
    },
    isCollapsed ? 'w-20' : 'w-64',
  ]"
>
</div>

<!-- Or using object syntax -->
<div
  :class="{
    'flex items-center': true,
    'bg-primary text-white': isActive,
    'bg-gray-200': !isActive,
    'w-20': isCollapsed,
    'w-64': !isCollapsed,
  }"
>
</div>
```

---

## Event Handling

### React

```tsx
const handleClick = () => console.log('clicked');
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
};

<button onClick={handleClick}>Click</button>
<form onSubmit={handleSubmit}>
```

### Vue 3

```vue
<template>
  <button @click="handleClick">Click</button>
  <button @click.prevent="handleLink">Link</button>
  <form @submit.prevent="handleSubmit">
</template>

<script setup lang="ts">
const handleClick = () => console.log('clicked');
const handleSubmit = () => {
  // No need for preventDefault
};
</script>
```

**Common Event Modifiers:**

- `.prevent` - preventDefault()
- `.stop` - stopPropagation()
- `.self` - only trigger if event.target is element itself
- `.once` - only trigger once
- `.passive` - attach listener with passive option

---

## Form Handling

### React

```tsx
const [form, setForm] = useState({ name: "", email: "" })

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target
  setForm((prev) => ({ ...prev, [name]: value }))
}

;<input name="name" value={form.name} onChange={handleChange} />
```

### Vue 3: v-model

```vue
<template>
  <input v-model="form.name" />
  <textarea v-model="form.bio"></textarea>
  <input v-model.number="form.age" type="number" />
  <input v-model.trim="form.username" />
</template>

<script setup lang="ts">
import { reactive } from "vue"

const form = reactive({
  name: "",
  email: "",
})
</script>
```

---

## Common Patterns

### 1. Computed Values

**React:**

```tsx
const doubled = useMemo(() => count * 2, [count])
```

**Vue 3:**

```vue
<script setup lang="ts">
import { computed } from "vue"

const doubled = computed(() => count.value * 2)
</script>
```

### 2. Conditional Component Rendering

**React:**

```tsx
const renderContent = () => {
  switch (activeTab) {
    case "home":
      return <Home />
    case "about":
      return <About />
    default:
      return <NotFound />
  }
}

return renderContent()
```

**Vue 3:**

```vue
<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import { computed } from "vue"
import Home from "./Home.vue"
import About from "./About.vue"
import NotFound from "./NotFound.vue"

const currentComponent = computed(() => {
  switch (activeTab.value) {
    case "home":
      return Home
    case "about":
      return About
    default:
      return NotFound
  }
})
</script>
```

### 3. Async Components

**React:**

```tsx
const LazyHome = React.lazy(() => import("./Home"))

;<Suspense fallback={<Loading />}>
  <LazyHome />
</Suspense>
```

**Vue 3:**

```vue
<script setup lang="ts">
import { defineAsyncComponent } from "vue"

const Home = defineAsyncComponent(() => import("./Home.vue"))
</script>

<template>
  <Suspense>
    <template #default>
      <Home />
    </template>
    <template #fallback>
      <Loading />
    </template>
  </Suspense>
</template>
```

### 4. Render Props / Slots

**React:**

```tsx
interface CardProps {
  children: React.ReactNode
  title?: string
}

const Card: React.FC<CardProps> = ({ children, title }) => (
  <div>
    {title && <h2>{title}</h2>}
    <div>{children}</div>
  </div>
)
```

**Vue 3:**

```vue
<template>
  <div>
    <h2 v-if="title">{{ title }}</h2>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>
```

### 5. Named Slots

**Vue 3:**

```vue
<!-- Parent -->
<template>
  <Card>
    <template #header>
      <h1>Title</h1>
    </template>
    <template #default> Content here </template>
    <template #footer> Footer </template>
  </Card>
</template>

<!-- Card.vue -->
<template>
  <div>
    <slot name="header"></slot>
    <slot></slot>
    <slot name="footer"></slot>
  </div>
</template>
```

### 6. Scoped Slots

**Vue 3:**

```vue
<!-- Parent -->
<template>
  <List v-slot="{ item }">
    <div>{{ item.name }}</div>
  </List>
</template>

<!-- List.vue -->
<template>
  <div v-for="item in items" :key="item.id">
    <slot :item="item"></slot>
  </div>
</template>
```

---

## Migration Checklist

When converting React components to Vue 3:

- [ ] Convert functional component to `.vue` file
- [ ] Move JSX to `<template>` section
- [ ] Convert `useState` to `ref()` or `reactive()`
- [ ] Convert `useEffect` to `watch()` or lifecycle hooks
- [ ] Replace `props` object with `defineProps<{...}>()`
- [ ] Replace callbacks with `defineEmits<{...}>()`
- [ ] Replace `.map()` with `v-for`
- [ ] Replace ternary operators with `v-if`/`v-else`
- [ ] Replace `className` with `:class`
- [ ] Replace event handlers with `@event`
- [ ] Replace `useMemo` with `computed()`
- [ ] Update all imports to use `.vue` extensions
- [ ] Test all interactive features

---

## Useful Resources

- [Vue 3 Official Guide](https://vuejs.org/)
- [Composition API Reference](https://vuejs.org/api/composition-api-setup.html)
- [Vue 3 Migration Guide](https://v2.vuejs.org/v2/guide/migration.html)
- [TypeScript with Vue](https://vuejs.org/guide/typescript/overview.html)
