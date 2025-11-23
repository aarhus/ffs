<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 bg-black/50 z-50" @click="close"></div>
    </Transition>
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
          <div v-if="title" class="px-6 py-4 border-b border-border">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
          </div>
          <div class="px-6 py-4">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-border flex gap-2 justify-end">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const close = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
