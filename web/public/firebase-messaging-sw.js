/**
 * public/firebase-messaging-sw.js
 *
 * NEW FOR WEEK 1: Service Worker for Firebase Cloud Messaging
 * Handles background push notifications when app is closed
 *
 * IMPORTANT: This file must be placed in the /public directory
 * and served from the root of your domain (e.g., /firebase-messaging-sw.js)
 */

// Import Firebase scripts (using importScripts for service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Initialize Firebase in the service worker
// IMPORTANT: Replace these values with your actual Firebase config
firebase.initializeApp({
  apiKey: "AIzaSyDeqHsmpLbsbr8BpGA1sk25fx5kgXsBXkw",
  authDomain: "pickit-b12e5.firebaseapp.com",
  projectId: "pickit-b12e5",
  storageBucket: "pickit-b12e5.appspot.com",
  messagingSenderId: "850762485363",
  appId: "1:850762485363:ios:052dc0fd83f124fbd3a406",
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

/**
 * Handle background messages
 * This runs when the app is not in focus
 */
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: payload.notification?.icon || "/logo192.png",
    badge: "/logo192.png",
    data: payload.data,
    // Actions for the notification
    actions: [
      {
        action: "view",
        title: "View",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  // Show the notification
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click:", event);

  event.notification.close();

  if (event.action === "view") {
    // Open the app at the specified link
    const urlToOpen = event.notification.data?.link || "/my-tickets";
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }
          // Otherwise, open a new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
  // 'dismiss' action does nothing (notification already closed)
});
