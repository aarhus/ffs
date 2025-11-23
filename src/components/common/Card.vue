<template>
  <div :class="['p-6 rounded-lg border border-border bg-card', className]">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>
