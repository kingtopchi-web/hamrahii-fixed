// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken } from "firebase/messaging";

// // const firebaseConfig = {
// //   apiKey: "...",
// //   authDomain: "...",
// //   projectId: "...",
// //   messagingSenderId: "...",
// //   appId: "..."
// // };

// const firebaseConfig = {
//   apiKey: "AIzaSyAmLVKbsi-L8Hkw2POXepALCRv86TGx2Zg",
//   authDomain: "hamrahi-fcf7c.firebaseapp.com",
//   projectId: "hamrahi-fcf7c",
//   storageBucket: "hamrahi-fcf7c.firebasestorage.app",
//   messagingSenderId: "914268034817",
//   appId: "1:914268034817:web:da26b14b43fd6fa1486d00",
//   measurementId: "G-YC8GS092PB"
// };

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// export const requestFCMToken = async () => {
//   const permission = await Notification.requestPermission();
//   if (permission !== "granted") return null;

//   const token = await getToken(messaging, {
//     vapidKey: "BMctIm5nS8J_Eb-LNi9-jSsGaSlQOCwdF3_SVHT-4ibQ7oLGydK_xDbE5SVd13UM8HSgNraIxiQc_E2ALVg08zI"
//   });

//   return token;
// };


import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAmLVKbsi-L8Hkw2POXepALCRv86TGx2Zg",
  authDomain: "hamrahi-fcf7c.firebaseapp.com",
  projectId: "hamrahi-fcf7c",
  storageBucket: "hamrahi-fcf7c.firebasestorage.app",
  messagingSenderId: "914268034817",
  appId: "1:914268034817:web:da26b14b43fd6fa1486d00",
  measurementId: "G-YC8GS092PB"
};

const app = initializeApp(firebaseConfig);

let messaging = null;

// Initialize messaging safely
export const initMessaging = async () => {
  try {
    const supported = await isSupported();

    if (!supported) {
      console.warn("FCM not supported in this browser");
      return null;
    }

    messaging = getMessaging(app);
    return messaging;
  } catch (err) {
    console.warn("FCM init failed safely:", err);
    return null;
  }
};

export const requestFCMToken = async () => {
  const msg = await initMessaging();
  if (!msg) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  try {
    const token = await getToken(msg, {
      vapidKey: "BMctIm5nS8J_Eb-LNi9-jSsGaSlQOCwdF3_SVHT-4ibQ7oLGydK_xDbE5SVd13UM8HSgNraIxiQc_E2ALVg08zI"
    });

    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
};

export const onForegroundMessage = async (callback) => {
  try {
    const msg = await initMessaging();
    if (!msg) return () => {};
    return onMessage(msg, (payload) => {
      if (callback) callback(payload);
    });
  } catch (err) {
    console.warn("Error setting up foreground message listener:", err);
    return () => {};
  }
};
