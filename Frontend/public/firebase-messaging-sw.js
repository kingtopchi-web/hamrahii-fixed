// importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// firebase.initializeApp({
//     //   apiKey: "xxx",
//     //   authDomain: "xxx",
//     //   projectId: "xxx",
//     //   messagingSenderId: "xxx",
//     //   appId: "xxx"
//     apiKey: "AIzaSyAmLVKbsi-L8Hkw2POXepALCRv86TGx2Zg",
//     authDomain: "hamrahi-fcf7c.firebaseapp.com",
//     projectId: "hamrahi-fcf7c",
//     storageBucket: "hamrahi-fcf7c.firebasestorage.app",
//     messagingSenderId: "914268034817",
//     appId: "1:914268034817:web:da26b14b43fd6fa1486d00",
//     measurementId: "G-YC8GS092PB"
// });

// const messaging = firebase.messaging();

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAmLVKbsi-L8Hkw2POXepALCRv86TGx2Zg",
  authDomain: "hamrahi-fcf7c.firebaseapp.com",
  projectId: "hamrahi-fcf7c",
  storageBucket: "hamrahi-fcf7c.firebasestorage.app",
  messagingSenderId: "914268034817",
  appId: "1:914268034817:web:da26b14b43fd6fa1486d00",
  measurementId: "G-YC8GS092PB"
});

const messaging = firebase.messaging();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  console.log("Notification clicked:", event.notification);

  const url =
    event.notification?.data?.url ||
    event.notification?.data?.FCM_MSG?.data?.url ||
    "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);

  const title = payload.notification?.title || payload.data?.title || "Hamrahii";
  const body = payload.notification?.body || payload.data?.body || "You have a new notification";
  const icon = payload.notification?.icon || payload.data?.icon || "/logo.png";
  const image = payload.notification?.image || payload.data?.image || "";
  const targetUrl = payload.data?.url || payload.fcmOptions?.link || "/";

  const notificationOptions = {
    body,
    icon,
    data: {
      url: targetUrl,
      ...(payload.data || {})
    }
  };

  if (image) {
    notificationOptions.image = image;
  }

  self.registration.showNotification(title, notificationOptions);
});
