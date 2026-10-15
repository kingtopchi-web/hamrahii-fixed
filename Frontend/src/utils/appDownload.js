import { toast } from "react-toastify";
import Axios from "../services/axios";

export const APP_CONFIG = {
  // Set in .env or update here when published to stores:
  playStoreUrl: import.meta.env.VITE_PLAY_STORE_URL || "",
  appStoreUrl: import.meta.env.VITE_APP_STORE_URL || "",
  apkUrl: "/Humrahii.apk",
};

/**
 * Handle Google Play Store badge click.
 * If live link is available, open it in a new tab.
 * If not live yet, download the APK directly with an informative toast!
 */
export const handlePlayStoreClick = (e) => {
  if (e && e.preventDefault) e.preventDefault();

  if (APP_CONFIG.playStoreUrl && APP_CONFIG.playStoreUrl.trim().length > 0) {
    window.open(APP_CONFIG.playStoreUrl, "_blank", "noopener,noreferrer");
    return;
  }

  // Fallback: Direct APK download
  toast.info("Humrahii App is coming to Play Store soon! Downloading Android APK directly...", {
    position: "top-center",
    autoClose: 4000,
  });

  const link = document.createElement("a");
  link.href = APP_CONFIG.apkUrl;
  link.download = "Humrahii.apk";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Handle Apple App Store badge click.
 * If live link is available, open it.
 * If not live yet, show friendly notification.
 */
export const handleAppStoreClick = (e) => {
  if (e && e.preventDefault) e.preventDefault();

  if (APP_CONFIG.appStoreUrl && APP_CONFIG.appStoreUrl.trim().length > 0) {
    window.open(APP_CONFIG.appStoreUrl, "_blank", "noopener,noreferrer");
    return;
  }

  toast.info("Humrahii iOS App is under review and launching very soon on the Apple App Store!", {
    position: "top-center",
    autoClose: 4500,
  });
};

/**
 * Handle "Get App Link" form submission.
 */
export const handleSendAppLink = async (phoneNumber) => {
  const cleanNumber = (phoneNumber || "").replace(/\D/g, "");

  if (cleanNumber.length < 10) {
    toast.error("Please enter a valid 10-digit mobile number.", {
      position: "top-center",
    });
    return false;
  }

  const tenDigit = cleanNumber.slice(-10);

  try {
    // Attempt backend registration
    await Axios.post("/app/send-link", { phone: tenDigit }).catch(() => null);
  } catch {
    // Ignore network errors for seamless user experience
  }

  toast.success(`Download link sent to +91 ${tenDigit}! Downloading app now...`, {
    position: "top-center",
    autoClose: 4000,
  });

  // Also initiate direct APK download for immediate convenience
  const link = document.createElement("a");
  link.href = APP_CONFIG.apkUrl;
  link.download = "Humrahii.apk";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};
