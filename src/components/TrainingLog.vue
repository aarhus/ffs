<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Training Log</h1>
        <p class="text-muted-foreground">Track and review your workouts</p>
      </div>
      <button @click="$emit('startWorkout')"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
        <DumbbellIcon class="w-5 h-5" />
        Start Workout
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Filters -->
      <Card>
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-sm mb-3">Filters</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Date Filter -->
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Date Range</label>
              <select v-model="selectedDateFilter"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>

            <!-- Exercise Filter -->
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Exercise</label>
              <select v-model="selectedExercise"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                <option value="">All Exercises</option>
                <option v-for="exercise in availableExercises" :key="exercise" :value="exercise">
                  {{ exercise }}
                </option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
              <select v-model="selectedStatus"
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                <option value="">All Workouts</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <!-- Workout List -->
      <Card v-if="filteredWorkouts.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">{{ filteredWorkouts.length }} Workout{{ filteredWorkouts.length !== 1 ? 's'
            : '' }}</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="workout in filteredWorkouts" :key="workout.id"
            class="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            @click="selectedWorkout = selectedWorkout?.id === workout.id ? null : workout">
            <!-- Workout Summary -->
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <p class="font-semibold">{{ formatDate(workout.date) }}</p>
                  <span :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    workout.completed
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  ]">
                    {{ workout.completed ? 'Completed' : 'In Progress' }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mb-2">{{ workout.exercises.length }} exercises • Exertion: {{
                  workout.perceivedExertion }}/10</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="exercise in workout.exercises.slice(0, 4)" :key="exercise.id"
                    class="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {{ exercise.name }}
                  </span>
                  <span v-if="workout.exercises.length > 4" class="text-xs text-muted-foreground px-2 py-1">
                    +{{ workout.exercises.length - 4 }} more
                  </span>
                </div>
              </div>
              <div class="text-right">
                <button @click.stop="deleteWorkout(workout.id)"
                  class="text-xs px-3 py-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1">
                  Delete
                </button>
              </div>
            </div>

            <!-- Expanded Workout Details -->
            <div v-if="selectedWorkout?.id === workout.id" class="mt-4 pt-4 border-t border-border space-y-3">
              <div v-for="exercise in workout.exercises" :key="exercise.id" class="space-y-2">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-medium">{{ exercise.name }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ exercise.sets }} sets × {{ exercise.reps }}
                      <span v-if="exercise.weight"> @ {{ exercise.weight }}kg</span>
                    </p>
                  </div>
                  <div class="text-right">
                    <span v-if="exercise.isPR" class="text-xs bg-warning/10 text-warning px-2 py-1 rounded">
                      PR ⭐
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="workout.notes" class="p-3 rounded bg-muted/50">
                <p class="text-xs text-muted-foreground mb-1">Notes</p>
                <p class="text-sm">{{ workout.notes }}</p>
              </div>
              <div class="flex gap-2 pt-2">
                <button
                  class="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <EmptyState v-else title="No Workouts Found"
        message="Start your first workout or adjust your filters to see workouts here!" />

      <!-- Statistics Section -->
      <div v-if="workouts.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Total Workouts</p>
            <p class="text-3xl font-bold">{{ workouts.length }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Completed</p>
            <p class="text-3xl font-bold">{{ completedCount }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Avg. Exertion</p>
            <p class="text-3xl font-bold">{{ averageExertion }}/10</p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User, Workout } from '@/types';
import { formatDistanceToNow, isAfter, isThisMonth, isThisWeek, parseISO, subMonths } from 'date-fns';
import { computed, ref } from 'vue';
import Card from './common/Card.vue';
import EmptyState from './common/EmptyState.vue';
import DumbbellIcon from './icons/DumbbellIcon.vue';

const props = defineProps<{
  currentUser: User;
  workouts: Workout[];
}>();

defineEmits<{
  startWorkout: [];
}>();

// State
const selectedDateFilter = ref('all');
const selectedExercise = ref('');
const selectedStatus = ref('');
const selectedWorkout = ref<Workout | null>(null);

// Computed properties
const userWorkouts = computed(() =>
  props.workouts.filter(w => w.userId === props.currentUser.id)
);

const availableExercises = computed(() => {
  const exercises = new Set<string>();
  userWorkouts.value.forEach(w => {
    w.exercises.forEach(e => exercises.add(e.name));
  });
  return Array.from(exercises).sort();
});

const filteredWorkouts = computed(() => {
  let result = userWorkouts.value;

  // Date filter
  if (selectedDateFilter.value === 'week') {
    result = result.filter(w => isThisWeek(parseISO(w.date)));
  } else if (selectedDateFilter.value === 'month') {
    result = result.filter(w => isThisMonth(parseISO(w.date)));
  } else if (selectedDateFilter.value === '3months') {
    const threeMonthsAgo = subMonths(new Date(), 3);
    result = result.filter(w => isAfter(parseISO(w.date), threeMonthsAgo));
  }

  // Exercise filter
  if (selectedExercise.value) {
    result = result.filter(w => w.exercises.some(e => e.name === selectedExercise.value));
  }

  // Status filter
  if (selectedStatus.value === 'completed') {
    result = result.filter(w => w.completed);
  } else if (selectedStatus.value === 'in-progress') {
    result = result.filter(w => !w.completed);
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const completedCount = computed(() => userWorkouts.value.filter(w => w.completed).length);

const averageExertion = computed(() => {
  if (userWorkouts.value.length === 0) return 0;
  const total = userWorkouts.value.reduce((sum, w) => sum + w.perceivedExertion, 0);
  return Math.round((total / userWorkouts.value.length) * 10) / 10;
});

// Methods
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const deleteWorkout = (workoutId: string) => {
  // In a real app, this would emit an event or call an API
  console.log('Delete workout:', workoutId);
};
</script>