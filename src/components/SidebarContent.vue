<template>
  <div>
    <div :class="['flex items-center space-x-2 mb-8', isCollapsed ? 'justify-center px-2' : 'px-4']">
      <DumbbellIcon class="w-8 h-8 text-primary flex-shrink-0" />
      <span :class="['text-xl font-bold', isCollapsed ? 'hidden' : '']">FFS App</span>
    </div>
    <nav class="flex-1 space-y-2 px-2">
      <NavItem v-for="item in navItems" :key="item.id" :item="item" :isActive="isActiveRoute(item)"
        :isCollapsed="isCollapsed" @click="navigateTo(item)" />
    </nav>
    <div class="mt-auto space-y-2 p-2 border-t border-border">
      <div class="flex items-center p-2 rounded-lg">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="currentUser.name"
          class="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
        <div v-else
          class="w-10 h-10 rounded-full flex-shrink-0 bg-primary/20 flex items-center justify-center text-primary font-semibold">
          {{ currentUser.name.charAt(0).toUpperCase() }}
        </div>
        <div :class="['ml-3 overflow-hidden', isCollapsed ? 'hidden' : '']">
          <p class="text-sm font-semibold truncate">{{ currentUser.name }}</p>
          <p class="text-xs text-muted-foreground capitalize">{{ currentUser.role.toLowerCase() }}</p>
        </div>
      </div>
      <NavItem :item="{ id: 'logout', label: 'Logout', icon: LogOut }" :isActive="false" :isCollapsed="isCollapsed"
        @click="handleLogout" />
      <div :class="['flex items-center', isCollapsed ? 'justify-center' : 'justify-end', 'pt-2']">
        <button @click="$emit('toggleTheme')" :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          class="p-2 border border-border rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-colors">
          <SunIcon v-if="isDarkMode" class="w-5 h-5" />
          <MoonIcon v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DumbbellIcon from '@/components/icons/DumbbellIcon.vue';
import LogOut from '@/components/icons/LogOut.vue';
import MoonIcon from '@/components/icons/MoonIcon.vue';
import SunIcon from '@/components/icons/SunIcon.vue';
import NavItem from '@/components/NavItem.vue';
import { getAvatarUrl } from '@/services/avatarApi';
import type { User } from '@/types';
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const props = defineProps<{
  isCollapsed: boolean;
  navItems: Array<{ id: string; label: string; icon: any; route: string }>;
  currentUser: User;
  isDarkMode: boolean;
}>();

const avatarUrl = ref<string>('');

/**
 * Load user's avatar
 */
const loadAvatar = async () => {
  if (!props.currentUser?.firebase_uid) return;

  try {
    const url = await getAvatarUrl();
    avatarUrl.value = url;
  } catch (error) {
    console.error('Failed to load avatar:', error);
    // Fallback to empty string - will show initials
    avatarUrl.value = '';
  }
};

onMounted(() => {
  loadAvatar();
});

// Watch for currentUser changes and reload avatar
watch(() => props.currentUser, () => {
  loadAvatar();
});

const emit = defineEmits<{
  logout: [];
  toggleTheme: [];
  navItemClick: [];
}>();

/**
 * Check if a nav item's route is currently active
 */
const isActiveRoute = (item: any) => {
  return route.path === item.route;
};

/**
 * Navigate to a route and close mobile menu
 */
const navigateTo = (item: any) => {
  router.push(item.route);
  emit('navItemClick');
};

/**
 * Handle logout
 */
const handleLogout = () => {
  emit('logout');
};
</script>