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
    notes: string | null;
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
export async function getCurrentUserFromAPI(): Promise<UserResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/auth/user/`, {
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

// ============================================================================
// ============================================================================
// EXERCISE LIBRARY API
// ============================================================================

export interface ExerciseLibraryResponse {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    muscle_groups: string[];
    equipment: string | null;
    video_url: string | null;
    instructions: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    default_measurement_type: string | null;
    measurement_categories: string | null; // JSON array string: '["WEIGHT"]', '["DISTANCE","TIME"]'
}

/**
 * Get all exercises from library
 */
export async function getExercises(params?: {
    category?: string;
    search?: string;
    include_inactive?: boolean;
}): Promise<ExerciseLibraryResponse[]> {
    const headers = await createHeaders(true);
    const searchParams = new URLSearchParams();

    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.include_inactive) searchParams.append('include_inactive', '1');

    const queryString = searchParams.toString();
    const url = `/api/exercises${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<ExerciseLibraryResponse[]>(response);
}

/**
 * Get single exercise by ID
 */
export async function getExercise(exerciseId: string): Promise<ExerciseLibraryResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<ExerciseLibraryResponse>(response);
}

/**
 * Create new exercise (ADMIN only)
 */
export async function createExercise(data: {
    name: string;
    description?: string;
    category?: string;
    muscle_groups?: string[];
    equipment?: string;
    video_url?: string;
    instructions?: string;
}): Promise<ExerciseLibraryResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/exercises`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    return handleResponse<ExerciseLibraryResponse>(response);
}

/**
 * Update exercise (ADMIN only)
 */
export async function updateExercise(
    exerciseId: string,
    data: Partial<ExerciseLibraryResponse>
): Promise<ExerciseLibraryResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
    });

    return handleResponse<ExerciseLibraryResponse>(response);
}

/**
 * Delete exercise (ADMIN only)
 */
export async function deleteExercise(exerciseId: string): Promise<{ success: boolean }> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'DELETE',
        headers,
    });

    return handleResponse<{ success: boolean }>(response);
}

// ============================================================================
// WORKOUTS API
// ============================================================================

export interface WorkoutComponentResponse {
    id: string;
    workout_id: string;
    exercise_id: string;
    exercise?: ExerciseLibraryResponse | null;
    order_index: number;
    sets: number;
    min_reps: number | null;
    max_reps: number | null;
    target_reps: number | null;
    measurement_type: 'REPS' | 'TIME' | 'DISTANCE' | 'WEIGHT' | null;
    measurement_value: number | null;
    measurement_unit: string | null;
    rest_seconds: number | null;
    notes: string | null;
    actual_sets: number | null;
    actual_reps: number[];
    actual_measurement: number[];
    completed: boolean;
    is_pr: boolean;
    created_at: string;
    updated_at: string;
}

export interface WorkoutResponse {
    id: string;
    user_id: string;
    trainer_id?: string | null;
    name: string;
    description?: string | null;
    date: string;
    exercises: any[]; // Legacy support
    components?: WorkoutComponentResponse[];
    duration_minutes?: number | null;
    intensity?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
    perceived_exertion?: number | null;
    notes?: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface WorkoutFilters {
    user_id?: string;
    date_from?: string;
    date_to?: string;
    completed?: boolean;
    page?: number;
    limit?: number;
}

/**
 * Get workouts with pagination and filters
 */
export async function getWorkouts(filters?: WorkoutFilters): Promise<PaginatedResponse<WorkoutResponse>> {
    const headers = await createHeaders(true);
    const params = new URLSearchParams();

    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.completed !== undefined) params.append('completed', filters.completed ? '1' : '0');
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/api/workouts${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<PaginatedResponse<WorkoutResponse>>(response);
}

/**
 * Get single workout by ID
 */
export async function getWorkout(workoutId: string): Promise<WorkoutResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<WorkoutResponse>(response);
}

/**
 * Create a new workout
 */
export async function createWorkout(data: {
    name: string;
    description?: string;
    date: string;
    exercises: any[];
    duration_minutes?: number;
    intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
    perceived_exertion?: number;
    notes?: string;
    completed?: boolean;
}): Promise<WorkoutResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/workouts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    return handleResponse<WorkoutResponse>(response);
}

/**
 * Update a workout
 */
export async function updateWorkout(
    workoutId: string,
    updates: Partial<Omit<WorkoutResponse, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<WorkoutResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
    });

    return handleResponse<WorkoutResponse>(response);
}

/**
 * Delete a workout
 */
export async function deleteWorkout(workoutId: string): Promise<{ success: boolean }> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
        headers,
    });

    return handleResponse<{ success: boolean }>(response);
}

// ============================================================================
// GOALS API
// ============================================================================

export interface GoalResponse {
    id: string;
    user_id: string;
    title: string;
    metric: 'kg' | 'reps' | 'cm' | 'mins' | '%';
    target: number;
    current: number;
    status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    due_date?: string | null;
    created_at: string;
    updated_at: string;
}

export interface GoalFilters {
    user_id?: string;
    status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    page?: number;
    limit?: number;
}

/**
 * Get goals with pagination and filters
 */
export async function getGoals(filters?: GoalFilters): Promise<PaginatedResponse<GoalResponse>> {
    const headers = await createHeaders(true);
    const params = new URLSearchParams();

    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/api/goals${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<PaginatedResponse<GoalResponse>>(response);
}

/**
 * Get single goal by ID
 */
export async function getGoal(goalId: string): Promise<GoalResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/goals/${goalId}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<GoalResponse>(response);
}

/**
 * Create a new goal
 */
export async function createGoal(data: {
    title: string;
    metric: 'kg' | 'reps' | 'cm' | 'mins' | '%';
    target: number;
    current?: number;
    status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
    due_date?: string;
}): Promise<GoalResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/goals/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    return handleResponse<GoalResponse>(response);
}

/**
 * Update a goal
 */
export async function updateGoal(
    goalId: string,
    updates: Partial<Pick<GoalResponse, 'title' | 'current' | 'status' | 'due_date'>>
): Promise<GoalResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
    });

    return handleResponse<GoalResponse>(response);
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<{ success: boolean }> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
        headers,
    });

    return handleResponse<{ success: boolean }>(response);
}

// ============================================================================
// NUTRITION API
// ============================================================================

export interface NutritionLogResponse {
    id: string;
    user_id: string;
    name: string;
    calories: number;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
    date: string;
    created_at: string;
}

export interface NutritionFilters {
    user_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}

/**
 * Get nutrition logs with pagination and filters
 */
export async function getNutritionLogs(filters?: NutritionFilters): Promise<PaginatedResponse<NutritionLogResponse>> {
    const headers = await createHeaders(true);
    const params = new URLSearchParams();

    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/api/nutrition${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<PaginatedResponse<NutritionLogResponse>>(response);
}

/**
 * Get single nutrition log by ID
 */
export async function getNutritionLog(logId: string): Promise<NutritionLogResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/nutrition/${logId}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<NutritionLogResponse>(response);
}

/**
 * Create a nutrition log
 */
export async function createNutritionLog(data: {
    name: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    date?: string;
}): Promise<NutritionLogResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/nutrition`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    return handleResponse<NutritionLogResponse>(response);
}

/**
 * Delete a nutrition log
 */
export async function deleteNutritionLog(logId: string): Promise<{ success: boolean }> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/nutrition/${logId}`, {
        method: 'DELETE',
        headers,
    });

    return handleResponse<{ success: boolean }>(response);
}

// ============================================================================
// MEASUREMENTS API
// ============================================================================

export interface MeasurementResponse {
    id: string;
    user_id: string;
    weight?: number | null;
    body_fat_percentage?: number | null;
    muscle_mass?: number | null;
    chest?: number | null;
    waist?: number | null;
    hips?: number | null;
    bicep_left?: number | null;
    bicep_right?: number | null;
    thigh_left?: number | null;
    thigh_right?: number | null;
    notes?: string | null;
    date: string;
    created_at: string;
}

export interface MeasurementFilters {
    user_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}

/**
 * Get measurements with pagination and filters
 */
export async function getMeasurements(filters?: MeasurementFilters): Promise<PaginatedResponse<MeasurementResponse>> {
    const headers = await createHeaders(true);
    const params = new URLSearchParams();

    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/api/measurements/${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<PaginatedResponse<MeasurementResponse>>(response);
}

/**
 * Get single measurement by ID
 */
export async function getMeasurement(measurementId: string): Promise<MeasurementResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/measurements/${measurementId}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<MeasurementResponse>(response);
}

/**
 * Create a measurement
 */
export async function createMeasurement(data: {
    weight?: number;
    body_fat_percentage?: number;
    muscle_mass?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    bicep_left?: number;
    bicep_right?: number;
    thigh_left?: number;
    thigh_right?: number;
    notes?: string;
    date?: string;
}): Promise<MeasurementResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/measurements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    return handleResponse<MeasurementResponse>(response);
}

/**
 * Delete a measurement
 */
export async function deleteMeasurement(measurementId: string): Promise<{ success: boolean }> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/measurements/${measurementId}`, {
        method: 'DELETE',
        headers,
    });

    return handleResponse<{ success: boolean }>(response);
}

// ============================================================================
// HABITS API
// ============================================================================

export interface HabitResponse {
    id: string;
    user_id: string;
    name: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    target: number;
    current: number;
    streak: number;
    unit: string;
    created_at: string;
    updated_at: string;
}

export interface HabitFilters {
    user_id?: string;
    page?: number;
    limit?: number;
}

/**
 * Get habits with pagination
 */
export async function getHabits(filters?: HabitFilters): Promise<PaginatedResponse<HabitResponse>> {
    const headers = await createHeaders(true);
    const params = new URLSearchParams();

    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `/api/habits${queryString ? '?' + queryString : ''}`;

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    return handleResponse<PaginatedResponse<HabitResponse>>(response);
}

/**
 * Get single habit by ID
 */
export async function getHabit(habitId: string): Promise<HabitResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/habits/${habitId}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<HabitResponse>(response);
}

/**
 * Create a habit
 */
export async function createHabit(data: {
    name: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    target: number;
    unit: string;
    current?: number;
    streak?: number;
}): Promise<HabitResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/habits`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });

    return handleResponse<HabitResponse>(response);
}

/**
 * Update a habit (typically for progress/streak updates)
 */
export async function updateHabit(
    habitId: string,
    updates: Partial<Pick<HabitResponse, 'name' | 'current' | 'streak' | 'target'>>
): Promise<HabitResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/habits/${habitId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
    });

    return handleResponse<HabitResponse>(response);
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<{ success: boolean }> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
        headers,
    });

    return handleResponse<{ success: boolean }>(response);
}

// ===================================
// INJURY API
// ===================================

export interface InjuryDefinitionResponse {
    id: number;
    name: string;
    category: string;
    description: string | null;
    affected_areas: string[];
    recommended_modifications: string[];
    is_active: boolean;
}

export interface UserInjuryResponse {
    id: number;
    user_id: number;
    injury_type: string;
    details: string | null;
    severity: 'MILD' | 'MODERATE' | 'SEVERE' | null;
    status: 'ACTIVE' | 'RECOVERING' | 'RESOLVED';
    date_reported: string;
    date_resolved: string | null;
}

/**
 * Get all injury definitions (templates)
 */
export async function getInjuryDefinitions(): Promise<InjuryDefinitionResponse[]> {
    const headers = await createHeaders(true);
    const response = await fetch('/api/injuries/definitions', {
        method: 'GET',
        headers,
    });

    return handleResponse<InjuryDefinitionResponse[]>(response);
}

/**
 * Get a user's injuries
 */
export async function getUserInjuries(userId: string | number): Promise<UserInjuryResponse[]> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/injuries/user/${userId}`, {
        method: 'GET',
        headers,
    });

    return handleResponse<UserInjuryResponse[]>(response);
}

/**
 * Create a new injury record
 */
export async function createInjury(injury: {
    user_id: number;
    injury_type: string;
    details?: string | null;
    severity?: 'MILD' | 'MODERATE' | 'SEVERE' | null;
    status?: 'ACTIVE' | 'RECOVERING' | 'RESOLVED';
    date_reported?: string;
}): Promise<UserInjuryResponse> {
    const headers = await createHeaders(true);
    const response = await fetch('/api/injuries', {
        method: 'POST',
        headers,
        body: JSON.stringify(injury),
    });

    return handleResponse<UserInjuryResponse>(response);
}

/**
 * Update an injury record
 */
export async function updateInjury(
    injuryId: number,
    updates: Partial<Pick<UserInjuryResponse, 'details' | 'severity' | 'status' | 'date_resolved'>>
): Promise<UserInjuryResponse> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/injuries/${injuryId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
    });

    return handleResponse<UserInjuryResponse>(response);
}

/**
 * Delete an injury record
 */
export async function deleteInjury(injuryId: number): Promise<{ success: boolean }> {
    const headers = await createHeaders(true);
    const response = await fetch(`/api/injuries/${injuryId}`, {
        method: 'DELETE',
        headers,
    });

    return handleResponse<{ success: boolean }>(response);
}
