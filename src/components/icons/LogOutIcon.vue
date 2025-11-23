<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="className"><path d="M15 18H9m0 0l-6-6m6 6l6-6m-6 6v-12"/></svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>
