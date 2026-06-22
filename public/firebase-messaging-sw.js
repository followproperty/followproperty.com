importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker with project credentials
firebase.initializeApp({
  apiKey: "AIzaSyD5a5Chi4C7I6nbtAHsP71drHBGwtmWHfo",
  authDomain: "followproperty-a392f.firebaseapp.com",
  projectId: "followproperty-a392f",
  storageBucket: "followproperty-a392f.firebasestorage.app",
  messagingSenderId: "111548686685",
  appId: "1:111548686685:web:7810dbca1c88832ab5c8b4"
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
