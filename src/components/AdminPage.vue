<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Admin Panel</h1>
      <p class="text-muted-foreground">Manage users and system settings</p>
    </div>

    <div class="px-6 space-y-6">
      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Total Users</p>
            <p class="text-3xl font-bold">{{ allUsers.length }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Trainers</p>
            <p class="text-3xl font-bold text-primary">{{ trainersCount }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Clients</p>
            <p class="text-3xl font-bold text-info">{{ clientsCount }}</p>
          </div>
        </Card>
      </div>

      <!-- Invite Client Section -->
      <Card>
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold mb-2">Invite New Client</h2>
          <p class="text-sm text-muted-foreground">Send an invitation to a new user</p>
        </div>
        <div class="p-4">
          <form @submit.prevent="submitInvite" class="space-y-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Email Address</label>
              <input v-model="inviteEmail" type="email" placeholder="user@example.com"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
            </div>
            <button type="submit"
              class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors font-medium">
              Send Invite
            </button>
          </form>
        </div>
      </Card>

      <!-- Users List -->
      <Card>
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">User Management</h2>
          <p class="text-sm text-muted-foreground">View and manage all users</p>
        </div>

        <!-- Search/Filter -->
        <div class="border-b border-border p-4">
          <div class="flex gap-2">
            <input v-model="userSearch" type="text" placeholder="Search by name or email..."
              class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground text-sm" />
            <select v-model="userRoleFilter"
              class="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
              <option value="">All Roles</option>
              <option value="TRAINER">Trainer</option>
              <option value="CLIENT">Client</option>
            </select>
          </div>
        </div>

        <!-- Users Table -->
        <div class="divide-y divide-border">
          <div v-for="user in filteredUsers" :key="user.id"
            class="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <img :src="user.avatar" :alt="user.name" class="w-8 h-8 rounded-full" />
                <div>
                  <p class="font-medium">{{ user.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="[
                'px-3 py-1 rounded text-xs font-medium',
                user.role === 'TRAINER'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-info/10 text-info'
              ]">
                {{ user.role }}
              </span>
              <div class="flex gap-2">
                <button v-if="user.role === 'CLIENT'" @click="promoteToTrainer(user.id)"
                  class="px-3 py-1.5 text-xs bg-success/10 text-success border border-success/20 rounded hover:bg-success/20 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-1 transition-colors"
                  aria-label="Promote user to trainer">
                  Promote
                </button>
                <button
                  class="px-3 py-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1 transition-colors"
                  aria-label="Remove user from system">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredUsers.length === 0" class="p-8 text-center text-muted-foreground">
          No users found matching your search.
        </div>
      </Card>

      <!-- System Settings -->
      <Card>
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">System Settings</h2>
        </div>
        <div class="p-4 space-y-3">
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked class="w-4 h-4 rounded border-border" />
            <span class="text-sm font-medium">Allow new user registrations</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked class="w-4 h-4 rounded border-border" />
            <span class="text-sm font-medium">Enable email notifications</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" class="w-4 h-4 rounded border-border" />
            <span class="text-sm font-medium">Maintenance mode</span>
          </label>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types';
import { Role } from '@/types';
import { computed, ref } from 'vue';
import Card from './common/Card.vue';

const props = defineProps<{
  allUsers: User[];
}>();

const emit = defineEmits<{
  inviteClient: [email: string];
  promoteUser: [userId: string];
}>();

// State
const inviteEmail = ref('');
const userSearch = ref('');
const userRoleFilter = ref('');

// Computed
const trainersCount = computed(() =>
  props.allUsers.filter(u => u.role === Role.TRAINER).length
);

const clientsCount = computed(() =>
  props.allUsers.filter(u => u.role === Role.CLIENT).length
);

const filteredUsers = computed(() => {
  let result = props.allUsers.filter(u => u.role !== Role.LOGIN);

  // Search filter
  if (userSearch.value) {
    const search = userSearch.value.toLowerCase();
    result = result.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  }

  // Role filter
  if (userRoleFilter.value) {
    result = result.filter(u => u.role === userRoleFilter.value);
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
});

// Methods
const submitInvite = () => {
  if (!inviteEmail.value) return;
  emit('inviteClient', inviteEmail.value);
  inviteEmail.value = '';
};

const promoteToTrainer = (userId: string) => {
  emit('promoteUser', userId);
};
</script>