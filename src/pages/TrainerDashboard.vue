<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Trainer Dashboard</h1>
      <p class="text-muted-foreground">Manage your clients and sessions</p>
    </div>

    <div class="px-6 space-y-6">
      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Total Clients</p>
            <p class="text-3xl font-bold">{{ clientsCount }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Sessions This Week</p>
            <p class="text-3xl font-bold">{{ sessionsThisWeek }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Total Workouts Logged</p>
            <p class="text-3xl font-bold">{{ workoutsCount }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Unread Messages</p>
            <p class="text-3xl font-bold text-warning">{{ unreadChatsCount }}</p>
          </div>
        </Card>
      </div>

      <!-- Upcoming Sessions -->
      <Card v-if="upcomingSessions.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Upcoming Sessions</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="session in upcomingSessions.slice(0, 5)" :key="session.id" class="p-4">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold">{{ session.title }}</h3>
                <p class="text-sm text-muted-foreground">{{ formatSessionDate(session.date) }}</p>
                <p class="text-xs text-muted-foreground mt-1">📍 {{ session.location }} • {{ session.attendees.length
                  }}/{{ session.capacity }} registered</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Recent Client Activity -->
      <Card v-if="recentWorkouts.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Recent Client Workouts</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="workout in recentWorkouts.slice(0, 5)" :key="workout.id" class="p-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-medium">{{ workout.exercises.length }} exercises completed</p>
                <p class="text-sm text-muted-foreground">{{ formatWorkoutDate(workout.date) }}</p>
              </div>
              <span :class="[
                'px-3 py-1 rounded text-xs font-medium',
                workout.completed ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              ]">
                {{ workout.completed ? 'Completed' : 'In Progress' }}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          class="p-4 rounded-lg border border-primary bg-primary/10 hover:bg-primary/20 transition-colors text-center">
          <UsersIcon class="w-6 h-6 mx-auto mb-2 text-primary" />
          <p class="font-medium text-sm">Manage Clients</p>
        </button>
        <button class="p-4 rounded-lg border border-muted hover:bg-muted transition-colors text-center">
          <CalendarIcon class="w-6 h-6 mx-auto mb-2 text-info" />
          <p class="font-medium text-sm">Schedule Session</p>
        </button>
        <button class="p-4 rounded-lg border border-muted hover:bg-muted transition-colors text-center">
          <MessageSquareIcon class="w-6 h-6 mx-auto mb-2 text-warning" />
          <p class="font-medium text-sm">Message Client</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/common/Card.vue';
import CalendarIcon from '@/components/icons/CalendarIcon.vue';
import MessageSquareIcon from '@/components/icons/MessageSquareIcon.vue';
import UsersIcon from '@/components/icons/UsersIcon.vue';
import { useUserStore } from '@/stores/user';
import type { Chat, Session, Workout } from '@/types';
import { formatDistanceToNow, isFuture, isThisWeek, parseISO } from 'date-fns';
import { computed, ref } from 'vue';

const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

// TODO: Replace with actual API calls
const sessions = ref<Session[]>([]);
const chats = ref<Chat[]>([]);
const workouts = ref<Workout[]>([]);

// Computed
const clientsCount = computed(() => {
  // Assuming attendees are clients
  const uniqueClients = new Set<string>();
  sessions.value.forEach(s => s.attendees.forEach(a => uniqueClients.add(a)));
  return uniqueClients.size;
});

const sessionsThisWeek = computed(() =>
  sessions.value.filter(s => isThisWeek(parseISO(s.date))).length
);

const workoutsCount = computed(() => workouts.value.length);

const unreadChatsCount = computed(() =>
  chats.value.filter(c => (c.unreadCount[currentUser.value?.id || ''] || 0) > 0).length
);

const upcomingSessions = computed(() =>
  sessions.value
    .filter(s => isFuture(parseISO(s.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
);

const recentWorkouts = computed(() =>
  workouts.value
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
);

// Methods
const formatSessionDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const formatWorkoutDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};
</script>