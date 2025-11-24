<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Profile</h1>
      <p class="text-muted-foreground">Manage your account and preferences</p>
    </div>

    <div v-if="currentUser" class="px-6 space-y-6">
      <!-- Profile Card -->
      <Card>
        <div class="p-6">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <!-- Avatar Manager Component -->
            <div class="flex-shrink-0">
              <AvatarManager v-if="currentUser.firebase_uid" :user="currentUser" />
            </div>
            <div class="flex-1">
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

            <!-- Success/Error Messages -->
            <div v-if="successMessage" class="p-3 rounded-lg bg-success/10 text-success text-sm">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {{ errorMessage }}
            </div>

            <!-- Save Button -->
            <button type="submit" :disabled="isLoading"
              class="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isLoading ? 'Saving...' : 'Save Changes' }}
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
import { updateUser } from '@/services/api';
import { useUserStore } from '@/stores/user';
import type { User } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { computed, ref, watch } from 'vue';
import AvatarManager from './AvatarManager.vue';
import Card from './common/Card.vue';

const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

// State
const editedUser = ref<Partial<User>>({
  name: currentUser.value?.name || '',
  email: currentUser.value?.email || '',
  notes: currentUser.value?.notes || '',
  injuries: currentUser.value?.injuries ? [...currentUser.value.injuries] : [],
});
const newInjury = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Watch for user changes to update form
watch(currentUser, (newUser) => {
  if (newUser) {
    editedUser.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      notes: newUser.notes || '',
      injuries: newUser.injuries ? [...newUser.injuries] : [],
    };
  }
}, { immediate: true });

// Methods
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const saveProfile = async () => {
  if (!currentUser.value) return;

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Convert ID to number if it's a string
    const userId = typeof currentUser.value.id === 'string'
      ? parseInt(currentUser.value.id, 10)
      : currentUser.value.id;

    // Only update name for now (backend doesn't support notes/injuries yet)
    const updatedUser = await updateUser(userId, {
      name: editedUser.value.name,
    });

    // Update the store with the new user data
    userStore.updateProfile(updatedUser);

    successMessage.value = 'Profile updated successfully!';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to update profile';
  } finally {
    isLoading.value = false;
  }
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
</script>