<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Profile</h1>
      <p class="text-muted-foreground">Manage your account and preferences</p>
    </div>

    <div class="px-6 space-y-6">
      <!-- Profile Card -->
      <Card>
        <div class="p-6">
          <div class="flex items-center gap-6 mb-6">
            <img :src="currentUser.avatar" :alt="currentUser.name" class="w-20 h-20 rounded-full" />
            <div>
              <h2 class="text-2xl font-bold">{{ currentUser.name }}</h2>
              <p class="text-muted-foreground">{{ currentUser.email }}</p>
              <span class="inline-block mt-2 px-3 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                {{ currentUser.role }}
              </span>
            </div>
          </div>

          <!-- Edit Form -->
          <form @submit.prevent="saveProfile" class="space-y-4">
            <!-- Name -->
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Full Name</label>
              <input v-model="editedUser.name" type="text"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
            </div>

            <!-- Email -->
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
              <input v-model="editedUser.email" type="email"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
            </div>

            <!-- Bio/Notes -->
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Bio / Notes</label>
              <textarea v-model="editedUser.notes"
                placeholder="Tell us about yourself, your fitness goals, or any important notes..." rows="4"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground resize-none" />
            </div>

            <!-- Save Button -->
            <button type="submit"
              class="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors font-medium">
              Save Changes
            </button>
          </form>
        </div>
      </Card>

      <!-- Injuries Section -->
      <Card>
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold mb-2">Injuries & Limitations</h2>
          <p class="text-sm text-muted-foreground">Help us customize your workout recommendations</p>
        </div>
        <div class="p-4 space-y-3">
          <div v-if="editedUser.injuries && editedUser.injuries.length > 0" class="space-y-2 mb-4">
            <div v-for="(injury, idx) in editedUser.injuries" :key="idx"
              class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span class="text-sm">{{ injury }}</span>
              <button @click="removeInjury(idx)" type="button"
                class="text-xs text-destructive border border-destructive/20 hover:bg-destructive/10 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1 transition-colors"
                aria-label="Remove injury">
                Remove
              </button>
            </div>
          </div>

          <!-- Add Injury Form -->
          <div class="space-y-2 pt-3 border-t border-border">
            <label class="text-sm font-medium text-muted-foreground">Add Injury / Limitation</label>
            <div class="flex gap-2">
              <input v-model="newInjury" type="text" placeholder="e.g., Lower back pain, Shoulder injury"
                class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-sm" />
              <button @click="addInjury" type="button"
                class="px-3 py-2 bg-primary text-primary-foreground border border-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors text-sm">
                Add
              </button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Account Settings -->
      <Card>
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Account Settings</h2>
        </div>
        <div class="p-4 space-y-3">
          <button
            class="w-full px-4 py-2.5 border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors text-left font-medium text-sm">
            Change Password
          </button>
          <button
            class="w-full px-4 py-2.5 border border-destructive/20 text-destructive rounded-lg hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1 transition-colors text-left font-medium text-sm">
            Delete Account
          </button>
        </div>
      </Card>

      <!-- Account Info -->
      <Card>
        <div class="p-4">
          <p class="text-xs text-muted-foreground space-y-1">
          <div>User ID: {{ currentUser.id }}</div>
          <div>Role: {{ currentUser.role }}</div>
          <div>Member since: {{ formatDate(new Date().toISOString()) }}</div>
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ref } from 'vue';
import Card from './common/Card.vue';

const props = defineProps<{
  currentUser: User;
}>();

// State
const editedUser = ref<Partial<User>>({
  name: props.currentUser.name,
  email: props.currentUser.email,
  notes: props.currentUser.notes,
  injuries: props.currentUser.injuries ? [...props.currentUser.injuries] : [],
});
const newInjury = ref('');

// Methods
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const saveProfile = () => {
  emit('updateProfile', {
    ...props.currentUser,
    ...editedUser.value,
  } as User);
};

const addInjury = () => {
  if (!newInjury.value.trim()) return;
  if (!editedUser.value.injuries) {
    editedUser.value.injuries = [];
  }
  editedUser.value.injuries.push(newInjury.value.trim());
  newInjury.value = '';
};

const removeInjury = (idx: number) => {
  if (editedUser.value.injuries) {
    editedUser.value.injuries.splice(idx, 1);
  }
};

const emit = defineEmits<{
  updateProfile: [user: User];
}>();
</script>