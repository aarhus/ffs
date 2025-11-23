<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Client Workouts</h1>
      <p class="text-muted-foreground">Review your clients' training logs</p>
    </div>

    <div class="px-6 space-y-6">
      <!-- Client Selector -->
      <Card>
        <div class="p-4">
          <label class="text-sm font-medium text-muted-foreground mb-2 block">Select Client</label>
          <select v-model="selectedClientId"
            class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
            <option value="">-- Choose a client --</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>
      </Card>

      <!-- Filters -->
      <Card v-if="selectedClientId">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-sm mb-3">Filters</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Date Range</label>
              <select v-model="dateFilter"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
              <select v-model="statusFilter"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm">
                <option value="">All</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <!-- Client Stats -->
      <div v-if="selectedClientId && selectedClient" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Total Workouts</p>
            <p class="text-3xl font-bold">{{ clientWorkouts.length }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Completed</p>
            <p class="text-3xl font-bold text-success">{{ completedCount }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Average Exertion</p>
            <p class="text-3xl font-bold">{{ averageExertion }}/10</p>
          </div>
        </Card>
      </div>

      <!-- Workout List -->
      <Card v-if="selectedClientId && filteredWorkouts.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">{{ selectedClient?.name }}'s Workouts</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="workout in filteredWorkouts" :key="workout.id"
            class="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            @click="selectedWorkout = selectedWorkout?.id === workout.id ? null : workout">
            <!-- Workout Summary -->
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold">{{ formatDate(workout.date) }}</p>
                <p class="text-sm text-muted-foreground">{{ workout.exercises.length }} exercises • Exertion: {{
                  workout.perceivedExertion }}/10</p>
              </div>
              <span :class="[
                'px-3 py-1 rounded text-xs font-medium',
                workout.completed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              ]">
                {{ workout.completed ? 'Completed' : 'In Progress' }}
              </span>
            </div>

            <!-- Expanded Details -->
            <div v-if="selectedWorkout?.id === workout.id" class="mt-4 pt-4 border-t border-border space-y-3">
              <div class="space-y-2">
                <p class="font-medium text-sm mb-2">Exercises:</p>
                <div v-for="exercise in workout.exercises" :key="exercise.id" class="text-sm bg-muted/50 p-2 rounded">
                  <p class="font-medium">{{ exercise.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ exercise.sets }} sets × {{ exercise.reps }}
                    <span v-if="exercise.weight"> @ {{ exercise.weight }}kg</span>
                    <span v-if="exercise.isPR" class="ml-1 text-warning">PR ⭐</span>
                  </p>
                </div>
              </div>
              <div v-if="workout.notes" class="text-sm bg-muted/50 p-2 rounded">
                <p class="text-xs text-muted-foreground mb-1">Notes</p>
                <p>{{ workout.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Empty State -->
      <div v-if="selectedClientId && filteredWorkouts.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">No workouts found for this client.</p>
      </div>

      <div v-if="!selectedClientId" class="text-center py-12">
        <p class="text-muted-foreground">Select a client to view their workouts.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, Workout } from '@/types';
import { formatDistanceToNow, isThisMonth, isThisWeek, parseISO } from 'date-fns';
import { computed, ref } from 'vue';
import Card from './common/Card.vue';

const props = defineProps<{
  currentUser: User;
  workouts: Workout[];
  clients: User[];
}>();

// State
const selectedClientId = ref('');
const dateFilter = ref('all');
const statusFilter = ref('');
const selectedWorkout = ref<Workout | null>(null);

// Computed
const selectedClient = computed(() =>
  props.clients.find(c => c.id === selectedClientId.value)
);

const clientWorkouts = computed(() =>
  props.workouts.filter(w => w.userId === selectedClientId.value)
);

const filteredWorkouts = computed(() => {
  let result = clientWorkouts.value;

  // Date filter
  if (dateFilter.value === 'week') {
    result = result.filter(w => isThisWeek(parseISO(w.date)));
  } else if (dateFilter.value === 'month') {
    result = result.filter(w => isThisMonth(parseISO(w.date)));
  }

  // Status filter
  if (statusFilter.value === 'completed') {
    result = result.filter(w => w.completed);
  } else if (statusFilter.value === 'in-progress') {
    result = result.filter(w => !w.completed);
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const completedCount = computed(() =>
  clientWorkouts.value.filter(w => w.completed).length
);

const averageExertion = computed(() => {
  if (clientWorkouts.value.length === 0) return 0;
  const total = clientWorkouts.value.reduce((sum, w) => sum + w.perceivedExertion, 0);
  return Math.round((total / clientWorkouts.value.length) * 10) / 10;
});

// Methods
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};
</script>"