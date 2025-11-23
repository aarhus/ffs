<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Messages</h1>
      <p class="text-muted-foreground">Chat with your clients</p>
    </div>

    <div class="px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        <!-- Chat List -->
        <Card class="md:col-span-1">
          <div class="border-b border-border p-4">
            <h2 class="text-lg font-semibold">Chats</h2>
          </div>
          <div class="overflow-y-auto">
            <div v-if="userChats.length === 0" class="p-4 text-center text-muted-foreground text-sm">
              No chats yet
            </div>
            <button v-for="chat in userChats" :key="chat.id" @click="selectedChat = chat" :class="[
              'w-full text-left px-4 py-3 hover:bg-muted transition-colors border-l-2 border-transparent',
              selectedChat?.id === chat.id ? 'bg-muted border-l-2 border-primary' : ''
            ]">
              <p class="font-medium text-sm truncate">{{ chat.name || 'Direct Message' }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ chat.lastMessage }}</p>
              <div v-if="getUnreadCount(chat.id) > 0" class="mt-1">
                <span
                  class="inline-block px-2 py-0.5 rounded-full bg-warning text-warning-foreground text-xs font-bold">
                  {{ getUnreadCount(chat.id) }}
                </span>
              </div>
            </button>
          </div>
        </Card>

        <!-- Chat View -->
        <Card class="md:col-span-3 flex flex-col">
          <div v-if="selectedChat" class="flex flex-col h-full">
            <!-- Chat Header -->
            <div class="border-b border-border p-4">
              <h2 class="font-semibold">{{ selectedChat.name || 'Direct Message' }}</h2>
              <p class="text-xs text-muted-foreground">{{ selectedChat.participants.length }} participant{{
                selectedChat.participants.length !== 1 ? 's' : '' }}</p>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div v-if="chatMessages.length === 0" class="h-full flex items-center justify-center text-center">
                <p class="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
              <div v-for="message in chatMessages" :key="message.id" :class="[
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
            <form @submit.prevent="sendMessage" class="border-t border-border p-4">
              <div class="flex gap-2">
                <input v-model="messageInput" type="text" placeholder="Type a message..."
                  class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground" />
                <button type="submit"
                  class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
                  Send
                </button>
              </div>
            </form>
          </div>

          <div v-else class="h-full flex items-center justify-center text-center">
            <p class="text-muted-foreground">Select a chat to view messages</p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Chat, Message, User } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { computed, ref } from 'vue';
import Card from './common/Card.vue';

const props = defineProps<{
  currentUser: User;
  chats: Chat[];
  allMessages: Message[];
}>();

const emit = defineEmits<{
  sendMessage: [chat: Chat, text: string];
  markChatAsRead: [chatId: string];
}>();

// State
const selectedChat = ref<Chat | null>(null);
const messageInput = ref('');

// Computed
const userChats = computed(() =>
  props.chats.filter(c => c.participants.includes(props.currentUser.id))
);

const chatMessages = computed(() => {
  if (!selectedChat.value) return [];
  return props.allMessages
    .filter(m => m.chatId === selectedChat.value!.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
});

// Methods
const getUnreadCount = (chatId: string) => {
  const chat = props.chats.find(c => c.id === chatId);
  return chat?.unreadCount[props.currentUser.id] || 0;
};

const formatMessageTime = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const sendMessage = () => {
  if (!messageInput.value.trim() || !selectedChat.value) return;
  emit('sendMessage', selectedChat.value, messageInput.value);
  messageInput.value = '';
};
</script>