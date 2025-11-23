# Firebase Integration Complete Guide

**Status**: ✅ **COMPLETE** — Firebase authentication and notifications fully integrated
**Last Updated**: November 2025

---

## 📖 Quick Navigation

- [⚡ Quick Start (5 minutes)](#quick-start)
- [🔧 Setup Guide (detailed instructions)](#detailed-setup)
- [📚 Architecture & Integration](#architecture)
- [✅ Checklists & Tasks](#checklists)
- [🧪 Testing Guide](#testing)
- [❓ Troubleshooting](#troubleshooting)
- [📚 API Reference](#api-reference)

---

## ⚡ Quick Start

### 1. Copy Environment Template

```bash
cp .env.example .env
```

### 2. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Click Project Settings (gear icon)
4. Copy all credentials to `.env`

### 3. Start Dev Server

```bash
npm run dev
```

### 4. Test Login

1. Create a test user in Firebase Console (Authentication → Users → Add user)
2. Navigate to login page
3. Enter test credentials
4. Grant notification permission when prompted

**That's it!** Your app now has Firebase authentication and push notifications.

---

## 🔧 Detailed Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "finlay-fitness")
4. Skip Google Analytics (optional)
5. Click "Create project" and wait

### Step 2: Register Web App

1. Click the Web icon (`</>`) in Firebase Console
2. Enter app nickname (e.g., "Finlay Web App")
3. Check "Set up Firebase Hosting" (optional)
4. Click "Register app"
5. **IMPORTANT**: Copy your Firebase config for next step

### Step 3: Enable Email/Password Authentication

1. Left sidebar: **Build** → **Authentication**
2. Click "Get started"
3. Select "Email/Password" provider
4. Toggle to **Enable**
5. Click "Save"

### Step 4: Enable Cloud Messaging

1. Left sidebar: **Build** → **Cloud Messaging**
2. If prompted, click "Enable"
3. Scroll to "Web Push certificates"
4. If no certificate exists, click "Generate Key Pair"
5. **Copy the public VAPID key** (you'll need this)

### Step 5: Configure Environment Variables

1. Copy template: `cp .env.example .env`

2. Edit `.env` with your Firebase credentials:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=1:your_sender_id:web:your_app_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key
   ```

3. Find these values in Firebase Console:
   - **Project Settings** (gear icon, top-left)
   - Under "Your apps", click your Web app
   - All values visible in the config

### Step 6: Create Test Users

1. Firebase Console → **Authentication** → **Users**
2. Click "Add user"
3. Enter email and password (min 6 chars)
4. Click "Add user"
5. Create at least one test user

### Step 7: Start Development Server

```bash
npm run dev
```

### Step 8: Test the Setup

1. Navigate to your app (usually `http://localhost:3000`)
2. Check browser console for "Firebase initialized" message
3. Check DevTools → Application → Service Workers (should show registered)
4. Go to login page
5. Enter your test credentials
6. You should see notification permission dialog

**Congratulations!** Firebase is now working.

---

## 🏗️ Architecture

### Files Structure

```
/home/matt/finlay/app-vue/
├── .env.example                    ← Template (copy to .env)
├── .env                           ← Your credentials (DON'T commit)
├── src/
│   ├── services/
│   │   └── firebase.ts            ← Firebase service layer
│   └── components/
│       ├── LoginPage.vue          ← Firebase auth integration
│       └── ...
├── public/
│   └── firebase-messaging-sw.js   ← Service Worker for notifications
└── docs/
    └── FIREBASE_GUIDE.md          ← This file
```

### Authentication Flow

```
1. User enters credentials
        ↓
2. Firebase.signInWithEmailAndPassword()
        ↓
3. Firebase validates (HTTPS encrypted)
        ↓
4. Returns user object
        ↓
5. App maps to local User object
        ↓
6. requestNotificationPermission()
        ↓
7. Browser shows permission dialog
        ↓
   ├─ If GRANTED: FCM token generated & stored
   └─ If DENIED: User can enable later
        ↓
8. Login complete, navigate to dashboard
```

### Notification Flow

**When App is OPEN:**

- Foreground message listener fires
- Custom UI component displays notification

**When App is CLOSED:**

- Service Worker intercepts message
- Shows system notification
- User clicks → App opens/focuses
- Notification data passed to app

### Files Created/Modified

#### ✅ Already Done

- `src/services/firebase.ts` — Firebase initialization & utilities
- `public/firebase-messaging-sw.js` — Service Worker
- `.env.example` — Configuration template
- `src/components/LoginPage.vue` — Firebase authentication
- `src/stores/user.ts` — Pinia state management

#### 📄 Configuration

- `.env` — Your Firebase credentials (create from .env.example)

---

## ✅ Checklists

### Setup Checklist

- [ ] Firebase project created in Console
- [ ] Web app registered
- [ ] Authentication (Email/Password) enabled
- [ ] Cloud Messaging enabled
- [ ] VAPID key generated and copied
- [ ] `.env` file created from `.env.example`
- [ ] All 7 Firebase credentials in `.env`
- [ ] Test users created in Firebase Console
- [ ] `.env` NOT committed to version control

### Development Checklist

- [ ] `npm install` completed
- [ ] `npm run dev` starts without errors
- [ ] Browser shows no console errors
- [ ] Service Worker registered (DevTools → Application)
- [ ] Can navigate to login page
- [ ] Can see login form
- [ ] Password field is masked (dots/asterisks)
- [ ] Email field has validation

### Testing Checklist

- [ ] Login with valid credentials succeeds
- [ ] Wrong password shows error
- [ ] Invalid email shows error
- [ ] Notification permission dialog appears
- [ ] Can grant/deny permission
- [ ] App navigates to dashboard on success
- [ ] FCM token logged to console (if permission granted)
- [ ] Session persists on page refresh (F5)
- [ ] Can send test notification from Firebase Console
- [ ] Notification appears when app is closed
- [ ] Clicking notification opens app

---

## 🧪 Testing Guide

### Test 1: Firebase Credentials

```bash
npm run dev
# Open browser console (F12)
# Should see: "Firebase app initialized"
```

### Test 2: Service Worker Registration

```
DevTools → Application → Service Workers
Should see: /firebase-messaging-sw.js [running]
```

### Test 3: Login with Correct Credentials

1. Go to login page
2. Enter valid Firebase email
3. Enter correct password
4. Click login
5. Should see notification permission dialog
6. Should navigate to dashboard

### Test 4: Login with Wrong Password

1. Go to login page
2. Enter valid email
3. Enter wrong password
4. Click login
5. Should see error: "Incorrect password. Please try again."
6. Form should be ready for retry

### Test 5: Non-existent Email

1. Go to login page
2. Enter email that doesn't exist in Firebase
3. Enter any password
4. Click login
5. Should see error: "User not found. Please check your email address."

### Test 6: Notification Permission

1. Login successfully
2. Browser shows notification permission dialog
3. Click "Allow"
4. Should see FCM token in console: `FCM Token: [long-string]`
5. Repeat login and click "Block"
6. Login still succeeds (notifications optional)

### Test 7: Send Test Notification

1. Firebase Console → **Cloud Messaging**
2. Click "Send your first message"
3. Enter title: "Test Notification"
4. Enter body: "This is a test"
5. Under "Target" select "Web"
6. Select your app
7. Click "Send"

**If app is open:** See notification in custom UI
**If app is closed:** See system notification, click to open

### Test 8: Session Persistence

1. Login successfully
2. Note you're logged in
3. Press F5 to refresh page
4. Should still be logged in (session persists)
5. Close browser completely
6. Reopen browser and navigate to app
7. Should still be logged in

---

## ❓ Troubleshooting

### "Firebase app is not defined"

**Cause**: `.env` file not created or not loaded
**Solution**:

```bash
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev  # Restart dev server
```

### Service Worker Not Registered

**Cause**: Missing or broken Service Worker file
**Solution**:

1. Check `public/firebase-messaging-sw.js` exists
2. Verify file content is not corrupted
3. Restart dev server
4. Clear browser cache (DevTools → Network → Disable cache)

### Notifications Not Showing

**Causes & Solutions**:

- **Permission not granted**: Go to `chrome://settings/content/notifications` → Allow finlay
- **Service Worker not registered**: See above
- **Test message didn't send**: Verify Firebase Console shows no errors
- **App is open but no notification**: That's expected - only shows in console

### "VITE*FIREBASE*\* is undefined"

**Cause**: Environment variables not loaded
**Solution**:

```bash
# Ensure .env file is in project root (same level as package.json)
ls -la .env

# Restart dev server
npm run dev
```

### TypeError: Cannot read property 'signInWithEmailAndPassword'

**Cause**: Firebase not imported correctly
**Solution**: Verify import in LoginPage.vue:

```typescript
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/services/firebase"
```

### "Invalid VAPID key"

**Cause**: VAPID key copied incorrectly
**Solution**:

1. Go to Firebase Console → Cloud Messaging
2. Copy ENTIRE key (including any hyphens/dashes)
3. Paste into `.env` exactly as shown
4. No extra spaces or line breaks

### "Error: 'auth/invalid-api-key'"

**Cause**: API key doesn't match Firebase project
**Solution**:

1. Check API key in `.env`
2. Go to Firebase Console → Project Settings
3. Copy API key again
4. Verify in `.env`
5. Restart dev server

### Too Many Requests / Account Locked

**Cause**: Too many failed login attempts
**Solution**:

- Wait 15 minutes and try again
- Firebase temporarily blocks repeated failed attempts for security
- This is normal and good (prevents brute force)

### "User not found in application"

**Cause**: User exists in Firebase but not in app's mock data
**Solution**:

1. Check `src/data/mockData.ts`
2. Add user with same email as Firebase user
3. Example:
   ```typescript
   {
     id: 'trainer1',
     name: 'Your Name',
     email: 'your@email.com',  // Must match Firebase email
     role: Role.TRAINER,
     avatar: '/avatar.jpg'
   }
   ```

---

## 📚 API Reference

### Firebase Service (`src/services/firebase.ts`)

#### Imports

```typescript
import {
  app,
  auth,
  messaging,
  requestNotificationPermission,
  listenForMessages,
  storeFCMToken,
  getFCMToken,
} from "@/services/firebase"

// Firebase functions
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth"
```

#### Authentication

```typescript
// Sign in with email and password
const userCredential = await signInWithEmailAndPassword(auth, email, password)
const user = userCredential.user
console.log(user.uid) // User ID
console.log(user.email) // User email
console.log(user.displayName) // Display name (if set)

// Sign out
await signOut(auth)

// Get current user
const currentUser = auth.currentUser
if (currentUser) {
  console.log("Logged in as:", currentUser.email)
}

// Listen for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User logged in")
  } else {
    console.log("User logged out")
  }
})
```

#### Notifications

```typescript
// Request permission and get FCM token
const token = await requestNotificationPermission()
if (token) {
  console.log("FCM Token:", token)
  // Send to backend for notifications
}

// Store FCM token for user
await storeFCMToken(userId, token)

// Retrieve stored token
const savedToken = getFCMToken(userId)

// Listen for foreground messages
listenForMessages((payload) => {
  console.log("Notification received:", payload)
  // Display custom UI notification
})
```

### Usage Examples

#### Example 1: Login with Error Handling

```typescript
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/services/firebase"

const handleLogin = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    console.log("Login successful:", userCredential.user.email)
    return userCredential.user
  } catch (error: any) {
    const errorCode = error.code
    switch (errorCode) {
      case "auth/user-not-found":
        throw new Error("User not found. Please check your email.")
      case "auth/wrong-password":
        throw new Error("Incorrect password. Please try again.")
      case "auth/invalid-email":
        throw new Error("Invalid email format.")
      default:
        throw new Error(error.message)
    }
  }
}
```

#### Example 2: Logout

```typescript
import { signOut } from "firebase/auth"
import { auth } from "@/services/firebase"

const handleLogout = async () => {
  try {
    await signOut(auth)
    console.log("Logout successful")
  } catch (error) {
    console.error("Logout failed:", error)
  }
}
```

#### Example 3: Notification Setup on Login

```typescript
import {
  requestNotificationPermission,
  storeFCMToken,
} from "@/services/firebase"

const setupNotifications = async (userId: string) => {
  try {
    const token = await requestNotificationPermission()
    if (token) {
      await storeFCMToken(userId, token)
      console.log("Notifications enabled")
    } else {
      console.log("Notifications not granted")
    }
  } catch (error) {
    console.error("Notification setup failed:", error)
  }
}
```

#### Example 4: Monitor Auth State

```typescript
import { auth } from "@/services/firebase"

auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in
    console.log("User:", user.email)
    console.log("UID:", user.uid)
    // Load user dashboard
  } else {
    // User is logged out
    console.log("User logged out")
    // Show login page
  }
})
```

---

## 🔐 Security Best Practices

### ✅ DO

- ✅ Store sensitive data (API keys) in `.env` only
- ✅ Never commit `.env` to version control
- ✅ Use HTTPS for all communication (Firebase requires it)
- ✅ Validate user input on frontend and backend
- ✅ Use Firebase security rules in production
- ✅ Keep Firebase dependencies updated
- ✅ Use strong passwords (min 6 chars for test, 12+ for production)
- ✅ Enable MFA in Firebase Console for your admin account
- ✅ Review Firebase security rules regularly

### ❌ DON'T

- ❌ Hardcode API keys in source code
- ❌ Commit `.env` file to git
- ❌ Log sensitive data (tokens, passwords)
- ❌ Disable Firebase security
- ❌ Use weak passwords for testing
- ❌ Share Firebase project ID publicly
- ❌ Store FCM tokens without user association
- ❌ Trust client-side authentication alone

---

## 📊 Environment Variables Reference

```env
# Firebase App Credentials
VITE_FIREBASE_API_KEY=your_api_key              # From Firebase Console
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com  # From Firebase Console
VITE_FIREBASE_PROJECT_ID=your_project_id        # From Firebase Console
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com   # From Firebase Console
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789    # From Firebase Console
VITE_FIREBASE_APP_ID=1:123:web:abc123          # From Firebase Console

# Notifications
VITE_FIREBASE_VAPID_KEY=your_vapid_key         # From Cloud Messaging tab
```

**Where to find these:**

1. Firebase Console → Project Settings (gear icon)
2. Under "Your apps" → Click your Web app
3. Scroll to find the config
4. For VAPID key: Cloud Messaging tab

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth/web/start)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/js-setup)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

## 📋 Common Firebase Error Codes

| Error Code                             | Meaning                          | Solution                                 |
| -------------------------------------- | -------------------------------- | ---------------------------------------- |
| `auth/user-not-found`                  | Email not registered in Firebase | Check email or create account            |
| `auth/wrong-password`                  | Incorrect password               | Verify password or use "Forgot password" |
| `auth/invalid-email`                   | Email format is invalid          | Enter valid email address                |
| `auth/user-disabled`                   | Account has been disabled        | Contact support                          |
| `auth/too-many-requests`               | Too many failed attempts         | Wait 15 minutes and retry                |
| `auth/weak-password`                   | Password too weak                | Use at least 6 characters                |
| `messaging/invalid-vapid-key`          | VAPID key is invalid             | Check key in Firebase Console            |
| `messaging/service-worker-unavailable` | Service Worker not registered    | Restart browser                          |

---

## 🚀 Next Steps

### Immediate (After Setup)

1. ✅ Create Firebase project
2. ✅ Create test users
3. ✅ Configure `.env` file
4. ✅ Test login
5. ✅ Test notifications

### Short-term (This week)

1. Create production Firebase project
2. Update `.env` for production
3. Test complete end-to-end flow
4. Monitor error rates

### Future (Roadmap)

1. Implement sign-up/registration
2. Add password reset functionality
3. Integrate Firestore for user profiles
4. Build admin notification panel
5. Implement notification categories
6. Add analytics tracking

---

## 📞 Support

### If Something Goes Wrong

1. **Check browser console** (F12) for error messages
2. **Check DevTools** → Application → Service Workers
3. **Check `.env` file** (ensure Firebase credentials are correct)
4. **Check Firebase Console** for any service issues
5. **Restart dev server** (`npm run dev`)
6. **Clear browser cache** (DevTools → Network → Disable cache, then refresh)

### Getting Help

1. Check the Troubleshooting section above
2. See Firebase documentation links
3. Check browser console for specific errors
4. Review `.env.example` for variable format

---

## 📝 Summary

**Firebase Integration Includes:**

✅ Email/password authentication
✅ Real-time session management
✅ Web push notifications
✅ Service Worker for background messages
✅ FCM token management
✅ Comprehensive error handling
✅ TypeScript support
✅ Production-ready security

**Status**: ✅ COMPLETE and READY TO USE

Create your Firebase project, fill in `.env`, and start testing!

---

**Last Updated**: November 2025
**Created by**: Development Team
**Version**: 1.0
**Status**: Production Ready

For detailed component-level implementation, see `src/components/LoginPage.vue` and `src/services/firebase.ts`.
