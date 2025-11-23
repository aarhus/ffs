<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Messages</h1>
      <p class="text-muted-foreground">{{ chat.name || 'Direct message' }}</p>
    </div>

    <div class="px-6 space-y-4 flex flex-col h-[calc(100vh-12rem)]">
      <!-- Messages Container -->
      <div class="flex-1 overflow-y-auto space-y-3 mb-4">
        <div v-if="sortedMessages.length === 0" class="h-full flex items-center justify-center">
          <EmptyState title="No Messages Yet" message="Start the conversation!" />
        </div>
        <div v-for="message in sortedMessages" :key="message.id" :class="[
          'flex',
          message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
        ]">
          <div :class="[
            'max-w-sm px-4 py-2 rounded-lg',
            message.senderId === currentUser.id
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-muted text-muted-foreground rounded-bl-none'
          ]">
            <p class="text-sm">{{ message.text }}</p>
            <p class="text-xs opacity-70 mt-1">{{ formatMessageTime(message.createdAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <Card>
        <div class="p-4 space-y-2">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input v-model="messageInput" type="text" placeholder="Type a message..."
              class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground" />
            <button type="submit"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors font-medium">
              Send
            </button>
          </form>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chat, Message, User } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { computed, onMounted, ref } from 'vue';
import Card from './common/Card.vue';
import EmptyState from './common/EmptyState.vue';

const props = defineProps<{
  chat: Chat;
  messages: Message[];
  currentUser: User;
}>();

const emit = defineEmits<{
  sendMessage: [text: string];
  markAsRead: [];
}>();

// State
const messageInput = ref('');

// Computed
const sortedMessages = computed(() =>
  props.messages
    .filter(m => m.chatId === props.chat.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
);

// Methods
const formatMessageTime = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const sendMessage = () => {
  if (!messageInput.value.trim()) return;
  emit('sendMessage', messageInput.value);
  messageInput.value = '';
};

// Mark as read on mount
onMounted(() => {
  emit('markAsRead');
});
</script>