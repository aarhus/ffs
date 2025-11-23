<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="className"><path d="M17 16l4-4m0 0l-4-4m4 4H7m0 0a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2"/></svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>
