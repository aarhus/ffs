<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Training Log</h1>
        <p class="text-muted-foreground">Track and review your workouts</p>
      </div>
      <button @click="$router.push('/add-workout')"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
        <DumbbellIcon class="w-5 h-5" />
        Start Workout
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-6 flex justify-center py-12">
      <div class="text-muted-foreground">Loading workouts...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-6">
      <Card>
        <div class="p-4 bg-destructive/10 text-destructive rounded-lg">
          <p class="font-semibold">Error loading workouts</p>
          <p class="text-sm">{{ error }}</p>
          <button @click="loadWorkouts" class="mt-2 text-sm underline">Try again</button>
        </div>
      </Card>
    </div>

    <div v-else class="px-6 space-y-6">
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
                  <p class="font-semibold">{{ workout.name || formatDate(workout.date) }}</p>
                  <span :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    workout.completed
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  ]">
                    {{ workout.completed ? 'Completed' : 'In Progress' }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mb-2">{{ workout.exercises?.length || 0 }} exercises<span
                    v-if="workout.perceived_exertion"> • Exertion: {{ workout.perceived_exertion }}/10</span></p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(exercise, idx) in (workout.exercises || []).slice(0, 4)" :key="idx"
                    class="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {{ exercise.name }}
                  </span>
                  <span v-if="(workout.exercises?.length || 0) > 4" class="text-xs text-muted-foreground px-2 py-1">
                    +{{ (workout.exercises?.length || 0) - 4 }} more
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
              <div v-for="(exercise, idx) in workout.exercises || []" :key="idx" class="space-y-2">
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
      <div v-if="allWorkouts.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Total Workouts</p>
            <p class="text-3xl font-bold">{{ allWorkouts.length }}</p>
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
import type { WorkoutResponse } from '@/services/api';
import { deleteWorkout as apiDeleteWorkout, getWorkouts } from '@/services/api';
import { formatDistanceToNow, isAfter, isThisMonth, isThisWeek, parseISO, subMonths } from 'date-fns';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Card from '@/components/common/Card.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import DumbbellIcon from '@/components/icons/DumbbellIcon.vue';

const router = useRouter();

// State
const allWorkouts = ref<WorkoutResponse[]>([]);
const isLoading = ref(false);
const error = ref('');
const selectedDateFilter = ref('all');
const selectedExercise = ref('');
const selectedStatus = ref('');
const selectedWorkout = ref<WorkoutResponse | null>(null);

// Computed properties
const availableExercises = computed(() => {
  const exercises = new Set<string>();
  allWorkouts.value.forEach(w => {
    if (Array.isArray(w.exercises)) {
      w.exercises.forEach((e: any) => {
        if (e && e.name) exercises.add(e.name);
      });
    }
  });
  return Array.from(exercises).sort();
});

const filteredWorkouts = computed(() => {
  let result = allWorkouts.value;

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
    result = result.filter(w =>
      Array.isArray(w.exercises) && w.exercises.some((e: any) => e && e.name === selectedExercise.value)
    );
  }

  // Status filter
  if (selectedStatus.value === 'completed') {
    result = result.filter(w => w.completed);
  } else if (selectedStatus.value === 'in-progress') {
    result = result.filter(w => !w.completed);
  }

  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const completedCount = computed(() => allWorkouts.value.filter(w => w.completed).length);

const averageExertion = computed(() => {
  if (allWorkouts.value.length === 0) return 0;
  const workoutsWithExertion = allWorkouts.value.filter(w => w.perceived_exertion != null);
  if (workoutsWithExertion.length === 0) return 0;
  const total = workoutsWithExertion.reduce((sum, w) => sum + (w.perceived_exertion || 0), 0);
  return Math.round((total / workoutsWithExertion.length) * 10) / 10;
});

// Methods
const loadWorkouts = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    const response = await getWorkouts({ limit: 100 });
    allWorkouts.value = response.data;
  } catch (err: any) {
    console.error('Failed to load workouts:', err);
    error.value = err.message || 'Failed to load workouts';
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const deleteWorkout = async (workoutId: string) => {
  if (!confirm('Are you sure you want to delete this workout?')) {
    return;
  }

  try {
    await apiDeleteWorkout(workoutId);
    // Remove from local state
    allWorkouts.value = allWorkouts.value.filter(w => w.id !== workoutId);
    // Close expanded view if this workout was selected
    if (selectedWorkout.value?.id === workoutId) {
      selectedWorkout.value = null;
    }
  } catch (err: any) {
    console.error('Failed to delete workout:', err);
    alert('Failed to delete workout: ' + (err.message || 'Unknown error'));
  }
};

// Load workouts on mount
onMounted(() => {
  loadWorkouts();
});
</script>