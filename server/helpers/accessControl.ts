/**
 * Access Control Helper
 * Validates trainer-client relationships for data access
 */

/**
 * Check if a trainer can access a client's data
 * Trainers can only view data for clients they have an ACTIVE relationship with
 *
 * @param trainerId - Trainer's user ID
 * @param clientId - Client's user ID
 * @param db - D1 database instance
 * @returns true if trainer has access, false otherwise
 */
export async function canAccessClientData(
    trainerId: string,
    clientId: string,
    db: D1Database
): Promise<boolean> {
    try {
        const result = await db
            .prepare(
                `SELECT id FROM trainer_clients
                 WHERE trainer_id = ? AND client_id = ? AND status = 'ACTIVE'
                 LIMIT 1`
            )
            .bind(trainerId, clientId)
            .first();

        return result !== null;
    } catch (error) {
        console.error('Error checking trainer-client access:', error);
        return false;
    }
}

/**
 * Check if requesting user can access target user's data
 * - Users can always access their own data
 * - Trainers can access their assigned clients' data
 *
 * @param requestingUserId - User making the request (from JWT)
 * @param requestingUserRole - Role of requesting user
 * @param targetUserId - User whose data is being accessed
 * @param db - D1 database instance
 * @returns true if access allowed, false otherwise
 */
export async function canAccessUserData(
    requestingUserId: string,
    requestingUserRole: string,
    targetUserId: string,
    db: D1Database
): Promise<boolean> {
    // Users can always access their own data
    if (requestingUserId === targetUserId) {
        return true;
    }

    // Trainers can access their assigned clients' data
    if (requestingUserRole === 'TRAINER') {
        return await canAccessClientData(requestingUserId, targetUserId, db);
    }

    // Clients cannot access other users' data
    return false;
}

/**
 * Get list of client IDs for a trainer
 * Only returns ACTIVE relationships
 *
 * @param trainerId - Trainer's user ID
 * @param db - D1 database instance
 * @returns Array of client user IDs
 */
export async function getTrainerClientIds(
    trainerId: string,
    db: D1Database
): Promise<string[]> {
    try {
        const results = await db
            .prepare(
                `SELECT client_id FROM trainer_clients
                 WHERE trainer_id = ? AND status = 'ACTIVE'`
            )
            .bind(trainerId)
            .all();

        return results.results?.map((row: any) => row.client_id) || [];
    } catch (error) {
        console.error('Error getting trainer clients:', error);
        return [];
    }
}
