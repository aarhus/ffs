/**
 * Router Testing Utilities
 *
 * Helper functions for testing routing behavior
 * Used to verify deep linking and auth flow
 */

import { useUserStore } from '@/stores/user';
import { useRoute, useRouter } from 'vue-router';

/**
 * Test helper: Navigate to a route and verify it loads
 * @param path - Route path to test
 */
export function testNavigateTo(path: string) {
    const router = useRouter();
    return router.push(path);
}

/**
 * Test helper: Get current route information
 */
export function getCurrentRouteInfo() {
    const route = useRoute();
    return {
        path: route.path,
        name: route.name,
        meta: route.meta,
        params: route.params,
        query: route.query,
    };
}

/**
 * Test helper: Check if current route requires auth
 */
export function doesCurrentRouteRequireAuth(): boolean {
    const route = useRoute();
    return route.meta.requiresAuth ? true : false;
}

/**
 * Test helper: Get allowed roles for current route
 */
export function getAllowedRolesForCurrentRoute(): string[] {
    const route = useRoute();
    return (route.meta.roles as Array<string>) || [];
}

/**
 * Test helper: Check if user has access to current route
 */
export function doesUserHaveAccessToCurrentRoute(): boolean {
    const route = useRoute();
    const userStore = useUserStore();

    if (!route.meta.requiresAuth) {
        return true;
    }

    if (!userStore.isAuthenticated) {
        return false;
    }

    if (route.meta.roles && route.meta.roles.length > 0) {
        return (route.meta.roles as Array<string>).includes(userStore.currentUser?.role || '');
    }

    return true;
}

/**
 * Test helper: Simulate logging out and verify redirect
 */
export async function testLogout() {
    const router = useRouter();
    const userStore = useUserStore();

    userStore.logout();
    await router.push('/login');

    return {
        isAuthenticated: userStore.isAuthenticated,
        currentPath: router.currentRoute.value.path,
    };
}

/**
 * Test helper: Verify deep linking to a route
 */
export async function testDeepLink(path: string) {
    const router = useRouter();
    await router.push(path);

    return {
        currentPath: router.currentRoute.value.path,
        matchedPath: path,
        isCorrect: router.currentRoute.value.path === path,
    };
}

/**
 * Test helper: Check browser history
 * (Note: Actual history testing requires e2e tests)
 */
export function getRouterHistory() {
    const router = useRouter();
    return {
        back: () => router.back(),
        forward: () => router.forward(),
    };
}
