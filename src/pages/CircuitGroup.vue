<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">{{ groupChat.name || 'Group' }}</h1>
        <p class="text-muted-foreground">{{ groupChat.participants.length }} members</p>
      </div>
      <button @click="showNewAnnouncementModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
        <MessageSquareIcon class="w-5 h-5" />
        New Announcement
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Announcements -->
      <Card v-if="announcements.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Announcements</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="announcement in announcements" :key="announcement.id" class="p-4">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold">{{ announcement.title }}</h3>
              <span v-if="announcement.pinned" class="text-xs bg-warning/10 text-warning px-2 py-1 rounded">
                📌 Pinned
              </span>
            </div>
            <p class="text-sm text-muted-foreground mb-2">{{ announcement.body }}</p>
            <p class="text-xs text-muted-foreground">{{ formatAnnouncementDate(announcement.createdAt) }}</p>
          </div>
        </div>
      </Card>

      <EmptyState v-else title="No Announcements" message="Be the first to share an announcement!" />

      <!-- Group Messages/Chat -->
      <Card>
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Group Chat</h2>
        </div>
        <div class="p-4 h-80 overflow-y-auto space-y-3 border-b border-border mb-4">
          <div v-if="groupMessages.length === 0" class="h-full flex items-center justify-center text-center">
            <p class="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
          <div v-for="message in groupMessages" :key="message.id" class="p-3 rounded-lg bg-muted/50">
            <div class="flex items-center justify-between mb-1">
              <p class="font-medium text-sm">User {{ message.senderId.substring(0, 8) }}</p>
              <p class="text-xs text-muted-foreground">{{ formatMessageTime(message.createdAt) }}</p>
            </div>
            <p class="text-sm">{{ message.text }}</p>
          </div>
        </div>

        <!-- Message Input -->
        <form @submit.prevent="submitMessage" class="p-4">
          <div class="flex gap-2">
            <input v-model="newMessage" type="text" placeholder="Type a message..."
              class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground" />
            <button type="submit"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Send
            </button>
          </div>
        </form>
      </Card>

      <!-- Members -->
      <Card>
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Members ({{ groupChat.participants.length }})</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="memberId in groupChat.participants" :key="memberId" class="p-3 flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-muted" />
            <p class="text-sm">Member {{ memberId.substring(0, 8) }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- New Announcement Modal -->
    <Modal :modelValue="showNewAnnouncementModal" @update:model-value="updateValue">
      <div class="p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">New Announcement</h2>

        <form @submit.prevent="submitAnnouncement" class="space-y-4">
          <!-- Title -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Title</label>
            <input v-model="newAnnouncement.title" type="text" placeholder="e.g., Schedule Update"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
          </div>

          <!-- Body -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Message</label>
            <textarea v-model="newAnnouncement.body" placeholder="Type your announcement..." rows="4"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
              required />
          </div>

          <!-- Pin Checkbox -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="newAnnouncement.pinned" type="checkbox" class="w-4 h-4 rounded border-border" />
            <span class="text-sm font-medium">Pin this announcement</span>
          </label>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showNewAnnouncementModal = false"
              class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Cancel
            </button>
            <button type="submit"
              class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Post
            </button>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/common/Card.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import Modal from '@/components/common/Modal.vue';
import MessageSquareIcon from '@/components/icons/MessageSquareIcon.vue';
import { useUserStore } from '@/stores/user';
import type { Announcement, Chat, Message } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { computed, ref } from 'vue';

const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

// TODO: Replace with actual API calls
const groupChat = ref<Chat | null>(null);
const announcements = ref<Announcement[]>([]);
const allMessages = ref<Message[]>([]);

const addNewAnnouncement = async (data: any) => {
  console.log('TODO: Add announcement:', data);
  // TODO: Implement API call
};

const sendMessage = async (chat: Chat, text: string) => {
  console.log('TODO: Send message:', chat, text);
  // TODO: Implement API call
};

const updateValue = (value: boolean) => {
  showNewAnnouncementModal.value = value;
};

// State
const showNewAnnouncementModal = ref(false);
const newMessage = ref('');
const newAnnouncement = ref({
  title: '',
  body: '',
  pinned: false,
});

// Computed
const groupMessages = computed(() =>
  allMessages.value
    .filter(m => m.chatId === groupChat.value?.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-20)
);

// Methods
const formatAnnouncementDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const formatMessageTime = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const submitMessage = () => {
  if (!newMessage.value.trim() || !groupChat.value) return;
  sendMessage(groupChat.value, newMessage.value);
  newMessage.value = '';
};

const submitAnnouncement = () => {
  if (!newAnnouncement.value.title || !newAnnouncement.value.body) return;
  addNewAnnouncement({ ...newAnnouncement.value });
  newAnnouncement.value = { title: '', body: '', pinned: false };
  showNewAnnouncementModal.value = false;
};
</script>