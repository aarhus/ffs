<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold">{{ componentName }}</h2>
    <p class="text-muted-foreground">Coming Soon</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  componentName: string;
}>();
</script>
