<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Goals</h1>
        <p class="text-muted-foreground">Track your fitness objectives</p>
      </div>
      <button @click="showNewGoalModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
        <TargetIcon class="w-5 h-5" />
        New Goal
      </button>
    </div>

    <div class="px-6 space-y-6">
      <!-- Goal Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Total Goals</p>
            <p class="text-3xl font-bold">{{ userGoals.length }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Active</p>
            <p class="text-3xl font-bold text-primary">{{ activeGoals.length }}</p>
          </div>
        </Card>
        <Card>
          <div class="p-4">
            <p class="text-sm text-muted-foreground mb-2">Completed</p>
            <p class="text-3xl font-bold text-success">{{ completedGoals.length }}</p>
          </div>
        </Card>
      </div>

      <!-- Active Goals -->
      <Card v-if="activeGoals.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Active Goals</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="goal in activeGoals" :key="goal.id" class="p-4 hover:bg-muted/50 transition-colors">
            <div class="space-y-3">
              <!-- Goal Header -->
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">{{ goal.title }}</h3>
                  <p class="text-sm text-muted-foreground">
                    Due {{ formatDueDate(goal.dueDate) }}
                  </p>
                </div>
                <span :class="[
                  'px-3 py-1 rounded text-xs font-medium',
                  goalProgressPercent(goal) >= 100
                    ? 'bg-success/10 text-success'
                    : goalProgressPercent(goal) >= 50
                      ? 'bg-info/10 text-info'
                      : 'bg-warning/10 text-warning'
                ]">
                  {{ goalProgressPercent(goal) }}%
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-1">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted-foreground">{{ goal.current }} / {{ goal.target }} {{ goal.metric }}</span>
                  <span class="font-medium">{{ ((goal.current / goal.target) * 100).toFixed(0) }}%</span>
                </div>
                <div class="w-full bg-muted rounded-full h-3">
                  <div class="bg-gradient-to-r from-info to-primary h-3 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }" />
                </div>
              </div>

              <!-- Update Current Value -->
              <div class="flex gap-2 pt-2">
                <input v-model.number="goalUpdates[goal.id]" type="number"
                  :placeholder="`Update: current is ${goal.current}`"
                  class="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground" />
                <button @click="updateGoalValue(goal.id)"
                  class="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Completed Goals -->
      <Card v-if="completedGoals.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Completed Goals 🎉</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="goal in completedGoals" :key="goal.id" class="p-4">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-lg">{{ goal.title }}</h3>
                <p class="text-sm text-muted-foreground">
                  {{ goal.current }} {{ goal.metric }} · Completed
                </p>
              </div>
              <span class="bg-success/10 text-success px-3 py-1 rounded text-xs font-medium">
                ✓ Completed
              </span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Archived Goals -->
      <Card v-if="archivedGoals.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Archived Goals</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="goal in archivedGoals" :key="goal.id" class="p-4 opacity-60">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-semibold text-lg">{{ goal.title }}</h3>
                <p class="text-sm text-muted-foreground">
                  {{ goal.current }} {{ goal.metric }}
                </p>
              </div>
              <span class="bg-muted text-muted-foreground px-3 py-1 rounded text-xs font-medium">
                Archived
              </span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Empty State -->
      <EmptyState v-if="userGoals.length === 0" title="No Goals Yet"
        message="Set your first fitness goal to get started!" />
    </div>

    <!-- New Goal Modal -->
    <Modal v-model="showNewGoalModal" title="New Goal">
      <div class="p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">Create New Goal</h2>

        <form @submit.prevent="submitNewGoal" class="space-y-4">
          <!-- Goal Title -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Goal Title</label>
            <input v-model="newGoal.title" type="text" placeholder="e.g., Bench Press 100kg"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
          </div>

          <!-- Target Value -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Target Value</label>
            <input v-model.number="newGoal.target" type="number" placeholder="100"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
          </div>

          <!-- Metric -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Metric</label>
            <select v-model="newGoal.metric"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required>
              <option value="kg">Kilograms (kg)</option>
              <option value="reps">Reps</option>
              <option value="cm">Centimeters (cm)</option>
              <option value="mins">Minutes</option>
              <option value="%">Percentage (%)</option>
            </select>
          </div>

          <!-- Due Date -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Due Date</label>
            <input v-model="newGoal.dueDate" type="date"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" required />
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4">
            <button type="button" @click="showNewGoalModal = false"
              class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Cancel
            </button>
            <button type="submit"
              class="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors">
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import type { Goal, User } from '@/types';
import { GoalStatus } from '@/types';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { computed, ref } from 'vue';
import Card from './common/Card.vue';
import EmptyState from './common/EmptyState.vue';
import Modal from './common/Modal.vue';
import TargetIcon from './icons/TargetIcon.vue';

const props = defineProps<{
  currentUser: User;
  goals: Goal[];
}>();

// State
const showNewGoalModal = ref(false);
const goalUpdates = ref<Record<string, number>>({});
const newGoal = ref({
  title: '',
  target: 0,
  metric: 'kg' as const,
  dueDate: '',
});

// Computed
const userGoals = computed(() =>
  props.goals.filter(g => g.userId === props.currentUser.id)
);

const activeGoals = computed(() =>
  userGoals.value.filter(g => g.status === GoalStatus.ACTIVE)
);

const completedGoals = computed(() =>
  userGoals.value.filter(g => g.status === GoalStatus.COMPLETED)
);

const archivedGoals = computed(() =>
  userGoals.value.filter(g => g.status === GoalStatus.ARCHIVED)
);

// Methods
const formatDueDate = (dateString: string) => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const goalProgressPercent = (goal: Goal) => {
  return Math.min(Math.round((goal.current / goal.target) * 100), 100);
};

const updateGoalValue = (goalId: string) => {
  const newValue = goalUpdates.value[goalId];
  if (newValue === undefined) return;

  emit('bulkUpdateGoals', [
    {
      goalId,
      newCurrent: newValue,
    },
  ]);

  goalUpdates.value[goalId] = undefined!;
};

const submitNewGoal = () => {
  if (!newGoal.value.title || !newGoal.value.target || !newGoal.value.dueDate) return;

  emit('addNewGoal', {
    title: newGoal.value.title,
    target: newGoal.value.target,
    metric: newGoal.value.metric,
    dueDate: newGoal.value.dueDate,
  });

  // Reset form
  newGoal.value = {
    title: '',
    target: 0,
    metric: 'kg',
    dueDate: '',
  };

  showNewGoalModal.value = false;
};

const emit = defineEmits<{
  addNewGoal: [goalData: any];
  bulkUpdateGoals: [updates: any[]];
}>();
</script>