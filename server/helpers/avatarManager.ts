/**
 * Avatar Management Service
 * Handles avatar operations: Gravatar fallback, R2 storage, and signed URL generation
 */

import crypto from 'crypto';

/**
 * Get Gravatar URL for a user email
 * Gravatar serves as default when user has no custom avatar
 *
 * @param email User email address
 * @param size Avatar size in pixels (default 200)
 * @returns Gravatar URL
 */
export function getGravatarUrl(email: string, size: number = 200): string {
    // MD5 hash of lowercase, trimmed email
    const hash = crypto
        .createHash('md5')
        .update(email.toLowerCase().trim())
        .digest('hex');

    // Gravatar URL with d=identicon for default avatar if email not found
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

/**
 * Get R2 storage path for user avatar
 * Shards files by first 6 characters of Firebase UID for better distribution
 *
 * @param firebaseUid User's Firebase UID
 * @returns R2 storage path (e.g., "abc123/abcdef1234567890.jpg")
 */
export function getR2AvatarPath(firebaseUid: string): string {
    const shardDir = firebaseUid.substring(0, 6);
    return `${shardDir}/${firebaseUid}`;
}

/**
 * Generate a 7-day signed URL for R2 object
 *
 * @param bucket R2 Bucket object from Cloudflare binding
 * @param firebaseUid User's Firebase UID
 * @returns Signed URL valid for 7 days
 */
export async function generateSignedAvatarUrl(
    bucket: any,
    firebaseUid: string
): Promise<string> {
    try {
        const path = getR2AvatarPath(firebaseUid);

        // Generate signed URL valid for 7 days (604800 seconds)
        const signedUrl = await bucket.createSignedUrl(path, {
            expirationTtl: 604800, // 7 days in seconds
        });

        return signedUrl;
    } catch (error) {
        console.error('Failed to generate signed avatar URL:', error);
        throw new Error('Failed to generate signed avatar URL');
    }
}

/**
 * Upload avatar image to R2
 *
 * @param bucket R2 Bucket object from Cloudflare binding
 * @param firebaseUid User's Firebase UID
 * @param imageData Image file data (ArrayBuffer or Blob)
 * @param contentType MIME type (e.g., 'image/jpeg', 'image/png')
 * @returns R2 object key
 */
export async function uploadAvatarToR2(
    bucket: any,
    firebaseUid: string,
    imageData: ArrayBuffer | Blob,
    contentType: string = 'image/jpeg'
): Promise<string> {
    try {
        const path = getR2AvatarPath(firebaseUid);

        // Upload to R2
        await bucket.put(path, imageData, {
            httpMetadata: {
                contentType,
                cacheControl: 'public, max-age=2592000', // 30 days
            },
            customMetadata: {
                uploadedAt: new Date().toISOString(),
                firebaseUid,
            },
        });

        console.log(`Avatar uploaded to R2: ${path}`);
        return path;
    } catch (error) {
        console.error('Failed to upload avatar to R2:', error);
        throw new Error('Failed to upload avatar to R2');
    }
}

/**
 * Delete avatar from R2
 *
 * @param bucket R2 Bucket object from Cloudflare binding
 * @param firebaseUid User's Firebase UID
 */
export async function deleteAvatarFromR2(
    bucket: any,
    firebaseUid: string
): Promise<void> {
    try {
        const path = getR2AvatarPath(firebaseUid);
        await bucket.delete(path);
        console.log(`Avatar deleted from R2: ${path}`);
    } catch (error) {
        console.error('Failed to delete avatar from R2:', error);
        // Don't throw - if file doesn't exist, that's fine
    }
}

/**
 * Resolve avatar URL for a user
 * Priority:
 * 1. Custom avatar in R2 (signed URL)
 * 2. Avatar URL stored in database
 * 3. Gravatar fallback
 *
 * @param firebaseUid User's Firebase UID
 * @param storedAvatarUrl Avatar URL from database
 * @param bucket R2 Bucket object from Cloudflare binding (optional)
 * @param email User email for Gravatar fallback
 * @returns Avatar URL to display
 */
export async function resolveAvatarUrl(
    firebaseUid: string,
    storedAvatarUrl: string | null | undefined,
    bucket: any,
    email: string
): Promise<string> {
    try {
        // If user has custom avatar in R2, generate signed URL
        if (bucket) {
            try {
                const signedUrl = await generateSignedAvatarUrl(bucket, firebaseUid);
                if (signedUrl) {
                    return signedUrl;
                }
            } catch (error) {
                console.log('No custom avatar in R2, falling back');
            }
        }

        // If stored avatar URL exists, return it
        if (storedAvatarUrl) {
            return storedAvatarUrl;
        }

        // Default to Gravatar
        return getGravatarUrl(email);
    } catch (error) {
        console.error('Error resolving avatar URL:', error);
        // Fallback to Gravatar if anything fails
        return getGravatarUrl(email);
    }
}

/**
 * Validate image file before upload
 *
 * @param file File object or Blob
 * @returns true if valid, throws error if not
 */
export function validateAvatarImage(file: Blob): boolean {
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
