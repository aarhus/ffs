import { useUserStore } from '@/stores/user';
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// Lazy-loaded page components
const LoginPage = () => import('@/components/LoginPage.vue');
const ClientHome = () => import('@/components/ClientHome.vue');
const ChatView = () => import('@/components/ChatView.vue');
const CircuitGroup = () => import('@/components/CircuitGroup.vue');
const TrainingLog = () => import('@/components/TrainingLog.vue');
const NutritionLog = () => import('@/components/NutritionLog.vue');
const Goals = () => import('@/components/Goals.vue');
const Schedule = () => import('@/components/Schedule.vue');
const Progress = () => import('@/components/Progress.vue');
const AddWorkout = () => import('@/components/AddWorkout.vue');
const ProfilePage = () => import('@/components/ProfilePage.vue');
const TrainerDashboard = () => import('@/components/TrainerDashboard.vue');
const TrainerMessages = () => import('@/components/TrainerMessages.vue');
const TrainerClientLogs = () => import('@/components/TrainerClientLogs.vue');
const AdminPage = () => import('@/components/AdminPage.vue');

/**
 * Route metadata configuration
 * Allows us to specify auth requirements and role restrictions per route
 */
declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean;
        roles?: Array<string>;
        title?: string;
    }
}

/**
 * Shared routes for authenticated users
 */
const sharedRoutes: RouteRecordRaw[] = [
    {
        path: '/schedule',
        component: Schedule,
        meta: {
            requiresAuth: true,
            title: 'Schedule',
        },
    },
];

/**
 * Client-specific routes
 */
const clientRoutes: RouteRecordRaw[] = [
    {
        path: '/home',
        component: ClientHome,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: 'Home',
        },
    },
    {
        path: '/coaching',
        component: ChatView,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: '1:1 Coaching',
        },
    },
    {
        path: '/circuit',
        component: CircuitGroup,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: 'Circuit Group',
        },
    },
    {
        path: '/training',
        component: TrainingLog,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: 'Training',
        },
    },
    {
        path: '/nutrition',
        component: NutritionLog,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: 'Nutrition',
        },
    },
    {
        path: '/goals',
        component: Goals,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: 'Goals',
        },
    },
    {
        path: '/progress',
        component: Progress,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: 'Progress',
        },
    },
    {
        path: '/add-workout',
        component: AddWorkout,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: 'Add Workout',
        },
    },
    {
        path: '/profile',
        component: ProfilePage,
        meta: {
            requiresAuth: true,
            roles: ['CLIENT'],
            title: 'Profile',
        },
    },
];

/**
 * Trainer-specific routes
 */
const trainerRoutes: RouteRecordRaw[] = [
    {
        path: '/dashboard',
        component: TrainerDashboard,
        meta: {
            requiresAuth: true,
            roles: ['TRAINER'],
            title: 'Dashboard',
        },
    },
    {
        path: '/messages',
        component: TrainerMessages,
        meta: {
            requiresAuth: true,
            roles: ['TRAINER'],
            title: 'Messages',
        },
    },
    {
        path: '/client-logs',
        component: TrainerClientLogs,
        meta: {
            requiresAuth: true,
            roles: ['TRAINER'],
            title: 'Client Logs',
        },
    },
    {
        path: '/admin',
        component: AdminPage,
        meta: {
            requiresAuth: true,
            roles: ['TRAINER', 'ADMIN'],
            title: 'Admin',
        },
    },
];

/**
 * All routes
 */
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: () => {
            const userStore = useUserStore();
            if (!userStore.isAuthenticated || !userStore.currentUser) {
                return '/login';
            }
            return userStore.currentUser.role === 'CLIENT' ? '/home' : '/dashboard';
        },
    },
    {
        path: '/login',
        component: LoginPage,
        meta: {
            requiresAuth: false,
            title: 'Login',
        },
    },
    ...clientRoutes,
    ...sharedRoutes,
    ...trainerRoutes,
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
];

/**
 * Create router instance
 */
const router = createRouter({
    history: createWebHistory('/'),
    routes,
});

/**
 * Navigation guard to check authentication and authorization
 */
router.beforeEach((to, _from, next) => {
    const userStore = useUserStore();

    // Check if route requires authentication
    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
        // Redirect to login if not authenticated
        if (to.path !== '/login') {
            next('/login');
            return;
        }
    }

    // Check if user has required role - only if user data is loaded
    if (to.meta.requiresAuth && to.meta.roles && to.meta.roles.length > 0 && userStore.currentUser) {
        if (!(to.meta.roles as Array<string>).includes(userStore.currentUser.role)) {
            // Redirect to appropriate home page if user doesn't have required role
            const homeRoute = userStore.currentUser.role === 'CLIENT' ? '/home' : '/dashboard';
            if (to.path !== homeRoute) {
                next(homeRoute);
                return;
            }
        }
    }

    // Redirect authenticated users away from login page to their home
    if (to.path === '/login' && userStore.isAuthenticated && userStore.currentUser) {
        const homeRoute = userStore.currentUser.role === 'CLIENT' ? '/home' : '/dashboard';
        next(homeRoute);
        return;
    }

    // Allow navigation
    next();
});

/**
 * Update page title based on route meta
 */
router.afterEach((to) => {
    document.title = `${to.meta.title ? `${to.meta.title} - ` : ''}FFS App`;
});

export default router;
