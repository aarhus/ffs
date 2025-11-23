import { getUserByFirebaseUid, registerUser } from '@/services/api';
import type { User } from '@/types';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    // State
    const currentUser = ref<User | null>(null);
    const isAuthenticated = ref(false);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Computed
    const isClient = computed(() => currentUser.value?.role === 'CLIENT');
    const isTrainer = computed(() => currentUser.value?.role === 'TRAINER');
    const isAdmin = computed(() => currentUser.value?.role === 'ADMIN');
    const userId = computed(() => currentUser.value?.id);
    const userEmail = computed(() => currentUser.value?.email);
    const userName = computed(() => currentUser.value?.name);
    const userRole = computed(() => currentUser.value?.role);

    // Actions
    const login = (user: User) => {
        currentUser.value = user;
        isAuthenticated.value = true;
        error.value = null;
    };

    const logout = () => {
        currentUser.value = null;
        isAuthenticated.value = false;
        error.value = null;
    };

    const fetchUserByFirebaseUid = async (firebaseUid: string): Promise<User | null> => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await getUserByFirebaseUid(firebaseUid);
            // Convert backend response to frontend User type
            const user: User = {
                id: response.id,
                firebase_uid: response.firebase_uid,
                email: response.email,
                name: response.name,
                role: response.role as any,
                avatar: response.avatar,
                created_at: response.created_at,
                updated_at: response.updated_at,
            };
            currentUser.value = user;
            isAuthenticated.value = true;
            return user;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const registerAndLogin = async (
        firebaseUid: string,
        email: string,
        name: string,
        role: 'TRAINER' | 'CLIENT' | 'ADMIN' = 'CLIENT',
        avatar?: string | null
    ): Promise<User | null> => {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await registerUser(firebaseUid, email, name, role, avatar);
            // Convert backend response to frontend User type
            const user: User = {
                id: response.id,
                firebase_uid: response.firebase_uid,
                email: response.email,
                name: response.name,
                role: response.role as any,
                avatar: response.avatar,
                created_at: response.created_at,
                updated_at: response.updated_at,
            };
            currentUser.value = user;
            isAuthenticated.value = true;
            return user;
        } catch (err: any) {
            error.value = err.message;
            return null;
        } finally {
            isLoading.value = false;
        }
    };

    const updateProfile = (updates: Partial<User>) => {
        if (currentUser.value) {
            currentUser.value = { ...currentUser.value, ...updates };
        }
    };

    const clearError = () => {
        error.value = null;
    };

    return {
        // State
        currentUser,
        isAuthenticated,
        isLoading,
        error,

        // Computed
        isClient,
        isTrainer,
        isAdmin,
        userId,
        userEmail,
        userName,
        userRole,

        // Actions
        login,
        logout,
        fetchUserByFirebaseUid,
        registerAndLogin,
        updateProfile,
        clearError,
    };
});
