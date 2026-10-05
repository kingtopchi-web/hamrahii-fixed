import { sendToMultiple } from "../../config/firebase/sendMobileNotification.js";
import userModel from "../../models/user.model.js";
import notificationModel from "../../models/notification.model.js";
import { sendToMany } from "../sendNotification/sendToMany.js";

const NEARBY_RADIUS_KM = 30; // 30 km radius around pickup location

const chunkArray = (arr, size = 500) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const cleanTokens = (tokens = []) =>
  tokens
    .filter((t) => typeof t === "string" && t.trim() !== "")
    .map((t) => t.trim());

// Haversine formula to compute great-circle distance in kilometers
export const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Normalize coordinates to { lat, lng } regardless of order or structure
export const extractLatLng = (coords) => {
  if (!coords) return null;

  if (typeof coords === "object" && !Array.isArray(coords)) {
    const lat = Number(coords.lat ?? coords.latitude);
    const lng = Number(coords.lng ?? coords.longitude ?? coords.lon);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return { lat, lng };
    }
    return null;
  }

  if (!Array.isArray(coords) || coords.length < 2) return null;
  const v0 = Number(coords[0]);
  const v1 = Number(coords[1]);
  if (isNaN(v0) || isNaN(v1)) return null;
  if (v0 === 0 && v1 === 0) return null;

  // In India: Latitude is approx 6° to 38° N, Longitude is approx 68° to 98° E
  if (v0 >= 6 && v0 <= 38 && v1 >= 68 && v1 <= 98) {
    return { lat: v0, lng: v1 };
  }
  if (v1 >= 6 && v1 <= 38 && v0 >= 68 && v0 <= 98) {
    return { lat: v1, lng: v0 };
  }

  // Fallback: standard [-90, 90] lat, [-180, 180] lng
  if (Math.abs(v0) <= 90 && Math.abs(v1) <= 180) {
    return { lat: v0, lng: v1 };
  }

  return null;
};

export const handleSendNotificationOnRideCreate = async (ride) => {
  try {
    const rideCoords = extractLatLng(ride?.from?.coordinates);
    const rideCity = (ride?.from?.city || "").trim();
    const rideAddress = ride?.from?.address || rideCity || "your area";
    const toAddress = ride?.to?.address || ride?.to?.city || "destination";

    if (!rideCoords && !rideCity) {
      console.log("rideNotificationError: No pickup coordinates or city found. Terminated.");
      return { error: true, message: "No pickup coordinates or city found to send notification" };
    }

    // Exclude the driver who created the ride from receiving the broadcast
    const driverId = ride?.driver?._id
      ? String(ride?.driver?._id)
      : ride?.driver
      ? String(ride.driver)
      : null;

    // Query candidate users who have either FCM tokens or a recorded city/location
    const candidateUsers = await userModel
      .find({
        ...(driverId ? { _id: { $ne: driverId } } : {}),
        $or: [
          { "mobileFcm.0": { $exists: true } },
          { "fcm.0": { $exists: true } },
          { "currentLocation.city": { $exists: true, $ne: "" } },
        ],
      })
      .select("_id firstName currentLocation mobileFcm fcm");

    const nearbyUsers = [];

    for (const user of candidateUsers) {
      const userCoords = extractLatLng(user?.currentLocation?.coordinates);
      let isNearby = false;
      let distanceKm = null;

      if (rideCoords && userCoords) {
        // High accuracy: Haversine physical distance check
        distanceKm = calculateHaversineDistanceKm(
          rideCoords.lat,
          rideCoords.lng,
          userCoords.lat,
          userCoords.lng
        );

        if (distanceKm <= NEARBY_RADIUS_KM) {
          isNearby = true;
        }
      } else if (rideCity) {
        // Safe Fallback: Check city match if GPS coordinates aren't recorded yet
        const userCity = (user?.currentLocation?.city || "").trim().toLowerCase();
        const targetCity = rideCity.toLowerCase();
        if (
          userCity &&
          (userCity.includes(targetCity) || targetCity.includes(userCity))
        ) {
          isNearby = true;
        }
      }

      if (isNearby) {
        nearbyUsers.push({ user, distanceKm });
      }
    }

    console.log(
      `[RideNotification] Found ${nearbyUsers.length} nearby users within ${NEARBY_RADIUS_KM}km of ${rideCity || "origin"}`
    );

    if (nearbyUsers.length === 0) {
      return {
        success: true,
        message: "No nearby users found within radius",
        notifiedUsersCount: 0,
      };
    }

    const rideDetailsRoute = `/view-ride-details?id=${ride?._id}`;
    const frontendUrl = process.env.FRONTEND_URL || "https://humrahii.com";
    const rideDetailsUrl = `${frontendUrl}/view-ride-details?id=${ride?._id}`;

    // 1. Create In-App Notifications for nearby users in database
    const inAppDocs = nearbyUsers.map(({ user }) => ({
      reciever: user._id,
      sender: driverId || null,
      title: `🚗 New ride nearby: ${rideCity || "Pickup nearby"}`,
      message: `New ride available from ${rideAddress} to ${toAddress}. Tap to view details and book!`,
      link: rideDetailsRoute,
      type: "ride_alert",
      isRead: false,
    }));

    if (inAppDocs.length > 0) {
      try {
        await notificationModel.insertMany(inAppDocs, { ordered: false });
      } catch (dbErr) {
        console.log("In-app notification insert note:", dbErr?.message);
      }
    }

    // 2. Gather FCM push tokens for nearby users
    let webTokens = [];
    let mobileTokens = [];

    nearbyUsers.forEach(({ user }) => {
      webTokens.push(...(user.fcm || []));
      mobileTokens.push(...(user.mobileFcm || []));
    });

    webTokens = cleanTokens(webTokens);
    mobileTokens = cleanTokens(mobileTokens);

    console.log(
      `[RideNotification] Sending to ${webTokens.length} web tokens, ${mobileTokens.length} mobile tokens`
    );

    const webBatches = chunkArray(webTokens, 500);
    const mobileBatches = chunkArray(mobileTokens, 500);

    let webStats = { success: 0, failure: 0 };
    let mobileStats = { success: 0, failure: 0 };

    const notifTitle = `🚗 New ride nearby: ${rideCity || "Pickup nearby"}`;
    const notifBody = `Ride available from ${rideAddress} to ${toAddress}. Book now!`;

    // 3. Send Web FCM notifications in batches
    for (const batch of webBatches) {
      const res = await sendToMany({
        tokens: batch,
        title: notifTitle,
        body: notifBody,
        link: rideDetailsUrl,
      });

      webStats.success += res.successCount || 0;
      webStats.failure += res.failureCount || 0;
    }

    // 4. Send Mobile FCM notifications in batches
    for (const batch of mobileBatches) {
      const res = await sendToMultiple({
        tokens: batch,
        title: notifTitle,
        body: notifBody,
        route: rideDetailsRoute,
      });

      mobileStats.success += res.successCount || 0;
      mobileStats.failure += res.failureCount || 0;
    }

    console.log("🌐 Web stats:", webStats);
    console.log("📱 Mobile stats:", mobileStats);

    return {
      success: true,
      notifiedUsersCount: nearbyUsers.length,
      webStats,
      mobileStats,
    };
  } catch (error) {
    console.log(
      `rideNotificationError: ${
        error?.message || "Failed to send nearby ride notifications"
      }`
    );

    return {
      error: true,
      message: error?.message || "Some error occurred",
    };
  }
};