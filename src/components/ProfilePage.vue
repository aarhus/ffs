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
          <p class="text-sm text-muted-foreground">Track your injuries to get personalized workout modifications</p>
        </div>
        <div class="p-4 space-y-3">
          <!-- Loading State -->
          <div v-if="isLoadingInjuries" class="text-sm text-muted-foreground py-4 text-center">
            Loading injuries...
          </div>

          <!-- Error State -->
          <div v-else-if="injuriesError" class="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {{ injuriesError }}
          </div>

          <!-- Current Injuries List -->
          <div v-else-if="userInjuries.length > 0" class="space-y-2 mb-4">
            <div v-for="injury in userInjuries" :key="injury.id" class="p-3 rounded-lg bg-muted/50 space-y-2">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ injury.injury_type }}</div>
                  <p v-if="injury.details" class="text-xs text-muted-foreground mt-1">{{ injury.details }}</p>
                </div>
                <button @click="deleteInjuryRecord(injury.id)" type="button"
                  class="text-xs text-destructive border border-destructive/20 hover:bg-destructive/10 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1 transition-colors"
                  aria-label="Remove injury">
                  Delete
                </button>
              </div>
              <div class="flex gap-2 text-xs">
                <span v-if="injury.severity" class="px-2 py-0.5 rounded-full" :class="{
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300': injury.severity === 'MILD',
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300': injury.severity === 'MODERATE',
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': injury.severity === 'SEVERE'
                }">
                  {{ injury.severity }}
                </span>
                <span class="px-2 py-0.5 rounded-full" :class="{
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300': injury.status === 'ACTIVE',
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300': injury.status === 'RECOVERING',
                  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300': injury.status === 'RESOLVED'
                }">
                  {{ injury.status }}
                </span>
                <span class="text-muted-foreground">Reported: {{ formatDate(injury.date_reported) }}</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-sm text-muted-foreground py-4 text-center">
            No injuries recorded
          </div>

          <!-- Add Injury Form -->
          <div v-if="!showInjurySelector" class="pt-3 border-t border-border">
            <button @click="showInjurySelector = true" type="button"
              class="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors text-sm">
              Add New Injury
            </button>
          </div>

          <!-- Injury Selector -->
          <div v-else class="pt-3 border-t border-border">
            <InjurySelector :injury-definitions="injuryDefinitions" @add-injury="handleAddInjury"
              @cancel="showInjurySelector = false" />
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
import { updateUser, getInjuryDefinitions, getUserInjuries, createInjury, deleteInjury } from '@/services/api';
import { useUserStore } from '@/stores/user';
import type { User, UserInjury, InjuryDefinition } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { computed, ref, watch, onMounted } from 'vue';
import AvatarManager from './AvatarManager.vue';
import Card from './common/Card.vue';
import InjurySelector from './InjurySelector.vue';

const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

// State
const editedUser = ref<Partial<User>>({
  name: currentUser.value?.name || '',
  email: currentUser.value?.email || '',
  notes: currentUser.value?.notes || '',
});
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Injuries State
const injuryDefinitions = ref<InjuryDefinition[]>([]);
const userInjuries = ref<UserInjury[]>([]);
const isLoadingInjuries = ref(false);
const injuriesError = ref('');
const showInjurySelector = ref(false);

// Methods
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

// Injury Management Methods
const loadInjuryDefinitions = async () => {
  try {
    injuryDefinitions.value = await getInjuryDefinitions();
  } catch (error: any) {
    console.error('Failed to load injury definitions:', error);
    injuriesError.value = 'Failed to load injury templates';
  }
};

const loadUserInjuries = async () => {
  if (!currentUser.value?.id) return;

  isLoadingInjuries.value = true;
  injuriesError.value = '';

  try {
    userInjuries.value = await getUserInjuries(currentUser.value.id);
  } catch (error: any) {
    console.error('Failed to load user injuries:', error);
    injuriesError.value = 'Failed to load injuries';
  } finally {
    isLoadingInjuries.value = false;
  }
};

const handleAddInjury = async (injury: {
  injury_type: string;
  details: string | null;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | null;
  status: 'ACTIVE' | 'RECOVERING' | 'RESOLVED';
  date_reported: string;
}) => {
  if (!currentUser.value?.id) return;

  try {
    const userId = typeof currentUser.value.id === 'string'
      ? parseInt(currentUser.value.id, 10)
      : currentUser.value.id;

    await createInjury({
      user_id: userId,
      ...injury,
    });

    // Reload injuries list
    await loadUserInjuries();

    // Hide the selector
    showInjurySelector.value = false;

    // Show success message
    successMessage.value = 'Injury added successfully';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to add injury';
  }
};

const deleteInjuryRecord = async (injuryId: number) => {
  if (!confirm('Are you sure you want to delete this injury record?')) return;

  try {
    await deleteInjury(injuryId);

    // Reload injuries list
    await loadUserInjuries();

    // Show success message
    successMessage.value = 'Injury deleted successfully';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to delete injury';
  }
};

// Watch for user changes to update form
watch(currentUser, (newUser) => {
  if (newUser) {
    editedUser.value = {
      name: newUser.name || '',
      email: newUser.email || '',
      notes: newUser.notes || '',
    };
    // Load user injuries when user changes
    loadUserInjuries();
  }
}, { immediate: true });

// Load injury data on mount
onMounted(async () => {
  await loadInjuryDefinitions();
  await loadUserInjuries();
});

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

    // Update user profile with name and notes
    const updatedUser = await updateUser(userId, {
      name: editedUser.value.name,
      notes: editedUser.value.notes || null,
    });

    // Update the store with the new user data
    const userUpdates: Partial<User> = {
      name: updatedUser.name,
    };
    if (updatedUser.notes !== null) {
      userUpdates.notes = updatedUser.notes;
    }
    userStore.updateProfile(userUpdates);

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
</script>