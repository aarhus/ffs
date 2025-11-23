<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold">{{ name }}</h2>
    <p class="text-muted-foreground">Coming Soon</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string;
  }>(),
  {
    name: 'Component'
  }
);
</script>
