<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
    <Card class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <DumbbellIcon class="w-12 h-12 text-primary" />
        </div>
        <h1 class="text-3xl font-bold">FFS App</h1>
        <p class="text-muted-foreground mt-2">Your personal fitness companion</p>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage"
        class="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
        {{ errorMessage }}
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="mb-4 p-3 bg-success/10 border border-success rounded-lg text-success text-sm">
        {{ successMessage }}
      </div>

      <!-- Login Form -->
      <form v-if="!isSignupMode" @submit.prevent="handleLogin" class="space-y-4">
        <h2 class="text-lg font-semibold text-center mb-4">Login</h2>

        <!-- Email Field -->
        <div>
          <label for="login-email" class="block text-sm font-semibold mb-2">Email</label>
          <input id="login-email" v-model="email" type="email" placeholder="you@example.com" required
            class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        </div>

        <!-- Password Field -->
        <div>
          <label for="login-password" class="block text-sm font-semibold mb-2">Password</label>
          <input id="login-password" v-model="password" type="password" placeholder="••••••••" required
            class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        </div>

        <!-- Remember me checkbox -->
        <div class="flex items-center">
          <input id="remember" v-model="rememberMe" type="checkbox"
            class="w-4 h-4 rounded border-border accent-primary" />
          <label for="remember" class="ml-2 text-sm text-muted-foreground cursor-pointer">Remember me</label>
        </div>

        <!-- Login Button -->
        <button type="submit" :disabled="isLoading || !email || !password"
          class="w-full px-4 py-2.5 bg-primary text-primary-foreground border border-primary rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Signup Form -->
      <form v-else @submit.prevent="handleSignup" class="space-y-4">
        <h2 class="text-lg font-semibold text-center mb-4">Create Account</h2>

        <!-- Email Field -->
        <div>
          <label for="signup-email" class="block text-sm font-semibold mb-2">Email</label>
          <input id="signup-email" v-model="signupEmail" type="email" placeholder="you@example.com" required
            class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        </div>

        <!-- Password Field -->
        <div>
          <label for="signup-password" class="block text-sm font-semibold mb-2">Password</label>
          <input id="signup-password" v-model="signupPassword" type="password" placeholder="••••••••" required
            class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
          <p class="text-xs text-muted-foreground mt-1">At least 6 characters</p>
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label for="signup-confirm" class="block text-sm font-semibold mb-2">Confirm Password</label>
          <input id="signup-confirm" v-model="signupConfirmPassword" type="password" placeholder="••••••••" required
            class="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        </div>

        <!-- Signup Button -->
        <button type="submit" :disabled="isLoading || !signupEmail || !signupPassword || !signupConfirmPassword"
          class="w-full px-4 py-2.5 bg-primary text-primary-foreground border border-primary rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors">
          {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-card text-muted-foreground">or</span>
        </div>
      </div>

      <!-- Google Login Button -->
      <button @click="handleGoogleLogin" :disabled="isLoading"
        class="w-full px-4 py-2.5 bg-white text-foreground border border-border rounded-lg font-semibold hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors flex items-center justify-center gap-2">
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {{ isLoading ? 'Signing in...' : 'Sign in with Google' }}
      </button>

      <!-- Toggle between login and signup -->
      <div class="text-center mt-6">
        <p class="text-sm text-muted-foreground">
          <span v-if="!isSignupMode">Don't have an account?</span>
          <span v-else>Already have an account?</span>
          <button @click="toggleMode" type="button"
            class="ml-1 text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded">
            <span v-if="!isSignupMode">Sign up</span>
            <span v-else>Login</span>
          </button>
        </p>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/common/Card.vue';
import DumbbellIcon from '@/components/icons/DumbbellIcon.vue';
import { getUserByFirebaseUid, registerUser } from '@/services/api';
import { auth, requestNotificationPermission, signInWithGoogle, signUpWithEmail, storeFCMToken } from '@/services/firebase';
import { useUserStore } from '@/stores/user';
import type { User } from '@/types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

// Check if already logged in and redirect
const checkAuthAndRedirect = () => {
  if (userStore.isAuthenticated && userStore.currentUser) {
    const homeRoute = userStore.currentUser.role === 'TRAINER' ? '/dashboard' : '/home';
    router.replace(homeRoute);
  }
};

// Check on mount
onMounted(() => {
  checkAuthAndRedirect();
});

// Watch for auth changes and redirect if user logs in
watch(() => userStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    checkAuthAndRedirect();
  }
});

// Form state
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const isSignupMode = ref(false);

// Signup form state
const signupEmail = ref('');
const signupPassword = ref('');
const signupConfirmPassword = ref('');

// Toggle between login and signup modes
const toggleMode = () => {
  isSignupMode.value = !isSignupMode.value;
  errorMessage.value = '';
  successMessage.value = '';
  email.value = '';
  password.value = '';
  signupEmail.value = '';
  signupPassword.value = '';
  signupConfirmPassword.value = '';
};

// Setup notifications and user after authentication
const setupUserAfterAuth = async (firebaseUser: any, appUser: User) => {
  try {
    // Request notification permissions and get FCM token
    const fcmToken = await requestNotificationPermission();
    if (fcmToken && appUser.id) {
      // Store FCM token in local storage
      await storeFCMToken(firebaseUser.uid, fcmToken);
      console.log('Notifications set up for user:', appUser.id);
    }
  } catch (notificationError) {
    console.warn('Failed to set up notifications:', notificationError);
  }

  // Store user in Pinia store
  userStore.login(appUser);

  // Navigate to appropriate home page based on user role
  const homeRoute = appUser.role === 'TRAINER' ? '/dashboard' : '/home';
  router.push(homeRoute);
};

// Handle login form submission
const handleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  // Validate inputs
  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Please enter email and password';
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address';
    return;
  }

  isLoading.value = true;

  try {
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const firebaseUser = userCredential.user;

    // Fetch user from backend using Firebase UID
    console.log('Fetching user by Firebase UID:', firebaseUser.uid);
    const appUser = await getUserByFirebaseUid(firebaseUser.uid);

    if (rememberMe.value) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('lastEmail', email.value);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('lastEmail');
    }

    await setupUserAfterAuth(firebaseUser, appUser as User);
  } catch (error: any) {
    console.error('Login error:', error);

    // Check if it's a Firebase error or API error
    const errorCode = error.code || error.message || '';

    if (errorCode.includes('auth/user-not-found')) {
      errorMessage.value = 'User not found. Please check your email address.';
    } else if (errorCode.includes('auth/wrong-password')) {
      errorMessage.value = 'Incorrect password. Please try again.';
    } else if (errorCode.includes('auth/invalid-email')) {
      errorMessage.value = 'Invalid email address format.';
    } else if (errorCode.includes('auth/user-disabled')) {
      errorMessage.value = 'This account has been disabled.';
    } else if (errorCode.includes('auth/too-many-requests')) {
      errorMessage.value = 'Too many failed login attempts. Please try again later.';
    } else if (errorCode.includes('USER_NOT_FOUND')) {
      errorMessage.value = 'User profile not found on server. Please try signing up.';
    } else {
      errorMessage.value = error.message || 'Login failed. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

// Handle signup form submission
const handleSignup = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  // Validate inputs
  if (!signupEmail.value.trim() || !signupPassword.value.trim() || !signupConfirmPassword.value.trim()) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(signupEmail.value)) {
    errorMessage.value = 'Please enter a valid email address';
    return;
  }

  // Validate password length
  if (signupPassword.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters';
    return;
  }

  // Validate passwords match
  if (signupPassword.value !== signupConfirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  isLoading.value = true;

  try {
    // Create Firebase user
    const firebaseUserCredential = await signUpWithEmail(signupEmail.value, signupPassword.value);
    const firebaseUser = firebaseUserCredential;

    // Register user in backend database
    const name = signupEmail.value.split('@')[0]; // Use email prefix as name
    const appUser = await registerUser(
      firebaseUser.uid,
      signupEmail.value,
      name,
      'CLIENT'
    );

    successMessage.value = 'Account created successfully! Logging you in...';

    // Wait a moment to show success message
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Now log them in
    await setupUserAfterAuth(firebaseUser, appUser as User);
  } catch (error: any) {
    console.error('Signup error:', error);

    const errorCode = error.code || error.message || '';

    if (errorCode.includes('auth/email-already-in-use')) {
      errorMessage.value = 'This email is already in use. Please login or use a different email.';
    } else if (errorCode.includes('auth/invalid-email')) {
      errorMessage.value = 'Invalid email address format.';
    } else if (errorCode.includes('auth/weak-password')) {
      errorMessage.value = 'Password is too weak. Please use a stronger password.';
    } else if (errorCode.includes('USER_EXISTS')) {
      errorMessage.value = 'User already registered. Please login instead.';
    } else {
      errorMessage.value = error.message || 'Sign up failed. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};

// Handle Google login
const handleGoogleLogin = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    // Sign in with Google
    const firebaseUser = await signInWithGoogle();

    // Try to fetch existing user from backend
    let appUser;
    try {
      appUser = await getUserByFirebaseUid(firebaseUser.uid);
    } catch (error: any) {
      // User doesn't exist in backend yet, so create them
      if (error.message.includes('USER_NOT_FOUND')) {
        appUser = await registerUser(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
          'CLIENT'
        );
      } else {
        throw error;
      }
    }

    await setupUserAfterAuth(firebaseUser, appUser as User);
  } catch (error: any) {
    console.error('Google login error:', error);

    const errorCode = error.code || error.message || '';

    if (errorCode.includes('auth/popup-closed-by-user')) {
      // User closed the popup - don't show error
      console.log('Google sign-in cancelled');
    } else if (errorCode.includes('auth/account-exists-with-different-credential')) {
      errorMessage.value = 'This email is already linked to a different sign-in method.';
    } else {
      errorMessage.value = error.message || 'Google sign-in failed. Please try again.';
    }
  } finally {
    isLoading.value = false;
  }
};
</script>