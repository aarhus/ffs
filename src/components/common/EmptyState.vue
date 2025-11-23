<template>
  <div class="flex flex-col items-center justify-center p-12 text-center">
    <div class="w-16 h-16 text-muted-foreground mb-4">
      <slot name="icon"></slot>
    </div>
    <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
    <p class="text-muted-foreground mb-6">{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  message: string;
}>();
</script>
