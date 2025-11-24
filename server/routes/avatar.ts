import { AutoRouter } from 'itty-router';
import {
    deleteAvatarFromR2,
    getGravatarUrl,
    resolveAvatarUrl,
    uploadAvatarToR2,
    validateAvatarImage,
} from '../helpers/avatarManager';
import { createError } from '../middleware/errorHandler';
import { UserModel } from '../models';

export const avatarRoutes = AutoRouter({ base: '/api/avatar' });

/**
 * GET /api/avatar/
 * Get user's avatar URL (with automatic Gravatar fallback)
 * Returns signed R2 URL if custom avatar exists, otherwise Gravatar URL
 */
avatarRoutes.get('/', async (request: any, env: Env) => {
    console.log(`Avatar Route: ${request.method} ${request.url}`);
    try {
        const firebaseUid = request.token.sub;

        console.log("Fetching avatar for UID:", firebaseUid, "Request user:", request.token);

        if (!request.user) {
            throw createError(404, 'User not found', 'USER_NOT_FOUND');
        }

        console.log("User found:", request.user);
        console.log("User avatar field:", request.user.avatar);
        // Resolve avatar: R2 signed URL → stored URL → Gravatar
        const avatarUrl = await resolveAvatarUrl(
            firebaseUid,
            request.user.avatar,
            env,
            request.user.email
        );

        console.log("Resolved avatar URL:", avatarUrl);

        return new Response(JSON.stringify({ avatarUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        if (error.status) {
            return new Response(JSON.stringify({ error: { code: error.code, message: error.message } }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ error: { code: 'AVATAR_ERROR', message: error.message } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});

/**
 * POST /api/avatar/:firebaseUid/upload
 * Upload custom avatar image to R2
 * Body: FormData with 'image' field containing image file
 *
 * Returns: { success: true, avatarUrl: string }
 */
avatarRoutes.post('/upload', async (request: any, env: Env) => {
    try {
        const firebaseUid = request.token.sub;

        console.log("Uploading avatar for UID:", firebaseUid, "Request user:", request.token);

        if (!request.user) {
            throw createError(404, 'User not found', 'USER_NOT_FOUND');
        }



        // Parse FormData
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            throw createError(400, 'Image file required', 'INVALID_REQUEST');
        }

        // Validate image
        validateAvatarImage(imageFile);



        // Delete old avatar if exists
        try {
            await deleteAvatarFromR2((env as any).PROFILE_PICS, firebaseUid);
        } catch (error) {
            console.log('No previous avatar to delete');
        }

        // Upload new avatar to R2
        const arrayBuffer = await imageFile.arrayBuffer();
        await uploadAvatarToR2(
            (env as any).PROFILE_PICS,
            firebaseUid,
            arrayBuffer,
            imageFile.type
        );

        // Generate signed URL for response
        const avatarUrl = await resolveAvatarUrl(
            firebaseUid,
            null, // Don't use stored URL, force R2
            env,
            request.user.email
        );

        const userModel = new UserModel(env.DB);
        // Update user record to indicate they have a custom avatar
        // (set avatar to a flag value or timestamp)
        await userModel.update(request.user.id, {
            avatar: 'r2_custom', // Flag indicating custom avatar in R2
            updated_at: new Date().toISOString(),
        });

        return new Response(JSON.stringify({
            success: true,
            avatarUrl,
            message: 'Avatar uploaded successfully',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        if (error.status) {
            return new Response(JSON.stringify({ error: { code: error.code, message: error.message } }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ error: { code: 'AVATAR_ERROR', message: error.message } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});

/**
 * DELETE /api/avatar/:firebaseUid
 * Delete custom avatar (reverts to Gravatar)
 *
 * Returns: { success: true, avatarUrl: string }
 */
avatarRoutes.delete('/:firebaseUid', async (request: any, env: Env) => {
    try {
        const { firebaseUid } = request.params as any;

        // Verify user is deleting their own avatar
        if (firebaseUid !== request.token?.sub) {
            throw createError(403, 'Cannot delete avatar for another user', 'FORBIDDEN');
        }

        if (!firebaseUid) {
            throw createError(400, 'Firebase UID required', 'INVALID_REQUEST');
        }

        const userModel = new UserModel(env.DB);
        const user = await userModel.getByFirebaseUid(firebaseUid);

        if (!user) {
            throw createError(404, 'User not found', 'USER_NOT_FOUND');
        }

        // Delete from R2
        await deleteAvatarFromR2((env as any).PROFILE_PICS, firebaseUid);

        // Update user record
        await userModel.update(user.id, {
            avatar: null,
            updated_at: new Date().toISOString(),
        });

        // Return Gravatar as fallback
        const gravatarUrl = getGravatarUrl(user.email);

        return new Response(JSON.stringify({
            success: true,
            avatarUrl: gravatarUrl,
            message: 'Avatar deleted. Using Gravatar fallback.',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        if (error.status) {
            return new Response(JSON.stringify({ error: { code: error.code, message: error.message } }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ error: { code: 'AVATAR_ERROR', message: error.message } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});

/**
 * POST /api/avatar/:firebaseUid/gravatar
 * Explicitly set user to use Gravatar as avatar
 *
 * Returns: { success: true, avatarUrl: string }
 */
avatarRoutes.post('/:firebaseUid/gravatar', async (request: any, env: Env) => {
    try {
        const { firebaseUid } = request.params as any;

        if (firebaseUid !== request.token?.sub) {
            throw createError(403, 'Cannot modify avatar for another user', 'FORBIDDEN');
        }

        if (!firebaseUid) {
            throw createError(400, 'Firebase UID required', 'INVALID_REQUEST');
        }

        const userModel = new UserModel(env.DB);
        const user = await userModel.getByFirebaseUid(firebaseUid);

        if (!user) {
            throw createError(404, 'User not found', 'USER_NOT_FOUND');
        }

        // Delete custom avatar if exists
        try {
            await deleteAvatarFromR2((env as any).PROFILE_PICS, firebaseUid);
        } catch (error) {
            console.log('No custom avatar to delete');
        }

        // Update user record
        await userModel.update(user.id, {
            avatar: null,
            updated_at: new Date().toISOString(),
        });

        const gravatarUrl = getGravatarUrl(user.email);

        return new Response(JSON.stringify({
            success: true,
            avatarUrl: gravatarUrl,
            message: 'Avatar set to Gravatar',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        if (error.status) {
            return new Response(JSON.stringify({ error: { code: error.code, message: error.message } }), {
                status: error.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        return new Response(JSON.stringify({ error: { code: 'AVATAR_ERROR', message: error.message } }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
