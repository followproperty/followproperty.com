importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Parse Firebase configuration parameters from the service worker registration URL
const params = new URL(self.location).searchParams;
firebase.initializeApp({
  apiKey: params.get("apiKey") || "",
  authDomain: params.get("authDomain") || "",
  projectId: params.get("projectId") || "",
  storageBucket: params.get("storageBucket") || "",
  messagingSenderId: params.get("messagingSenderId") || "",
  appId: params.get("appId") || ""
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'New Match Alert';
  const notificationOptions = {
    body: payload.notification.body || 'A new property matches your requirement!',
    icon: payload.data?.icon || '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      click_action: payload.data?.click_action || '/notifications'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Redirect when user clicks on a background notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.click_action || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Find open browser tab for this origin and focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.navigate(urlToOpen).then(c => c.focus());
        }
      }
      // Or open a new tab/window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
