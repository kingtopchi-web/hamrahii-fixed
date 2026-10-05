import admin from "../../config/firebaseAdmin.js";


const buildMessage = ({ token, title, body, icon, link }) => ({
  token,
  notification: {
    title: title || "New Message",
    body: body || "You have a new notification",
  },
  webpush: {
    notification: {
      icon: icon || "https://image.similarpng.com/file/similarpng/very-thumbnail/2020/12/Yellow-car-design-illustration-on-transparent-background-PNG.png",

      url: link || process.env.FRONTEND_URL 

    },
    data: {
      url: link || process.env.FRONTEND_URL 
    },
    fcmOptions: {
      link: link || process?.env?.FRONTEND_URL, // 👈 where user goes when clicked
    },
  },
});


export const sendToOne = async ({ token, title, body, icon, link }) => {
  // console.log(link)
  const message = buildMessage({ token, title, body, icon, link });

  const response = await admin.messaging().send(message);
  // console.log("Sent:", response);
};
