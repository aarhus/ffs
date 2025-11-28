<template>
  <div class="space-y-6 pb-6">
    <!-- Header -->
    <div class="pt-6 px-6">
      <h1 class="text-3xl font-bold">Start a Workout</h1>
      <p class="text-muted-foreground">Log your exercises and track your progress</p>
    </div>

    <div class="px-6 space-y-6">
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
      <!-- Exercise Search & Add Section -->
      <Card>
        <div class="p-4 border-b border-border">
          <h2 class="text-lg font-semibold mb-4">Add Exercises</h2>

          <div class="space-y-4">
            <!-- Search/Select Exercise -->
            <div>
              <label class="text-sm font-medium text-muted-foreground mb-2 block">Exercise Name</label>
              <input v-model="exerciseSearch" type="text" placeholder="Search exercises..."
                class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground"
                @focus="showSuggestions = true" @blur="hideSuggestionsDelayed" />
              <div v-if="filteredExerciseLibrary.length > 0 && showSuggestions"
                class="mt-2 border border-border rounded-lg max-h-48 overflow-y-auto">
                <button v-for="exercise in filteredExerciseLibrary" :key="exercise.id"
                  @mousedown.prevent="selectExercise(exercise)"
                  class="w-full text-left px-3 py-2 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors text-sm">
                  {{ exercise.name }}
                </button>
              </div>
            </div>

            <!-- Selected Exercise Display -->
            <div v-if="currentExerciseData.name" class="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-muted-foreground mb-1">Selected Exercise</p>
                  <p class="font-semibold text-primary">{{ currentExerciseData.name }}</p>
                </div>
                <button @click="clearExerciseSelection"
                  class="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Clear
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

                <!-- Rest Time (only show if sets > 1) -->
                <div v-if="(currentExerciseData.sets || 0) > 1">
                  <label class="text-sm font-medium text-muted-foreground mb-2 block">Rest (seconds)</label>
                  <input v-model.number="currentExerciseData.rest_seconds" type="number" min="0" step="15"
                    placeholder="60"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                </div>
              </div>

              <!-- Rep Range -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-muted-foreground mb-2 block">Min Reps</label>
                  <input v-model.number="currentExerciseData.min_reps" type="number" min="1" placeholder="8"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                </div>
                <div>
                  <label class="text-sm font-medium text-muted-foreground mb-2 block">Max Reps</label>
                  <input v-model.number="currentExerciseData.max_reps" type="number" min="1" placeholder="12"
                    class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                </div>
              </div>

              <!-- Dynamic Measurement Fields based on exercise type -->
              {{ measurementCategories }}

              <!-- WEIGHT Measurement -->
              <div v-if="measurementCategories.includes('WEIGHT')" class="space-y-2">
                <label class="text-sm font-medium text-muted-foreground block">Weight - Optional</label>
                <div class="flex gap-2">
                  <input v-model.number="measurementValue" type="number" placeholder="0" step="0.5"
                    class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                  <select v-model="measurementType"
                    class="px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                    <option value="measure_weight_kg">kg</option>
                    <option value="measure_weight_lbs">lbs</option>
                  </select>
                </div>
              </div>

              <!-- DISTANCE Measurement -->
              <div v-if="measurementCategories.includes('DISTANCE')" class="space-y-2">
                <label class="text-sm font-medium text-muted-foreground block">Distance - Optional</label>
                <div class="flex gap-2">
                  <input v-model.number="measurementValue" type="number" placeholder="0" step="0.1"
                    class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                  <select v-model="measurementType"
                    class="px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                    <option value="measure_distance_meters">meters</option>
                    <option value="measure_distance_kilometers">km</option>
                    <option value="measure_distance_miles">miles</option>
                  </select>
                </div>
              </div>

              <!-- TIME Measurement -->
              <div v-if="measurementCategories.includes('TIME')" class="space-y-2">
                <label class="text-sm font-medium text-muted-foreground block">Duration - Optional</label>
                <div class="flex gap-2">
                  <input v-model.number="measurementValue" type="number" placeholder="0" step="1"
                    class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                  <select v-model="measurementType"
                    class="px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                    <option value="measure_time_seconds">seconds</option>
                    <option value="measure_time_minutes">minutes</option>
                    <option value="measure_time_hours">hours</option>
                  </select>
                </div>
              </div>

              <!-- POWER Measurement -->
              <div v-if="measurementCategories.includes('POWER')" class="space-y-2">
                <label class="text-sm font-medium text-muted-foreground block">Power - Optional</label>
                <div class="flex gap-2">
                  <input v-model.number="measurementValue" type="number" placeholder="0" step="1"
                    class="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
                  <select v-model="measurementType"
                    class="px-3 py-2 rounded-lg border border-border bg-background text-foreground">
                    <option value="measure_power_watts">watts</option>
                    <option value="measure_power_calories">cal/hr</option>
                  </select>
                </div>
              </div>

              <!-- POINTS Measurement -->
              <div v-if="measurementCategories.includes('POINTS')" class="space-y-2">
                <label class="text-sm font-medium text-muted-foreground block">Points - Optional</label>
                <input v-model.number="measurementValue" type="number" placeholder="0" step="1"
                  class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground" />
              </div>

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
                  {{ exercise.sets }} sets ×
                  <span v-if="exercise.min_reps && exercise.max_reps">{{ exercise.min_reps }}-{{ exercise.max_reps
                    }}</span>
                  <span v-else-if="exercise.min_reps">{{ exercise.min_reps }}</span>
                  <span v-else>{{ exercise.reps || '?' }}</span>
                  <span v-if="exercise.weight"> @ {{ exercise.weight }}kg</span>
                  <span v-if="exercise.rest_seconds"> • {{ exercise.rest_seconds }}s rest</span>
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
            <button @click="router.back()"
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
import Card from '@/components/common/Card.vue';
import { createWorkout, getExercises, type ExerciseLibraryResponse } from '@/services/api';
import type { Exercise } from '@/types';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// State
const exerciseLibrary = ref<ExerciseLibraryResponse[]>([]);
const isLoadingExercises = ref(false);
const exerciseSearch = ref('');
const showSuggestions = ref(false);
const selectedExercise = ref<ExerciseLibraryResponse | null>(null);
const currentExerciseData = ref<Partial<Exercise>>({
  sets: 3,
});
const measurementValue = ref<number | undefined>();
const measurementType = ref<string>(''); // ID from measurement_types table
const addedExercises = ref<Exercise[]>([]);
const perceivedExertion = ref(5);
const workoutNotes = ref('');
const isCompleted = ref(false);
const workoutName = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Load exercises from API
const loadExercises = async () => {
  try {
    isLoadingExercises.value = true;
    exerciseLibrary.value = await getExercises();
  } catch (error: any) {
    console.error('Failed to load exercises:', error);
    errorMessage.value = 'Failed to load exercise library';
  } finally {
    isLoadingExercises.value = false;
  }
};

// Computed
const filteredExerciseLibrary = computed(() => {
  const search = exerciseSearch.value.toLowerCase();
  if (!search) return [];
  return exerciseLibrary.value
    .filter(e => e.name.toLowerCase().includes(search))
    .slice(0, 8);
});

// Parse measurement categories for selected exercise
const measurementCategories = computed(() => {
  console.log('Selected Exercise:', selectedExercise.value);
  if (!selectedExercise.value?.measurement_categories) return [];
  try {
    return JSON.parse(selectedExercise.value.measurement_categories);
  } catch {
    return [];
  }
});

// Methods
const selectExercise = (exercise: ExerciseLibraryResponse) => {
  selectedExercise.value = exercise;
  currentExerciseData.value.name = exercise.name;
  currentExerciseData.value.id = exercise.id; // Store exercise ID
  measurementType.value = exercise.default_measurement_type || '';
  exerciseSearch.value = '';
  showSuggestions.value = false;
};

const clearExerciseSelection = () => {
  selectedExercise.value = null;
  currentExerciseData.value = { sets: 3, reps: '8-12' };
  measurementValue.value = undefined;
  measurementType.value = '';
  exerciseSearch.value = '';
};

const hideSuggestionsDelayed = () => {
  // Delay hiding to allow click events to fire
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const addExercise = () => {
  if (!currentExerciseData.value.name) return;

  // Require that an exercise from the library was selected
  if (!currentExerciseData.value.id) {
    errorMessage.value = 'Please select an exercise from the library. For custom exercises, select "Other/Custom Exercise".';
    return;
  }

  // Build reps string for display from min/max
  let repsDisplay = '';
  if (currentExerciseData.value.min_reps && currentExerciseData.value.max_reps) {
    repsDisplay = `${currentExerciseData.value.min_reps}-${currentExerciseData.value.max_reps}`;
  } else if (currentExerciseData.value.min_reps) {
    repsDisplay = `${currentExerciseData.value.min_reps}`;
  } else {
    repsDisplay = '8-12'; // Default
  }

  const exercise: Exercise = {
    id: currentExerciseData.value.id,
    name: currentExerciseData.value.name,
    sets: currentExerciseData.value.sets || 3,
    reps: repsDisplay,
    min_reps: currentExerciseData.value.min_reps,
    max_reps: currentExerciseData.value.max_reps,
    measurement_value: measurementValue.value,
    measurement_type: measurementType.value || undefined,
    rest_seconds: currentExerciseData.value.rest_seconds,
    instructions: currentExerciseData.value.instructions,
  };

  addedExercises.value.push(exercise);

  // Reset form
  selectedExercise.value = null;
  currentExerciseData.value = { sets: 3 };
  measurementValue.value = undefined;
  measurementType.value = '';
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

    // Redirect back after a short delay
    setTimeout(() => {
      router.push('/training');
    }, 1500);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to save workout';
  } finally {
    isSubmitting.value = false;
  }
};

// Load exercises on mount
onMounted(() => {
  loadExercises();
});
</script>