<template>
  <div class="min-h-screen font-sans text-foreground">
    <!-- Mobile Sidebar -->
    <aside v-if="isAuthenticated && currentUser" :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex-col flex p-2 transition-transform duration-300 ease-in-out md:hidden',
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <SidebarContent :isCollapsed="false" :navItems="navItems" :currentUser="currentUser!" :isDarkMode="isDarkMode"
        @logout="handleLogout" @toggleTheme="toggleTheme" @navItemClick="isMobileMenuOpen = false" />
    </aside>
    <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-black/50 z-40 md:hidden" />

    <!-- Desktop Sidebar -->
    <aside v-if="isAuthenticated && currentUser" :class="[
      'hidden md:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-border bg-card p-2 transition-[width] duration-300',
      isSidebarCollapsed ? 'w-20' : 'w-64'
    ]">
      <SidebarContent :isCollapsed="isSidebarCollapsed" :navItems="navItems" :currentUser="currentUser!"
        :isDarkMode="isDarkMode" @logout="handleLogout" @toggleTheme="toggleTheme" />
      <div class="mt-2 border-t border-border pt-2">
        <button @click="isSidebarCollapsed = !isSidebarCollapsed"
          class="w-full flex items-center space-x-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground justify-center px-2">
          <ChevronsLeft :class="['w-5 h-5 transition-transform', isSidebarCollapsed ? 'rotate-180' : '']" />
          <span :class="isSidebarCollapsed ? 'sr-only' : 'inline'">Collapse</span>
        </button>
      </div>
    </aside>

    <div :class="[
      'flex flex-col min-h-screen transition-[padding-left] duration-300',
      (isAuthenticated && currentUser && isSidebarCollapsed) ? 'md:pl-20' : (isAuthenticated && currentUser) ? 'md:pl-64' : ''
    ]">
      <!-- Mobile Header -->
      <header v-if="isAuthenticated && currentUser"
        class="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 md:hidden">
        <button @click="isMobileMenuOpen = true" class="p-2 -ml-2 text-muted-foreground">
          <MenuIcon class="h-6 w-6" />
        </button>
        <div class="flex items-center space-x-2">
          <DumbbellIcon class="w-6 h-6 text-primary" />
          <span class="text-lg font-bold">FFS App</span>
        </div>
        <div class="w-6"></div>
      </header>

      <main class="flex-1">
        <!-- Router provides the page content based on current route -->
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { auth } from '@/services/firebase';
import { useUserStore } from '@/stores/user';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

// Icons
import AppleIcon from '@/components/icons/AppleIcon.vue';
import CalendarIcon from '@/components/icons/CalendarIcon.vue';
import ChevronsLeft from '@/components/icons/ChevronsLeft.vue';
import ClipboardListIcon from '@/components/icons/ClipboardListIcon.vue';
import DumbbellIcon from '@/components/icons/DumbbellIcon.vue';
import HomeIcon from '@/components/icons/HomeIcon.vue';
import LayoutDashboardIcon from '@/components/icons/LayoutDashboardIcon.vue';
import MenuIcon from '@/components/icons/MenuIcon.vue';
import MessageSquareIcon from '@/components/icons/MessageSquareIcon.vue';
import ShieldIcon from '@/components/icons/ShieldIcon.vue';
import TargetIcon from '@/components/icons/TargetIcon.vue';
import TrendingUpIcon from '@/components/icons/TrendingUpIcon.vue';
import UserIcon from '@/components/icons/UserIcon.vue';
import UsersIcon from '@/components/icons/UsersIcon.vue';

// Components
import SidebarContent from '@/components/SidebarContent.vue';

// Store & Router
const userStore = useUserStore();
const router = useRouter();

// State
const isDarkMode = ref(false);
const isSidebarCollapsed = ref(false);
const isMobileMenuOpen = ref(false);

// Computed
const isAuthenticated = computed(() => userStore.isAuthenticated);
const currentUser = computed(() => userStore.currentUser);

/**
 * Navigation items based on user role
 */
const clientNavItems = computed(() => [
  { id: 'home', label: 'Home', icon: HomeIcon, route: '/home' },
  { id: 'coaching', label: '1:1 Coaching', icon: MessageSquareIcon, route: '/coaching' },
  { id: 'circuit', label: 'Circuit Group', icon: UsersIcon, route: '/circuit' },
  { id: 'training', label: 'Training', icon: DumbbellIcon, route: '/training' },
  { id: 'nutrition', label: 'Nutrition', icon: AppleIcon, route: '/nutrition' },
  { id: 'goals', label: 'Goals', icon: TargetIcon, route: '/goals' },
  { id: 'schedule', label: 'Schedule', icon: CalendarIcon, route: '/schedule' },
  { id: 'progress', label: 'Progress', icon: TrendingUpIcon, route: '/progress' },
  { id: 'profile', label: 'Profile', icon: UserIcon, route: '/profile' },
]);

const trainerNavItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, route: '/dashboard' },
  { id: 'messages', label: 'Messages', icon: MessageSquareIcon, route: '/messages' },
  { id: 'training', label: 'Client Logs', icon: ClipboardListIcon, route: '/client-logs' },
  { id: 'schedule', label: 'Schedule', icon: CalendarIcon, route: '/schedule' },
  { id: 'admin', label: 'Admin', icon: ShieldIcon, route: '/admin' },
]);

const navItems = computed(() =>
  currentUser.value?.role === 'CLIENT' ? clientNavItems.value : trainerNavItems.value
);

// Watch dark mode preference
watch(isDarkMode, (newVal) => {
  if (newVal) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});

// Initialize Firebase auth state on mount
onMounted(() => {
  // Set up a one-time listener to restore session on app load
  const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser && !userStore.isAuthenticated) {
      // Check if email is verified before allowing login
      if (!firebaseUser.emailVerified) {
        console.log('User email not verified, signing out:', firebaseUser.email);

        userStore.logout();
        return;
      }

      // User has a Firebase session but not yet in Pinia store
      // Fetch user data from backend

      console.log('Firebase user detected, fetching user data:', firebaseUser);
      try {
        await userStore.fetchUserByFirebaseUid(firebaseUser.uid);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    } else if (!firebaseUser && userStore.isAuthenticated) {
      // Firebase session ended, logout from Pinia
      userStore.logout();
    }
  });

  // Keep the subscription active for the lifetime of the app
  // Return cleanup function (though App.vue typically stays mounted)
  return () => unsubscribe();
});

// Event handlers
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value;
};

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>