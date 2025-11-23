<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Welcome back, {{ currentUser.name }}! 👋</h1>
      <p class="text-muted-foreground">Here's your fitness overview</p>
    </div>

    <div class="px-6 space-y-6">
      <!-- Summary Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Workouts This Week -->
        <Card>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Workouts This Week</p>
                <p class="text-2xl font-bold">{{ workoutsThisWeek }}</p>
              </div>
              <DumbbellIcon class="w-8 h-8 text-primary opacity-60" />
            </div>
          </div>
        </Card>

        <!-- Total Workouts -->
        <Card>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Total Workouts</p>
                <p class="text-2xl font-bold">{{ workouts.length }}</p>
              </div>
              <TrendingUpIcon class="w-8 h-8 text-success opacity-60" />
            </div>
          </div>
        </Card>

        <!-- Active Goals -->
        <Card>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Active Goals</p>
                <p class="text-2xl font-bold">{{ activeGoalsCount }}</p>
              </div>
              <TargetIcon class="w-8 h-8 text-warning opacity-60" />
            </div>
          </div>
        </Card>

        <!-- Current Streak -->
        <Card>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Best Habit Streak</p>
                <p class="text-2xl font-bold">{{ bestStreak }}</p>
              </div>
              <TrendingUpIcon class="w-8 h-8 text-info opacity-60" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Recent Workouts -->
      <Card v-if="recentWorkouts.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Recent Workouts</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="workout in recentWorkouts" :key="workout.id" class="p-4 hover:bg-muted/50 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="font-medium">{{ formatDate(workout.date) }}</p>
                <p class="text-sm text-muted-foreground">{{ workout.exercises.length }} exercises</p>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span v-for="exercise in workout.exercises.slice(0, 3)" :key="exercise.id"
                    class="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    {{ exercise.name }}
                  </span>
                  <span v-if="workout.exercises.length > 3" class="text-xs text-muted-foreground px-2 py-1">
                    +{{ workout.exercises.length - 3 }} more
                  </span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm">Exertion: {{ workout.perceivedExertion }}/10</p>
                <span :class="[
                  'mt-2 inline-block px-2 py-1 rounded text-xs font-medium',
                  workout.completed
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                ]">
                  {{ workout.completed ? 'Completed' : 'In Progress' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <EmptyState v-else title="No Workouts Yet" message="Start your first workout to see them here!" />

      <!-- Goal Progress -->
      <Card v-if="goals.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Goal Progress</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="goal in activeGoals" :key="goal.id" class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-medium">{{ goal.title }}</h3>
              <span class="text-sm text-muted-foreground">{{ goal.current }} / {{ goal.target }} {{ goal.metric
              }}</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2">
              <div class="bg-primary h-2 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }" />
            </div>
            <p class="text-xs text-muted-foreground mt-2">
              {{ goalProgress(goal) }}% complete · Due {{ formatDate(goal.dueDate) }}
            </p>
          </div>
        </div>
      </Card>

      <!-- Habit Tracker -->
      <Card v-if="habits.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Habit Tracker</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="habit in habits" :key="habit.id" class="p-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="font-medium">{{ habit.name }}</h3>
                <p class="text-xs text-muted-foreground">{{ habit.frequency }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-success">{{ habit.streak }} day streak 🔥</p>
                <p class="text-xs text-muted-foreground">{{ habit.current }} / {{ habit.target }} {{ habit.unit }}</p>
              </div>
            </div>
            <div class="w-full bg-muted rounded-full h-2">
              <div class="bg-success h-2 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min((habit.current / habit.target) * 100, 100)}%` }" />
            </div>
          </div>
        </div>
      </Card>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button @click="$emit('goToAddWorkout')"
          class="p-4 rounded-lg border border-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors text-center"
          aria-label="Log a workout">
          <DumbbellIcon class="w-6 h-6 mx-auto mb-2 text-primary" />
          <p class="font-medium text-sm">Log Workout</p>
        </button>
        <button
          class="p-4 rounded-lg border border-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors text-center"
          aria-label="Log nutrition intake">
          <AppleIcon class="w-6 h-6 mx-auto mb-2 text-warning" />
          <p class="font-medium text-sm">Log Nutrition</p>
        </button>
        <button
          class="p-4 rounded-lg border border-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors text-center"
          aria-label="View schedule">
          <CalendarIcon class="w-6 h-6 mx-auto mb-2 text-info" />
          <p class="font-medium text-sm">Schedule</p>
        </button>
        <button
          class="p-4 rounded-lg border border-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors text-center"
          aria-label="View progress">
          <TrendingUpIcon class="w-6 h-6 mx-auto mb-2 text-success" />
          <p class="font-medium text-sm">Progress</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Goal, Habit, Measurement, Session, User, Workout } from '@/types';
import { GoalStatus } from '@/types';
import { formatDistanceToNow, isThisWeek, parseISO } from 'date-fns';
import { computed } from 'vue';
import Card from './common/Card.vue';
import EmptyState from './common/EmptyState.vue';
import AppleIcon from './icons/AppleIcon.vue';
import CalendarIcon from './icons/CalendarIcon.vue';
import DumbbellIcon from './icons/DumbbellIcon.vue';
import TargetIcon from './icons/TargetIcon.vue';
import TrendingUpIcon from './icons/TrendingUpIcon.vue';

const props = defineProps<{
  currentUser: User;
  sessions: Session[];
  goals: Goal[];
  habits: Habit[];
  workouts: Workout[];
  measurements: Measurement[];
}>();

const emit = defineEmits<{
  addMeasurement: [measurement: Omit<Measurement, 'id' | 'userId' | 'date'>];
  updateGoal: [goalId: string, newCurrent: number];
  addNutritionLog: [log: any];
  goToAddWorkout: [];
}>();

// Computed properties
const recentWorkouts = computed(() =>
  props.workouts
    .filter(w => w.userId === props.currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
);

const workoutsThisWeek = computed(() =>
  props.workouts.filter(w => w.userId === props.currentUser.id && isThisWeek(parseISO(w.date))).length
);

const activeGoals = computed(() =>
  props.goals.filter(g => g.userId === props.currentUser.id && g.status === GoalStatus.ACTIVE)
);

const activeGoalsCount = computed(() => activeGoals.value.length);

const bestStreak = computed(() => {
  if (props.habits.length === 0) return 0;
  return Math.max(...props.habits.filter(h => h.userId === props.currentUser.id).map(h => h.streak));
});

// Helper functions
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const goalProgress = (goal: Goal) => {
  return Math.min(Math.round((goal.current / goal.target) * 100), 100);
};
</script>