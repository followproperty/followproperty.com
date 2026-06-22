import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize firebase client app for messaging
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Requests browser permission for notifications, registers the background service worker,
 * fetches the Firebase FCM push token, and registers it with the database.
 */
export async function requestFcmPermissionAndRegister() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("Notification" in window)
  ) {
    console.warn("[FCM Client] Service worker or Notification APIs not supported in this browser.");
    return null;
  }

  try {
    // 1. Request notification permissions from the user
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM Client] Permission for notifications was not granted.");
      return null;
    }

    // 2. Pass config parameters to service worker via URL query parameters
    const configParams = new URLSearchParams({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    });
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${configParams.toString()}`
    );
    console.log("[FCM Client] Service Worker registered scope:", registration.scope);

    // 3. Retrieve messaging instance
    const messaging = getMessaging(app);

    // 4. Retrieve FCM push registration token
    // Uses VAPID key if present in process.env (passed as process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY)
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      ...(vapidKey ? { vapidKey } : {})
    });

    if (token) {
      // 5. Submit push token to user account endpoint
      const res = await fetch("/api/users/fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "register" })
      });
      const data = await res.json();
      if (data.success) {
        console.log("[FCM Client] Token successfully registered on server.");
      } else {
        console.error("[FCM Client] Failed to register token on server:", data.error);
      }
      return token;
    } else {
      console.warn("[FCM Client] Generated FCM token is empty.");
      return null;
    }
  } catch (error) {
    console.error("[FCM Client] Failed to execute FCM token registration:", error);
    return null;
  }
}
