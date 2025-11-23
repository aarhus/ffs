<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="className"><path d="M9 6l6 6m0-6l-6 6m13 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>
