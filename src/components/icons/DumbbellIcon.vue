<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="className"
  >
    <path d="M14.4 14.4 9.6 9.6" />
    <path d="M18.657 5.343a2 2 0 1 0-2.829-2.829" />
    <path d="m21.5 8.5-1.17-1.17" />
    <path d="m15.5 2.5-1.17-1.17" />
    <path d="M5.343 18.657a2 2 0 1 0 2.829 2.829" />
    <path d="m2.5 15.5 1.17 1.17" />
    <path d="m8.5 21.5 1.17 1.17" />
    <path d="m17 17 3-3" />
    <path d="m5 5 3 3" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  className?: string;
}>();
</script>
