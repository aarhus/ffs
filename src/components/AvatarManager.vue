<template>
    <div v-if="props.user" class="flex flex-col gap-4">
        <!-- Display Current Avatar -->
        <div class="text-center">
            <img v-if="currentAvatarUrl" :src="currentAvatarUrl" :alt="props.user.name"
                class="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg mx-auto transition-transform hover:scale-105" />
        </div>

        <!-- Upload Options -->
        <div class="flex flex-col gap-3">
            <!-- Upload Custom Avatar -->
            <div class="flex flex-col gap-2">
                <label for="avatar-input"
                    class="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer text-center font-medium">
                    📸 Upload Photo
                </label>
                <input id="avatar-input" type="file" accept="image/*" class="hidden" @change="handleFileSelect"
                    :disabled="isLoading" aria-label="Upload avatar image" />
                <p class="text-xs text-muted-foreground">JPG, PNG, WebP or GIF up to 5MB</p>
            </div>

            <!-- Use Gravatar -->
            <button v-if="!isUsingGravatar" @click="handleSetGravatar" :disabled="isLoading"
                class="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium disabled:opacity-60"
                aria-label="Use Gravatar as avatar">
                👤 Use Gravatar
            </button>

            <!-- Delete Custom Avatar -->
            <button v-if="isUsingCustomAvatar" @click="handleDeleteAvatar" :disabled="isLoading"
                class="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium disabled:opacity-60"
                aria-label="Delete custom avatar">
                🗑️ Delete Custom Avatar
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-3 bg-info/10 text-info rounded-lg text-center font-medium animate-pulse">
            Updating avatar...
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage"
            class="p-3 bg-destructive/10 text-destructive rounded-lg text-center font-medium border-l-4 border-destructive"
            role="alert">
            {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage"
            class="p-3 bg-success/10 text-success rounded-lg text-center font-medium border-l-4 border-success">
            {{ successMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    deleteAvatar,
    getAvatarUrl,
    setGravatar,
    uploadAvatar,
    validateImageFile,
} from '@/services/avatarApi';
import { auth } from '@/services/firebase';
import { computed, onMounted, ref } from 'vue';

interface Props {
    user: Object;
}
;

const currentAvatarUrl = ref<string>('');
const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const isUsingCustomAvatar = ref(false);

const isUsingGravatar = computed(() => !isUsingCustomAvatar.value);

/**
 * Load current avatar on component mount
 */
onMounted(async () => {
    await loadAvatar();
});

const props = defineProps(
    {
        user: Object
    }
);

/**
 * Load user's current avatar
 */
async function loadAvatar() {
    try {
        const url = await getAvatarUrl();
        currentAvatarUrl.value = url;

        // Determine if using custom avatar or Gravatar
        // Custom avatars from R2 contain signed URL parameters
        isUsingCustomAvatar.value = url.includes('r2.cloudflarestorage.com');
    } catch (error) {
        console.error('Failed to load avatar:', error);
        errorMessage.value = 'Failed to load avatar';
    }
}

/**
 * Handle file selection from input
 */
async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    errorMessage.value = '';
    successMessage.value = '';

    try {
        // Validate file
        validateImageFile(file);

        // Verify user is authenticated
        if (!auth.currentUser) {
            throw new Error('Not authenticated');
        }



        isLoading.value = true;

        // Upload avatar
        const result = await uploadAvatar(file);

        currentAvatarUrl.value = result.avatarUrl;
        isUsingCustomAvatar.value = true;
        successMessage.value = '✅ Avatar updated successfully!';
        loadAvatar();

        // Clear input
        input.value = '';

        // Clear success message after 3 seconds
        setTimeout(() => {
            successMessage.value = '';
        }, 3000);
    } catch (error: any) {
        errorMessage.value = error.message || 'Failed to upload avatar';
        console.error('Upload error:', error);

        // Clear error after 5 seconds
        setTimeout(() => {
            errorMessage.value = '';
        }, 5000);
    } finally {
        isLoading.value = false;
    }
}

/**
 * Delete custom avatar and revert to Gravatar
 */
async function handleDeleteAvatar() {
    try {
        if (!confirm('Delete custom avatar and revert to Gravatar?')) {
            return;
        }

        errorMessage.value = '';
        successMessage.value = '';

        isLoading.value = true;

        const result = await deleteAvatar();

        currentAvatarUrl.value = result.avatarUrl;
        isUsingCustomAvatar.value = false;
        successMessage.value = '✅ Avatar deleted. Using Gravatar.';

        // Clear success message after 3 seconds
        setTimeout(() => {
            successMessage.value = '';
        }, 3000);
    } catch (error: any) {
        errorMessage.value = error.message || 'Failed to delete avatar';
        console.error('Delete error:', error);

        // Clear error after 5 seconds
        setTimeout(() => {
            errorMessage.value = '';
        }, 5000);
    } finally {
        isLoading.value = false;
    }
}

/**
 * Set avatar to Gravatar
 */
async function handleSetGravatar() {
    try {
        errorMessage.value = '';
        successMessage.value = '';

        isLoading.value = true;

        const result = await setGravatar();

        currentAvatarUrl.value = result.avatarUrl;
        isUsingCustomAvatar.value = false;
        successMessage.value = '✅ Using Gravatar.';

        // Clear success message after 3 seconds
        setTimeout(() => {
            successMessage.value = '';
        }, 3000);
    } catch (error: any) {
        errorMessage.value = error.message || 'Failed to set Gravatar';
        console.error('Gravatar error:', error);

        // Clear error after 5 seconds
        setTimeout(() => {
            errorMessage.value = '';
        }, 5000);
    } finally {
        isLoading.value = false;
    }
}

/**
 * Handle avatar image load error (fallback)
 */
function onAvatarLoadError(error: Event) {
    // If image fails to load, try to reload from API
    console.warn('Avatar image failed to load, reloading...', error);
    loadAvatar();
}
</script>