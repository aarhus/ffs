<template>
    <div class="avatar-manager">
        <!-- Display Current Avatar -->
        <div class="avatar-display">
            <img :src="currentAvatarUrl" :alt="userName" class="avatar-image" @error="onAvatarLoadError" />
        </div>

        <!-- Upload Options -->
        <div class="avatar-options">
            <!-- Upload Custom Avatar -->
            <div class="upload-section">
                <label for="avatar-input" class="btn-upload">
                    📸 Upload Photo
                </label>
                <input id="avatar-input" type="file" accept="image/*" style="display: none" @change="handleFileSelect"
                    :disabled="isLoading" aria-label="Upload avatar image" />
                <p class="help-text">JPG, PNG, WebP or GIF up to 5MB</p>
            </div>

            <!-- Use Gravatar -->
            <button v-if="!isUsingGravatar" @click="handleSetGravatar" :disabled="isLoading" class="btn-gravatar"
                aria-label="Use Gravatar as avatar">
                👤 Use Gravatar
            </button>

            <!-- Delete Custom Avatar -->
            <button v-if="isUsingCustomAvatar" @click="handleDeleteAvatar" :disabled="isLoading" class="btn-delete"
                aria-label="Delete custom avatar">
                🗑️ Delete Custom Avatar
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
            Updating avatar...
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message" role="alert">
            {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
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
    firebaseUid: string;
    userName: string;
    userEmail: string;
}

const props = defineProps<Props>();

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

/**
 * Load user's current avatar
 */
async function loadAvatar() {
    try {
        const url = await getAvatarUrl(props.firebaseUid);
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

        // Verify uploading own avatar
        if (auth.currentUser.uid !== props.firebaseUid) {
            throw new Error('Cannot upload avatar for another user');
        }

        isLoading.value = true;

        // Upload avatar
        const result = await uploadAvatar(props.firebaseUid, file);

        currentAvatarUrl.value = result.avatarUrl;
        isUsingCustomAvatar.value = true;
        successMessage.value = '✅ Avatar updated successfully!';

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

        const result = await deleteAvatar(props.firebaseUid);

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

        const result = await setGravatar(props.firebaseUid);

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
function onAvatarLoadError() {
    // If image fails to load, try to reload from API
    console.warn('Avatar image failed to load, reloading...');
    loadAvatar();
}
</script>

<style scoped>
.avatar-manager {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    background: linear-gradient(135deg, var(--color-background-soft) 0%, var(--color-background) 100%);
    border-radius: 12px;
    border: 1px solid var(--color-border);
}

.avatar-display {
    text-align: center;
}

.avatar-image {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease;
}

.avatar-image:hover {
    transform: scale(1.05);
}

.avatar-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.upload-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.btn-upload,
.btn-gravatar,
.btn-delete {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.btn-upload {
    display: inline-block;
    background: var(--color-primary);
    color: white;
    text-align: center;
}

.btn-upload:hover:not(:disabled) {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-gravatar {
    background: var(--color-secondary);
    color: white;
}

.btn-gravatar:hover:not(:disabled) {
    background: var(--color-secondary-dark);
    transform: translateY(-2px);
}

.btn-delete {
    background: var(--color-danger);
    color: white;
}

.btn-delete:hover:not(:disabled) {
    background: var(--color-danger-dark);
    transform: translateY(-2px);
}

.btn-upload:disabled,
.btn-gravatar:disabled,
.btn-delete:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.help-text {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
}

.loading,
.error-message,
.success-message {
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
}

.loading {
    background: var(--color-info-light);
    color: var(--color-info);
    animation: pulse 1.5s infinite;
}

.error-message {
    background: var(--color-danger-light);
    color: var(--color-danger);
    border-left: 4px solid var(--color-danger);
}

.success-message {
    background: var(--color-success-light);
    color: var(--color-success);
    border-left: 4px solid var(--color-success);
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {

    .avatar-image,
    .btn-upload,
    .btn-gravatar,
    .btn-delete,
    .loading {
        transition: none;
        animation: none;
    }
}

@media (max-width: 640px) {
    .avatar-manager {
        padding: 1rem;
        gap: 1rem;
    }

    .avatar-image {
        width: 120px;
        height: 120px;
    }

    .btn-upload,
    .btn-gravatar,
    .btn-delete {
        padding: 0.625rem 1rem;
        font-size: 0.95rem;
    }
}
</style>