# Firebase Setup Guide

This document provides step-by-step instructions to set up Firebase authentication and web push notifications for the Finlay fitness tracking application.

## Prerequisites

- A Google account
- Access to Firebase Console (https://console.firebase.google.com/)
- Node.js and npm installed locally
- The Finlay Vue 3 app cloned and dependencies installed (`npm install`)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "finlay-fitness")
4. You can skip Google Analytics setup
5. Click "Create project" and wait for setup to complete

## Step 2: Register Web App

1. In Firebase Console, click the Web icon (`</>`) to add a web app
2. Enter an app nickname (e.g., "Finlay Web App")
3. Check "Set up Firebase Hosting" (optional)
4. Click "Register app"
5. You'll see your Firebase config - **copy this for later steps**

## Step 3: Enable Authentication

1. In the left sidebar, click "Build" → "Authentication"
2. Click "Get started"
3. Select "Email/Password" as a sign-in provider
4. Toggle to enable it
5. Click "Save"

You can add additional providers (Google, GitHub, etc.) if needed.

## Step 4: Enable Cloud Messaging

1. In the left sidebar, click "Build" → "Cloud Messaging"
2. If prompted, click "Enable" to enable the Messaging service
3. Under "Web configuration", you should see a "Web Push certificates" section
4. If no certificate exists, click "Generate Key Pair"
5. Copy the public key (VAPID key) - you'll need this for `.env`

## Step 5: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Open your `.env` file and update with values from your Firebase config:

   ```
   VITE_FIREBASE_API_KEY=<your-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=<your-project-id>
   VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
   VITE_FIREBASE_APP_ID=1:<your-sender-id>:web:<your-app-id>
   VITE_FIREBASE_VAPID_KEY=<your-vapid-key-from-cloud-messaging>
   VITE_FIREBASE_ISSUER=<your-issuer-url>
   ```

3. You can find all these values in Firebase Console:
   - Go to **Project Settings** (gear icon, top-left)
   - Under "Your apps", find the Web app you registered
   - Click to view the config

## Step 6: Create Service Worker for Background Notifications

The Service Worker enables your app to receive push notifications even when not in focus.

1. Create a new file: `public/firebase-messaging-sw.js`

2. Add this content:

   ```javascript
   // Import Firebase scripts (global scope for Service Worker)
   importScripts("https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js")
   importScripts(
     "https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js"
   )

   // Initialize Firebase in Service Worker context
   // (Configuration will be handled by the app, but we need the scripts loaded)

   // Listen for background messages
   messaging.onBackgroundMessage((payload) => {
     console.log("Received background message:", payload)

     const notificationTitle = payload.notification?.title || "Finlay"
     const notificationOptions = {
       body: payload.notification?.body || "New notification",
       icon: "/finlay-icon.png", // Update with your app icon
       badge: "/finlay-badge.png", // Update with your badge icon
       tag: payload.messageId, // Prevent duplicate notifications
       data: payload.data,
     }

     return self.registration.showNotification(
       notificationTitle,
       notificationOptions
     )
   })

   // Handle notification clicks
   self.addEventListener("notificationclick", (event) => {
     event.notification.close()

     // Open the app when user clicks notification
     event.waitUntil(
       clients
         .matchAll({ type: "window", includeUncontrolled: true })
         .then((clientList) => {
           for (let i = 0; i < clientList.length; i++) {
             const client = clientList[i]
             if (client.url === "/" && "focus" in client) {
               return client.focus()
             }
           }
           if (clients.openWindow) {
             return clients.openWindow("/")
           }
         })
     )
   })
   ```

## Step 7: Update App to Request Notification Permission

The Firebase service (`src/services/firebase.ts`) already includes notification handling. When users login or visit the app, they should see a browser permission request for notifications.

To manually request permission in a component:

```vue
<script setup>
import { requestNotificationPermission } from "@/services/firebase"

const enableNotifications = async () => {
  try {
    const token = await requestNotificationPermission()
    console.log("FCM Token:", token)
    // Token is automatically stored - you can sync it to your backend here
  } catch (error) {
    console.error("Failed to enable notifications:", error)
  }
}
</script>

<template>
  <button @click="enableNotifications">Enable Notifications</button>
</template>
```

## Step 8: Update LoginPage to Use Firebase Authentication

The Firebase auth service is ready in `src/services/firebase.ts`. You'll need to integrate it with `LoginPage.vue`:

```vue
<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/services/firebase"

const router = useRouter()
const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

const handleLogin = async () => {
  error.value = ""
  loading.value = true

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )
    console.log("Logged in:", userCredential.user.user_id)

    // Request notification permission after successful login
    const { requestNotificationPermission } = await import(
      "@/services/firebase"
    )
    requestNotificationPermission().catch((err) =>
      console.warn("Notification permission denied", err)
    )

    // Redirect to home or dashboard
    router.push("/")
  } catch (err) {
    error.value = err.message || "Login failed"
    console.error("Login error:", err)
  } finally {
    loading.value = false
  }
}
</script>
```

## Step 9: Test Firebase Setup

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the app in your browser (typically `http://localhost:3001`)

3. Check browser console for Firebase initialization messages

4. If you see no errors and Firebase loads, your setup is working

## Step 10: Test Push Notifications

1. In Firebase Console, go to **Build** → **Cloud Messaging**
2. Click "Send your first message"
3. Enter a notification title and body
4. Under "Target", select "Web"
5. Select your app
6. Schedule to send immediately
7. You should see the notification appear in your browser

## Troubleshooting

### "Property 'env' does not exist on type 'ImportMeta'"

- This error is already fixed in `src/services/firebase.ts` using type casting
- If you see it elsewhere, cast `(import.meta as any).env.VITE_FIREBASE_*`

### Notifications not showing

- Ensure you've granted notification permission to the app
- Check that the Service Worker is registered: DevTools → Application → Service Workers
- Check browser console for errors

### Firebase initialization errors

- Verify all environment variables are set correctly in `.env`
- Ensure the `.env` file exists and is in the project root
- Restart your dev server after updating `.env`

### "Firebase: Error (auth/invalid-api-key)"

- Double-check your `VITE_FIREBASE_API_KEY` is correct
- Verify the API key is enabled for Web in Firebase Console

## Next Steps

1. Create signup functionality with Firebase Authentication
2. Store user FCM tokens in a Firestore database or backend
3. Build notification management UI for users to control preferences
4. Implement notification categories (workout reminders, messages, etc.)
5. Set up scheduled notifications through Cloud Tasks or backend

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth/web/start)
- [Firebase Cloud Messaging for Web](https://firebase.google.com/docs/cloud-messaging/js-setup)
- [Service Workers Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
