// Firebase Cloud Messaging Service Worker
// Handles background notifications when the app is not in focus
//
// IMPORTANT: Firebase Cloud Messaging automatically handles background messages
// when a service worker is present. This file doesn't need to import Firebase
// libraries - the browser and FCM handle everything automatically.

console.log('Firebase Messaging Service Worker loaded');

/**
 * Handle background messages when app is closed or not focused
 * Firebase Cloud Messaging will automatically deliver background messages
 * to this handler without requiring explicit Firebase library imports
 */
self.addEventListener('message', (event) => {
    const eventType = event.data?.type;

    if (eventType === 'BACKGROUND_MESSAGE') {
        const payload = event.data.payload;
        handleBackgroundMessage(payload);
    }
});

/**
 * Handle background messages when the app is not in focus
 * @param {Object} payload - The notification payload from FCM
 */
function handleBackgroundMessage(payload) {
    console.log('Received background message:', payload);

    if (!payload.notification) {
        console.warn('No notification data in payload');
        return;
    }

    const notificationTitle = payload.notification.title || 'Finlay Fitness';
    const notificationOptions = {
        body: payload.notification.body || 'You have a new notification',
        icon: '/finlay-icon.png', // Update with your app icon path
        badge: '/finlay-badge.png', // Update with your badge icon path
        tag: payload.messageId || 'finlay-notification', // Prevents duplicate notifications
        data: {
            ...payload.data,
            link: payload.notification.click_action || '/',
        },
        actions: [
            {
                action: 'open',
                title: 'Open',
            },
            {
                action: 'close',
                title: 'Close',
            },
        ],
    };

    // Show the notification
    self.registration.showNotification(notificationTitle, notificationOptions).catch((error) => {
        console.error('Error showing notification:', error);
    });
}

/**
 * Handle notification clicks
 * Opens the app window or focuses existing one
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.link || '/';
    const action = event.action;

    if (action === 'close') {
        // User clicked close button
        return;
    }

    // User clicked open or the notification body
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app window already exists
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if ((client.url === urlToOpen || client.url.includes(urlToOpen)) && 'focus' in client) {
                    return client.focus();
                }
            }

            // If no window found, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

/**
 * Handle notification close/dismiss
 */
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event.notification.data);
    // Optional: Track notification dismissals for analytics
});

/**
 * Keep service worker active
 * Prevents service worker from being terminated
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(self.clients.claim());
});

/**
 * Install event
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});
