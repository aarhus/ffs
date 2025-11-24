<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Start a Workout</h1>
      <p class="text-muted-foreground">Log your exercises and track your progress</p>
    </div>

    <div class="px-6 space-y-6">
      <!-- Exercise Search & Add Section -->
      <Card>
        <div class="p-4 border-b border-border">
          <h2 class="text-lg font-semibold mb-4">Add Exercises</h2>

          <div class="space-y-4">
            <!-- Search/Select Exercise -->
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Exercise Name</label>
              <input v-model="exerciseSearch" type="text" placeholder="Search exercises..."
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground" />
              <div v-if="filteredExerciseLibrary.length > 0"
                class="mt-2 border border-border rounded-lg max-h-48 overflow-y-auto">
                <button v-for="exercise in filteredExerciseLibrary" :key="exercise" @click="selectExercise(exercise)"
                  class="w-full text-left px-3 py-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors text-sm">
                  {{ exercise }}
                </button>
              </div>
            </div>

            <!-- Exercise Details Form -->
            <div v-if="currentExerciseData.name" class="space-y-4 pt-4 border-t border-border">
              <div class="grid grid-cols-2 gap-4">
                <!-- Sets -->
                <div>
                  <label class="text-sm font-medium text-muted-foreground mb-2 block">Sets</label>
                  <input v-model.number="currentExerciseData.sets" type="number" min="1" max="10"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                </div>

                <!-- Reps -->
                <div>
                  <label class="text-sm font-medium text-muted-foreground mb-2 block">Reps</label>
                  <input v-model="currentExerciseData.reps" type="text" placeholder="e.g., 8-12, 5, AMRAP"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                </div>
              </div>

              <!-- Weight -->
              <div>
                <label class="text-sm font-medium text-muted-foreground mb-2 block">Weight (kg) - Optional</label>
                <input v-model.number="currentExerciseData.weight" type="number" placeholder="0.0" step="0.5"
                  class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
              </div>

              <!-- PR Indicator -->
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="currentExerciseData.isPR" type="checkbox" class="w-4 h-4 rounded border-border" />
                <span class="text-sm font-medium">Personal Record (PR) ⭐</span>
              </label>

              <!-- Notes -->
              <div>
                <label class="text-sm font-medium text-muted-foreground mb-2 block">Exercise Notes - Optional</label>
                <textarea v-model="currentExerciseData.instructions" placeholder="How did it feel? Any form cues?"
                  rows="2"
                  class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground resize-none" />
              </div>

              <!-- Add Exercise Button -->
              <button @click="addExercise"
                class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors font-medium">
                Add Exercise
              </button>
            </div>
          </div>
        </div>
      </Card>

      <!-- Added Exercises List -->
      <Card v-if="addedExercises.length > 0">
        <div class="border-b border-border p-4">
          <h2 class="text-lg font-semibold">Exercises in This Workout ({{ addedExercises.length }})</h2>
        </div>
        <div class="divide-y divide-border">
          <div v-for="(exercise, index) in addedExercises" :key="index" class="p-4">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="font-semibold">{{ exercise.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ exercise.sets }} sets × {{ exercise.reps }}
                  <span v-if="exercise.weight">@ {{ exercise.weight }}kg</span>
                  <span v-if="exercise.isPR" class="ml-2 text-xs bg-warning/10 text-warning px-1.5 py-0.5 rounded">
                    PR ⭐
                  </span>
                </p>
              </div>
              <button @click="removeExercise(index)"
                class="text-destructive hover:bg-destructive/10 px-2 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1 transition-colors">
                Remove
              </button>
            </div>
            <div v-if="exercise.instructions" class="text-xs text-muted-foreground mt-2 italic">
              {{ exercise.instructions }}
            </div>
          </div>
        </div>
      </Card>

      <!-- Workout Notes Section -->
      <Card>
        <div class="p-4 border-b border-border">
          <h2 class="text-lg font-semibold mb-4">Workout Details</h2>

          <!-- Workout Name -->
          <div class="mb-6">
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Workout Name *</label>
            <input v-model="workoutName" type="text" placeholder="e.g., Upper Body Push Day"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground"
              required />
          </div>

          <!-- Perceived Exertion Slider -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <label class="text-sm font-medium">Perceived Exertion</label>
              <span class="text-lg font-semibold text-primary">{{ perceivedExertion }}/10</span>
            </div>
            <input v-model.number="perceivedExertion" type="range" min="0" max="10" step="1"
              class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer" />
            <div class="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Easy</span>
              <span>Moderate</span>
              <span>Maximum</span>
            </div>
          </div>

          <!-- Workout Notes -->
          <div>
            <label class="text-sm font-medium text-muted-foreground mb-2 block">Workout Notes</label>
            <textarea v-model="workoutNotes" placeholder="Overall notes about the workout..." rows="3"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground resize-none" />
          </div>
        </div>
      </Card>

      <!-- Completion Toggle & Submit -->
      <Card>
        <div class="p-4">
          <!-- Success/Error Messages -->
          <div v-if="successMessage" class="mb-4 p-3 rounded-lg bg-success/10 text-success text-sm">
            {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {{ errorMessage }}
          </div>

          <label class="flex items-center gap-3 cursor-pointer mb-4">
            <input v-model="isCompleted" type="checkbox" class="w-4 h-4 rounded border-border" />
            <span class="text-sm font-medium">Mark workout as completed</span>
          </label>

          <div class="flex gap-3">
            <button @click="$emit('back')"
              class="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors font-medium">
              Cancel
            </button>
            <button @click="submitWorkout"
              :disabled="addedExercises.length === 0 || !workoutName.trim() || isSubmitting" :class="[
                'flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 border',
                addedExercises.length === 0 || !workoutName.trim() || isSubmitting
                  ? 'bg-muted text-muted-foreground cursor-not-allowed border-muted'
                  : 'bg-success text-success-foreground hover:bg-success/90 focus:ring-success border-success'
              ]">
              {{ isSubmitting ? 'Saving...' : 'Save Workout' }}
            </button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Exercise } from '@/types';
import { computed, ref } from 'vue';
import { createWorkout } from '@/services/api';
import Card from './common/Card.vue';

const emit = defineEmits<{
  workoutSaved: [];
  back: [];
}>();

// Exercise library
const exerciseLibrary = [
  'Bench Press',
  'Barbell Squat',
  'Deadlift',
  'Pull-ups',
  'Dumbbell Row',
  'Leg Press',
  'Chest Fly',
  'Lat Pulldown',
  'Leg Curl',
  'Leg Extension',
  'Shoulder Press',
  'Lateral Raise',
  'Bicep Curl',
  'Tricep Dip',
  'Push-ups',
  'Planks',
  'Running',
  'Cycling',
  'Swimming',
  'Rowing',
];

// State
const exerciseSearch = ref('');
const currentExerciseData = ref<Partial<Exercise>>({
  sets: 3,
  reps: '8-12',
});
const addedExercises = ref<Exercise[]>([]);
const perceivedExertion = ref(5);
const workoutNotes = ref('');
const isCompleted = ref(false);
const workoutName = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Computed
const filteredExerciseLibrary = computed(() => {
  const search = exerciseSearch.value.toLowerCase();
  if (!search) return [];
  return exerciseLibrary.filter(e => e.toLowerCase().includes(search)).slice(0, 8);
});

// Methods
const selectExercise = (exerciseName: string) => {
  currentExerciseData.value.name = exerciseName;
  exerciseSearch.value = '';
};

const addExercise = () => {
  if (!currentExerciseData.value.name) return;

  const exercise: Exercise = {
    id: `exercise_${Date.now()}`,
    name: currentExerciseData.value.name,
    sets: currentExerciseData.value.sets || 3,
    reps: currentExerciseData.value.reps || '8-12',
    weight: currentExerciseData.value.weight,
    instructions: currentExerciseData.value.instructions,
    isPR: currentExerciseData.value.isPR,
  };

  addedExercises.value.push(exercise);

  // Reset form
  currentExerciseData.value = { sets: 3, reps: '8-12' };
  exerciseSearch.value = '';
};

const removeExercise = (index: number) => {
  addedExercises.value.splice(index, 1);
};

const submitWorkout = async () => {
  if (addedExercises.value.length === 0) return;
  if (!workoutName.value.trim()) {
    errorMessage.value = 'Please enter a workout name';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    await createWorkout({
      name: workoutName.value,
      date: new Date().toISOString(),
      exercises: addedExercises.value,
      perceived_exertion: perceivedExertion.value,
      notes: workoutNotes.value || undefined,
      completed: isCompleted.value,
    });

    successMessage.value = 'Workout saved successfully!';

    // Reset form
    addedExercises.value = [];
    workoutName.value = '';
    workoutNotes.value = '';
    perceivedExertion.value = 5;
    isCompleted.value = false;
    currentExerciseData.value = { sets: 3, reps: '8-12' };

    // Emit success event
    emit('workoutSaved');

    // Redirect back after a short delay
    setTimeout(() => {
      emit('back');
    }, 1500);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to save workout';
  } finally {
    isSubmitting.value = false;
  }
};
</script>