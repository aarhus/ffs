import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, browserLocalPersistence, createUserWithEmailAndPassword, getAuth, setPersistence, signInWithPopup } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
// Replace these with your Firebase project credentials from Firebase Console
const firebaseConfig = {
    apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
    authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Set persistence to local storage
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Failed to set persistence:', error);
});

/**
 * Register Service Worker for background notifications
 */
const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/',
            });
            console.log('Service Worker registered:', registration);
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }
};

// Register service worker on app initialization
registerServiceWorker();

// Initialize Firebase Cloud Messaging
let messaging: any = null;

try {
    messaging = getMessaging(app);
} catch (error) {
    console.warn('Firebase Cloud Messaging not available:', error);
}

export { messaging };

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
    if (!messaging) {
        console.warn('Firebase Cloud Messaging not initialized');
        return null;
    }

    try {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey: (import.meta as any).env.VITE_FIREBASE_VAPID_KEY || undefined,
            });

            console.log('FCM Token:', token);
            return token;
        } else {
            console.log('Notification permission denied');
            return null;
        }
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Listen for incoming messages
 */
export const listenForMessages = (callback: (payload: any) => void) => {
    if (!messaging) {
        console.warn('Firebase Cloud Messaging not initialized');
        return;
    }

    onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        callback(payload);
    });
};

/**
 * Store FCM token in local storage
 * This should be called after user logs in
 */
export const storeFCMToken = async (userId: string | number, token: string) => {
    try {
        // Store in local storage for client-side access
        localStorage.setItem(`fcm_token_${userId}`, token);
        console.log('FCM token stored for user:', userId);
    } catch (error) {
        console.error('Error storing FCM token:', error);
    }
};

/**
 * Get stored FCM token for a user
 */
export const getFCMToken = (userId: string | number): string | null => {
    return localStorage.getItem(`fcm_token_${userId}`);
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        throw error;
    }
};
