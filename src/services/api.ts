/**
 * API Service for Finlay Backend
 * Handles all HTTP requests to the Cloudflare Workers backend
 * All authenticated requests include Firebase ID token
 */

import { auth } from '@/services/firebase';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8787';

export interface RegisterRequest {
    firebaseUid: string;
    email: string;
    name: string;
    role?: 'TRAINER' | 'CLIENT' | 'ADMIN';
    avatar?: string | null;
}

export interface UserResponse {
    id: number;
    firebase_uid: string;
    email: string;
    name: string;
    role: 'TRAINER' | 'CLIENT' | 'ADMIN';
    avatar: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
    try {
        if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken(true);
            return token;
        }
    } catch (error) {
        console.error('Failed to get Firebase ID token:', error);
    }
    return null;
}

/**
 * Create headers for API requests
 * Includes Firebase ID token for authentication if user is logged in
 */
async function createHeaders(includeAuth: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = await getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}

/**
 * Handle API response and throw errors appropriately
 */
async function handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const error = data?.error || {
            code: 'UNKNOWN_ERROR',
            message: `HTTP ${response.status}`,
        };
        throw new Error(
            `[${error.code}] ${error.message || 'API request failed'}`
        );
    }

    return data;
}

/**
 * Register a new user after Firebase signup
 * @param firebaseUid - Firebase authentication UID
 * @param email - User email
 * @param name - User display name
 * @param role - User role (defaults to CLIENT)
 * @param avatar - Profile picture URL (optional)
 */
export async function registerUser(
    firebaseUid: string,
    email: string,
    name: string,
    role: 'TRAINER' | 'CLIENT' | 'ADMIN' = 'CLIENT',
    avatar?: string | null
): Promise<UserResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            firebaseUid,
            email,
            name,
            role,
            avatar: avatar || null,
        }),
    });

    return handleResponse<UserResponse>(response);
}

/**
 * Get user by Firebase UID
 * @param firebaseUid - Firebase authentication UID
 */
export async function getUserByFirebaseUid(firebaseUid: string): Promise<UserResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/auth/user/${firebaseUid}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<UserResponse>(response);
}

/**
 * Get user by ID
 * @param userId - Database user ID
 */
export async function getUserById(userId: number): Promise<UserResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<UserResponse>(response);
}

/**
 * Update user profile
 * @param userId - Database user ID
 * @param updates - Partial user object with fields to update
 */
export async function updateUser(
    userId: number,
    updates: Partial<Omit<UserResponse, 'id' | 'firebase_uid' | 'email' | 'created_at'>>
): Promise<UserResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
    });

    return handleResponse<UserResponse>(response);
}

/**
 * Delete user account
 * @param userId - Database user ID
 */
export async function deleteUser(userId: number): Promise<{ success: boolean }> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers,
    });

    return handleResponse<{ success: boolean }>(response);
}

/**
 * Store FCM notification token
 * @param userId - Database user ID
 * @param token - FCM token
 * @param deviceName - Device identifier (optional)
 */
export async function storeFCMToken(
    userId: number,
    token: string,
    deviceName?: string
): Promise<any> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/notifications/tokens`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            userId,
            token,
            deviceName: deviceName || `${navigator.userAgent.split(' ').pop()}`,
        }),
    });

    return handleResponse<any>(response);
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`/health`, {
        method: 'GET',
    });

    return handleResponse<{ status: string }>(response);
}
