import admin from "firebase-admin";
import fs from "fs";

let serviceAccount;
if (process.env.FIREBASE_SERVICES) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICES);
} else {
  serviceAccount = JSON.parse(
    fs.readFileSync(new URL("./firebase-services.json", import.meta.url))
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;