/**
 * Avatar API Service
 * Frontend service for avatar operations
 */



/**
 * Get avatar URL for a user
 * Automatically resolves to R2 signed URL or Gravatar
 */
export async function getAvatarUrl(firebaseUid: string): Promise<string> {
    try {
        const response = await fetch(`/avatar/${firebaseUid}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch avatar: ${response.statusText}`);
        }

        const data = await response.json() as { avatarUrl: string };
        return data.avatarUrl;
    } catch (error) {
        console.error('Error getting avatar URL:', error);
        throw error;
    }
}

/**
 * Upload custom avatar image
 *
 * @param firebaseUid User's Firebase UID
 * @param imageFile Image file from file input
 * @returns Promise with { success: boolean, avatarUrl: string }
 */
export async function uploadAvatar(
    firebaseUid: string,
    imageFile: File
): Promise<{ success: boolean; avatarUrl: string }> {
    try {
        const token = await getAuthToken();

        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(
            `/avatar/${firebaseUid}/upload`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json() as any;
            throw new Error(error.error?.message || 'Upload failed');
        }

        const data = await response.json() as { success: boolean; avatarUrl: string };
        return {
            success: data.success,
            avatarUrl: data.avatarUrl,
        };
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
}

/**
 * Delete custom avatar (revert to Gravatar)
 *
 * @param firebaseUid User's Firebase UID
 * @returns Promise with { success: boolean, avatarUrl: string }
 */
export async function deleteAvatar(firebaseUid: string): Promise<{
    success: boolean;
    avatarUrl: string
}> {
    try {
        const token = await getAuthToken();

        const response = await fetch(
            `/avatar/${firebaseUid}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const error = await response.json() as any;
            throw new Error(error.error?.message || 'Delete failed');
        }

        const data = await response.json() as { success: boolean; avatarUrl: string };
        return {
            success: data.success,
            avatarUrl: data.avatarUrl,
        };
    } catch (error) {
        console.error('Error deleting avatar:', error);
        throw error;
    }
}

/**
 * Set avatar to Gravatar
 *
 * @param firebaseUid User's Firebase UID
 * @returns Promise with { success: boolean, avatarUrl: string }
 */
export async function setGravatar(firebaseUid: string): Promise<{
    success: boolean;
    avatarUrl: string
}> {
    try {
        const token = await getAuthToken();

        const response = await fetch(
            `/avatar/${firebaseUid}/gravatar`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const error = await response.json() as any;
            throw new Error(error.error?.message || 'Failed to set Gravatar');
        }

        const data = await response.json() as { success: boolean; avatarUrl: string };
        return {
            success: data.success,
            avatarUrl: data.avatarUrl,
        };
    } catch (error) {
        console.error('Error setting Gravatar:', error);
        throw error;
    }
}

/**
 * Validate image before upload
 *
 * @param file Image file
 * @returns true if valid, throws error if not
 */
export function validateImageFile(file: File): boolean {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('Image too large (max 5MB)');
    }

    // Check MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid image format. Allowed: JPEG, PNG, WebP, GIF');
    }

    return true;
}

/**
 * Get fresh auth token from Firebase
 */
async function getAuthToken(): Promise<string> {
    const { auth } = await import('@/services/firebase');
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
        throw new Error('Not authenticated');
    }

    return token;
}
