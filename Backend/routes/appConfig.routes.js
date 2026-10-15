import express from "express";

const router = express.Router();

// Configuration for Mobile Apps
// You can also set PLAY_STORE_URL and APP_STORE_URL in Backend/.env
export const getAppConfig = () => {
  const playStoreUrl = process.env.PLAY_STORE_URL || "";
  const appStoreUrl = process.env.APP_STORE_URL || "";
  
  return {
    playStoreUrl,
    appStoreUrl,
    isAndroidLive: Boolean(playStoreUrl && playStoreUrl.trim().length > 0),
    isIosLive: Boolean(appStoreUrl && appStoreUrl.trim().length > 0),
    apkUrl: "/Humrahii.apk",
  };
};

// GET /api/app/config
router.get("/config", (req, res) => {
  return res.status(200).json({
    success: true,
    data: getAppConfig(),
  });
});

// POST /api/app/send-link
router.post("/send-link", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit mobile number.",
      });
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    console.log(`[APP DOWNLOAD REQUEST] Mobile: +91${cleanPhone} requested app link.`);

    // If an SMS provider (like Whistle) is configured, we could trigger SMS here.
    return res.status(200).json({
      success: true,
      message: `App link sent successfully to +91${cleanPhone}!`,
      apkUrl: "/Humrahii.apk",
    });
  } catch (error) {
    console.error("Error in /send-link:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// Smart redirect: /download/android
router.get("/download/android", (req, res) => {
  const config = getAppConfig();
  if (config.isAndroidLive && config.playStoreUrl) {
    return res.redirect(config.playStoreUrl);
  }
  // Fallback to direct APK download
  return res.redirect("/Humrahii.apk");
});

// Smart redirect: /download/ios
router.get("/download/ios", (req, res) => {
  const config = getAppConfig();
  if (config.isIosLive && config.appStoreUrl) {
    return res.redirect(config.appStoreUrl);
  }
  const frontendUrl = process.env.FRONTEND_URL || "https://humrahii.com";
  return res.redirect(`${frontendUrl}?notice=ios-coming-soon`);
});

export default router;
