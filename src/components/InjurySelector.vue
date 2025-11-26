<template>
    <div class="injury-selector">
        <div class="form-group">
            <label class="form-label">Injury Type</label>
            <select v-model="selectedInjuryType" @change="onInjuryTypeChange" class="form-select" required>
                <option value="">-- Select an injury --</option>
                <optgroup v-for="category in categories" :key="category" :label="category">
                    <option v-for="injury in getInjuriesByCategory(category)" :key="injury.id" :value="injury.name">
                        {{ injury.name }}
                    </option>
                </optgroup>
                <option value="Other">Other (Custom)</option>
            </select>
        </div>

        <div v-if="selectedInjuryType === 'Other'" class="form-group">
            <label class="form-label">Custom Injury Name</label>
            <input v-model="customInjuryName" type="text" class="form-input" placeholder="Enter injury name" required />
        </div>

        <div v-if="selectedInjuryType" class="form-group">
            <label class="form-label">Additional Details (Optional)</label>
            <textarea v-model="details" class="form-textarea" rows="3"
                placeholder="Provide any additional information about this injury..."></textarea>
        </div>

        <div v-if="selectedInjuryType" class="form-row">
            <div class="form-group flex-1">
                <label class="form-label">Severity</label>
                <select v-model="severity" class="form-select">
                    <option :value="null">Not specified</option>
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                </select>
            </div>

            <div class="form-group flex-1">
                <label class="form-label">Status</label>
                <select v-model="status" class="form-select">
                    <option value="ACTIVE">Active</option>
                    <option value="RECOVERING">Recovering</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
            </div>
        </div>

        <div v-if="selectedInjuryType" class="form-group">
            <label class="form-label">Date Reported</label>
            <input v-model="dateReported" type="date" class="form-input" required />
        </div>

        <!-- Show injury metadata for pre-defined injuries -->
        <div v-if="selectedInjuryDefinition" class="injury-info bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p v-if="selectedInjuryDefinition.description" class="text-sm mb-2">
                <strong>Description:</strong> {{ selectedInjuryDefinition.description }}
            </p>
            <p v-if="selectedInjuryDefinition.affected_areas.length > 0" class="text-sm mb-2">
                <strong>Affected Areas:</strong>
                {{ selectedInjuryDefinition.affected_areas.join(', ') }}
            </p>
            <p v-if="selectedInjuryDefinition.recommended_modifications.length > 0" class="text-sm">
                <strong>Recommended Modifications:</strong>
            </p>
            <ul v-if="selectedInjuryDefinition.recommended_modifications.length > 0"
                class="text-sm list-disc list-inside ml-2">
                <li v-for="(mod, idx) in selectedInjuryDefinition.recommended_modifications" :key="idx">
                    {{ mod }}
                </li>
            </ul>
        </div>

        <div class="form-actions">
            <button @click="handleAddInjury" :disabled="!isValid" class="btn btn-primary">
                Add Injury
            </button>
            <button @click="handleCancel" class="btn btn-secondary">Cancel</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { InjuryDefinition } from '@/types';

const props = defineProps<{
    injuryDefinitions: InjuryDefinition[];
}>();

const emit = defineEmits<{
    'add-injury': [injury: {
        injury_type: string;
        details: string | null;
        severity: 'MILD' | 'MODERATE' | 'SEVERE' | null;
        status: 'ACTIVE' | 'RECOVERING' | 'RESOLVED';
        date_reported: string;
    }];
    cancel: [];
}>();

const selectedInjuryType = ref<string>('');
const customInjuryName = ref<string>('');
const details = ref<string>('');
const severity = ref<'MILD' | 'MODERATE' | 'SEVERE' | null>(null);
const status = ref<'ACTIVE' | 'RECOVERING' | 'RESOLVED'>('ACTIVE');
const dateReported = ref<string>(new Date().toISOString().split('T')[0]);

// Get unique categories
const categories = computed(() => {
    const cats = new Set(
        props.injuryDefinitions
            .filter((def) => def.is_active)
            .map((def) => def.category)
    );
    return Array.from(cats).sort();
});

// Filter injuries by category
const getInjuriesByCategory = (category: string) => {
    return props.injuryDefinitions
        .filter((def) => def.category === category && def.is_active)
        .sort((a, b) => a.name.localeCompare(b.name));
};

// Get selected injury definition details
const selectedInjuryDefinition = computed(() => {
    if (!selectedInjuryType.value || selectedInjuryType.value === 'Other') {
        return null;
    }
    return props.injuryDefinitions.find(
        (def) => def.name === selectedInjuryType.value
    );
});

// Validation
const isValid = computed(() => {
    if (!selectedInjuryType.value) return false;
    if (selectedInjuryType.value === 'Other' && !customInjuryName.value.trim()) {
        return false;
    }
    if (!dateReported.value) return false;
    return true;
});

// Reset form when injury type changes
const onInjuryTypeChange = () => {
    if (selectedInjuryType.value !== 'Other') {
        customInjuryName.value = '';
    }
};

// Handle add injury
const handleAddInjury = () => {
    if (!isValid.value) return;

    const injuryType =
        selectedInjuryType.value === 'Other'
            ? customInjuryName.value.trim()
            : selectedInjuryType.value;

    emit('add-injury', {
        injury_type: injuryType,
        details: details.value.trim() || null,
        severity: severity.value,
        status: status.value,
        date_reported: dateReported.value,
    });

    // Reset form
    selectedInjuryType.value = '';
    customInjuryName.value = '';
    details.value = '';
    severity.value = null;
    status.value = 'ACTIVE';
    dateReported.value = new Date().toISOString().split('T')[0];
};

// Handle cancel
const handleCancel = () => {
    emit('cancel');
};
</script>

<style scoped>
.injury-selector {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.flex-1 {
    flex: 1;
}

.form-label {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text);
}

.form-select,
.form-input,
.form-textarea {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: 0.375rem;
    background-color: var(--color-background);
    color: var(--color-text);
    font-size: 0.875rem;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
    resize: vertical;
    min-height: 4rem;
}

.injury-info {
    margin-top: 0.5rem;
}

.form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background-color: #3b82f6;
    color: white;
    border: none;
}

.btn-primary:hover:not(:disabled) {
    background-color: #2563eb;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.btn-secondary:hover {
    background-color: var(--color-background-soft);
}
</style>