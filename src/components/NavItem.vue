<template>
  <button @click="$emit('click')" :aria-label="item.label" :class="[
    'flex items-center space-x-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground focus:bg-muted',
    isCollapsed ? 'justify-center px-2' : 'px-3'
  ]">
    <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
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