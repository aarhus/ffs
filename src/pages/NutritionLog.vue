<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Nutrition Log</h1>
        <p class="text-muted-foreground">Track your daily nutrition intake</p>
      </div>
      <button @click="showAddMealModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
        <AppleIcon class="w-5 h-5" />
        Log Meal
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Today's Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Protein</p>
            <p class="text-3xl font-bold">{{ todayStats.protein }}g</p>
            <p class="text-xs text-muted-foreground mt-1">Target: 150g</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Water</p>
            <p class="text-3xl font-bold">{{ todayStats.water }}ml</p>
            <p class="text-xs text-muted-foreground mt-1">Target: 2000ml</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Fiber</p>
            <p class="text-3xl font-bold">{{ todayStats.fiber }}g</p>
            <p class="text-xs text-muted-foreground mt-1">Target: 30g</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Meals Logged</p>
            <p class="text-3xl font-bold">{{ todayStats.mealCount }}</p>
            <p class="text-xs text-muted-foreground mt-1">Today</p>
          </div>
        </Card>
      </div>

      <!-- Daily Nutrition Progress -->
      <Card>
        <div class="p-4 border-b border-border">
          <h2 class="text-lg font-semibold mb-4">Daily Progress</h2>
        </div>
        <div class="p-4 space-y-4">
          <!-- Protein Progress -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">Protein</span>
              <span class="text-sm">{{ todayStats.protein }} / 150g</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2.5">
              <div class="bg-info h-2.5 rounded-full"
                :style="{ width: `${Math.min((todayStats.protein / 150) * 100, 100)}%` }" />
            </div>
          </div>

          <!-- Water Progress -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">Water</span>
              <span class="text-sm">{{ todayStats.water }} / 2000ml</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2.5">
              <div class="bg-primary h-2.5 rounded-full"
                :style="{ width: `${Math.min((todayStats.water / 2000) * 100, 100)}%` }" />
            </div>
          </div>

          <!-- Fiber Progress -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium">Fiber</span>
              <span class="text-sm">{{ todayStats.fiber }} / 30g</span>
            </div>
            <div class="w-full bg-muted rounded-full h-2.5">
              <div class="bg-success h-2.5 rounded-full"
                :style="{ width: `${Math.min((todayStats.fiber / 30) * 100, 100)}%` }" />
            </div>
          </div>
        </div>
      </Card>

      <!-- Habit Tracker -->
      <Card v-if="proteinHabit || waterHabit" class="border-primary/50">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Habit Streaks</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-if="proteinHabit" class="p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium">Protein Target 🥚</span>
              <span class="text-success font-semibold">{{ proteinHabit.streak }} day streak 🔥</span>
            </div>
            <p class="text-sm text-muted-foreground">{{ proteinHabit.current }} / {{ proteinHabit.target }}g daily</p>
          </div>
          <div v-if="waterHabit" class="p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium">Water Intake 💧</span>
              <span class="text-success font-semibold">{{ waterHabit.streak }} day streak 🔥</span>
            </div>
            <p class="text-sm text-muted-foreground">{{ waterHabit.current }} / {{ waterHabit.target }}ml daily</p>
          </div>
        </div>
      </Card>

      <!-- Recent Meals -->
      <Card v-if="todayMeals.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Today's Meals</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="(meal, idx) in todayMeals" :key="idx" class="p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="font-medium">{{ meal.text || 'Meal' }}</p>
                <p class="text-sm text-muted-foreground">{{ formatTime(logs[0]?.date || new Date().toISOString()) }}</p>
              </div>
              <button
                class="text-xs text-destructive border border-destructive/20 hover:bg-destructive/10 px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1">
                Remove
              </button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Meal History -->
      <Card v-if="recentLogs.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Recent Logs</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="log in recentLogs" :key="log.id" class="p-4">
            <div class="flex items-start justify-between mb-2">
              <p class="font-medium">{{ formatLogDate(log.date) }}</p>
              <span class="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                {{ log.meals.length }} meal{{ log.meals.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="text-sm text-muted-foreground space-y-1">
              <p>Protein: {{ log.protein }}g</p>
              <p>Water: {{ log.water }}ml</p>
              <p>Fiber: {{ log.fibre }}g</p>
            </div>
          </div>
        </div>
      </Card>

      <!-- Empty State -->
      <EmptyState v-if="logs.length === 0" title="No Nutrition Logged"
        message="Start logging your meals to track your nutrition!" />
    </div>

    <!-- Add Meal Modal -->
    <Modal v-model="showAddMealModal" title="Log Meal">
      <div class="p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Log Meal</h2>

        <form @submit.prevent="submitMeal" class="space-y-4">
          <!-- Meal Description -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Meal Description</label>
            <textarea v-model="newMeal.text" placeholder="e.g., Chicken breast with rice and broccoli" rows="3"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground resize-none" />
          </div>

          <!-- Protein -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Protein (g)</label>
            <input v-model.number="newMeal.protein" type="number" step="1" placeholder="0"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          </div>

          <!-- Fiber -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Fiber (g)</label>
            <input v-model.number="newMeal.fiber" type="number" step="0.5" placeholder="0"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          </div>

          <!-- Water -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Water (ml)</label>
            <input v-model.number="newMeal.water" type="number" step="50" placeholder="0"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showAddMealModal = false"
              class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Cancel
            </button>
            <button type="submit"
              class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Log Meal
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
import AppleIcon from '@/components/icons/AppleIcon.vue';
import { useUserStore } from '@/stores/user';
import type { Habit, NutritionLog } from '@/types';
import { endOfDay, formatDistanceToNow, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { computed, ref } from 'vue';

const userStore = useUserStore();
const currentUser = computed(() => userStore.currentUser);

// TODO: Replace with actual API calls
const logs = ref<NutritionLog[]>([]);
const habits = ref<Habit[]>([]);

// State
const showAddMealModal = ref(false);
const newMeal = ref({
  text: '',
  protein: 0,
  fiber: 0,
  water: 0,
});

// Computed
const recentLogs = computed(() =>
  logs.value
    .filter(l => l.userId === currentUser.value?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
);

const todayMeals = computed(() => {
  const today = new Date();
  const todayLog = logs.value.find(
    l => l.userId === currentUser.value?.id &&
      isWithinInterval(parseISO(l.date), {
        start: startOfDay(today),
        end: endOfDay(today),
      })
  );
  return todayLog?.meals || [];
});

const todayStats = computed(() => {
  const today = new Date();
  const todayLog = logs.value.find(
    l => l.userId === currentUser.value?.id &&
      isWithinInterval(parseISO(l.date), {
        start: startOfDay(today),
        end: endOfDay(today),
      })
  );

  return {
    protein: todayLog?.protein || 0,
    water: todayLog?.water || 0,
    fiber: todayLog?.fibre || 0,
    mealCount: todayLog?.meals.length || 0,
  };
});

const proteinHabit = computed(() =>
  habits.value.find(h => h.userId === currentUser.value?.id && h.name === 'Protein')
);

const waterHabit = computed(() =>
  habits.value.find(h => h.userId === currentUser.value?.id && h.name === 'Water')
);

// Methods
const formatTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const formatLogDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const submitMeal = () => {
  addNutritionLog({
    date: new Date().toISOString(),
    meals: [{ text: newMeal.value.text }],
    protein: newMeal.value.protein,
    fibre: newMeal.value.fiber,
    water: newMeal.value.water,
  });

  // Reset form
  newMeal.value = {
    text: '',
    protein: 0,
    fiber: 0,
    water: 0,
  };

  showAddMealModal.value = false;
};

const addNutritionLog = async (log: any) => {
  console.log('TODO: Add nutrition log:', log);
  // TODO: Implement API call
};
</script>