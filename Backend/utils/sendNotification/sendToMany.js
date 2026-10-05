import admin from "../../config/firebaseAdmin.js";
import userModel from "../../models/user.model.js";


const buildMessage = ({ token, title, body, icon, link, image }) => {
  const frontendUrl = process.env.FRONTEND_URL || "https://humrahii.com";
  const targetUrl = link && typeof link === "string" && link.trim() ? link.trim() : frontendUrl;

  const notificationPayload = {
    title: title || "Hamrahii",
    body: body || "You have a new notification",
  };
  if (image && typeof image === "string" && image.trim()) {
    notificationPayload.image = image.trim();
  }

  const webpushNotification = {
    title: title || "Hamrahii",
    body: body || "You have a new notification",
    icon:
      icon && typeof icon === "string" && icon.trim()
        ? icon.trim()
        : `${frontendUrl}/logo.png`,
  };
  if (image && typeof image === "string" && image.trim()) {
    webpushNotification.image = image.trim();
  }

  const webpushData = {
    url: String(targetUrl),
    title: String(title || "Hamrahii"),
    body: String(body || "You have a new notification"),
  };
  if (image && typeof image === "string" && image.trim()) {
    webpushData.image = String(image.trim());
  }

  return {
    token,
    notification: notificationPayload,
    webpush: {
      notification: webpushNotification,
      data: webpushData,
      fcmOptions: {
        link: targetUrl,
      },
    },
  };
};


// export const sendToMany = async ({ tokens, title, body, icon, link }) => {
//   const messages = tokens.map(token =>
//     buildMessage({ token, title, body, icon, link })
//   );

//   const response = await admin.messaging().sendEach(messages);

//   let successTokens = [];
//   let failedTokens = [];

//   response.responses.forEach((r, i) => {
//     if (r.success) {
//       successTokens.push(tokens[i]);
//     } else {
//       failedTokens.push({
//         token: tokens[i],
//         error: r.error?.message,
//       });
//     }
//   });

//   return {
//     successCount: successTokens.length,
//     failureCount: failedTokens.length,
//     failedTokens,
//   };
// };


export const sendToMany = async ({ tokens, title, body, icon, link , image}) => {
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, failedTokens: [] };
  }

  const messages = tokens.map(token =>
    buildMessage({ token, title, body, icon, link , image})
  );

  const response = await admin.messaging().sendEach(messages);

  let successTokens = [];
  let failedTokens = [];
  let tokensToDelete = [];

  response.responses.forEach((r, i) => {
    const token = tokens[i];

    if (r.success) {
      successTokens.push(token);
    } else {
      const errorCode = r.error?.code;

      failedTokens.push({
        token,
        error: r.error?.message,
      });

      // 🔥 mark for deletion only if permanently invalid
      if (
        errorCode === "messaging/registration-token-not-registered" ||
        errorCode === "messaging/invalid-registration-token"
      ) {
        tokensToDelete.push(token);
      }
    }
  });

  // 🔥 Remove invalid tokens from DB
  if (tokensToDelete.length > 0) {
    await userModel.updateMany(
      { fcm: { $in: tokensToDelete } },
      { $pull: { fcm: { $in: tokensToDelete } } }
    );
  }

  return {
    successCount: successTokens.length,
    failureCount: failedTokens.length,
    failedTokens,
  };
};