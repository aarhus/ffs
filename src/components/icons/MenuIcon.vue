<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="className"><path d="M23 17H9v-5h14v5zM23 5H9v5h14V5z"/></svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>
