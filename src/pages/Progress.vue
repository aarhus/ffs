<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Progress</h1>
        <p class="text-muted-foreground">Track your body measurements and weight</p>
      </div>
      <button @click="showAddMeasurementModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
        <TrendingUpIcon class="w-5 h-5" />
        Add Measurement
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Latest Measurements -->
      <Card v-if="latestMeasurement">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Latest Measurements</h2>
          <p class="text-sm text-muted-foreground">{{ formatDate(latestMeasurement.date) }}</p>
        </div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-if="latestMeasurement.bodyweight" class="text-center">
            <p class="text-muted-foreground text-sm mb-1">Body Weight</p>
            <p class="text-3xl font-bold">{{ latestMeasurement.bodyweight }}</p>
            <p class="text-xs text-muted-foreground mt-1">kg</p>
          </div>
          <div v-if="latestMeasurement.waist" class="text-center">
            <p class="text-muted-foreground text-sm mb-1">Waist</p>
            <p class="text-3xl font-bold">{{ latestMeasurement.waist }}</p>
            <p class="text-xs text-muted-foreground mt-1">cm</p>
          </div>
          <div v-if="latestMeasurement.hips" class="text-center">
            <p class="text-muted-foreground text-sm mb-1">Hips</p>
            <p class="text-3xl font-bold">{{ latestMeasurement.hips }}</p>
            <p class="text-xs text-muted-foreground mt-1">cm</p>
          </div>
          <div v-if="weightChange !== null" class="text-center">
            <p class="text-muted-foreground text-sm mb-1">Weight Change</p>
            <p :class="[
              'text-3xl font-bold',
              weightChange > 0 ? 'text-destructive' : 'text-success'
            ]">
              {{ weightChange > 0 ? '+' : '' }}{{ weightChange.toFixed(1) }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">kg</p>
          </div>
        </div>
      </Card>

      <!-- Measurement History -->
      <Card v-if="measurementHistory.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Measurement History</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="measurement in measurementHistory" :key="measurement.id" class="p-4">
            <div class="flex items-start justify-between mb-2">
              <p class="font-medium">{{ formatDate(measurement.date) }}</p>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div v-if="measurement.bodyweight">
                <p class="text-muted-foreground mb-1">Weight</p>
                <p class="font-medium">{{ measurement.bodyweight }}kg</p>
              </div>
              <div v-if="measurement.waist">
                <p class="text-muted-foreground mb-1">Waist</p>
                <p class="font-medium">{{ measurement.waist }}cm</p>
              </div>
              <div v-if="measurement.hips">
                <p class="text-muted-foreground mb-1">Hips</p>
                <p class="font-medium">{{ measurement.hips }}cm</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Habit Streaks -->
      <Card v-if="topHabits.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Habit Streaks</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="habit in topHabits" :key="habit.id" class="p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold">{{ habit.name }}</h3>
              <span class="text-success font-bold text-lg">{{ habit.streak }} 🔥</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2">
              <div class="bg-success h-2 rounded-full"
                :style="{ width: `${Math.min((habit.current / habit.target) * 100, 100)}%` }" />
            </div>
            <p class="text-xs text-muted-foreground mt-2">{{ habit.current }} / {{ habit.target }} {{ habit.unit }}</p>
          </div>
        </div>
      </Card>

      <!-- Workout Statistics -->
      <Card v-if="workouts.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Workout Statistics</h2>
        </div>
        <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <p class="text-muted-foreground text-sm mb-1">Total Workouts</p>
            <p class="text-3xl font-bold">{{ workouts.length }}</p>
          </div>
          <div class="text-center">
            <p class="text-muted-foreground text-sm mb-1">This Month</p>
            <p class="text-3xl font-bold">{{ workoutsThisMonth }}</p>
          </div>
          <div class="text-center">
            <p class="text-muted-foreground text-sm mb-1">Average Exertion</p>
            <p class="text-3xl font-bold">{{ averageExertion }}/10</p>
          </div>
          <div class="text-center">
            <p class="text-muted-foreground text-sm mb-1">Exercises Logged</p>
            <p class="text-3xl font-bold">{{ totalExercises }}</p>
          </div>
        </div>
      </Card>

      <!-- Empty State -->
      <EmptyState v-if="measurements.length === 0" title="No Measurements Yet"
        message="Add your first measurement to start tracking your progress!" />
    </div>

    <!-- Add Measurement Modal -->
    <Modal v-model="showAddMeasurementModal" title="Add Measurement">
      <div class="p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Add Measurement</h2>

        <form @submit.prevent="submitMeasurement" class="space-y-4">
          <!-- Body Weight -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Body Weight (kg) - Optional</label>
            <input v-model.number="newMeasurement.bodyweight" type="number" step="0.1" placeholder="75.0"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          </div>

          <!-- Waist -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Waist (cm) - Optional</label>
            <input v-model.number="newMeasurement.waist" type="number" step="0.5" placeholder="80"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          </div>

          <!-- Hips -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Hips (cm) - Optional</label>
            <input v-model.number="newMeasurement.hips" type="number" step="0.5" placeholder="95"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showAddMeasurementModal = false"
              class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Cancel
            </button>
            <button type="submit"
              class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Add
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
import TrendingUpIcon from '@/components/icons/TrendingUpIcon.vue';
import { useUserStore } from '@/stores/user';
import type { Habit, Measurement, Workout } from '@/types';
import { formatDistanceToNow, isAfter, parseISO, startOfMonth } from 'date-fns';
import { computed, ref } from 'vue';

const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);
const measurements = ref<Measurement[]>([]);
const workouts = ref<Workout[]>([]);
const habits = ref<Habit[]>([]);

// TODO: Replace with actual API calls to load measurements, workouts, and habits

// State
const showAddMeasurementModal = ref(false);
const newMeasurement = ref({
  bodyweight: undefined as number | undefined,
  waist: undefined as number | undefined,
  hips: undefined as number | undefined,
});

// Computed
const userMeasurements = computed(() =>
  measurements.value.filter(m => m.userId === currentUser.value?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
);

const latestMeasurement = computed(() => userMeasurements.value[0] || null);

const measurementHistory = computed(() => userMeasurements.value.slice(0, 10));

const weightChange = computed(() => {
  if (!latestMeasurement.value || userMeasurements.value.length < 2) return null;
  const latest = latestMeasurement.value.bodyweight;
  const previous = userMeasurements.value[1].bodyweight;
  if (latest === undefined || previous === undefined) return null;
  return latest - previous;
});

const userWorkouts = computed(() =>
  workouts.value.filter(w => w.userId === currentUser.value?.id)
);

const workoutsThisMonth = computed(() => {
  const startOfCurrentMonth = startOfMonth(new Date());
  return userWorkouts.value.filter(w =>
    isAfter(parseISO(w.date), startOfCurrentMonth)
  ).length;
});

const averageExertion = computed(() => {
  if (userWorkouts.value.length === 0) return 0;
  const total = userWorkouts.value.reduce((sum, w) => sum + w.perceivedExertion, 0);
  return Math.round((total / userWorkouts.value.length) * 10) / 10;
});

const totalExercises = computed(() =>
  userWorkouts.value.reduce((sum, w) => sum + w.exercises.length, 0)
);

const userHabits = computed(() =>
  habits.value.filter(h => h.userId === currentUser.value?.id)
);

const topHabits = computed(() =>
  userHabits.value
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 4)
);

// Methods
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const submitMeasurement = () => {
  const hasData = newMeasurement.value.bodyweight !== undefined ||
    newMeasurement.value.waist !== undefined ||
    newMeasurement.value.hips !== undefined;

  if (!hasData) return;

  addMeasurement({ ...newMeasurement.value });

  // Reset form
  newMeasurement.value = {
    bodyweight: undefined,
    waist: undefined,
    hips: undefined,
  };

  showAddMeasurementModal.value = false;
};

const addMeasurement = async (measurementData: any) => {
  console.log('TODO: Add measurement:', measurementData);
  // TODO: Implement API call
};
</script>