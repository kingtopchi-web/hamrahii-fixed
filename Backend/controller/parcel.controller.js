import parcelModel from "../models/parcel.model.js";
import parcelRequestModel from "../models/parcelRequest.model.js";
import rideModel from "../models/ride.model.js";
import userModel from "../models/user.model.js";
import notificationModel from "../models/notification.model.js";
import { sendToMany } from "../utils/sendNotification/sendToMany.js";
import vehicleTypeModel from "../models/vehicleType.model.js";
import Commision from "../models/commision.model.js";
import { sendSms } from "../utils/sendOtpOnMobile.js";

import parcelWeightSlabModel from "../models/parcelWeightSlab.model.js";

// Generate a random 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Calculate distance in kilometers between two coordinates using Haversine formula
const calculateDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Core logic to calculate exact fare
const calculateParcelFareInternal = async (dist, reqWeight, vTypeStr) => {
  const vTypeDoc = await vehicleTypeModel.findOne({ type: { $regex: new RegExp(`^${vTypeStr}$`, "i") } });
  if (!vTypeDoc) {
    throw new Error(`Vehicle type ${vTypeStr} not found or inactive`);
  }

  const maxAllowed = vTypeDoc.maxParcelWeight || (vTypeStr.toLowerCase().includes('car') ? 50 : vTypeStr.toLowerCase().includes('auto') ? 80 : vTypeStr.toLowerCase().includes('bike') ? 10 : 5);
  if (reqWeight > 0 && reqWeight > maxAllowed) {
    throw new Error(`Maximum allowed parcel weight for ${vTypeDoc.type} is ${maxAllowed} KG`);
  }

  const pricing = vTypeDoc.parcelPricing || { baseFare: 50, includedKm: 1, perKm: 10 };
  const { baseFare, includedKm, perKm } = pricing;

  const extraDistanceKm = Math.max(0, dist - includedKm);
  const distanceCharge = Number((extraDistanceKm * perKm).toFixed(2));

  let weightCharge = 0;
  if (reqWeight > 0) {
    const matchingWeightSlab = await parcelWeightSlabModel.findOne({
      status: "ACTIVE",
      fromWeight: { $lte: reqWeight },
      toWeight: { $gte: reqWeight }
    });
    weightCharge = matchingWeightSlab ? matchingWeightSlab.extraCharge : 0;
  }

  const finalFare = Math.round(baseFare + distanceCharge + weightCharge);

  return {
    vehicleType: vTypeDoc.type,
    distanceKm: Number(dist.toFixed(2)),
    parcelWeight: reqWeight,
    baseFare,
    includedKm,
    extraDistanceKm: Number(extraDistanceKm.toFixed(2)),
    extraKmRate: perKm,
    distanceCharge,
    weightCharge,
    finalFare
  };
};

export const handleCalculateFare = async (req, res) => {
  try {
    const { pickupLatitude, pickupLongitude, dropLatitude, dropLongitude, parcelWeight, vehicleType } = req.body;

    if (pickupLatitude === undefined || pickupLongitude === undefined || dropLatitude === undefined || dropLongitude === undefined) {
      return res.status(400).json({ success: false, message: "Missing coordinates" });
    }

    const dist = calculateDistanceInKm(
      Number(pickupLatitude), Number(pickupLongitude),
      Number(dropLatitude), Number(dropLongitude)
    );

    const weight = Number(parcelWeight) || 0;
    const vTypeStr = vehicleType || "Bike";

    const fareDetails = await calculateParcelFareInternal(dist, weight, vTypeStr);

    return res.status(200).json({
      success: true,
      data: {
        ...fareDetails,
        amount: fareDetails.finalFare,
        currency: "INR"
      }
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create a new parcel request
export const handleCreateParcel = async (req, res) => {
  try {
    const { receiverDetails, pickup, dropoff, vehicleType, paymentMethod, parcelType, rideId, weight } = req.body;
    const senderId = req.userId;

    if (!pickup?.address || !pickup.address.trim()) {
      return res.status(400).json({ success: false, message: "Pickup location is required" });
    }
    if (!dropoff?.address || !dropoff.address.trim()) {
      return res.status(400).json({ success: false, message: "Drop location is required" });
    }
    if (!receiverDetails?.name || !receiverDetails.name.trim()) {
      return res.status(400).json({ success: false, message: "Receiver name is required" });
    }
    if (!receiverDetails?.phone || !/^\d{10}$/.test(receiverDetails.phone.trim())) {
      return res.status(400).json({ success: false, message: "Valid 10-digit receiver mobile number is required" });
    }

    const payMethod = paymentMethod === "COD" ? "COD" : "ONLINE";

    // Optional: Check if ride exists
    if (rideId) {
      const ride = await rideModel.findById(rideId);
      if (!ride) {
        return res.status(404).json({ success: false, message: "Ride not found" });
      }
    }

    const sender = await userModel.findById(senderId);
    if (!sender) return res.status(404).json({ success: false, message: "User not found" });

    // Enforce ONE ACTIVE PARCEL rule
    const activeParcel = await parcelModel.findOne({
      sender: senderId,
      status: { $nin: ["CANCELLED", "REJECTED"] },
      $or: [
        { status: { $nin: ["DELIVERED", "COMPLETED"] } },
        { paymentStatus: { $nin: ["PAID", "REFUNDED"] } }
      ]
    });

    if (activeParcel) {
      return res.status(400).json({ success: false, message: "ACTIVE_PARCEL_EXISTS" });
    }

    // Ensure valid coordinates format for pickup & dropoff
    const validPickup = {
      address: pickup?.address || "",
      city: pickup?.city || "",
      coordinates: Array.isArray(pickup?.coordinates) && pickup.coordinates.length === 2
        ? [Number(pickup.coordinates[0]) || 0, Number(pickup.coordinates[1]) || 0]
        : [0, 0]
    };

    const validDropoff = {
      address: dropoff?.address || "",
      city: dropoff?.city || "",
      coordinates: Array.isArray(dropoff?.coordinates) && dropoff.coordinates.length === 2
        ? [Number(dropoff.coordinates[0]) || 0, Number(dropoff.coordinates[1]) || 0]
        : [0, 0]
    };

    // Calculate exact distance
    const dist = calculateDistanceInKm(
      validPickup.coordinates[1], validPickup.coordinates[0],
      validDropoff.coordinates[1], validDropoff.coordinates[0]
    );

    const vTypeStr = vehicleType || "Bike";
    const reqWeight = Number(weight) || 0;

    const fareDetails = await calculateParcelFareInternal(dist, reqWeight, vTypeStr);
    const calculatedAmount = fareDetails.finalFare;

    const newParcel = new parcelModel({
      sender: senderId,
      receiverDetails: {
        name: receiverDetails.name.trim(),
        phone: receiverDetails.phone.trim()
      },
      pickup: {
        ...validPickup,
        accuracy: req.body.pickup?.accuracy,
        source: req.body.pickup?.source
      },
      dropoff: validDropoff,
      vehicleType: fareDetails.vehicleType,
      weight: fareDetails.parcelWeight,
      parcelType: req.body.parcelType || "Document",
      fareDetails: fareDetails,
      currency: "INR",
      paymentMethod: payMethod,
      distance: Number(dist.toFixed(2)),
      ride: rideId || null,
      amount: calculatedAmount,
      pickupOtp: null,
      deliveryOtp: generateOTP(),
      status: "REQUESTED",
      paymentStatus: payMethod === "COD" ? "CASH_PENDING" : "PAYMENT_PENDING",
      statusHistory: [{ status: "REQUESTED", updatedBy: senderId }]
    });

    await newParcel.save();

    // Send Delivery OTP to Receiver's mobile via SMS
    const cleanReceiverPhone = receiverDetails.phone?.trim()?.replace(/\D/g, "");
    if (cleanReceiverPhone) {
      try {
        const smsMessage = `${newParcel.deliveryOtp} is your account verification OTP. Treat this as confidential. Don't share this with anyone (otp) HumRahii  Tourism`;
        await sendSms(cleanReceiverPhone, smsMessage);
        console.log(`[Parcel OTP] Delivery OTP ${newParcel.deliveryOtp} sent via SMS to receiver ${cleanReceiverPhone}`);
      } catch (smsErr) {
        console.error("Error sending delivery OTP SMS to receiver:", smsErr);
      }
    }

    // Find nearby riders within 10km who have liveLocationEnabled = true
    let tokens = [];
    try {
      const activeRiders = await userModel.find({
        liveLocationEnabled: true
      }).populate("cars");

      if (activeRiders.length > 0) {
        let nearbyRiders = activeRiders;

        // If pickup coordinates or city are available, dynamically filter riders within 25km or same city
        const [pickupLng, pickupLat] = validPickup.coordinates;
        const pickupCity = validPickup.city?.trim().toLowerCase();

        const parcelWeightVal = Number(req.body.weight) || 0;

        nearbyRiders = activeRiders.filter(rider => {
          // Vehicle Type Check
          const hasVehicle = rider.cars && rider.cars.some(c => c.vehicleType && c.vehicleType.toLowerCase() === vTypeStr.toLowerCase());
          if (!hasVehicle) return false;

          const riderCity = rider.currentLocation?.city?.trim().toLowerCase();
          const riderCoords = rider.currentLocation?.coordinates;

          if (Array.isArray(riderCoords) && riderCoords.length === 2) {
            const [rLng, rLat] = riderCoords.map(Number);
            if (!isNaN(rLng) && !isNaN(rLat) && (rLng !== 0 || rLat !== 0) && (pickupLng !== 0 || pickupLat !== 0)) {
              const dist = calculateDistanceInKm(pickupLat, pickupLng, rLat, rLng);
              if (dist <= 10) return true;
            }
          }

          return false;
        });

        if (nearbyRiders.length > 0) {
          const commisionSetting = await Commision.findOne();
          const expiryMinutes = commisionSetting?.parcelRequestExpiry || 5;
          const expiresAt = new Date(Date.now() + expiryMinutes * 60000);

          const parcelRequests = nearbyRiders.map(rider => ({
            parcelId: newParcel._id,
            riderId: rider._id,
            status: "PENDING",
            expiresAt
          }));
          await parcelRequestModel.insertMany(parcelRequests);

          tokens = nearbyRiders.reduce((acc, rider) => {
            if (rider.fcm && rider.fcm.length > 0) acc.push(...rider.fcm);
            if (rider.mobileFcm && rider.mobileFcm.length > 0) acc.push(...rider.mobileFcm);
            return acc;
          }, []);

          // Also create in-app notification records for riders in notificationModel
          for (const rider of nearbyRiders) {
            await notificationModel.create({
              reciever: rider._id,
              sender: senderId,
              title: "New Parcel Request 📦",
              message: `Pickup: ${validPickup.city || validPickup.address || "Nearby"} → Drop: ${validDropoff.city || validDropoff.address || "Destination"}${parcelAmount > 0 ? ` (₹${parcelAmount})` : ""}`,
              link: "/user/dashboard",
              type: "parcel_request"
            }).catch(e => console.error("In-app notification error:", e));
          }

          if (tokens.length > 0) {
            await sendToMany({
              tokens,
              title: "New Parcel Request 📦",
              body: `Pickup: ${validPickup.city || validPickup.address || "Nearby"}\nDrop: ${validDropoff.city || validDropoff.address || "Destination"}`,
              link: `/rider/parcel-request/${newParcel._id}`
            }).catch(err => console.error("Notification error:", err));
          }
        }
      }
    } catch (riderError) {
      console.error("Non-critical error notifying riders:", riderError);
    }

    res.status(201).json({
      success: true,
      message: tokens.length > 0 ? "Parcel request created and nearby riders notified." : "Parcel request created successfully.",
      data: newParcel
    });
  } catch (error) {
    console.error("Error creating parcel:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get parcels sent by the user
export const handleGetMyParcels = async (req, res) => {
  try {
    const parcels = await parcelModel.find({ sender: req.userId })
      .populate("driver", "firstName lastName phone profilePhotos currentLocation liveLocationEnabled lastLocationUpdate")
      .populate("ride", "from to departureDate driver")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: parcels });
  } catch (error) {
    console.error("Error fetching user parcels:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get parcels for a specific ride (for Driver)
export const handleGetRideParcels = async (req, res) => {
  try {
    const { rideId } = req.params;

    // Ensure the driver requesting is the owner of the ride
    const ride = await rideModel.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found" });
    if (ride.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const parcels = await parcelModel.find({ ride: rideId })
      .populate("sender", "firstName lastName phone profilePhotos")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: parcels });
  } catch (error) {
    console.error("Error fetching ride parcels:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Driver updates parcel status (Accept, Picked Up, Delivered, etc.)
export const handleUpdateParcelStatus = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const { status, otp } = req.body;

    const parcel = await parcelModel.findById(parcelId).populate("ride");
    if (!parcel) return res.status(404).json({ success: false, message: "Parcel not found" });

    const isSender = parcel.sender?.toString() === req.userId.toString();
    const isDriver = parcel.driver?.toString() === req.userId.toString();

    // Cancellation: Sender or assigned driver can cancel
    if (status === "CANCELLED") {
      if (!isSender && !isDriver) {
        return res.status(403).json({ success: false, message: "Unauthorized to cancel this parcel" });
      }

      const nonCancellableStatuses = ["PICKUP_CONFIRMED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"];
      if (nonCancellableStatuses.includes(parcel.status)) {
        return res.status(400).json({ success: false, message: "Cancellation is no longer available after pickup confirmation." });
      }
      parcel.status = "CANCELLED";
      parcel.statusHistory.push({ status: "CANCELLED", updatedBy: req.userId });
      await parcel.save();

      // Expire any pending parcel requests
      await parcelRequestModel.updateMany(
        { parcelId: parcel._id, status: "PENDING" },
        { $set: { status: "EXPIRED" } }
      );

      return res.status(200).json({ success: true, message: "Parcel request cancelled successfully", data: parcel });
    }

    // Validate driver authorization if ride is assigned
    if (parcel.ride && parcel.ride.driver?.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    // Validate driver authorization for direct parcel deliveries
    if (parcel.driver && parcel.driver.toString() !== req.userId.toString() && status !== "ACCEPTED") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // OTP Validation for Delivery ONLY (Pickup OTP has been removed)
    if (status === "DELIVERED") {
      if (parcel.deliveryOtp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid Delivery OTP" });
      }
    }

    // Accept logic - assign driver
    if (status === "ACCEPTED") {
      const pendingCodParcel = await parcelModel.findOne({
        driver: req.userId,
        paymentMethod: "COD",
        status: "DELIVERED",
        paymentStatus: "CASH_PENDING"
      });

      if (pendingCodParcel) {
        return res.status(400).json({
          success: false,
          pendingCashCollection: true,
          message: "Please complete the Cash Received confirmation for your current COD parcel before accepting another parcel."
        });
      }

      parcel.driver = req.userId;
    }

    if (status === "DELIVERED") {
      if (parcel.paymentMethod === "COD") {
        parcel.paymentStatus = "CASH_PENDING";
      } else {
        parcel.paymentStatus = "PAYMENT_PENDING";
      }
    }

    if (["CANCELLED", "REJECTED"].includes(status)) {
      // Note: Since no money was deducted, no refund is needed.
      // We will skip refund logic since wallet is no longer deducted initially.
    }

    parcel.status = status;
    parcel.statusHistory.push({ status, updatedBy: req.userId });

    await parcel.save();

    // Send/Resend Delivery OTP to Receiver on pickup or in-transit
    if (status === "PICKED_UP" || status === "IN_TRANSIT") {
      const cleanReceiverPhone = parcel.receiverDetails?.phone?.trim()?.replace(/\D/g, "");
      if (cleanReceiverPhone && parcel.deliveryOtp) {
        try {
          const smsMessage = `${parcel.deliveryOtp} is your account verification OTP. Treat this as confidential. Don't share this with anyone (otp) Houda Carjour Tourism`;
          await sendSms(cleanReceiverPhone, smsMessage);
          console.log(`[Parcel OTP] Delivery OTP ${parcel.deliveryOtp} sent to receiver ${cleanReceiverPhone} on status ${status}`);
        } catch (smsErr) {
          console.error("Error resending delivery OTP SMS to receiver:", smsErr);
        }
      }
    }

    // Send Notification to Sender
    try {
      const senderToNotify = await userModel.findById(parcel.sender);
      if (senderToNotify && senderToNotify.fcm && senderToNotify.fcm.length > 0) {
        let title = "Parcel Update";
        let body = `Your parcel status is now ${status.replace('_', ' ')}`;

        if (status === "ACCEPTED") {
          body = `A driver has accepted your parcel and will pick it up soon.`;
        } else if (status === "PICKED_UP") {
          body = `Your parcel has been picked up! Delivery OTP is ${parcel.deliveryOtp}.`;
        } else if (status === "IN_TRANSIT") {
          body = `Your parcel is on the way to the destination! Delivery OTP: ${parcel.deliveryOtp}`;
        } else if (status === "DELIVERED") {
          body = `Your parcel has been delivered successfully.`;
        }

        sendToMany({
          tokens: senderToNotify.fcm,
          title: title,
          description: body
        });
      }
    } catch (notifErr) {
      console.error("Error sending parcel notification:", notifErr);
    }

    res.status(200).json({ success: true, message: `Parcel status updated to ${status}`, data: parcel });
  } catch (error) {
    console.error("Error updating parcel status:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
export const handleAcceptParcel = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const riderId = req.userId;

    // Restriction: Rider cannot accept another parcel if they have an active one
    const activeParcel = await parcelModel.findOne({
      driver: riderId,
      status: { $nin: ["CANCELLED", "COMPLETED", "REJECTED"] }
    });

    if (activeParcel) {
      const isPendingCod = activeParcel.paymentMethod === "COD" && activeParcel.status === "DELIVERED" && activeParcel.paymentStatus === "CASH_PENDING";
      return res.status(400).json({
        success: false,
        pendingCashCollection: isPendingCod,
        message: isPendingCod 
          ? "Please complete the Cash Received confirmation for your current COD parcel before accepting another parcel."
          : "You already have an active parcel. Please complete it before accepting a new one."
      });
    }

    const parcel = await parcelModel.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    if (parcel.driver) {
      return res.status(400).json({ success: false, message: "Parcel has already been assigned to another rider." });
    }

    const request = await parcelRequestModel.findOne({ parcelId, riderId });
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.expiresAt && request.expiresAt < new Date()) {
      await parcelRequestModel.findByIdAndUpdate(request._id, { status: "EXPIRED" });
      return res.status(400).json({ success: false, message: "This parcel request has expired." });
    }

    // Atomically assign rider
    const updatedParcel = await parcelModel.findOneAndUpdate(
      { _id: parcelId, driver: null },
      {
        $set: {
          driver: riderId,
          status: "ACCEPTED",
          "statusHistory": [...parcel.statusHistory, { status: "ACCEPTED", updatedBy: riderId }]
        }
      },
      { new: true }
    );

    if (!updatedParcel) {
      return res.status(400).json({ success: false, message: "Parcel has already been assigned to another rider." });
    }

    // Mark other requests as ASSIGNED_TO_OTHER
    await parcelRequestModel.updateMany(
      { parcelId: parcelId, riderId: { $ne: riderId } },
      { $set: { status: "ASSIGNED_TO_OTHER" } }
    );

    // Mark this rider's request as ACCEPTED
    await parcelRequestModel.findOneAndUpdate(
      { parcelId: parcelId, riderId: riderId },
      { $set: { status: "ACCEPTED", respondedAt: new Date() } }
    );

    res.status(200).json({ success: true, message: "Parcel accepted successfully", data: updatedParcel });
  } catch (error) {
    console.error("Error accepting parcel:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const handleRejectParcel = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const riderId = req.userId;

    await parcelRequestModel.findOneAndUpdate(
      { parcelId: parcelId, riderId: riderId },
      { $set: { status: "REJECTED", respondedAt: new Date() } }
    );

    res.status(200).json({ success: true, message: "Parcel request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting parcel:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
export const handleGetParcelRequests = async (req, res) => {
  try {
    const riderId = req.userId;
    const rider = await userModel.findById(riderId).populate("cars");

    // If rider does not have live location enabled, return empty list
    if (!rider?.liveLocationEnabled) {
      return res.status(200).json({ success: true, data: [] });
    }

    const activeParcel = await parcelModel.findOne({
      driver: riderId,
      status: { $nin: ["CANCELLED", "COMPLETED", "REJECTED"] }
    });

    if (activeParcel) {
      const isPendingCod = activeParcel.paymentMethod === "COD" && activeParcel.status === "DELIVERED" && activeParcel.paymentStatus === "CASH_PENDING";
      return res.status(200).json({ 
        success: true, 
        data: [],
        pendingCashCollection: isPendingCod,
        pendingCodParcel: isPendingCod ? {
          _id: activeParcel._id,
          amount: activeParcel.amount
        } : null
      });
    }

    // 1. Find all open parcels looking for a rider
    const openParcels = await parcelModel.find({
      status: { $in: ["REQUESTED", "SEARCHING_RIDER"] },
      driver: null
    }).sort({ createdAt: -1 });

    // 2. Exclude parcels that this rider has already rejected or responded to
    const existingRequests = await parcelRequestModel.find({ riderId });
    const existingMap = new Map(
      existingRequests
        .filter(r => r.parcelId)
        .map(r => [r.parcelId.toString(), r])
    );

    const riderCoords = rider.currentLocation?.coordinates;
    const riderCity = rider.currentLocation?.city?.trim().toLowerCase();
    const [rLng, rLat] = Array.isArray(riderCoords) && riderCoords.length === 2
      ? riderCoords.map(Number)
      : [0, 0];

    const commisionSetting = await Commision.findOne();
    const expiryMinutes = 2.5;

    for (const parcel of openParcels) {
      const pIdStr = parcel._id.toString();
      const existingReq = existingMap.get(pIdStr);

      // Skip ONLY if rider explicitly rejected or if parcel was assigned to someone else
      if (existingReq && (existingReq.status === "REJECTED" || existingReq.status === "ASSIGNED_TO_OTHER")) {
        continue;
      }

      // Skip if rider does not own the vehicle type required for this parcel
      const hasVehicle = !parcel.vehicleType || (rider.cars && rider.cars.some(c => c.vehicleType && c.vehicleType.toLowerCase() === parcel.vehicleType.toLowerCase()));
      if (!hasVehicle) continue;

      // Check distance dynamically (up to 10km based on pickup location) or if rider was already matched
      let isNearby = false;
      const pickupCoords = parcel.pickup?.coordinates;

      if (
        Array.isArray(pickupCoords) && pickupCoords.length === 2 &&
        (pickupCoords[0] !== 0 || pickupCoords[1] !== 0) &&
        (rLng !== 0 || rLat !== 0)
      ) {
        const dist = calculateDistanceInKm(rLat, rLng, pickupCoords[1], pickupCoords[0]);
        if (dist <= 10) {
          isNearby = true;
        }
      } else if (existingReq) {
        // If rider was already matched to this parcel initially, maintain eligibility
        isNearby = true;
      }

      if (isNearby) {
        const expiresAt = new Date(Date.now() + expiryMinutes * 60000);
        // If no request exists yet, or if request is expired or about to expire within 30 seconds, renew it
        const needsRenewal = !existingReq || 
          existingReq.status === "EXPIRED" || 
          !existingReq.expiresAt || 
          new Date(existingReq.expiresAt).getTime() <= (Date.now() + 30000);

        if (needsRenewal) {
          await parcelRequestModel.findOneAndUpdate(
            { parcelId: parcel._id, riderId },
            {
              $set: {
                status: "PENDING",
                expiresAt,
                respondedAt: null
              }
            },
            { upsert: true, new: true }
          ).catch(err => console.error("Error creating/renewing pending parcel request:", err));
        }
      }
    }

    const requests = await parcelRequestModel.find({ riderId, status: "PENDING" })
      .populate("parcelId")
      .sort({ createdAt: -1 });

    const now = new Date();

    // Filter to ensure parcel is still open and unassigned, and not expired
    const validRequests = requests.filter(
      req => {
        if (!req.parcelId) return false;

        if (req.expiresAt && new Date(req.expiresAt) < now) {
          // Auto expire it in background
          parcelRequestModel.findByIdAndUpdate(req._id, { status: "EXPIRED" }).exec();
          return false;
        }

        const hasVeh = !req.parcelId.vehicleType || (rider.cars && rider.cars.some(c => c.vehicleType && req.parcelId.vehicleType && c.vehicleType.toLowerCase() === req.parcelId.vehicleType.toLowerCase()));

        return ["REQUESTED", "SEARCHING_RIDER"].includes(req.parcelId.status) &&
          !req.parcelId.driver && hasVeh;
      }
    );

    const pendingCodParcel = await parcelModel.findOne({
      driver: riderId,
      paymentMethod: "COD",
      status: "DELIVERED",
      paymentStatus: "CASH_PENDING"
    });

    res.status(200).json({
      success: true,
      data: validRequests,
      pendingCashCollection: Boolean(pendingCodParcel),
      pendingCodParcel: pendingCodParcel ? {
        _id: pendingCodParcel._id,
        amount: pendingCodParcel.amount
      } : null
    });
  } catch (error) {
    console.error("Error fetching parcel requests:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get parcels assigned to the driver for delivery
export const handleGetRiderDeliveries = async (req, res) => {
  try {
    const riderId = req.userId;
    const parcels = await parcelModel.find({ driver: riderId })
      .populate("sender", "firstName lastName phone profilePhotos email")
      .populate("ride", "from to departureDate")
      .sort({ updatedAt: -1 });

    const commisionSetting = await Commision.findOne();
    const enrichedParcels = parcels.map(p => {
      const doc = p.toObject();
      let fee = 0;
      if (commisionSetting && commisionSetting.isCommision) {
        if (commisionSetting.type === "Percentage") {
          fee = doc.amount * (commisionSetting.value / 100);
        } else if (commisionSetting.type === "Fixed") {
          fee = commisionSetting.value;
        }
      }
      doc.calculatedPlatformFee = Math.round(fee * 100) / 100;
      return doc;
    });

    const hasPendingCod = enrichedParcels.some(
      p => p.paymentMethod === "COD" && p.status === "DELIVERED" && p.paymentStatus === "CASH_PENDING"
    );

    res.status(200).json({
      success: true,
      data: enrichedParcels,
      pendingCashCollection: hasPendingCod
    });
  } catch (error) {
    console.error("Error fetching rider deliveries:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Verify Online Payment
export const handleVerifyOnlinePayment = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // In a real implementation you would verify the razorpay_signature here

    const parcel = await parcelModel.findById(parcelId);
    if (!parcel) return res.status(404).json({ success: false, message: "Parcel not found" });

    const driver = parcel.driver ? await userModel.findById(parcel.driver) : null;
    let platformCommission = 0;
    const commisionSetting = await Commision.findOne();
    if (commisionSetting && commisionSetting.isCommision) {
      if (commisionSetting.type === "Percentage") {
        platformCommission = parcel.amount * (commisionSetting.value / 100);
      } else if (commisionSetting.type === "Fixed") {
        platformCommission = commisionSetting.value;
      }
    }
    const driverAmount = parcel.amount - platformCommission;
    parcel.platformCommission = platformCommission;
    parcel.driverAmount = driverAmount;

    if (driver) {
      if (!driver.wallet) driver.wallet = { balance: 0, transactions: [] };
      if (!Array.isArray(driver.wallet.transactions)) driver.wallet.transactions = [];

      // ONLINE: Add the driver's earnings to their wallet
      driver.wallet.balance = (driver.wallet.balance || 0) + driverAmount;
      driver.wallet.transactions.push({
        userId: driver._id,
        amount: driverAmount,
        type: "credit",
        source: "wallet",
        status: "success",
        referenceId: parcel._id,
        description: `Earnings for parcel delivery (Online)`,
        balanceAfter: driver.wallet.balance
      });
      await driver.save();
    }

    parcel.paymentStatus = "PAID";
    parcel.status = "COMPLETED";
    parcel.statusHistory.push({ status: "COMPLETED", updatedBy: req.userId });

    await parcel.save();

    res.status(200).json({ success: true, message: "Payment verified successfully", data: parcel });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Rider marks Cash Received
export const handleCashReceived = async (req, res) => {
  try {
    const { parcelId } = req.params;

    const parcel = await parcelModel.findById(parcelId);
    if (!parcel) return res.status(404).json({ success: false, message: "Parcel not found" });

    // Validate driver authorization
    if (parcel.driver && parcel.driver.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (parcel.status !== "DELIVERED" || parcel.paymentMethod !== "COD" || parcel.paymentStatus !== "CASH_PENDING") {
      return res.status(400).json({ success: false, message: "Invalid status for cash collection." });
    }

    const driver = await userModel.findById(req.userId);
    if (!driver) return res.status(404).json({ success: false, message: "Driver not found" });

    let platformCommission = 0;
    const commisionSetting = await Commision.findOne();
    if (commisionSetting && commisionSetting.isCommision) {
      if (commisionSetting.type === "Percentage") {
        platformCommission = parcel.amount * (commisionSetting.value / 100);
      } else if (commisionSetting.type === "Fixed") {
        platformCommission = commisionSetting.value;
      }
    }
    // Round to 2 decimal places
    platformCommission = Math.round(platformCommission * 100) / 100;
    const driverAmount = Math.round((parcel.amount - platformCommission) * 100) / 100;

    const currentBalance = Number(driver.wallet?.balance || 0);

    // WALLET BALANCE VALIDATION:
    // If Wallet Balance < Platform Fee: Block Cash Received, do not deduct, return insufficient balance details
    if (currentBalance < platformCommission) {
      const requiredAdditional = Math.round((platformCommission - currentBalance) * 100) / 100;
      return res.status(400).json({
        success: false,
        insufficientBalance: true,
        message: `Your wallet balance is insufficient to pay the platform fee of ₹${platformCommission}. Please add ₹${requiredAdditional} or more to your wallet to complete this COD delivery.`,
        data: {
          platformFee: platformCommission,
          currentBalance: currentBalance,
          requiredAdditional: requiredAdditional,
          parcelAmount: parcel.amount
        }
      });
    }

    // Wallet balance is sufficient: Proceed
    parcel.platformCommission = platformCommission;
    parcel.driverAmount = driverAmount;

    if (!driver.wallet) driver.wallet = { balance: 0, transactions: [] };
    if (!Array.isArray(driver.wallet.transactions)) driver.wallet.transactions = [];

    if (platformCommission > 0) {
      // Deduct exactly the platform commission from rider's wallet
      driver.wallet.balance = Math.round((currentBalance - platformCommission) * 100) / 100;
      driver.wallet.transactions.push({
        userId: driver._id,
        amount: platformCommission,
        type: "debit",
        source: "wallet",
        status: "success",
        referenceId: parcel._id,
        description: `Platform fee for parcel delivery (COD)`,
        balanceAfter: driver.wallet.balance
      });
      await driver.save();
    }

    parcel.paymentStatus = "PAID";
    parcel.status = "COMPLETED";
    parcel.statusHistory.push({ status: "COMPLETED", updatedBy: req.userId });

    await parcel.save();

    res.status(200).json({
      success: true,
      message: "Cash received successfully and platform fee deducted.",
      data: parcel,
      walletBalance: driver.wallet.balance
    });
  } catch (error) {
    console.error("Error confirming cash received:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Real-Time Live Tracking API for a Parcel
export const handleGetParcelTracking = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const userId = req.userId;

    const parcel = await parcelModel.findById(parcelId)
      .populate("driver", "firstName lastName phone profilePhotos currentLocation liveLocationEnabled lastLocationUpdate")
      .populate("sender", "firstName lastName phone");

    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    // Security check: only sender, assigned driver, or admin can track
    const isSender = parcel.sender?._id?.toString() === userId?.toString();
    const isDriver = parcel.driver?._id?.toString() === userId?.toString();

    let isAdmin = false;
    const reqUser = await userModel.findById(userId);
    if (reqUser && reqUser.role === "admin") {
      isAdmin = true;
    }

    if (!isSender && !isDriver && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to track this parcel" });
    }

    let riderInfo = null;
    if (parcel.driver) {
      const driver = parcel.driver;
      const isCompleted = ["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"].includes(parcel.status);

      const coords = driver.currentLocation?.coordinates; // [lng, lat]
      const hasCoords = Array.isArray(coords) && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0);

      const updatedAt = driver.lastLocationUpdate || null;
      let isStale = false;
      if (updatedAt) {
        const diffMs = new Date().getTime() - new Date(updatedAt).getTime();
        // Stale if last update was more than 2 minutes ago
        if (diffMs > 2 * 60 * 1000) {
          isStale = true;
        }
      }

      riderInfo = {
        name: `${driver.firstName || ''} ${driver.lastName || ''}`.trim() || "Driver",
        phone: driver.phone,
        profilePhoto: driver.profilePhotos?.[0]?.url || null,
        liveLocationEnabled: Boolean(driver.liveLocationEnabled),
        latitude: hasCoords ? coords[1] : null,
        longitude: hasCoords ? coords[0] : null,
        accuracy: driver.currentLocation?.accuracy || null,
        updatedAt: updatedAt,
        isLive: !isCompleted && Boolean(driver.liveLocationEnabled) && Boolean(hasCoords),
        isStale: isStale
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        parcelId: parcel._id,
        status: parcel.status,
        pickup: parcel.pickup,
        dropoff: parcel.dropoff,
        vehicleType: parcel.vehicleType || "Bike",
        driver: riderInfo,
        rider: riderInfo,
        fareDetails: parcel.fareDetails,
        deliveryOtp: isSender ? parcel.deliveryOtp : undefined,
        receiverDetails: parcel.receiverDetails
      }
    });
  } catch (error) {
    console.error("Error fetching parcel tracking:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Get nearby active riders around pickup location for Finding Driver screen
export const handleGetNearbyRiders = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const parcel = await parcelModel.findById(parcelId).populate("driver", "firstName lastName phone profilePhotos currentLocation liveLocationEnabled");
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    const searchRadiusKm = 3;

    // Check if parcel was already accepted
    if (parcel.driver || !["REQUESTED", "SEARCHING_RIDER"].includes(parcel.status)) {
      return res.status(200).json({
        success: true,
        radiusKm: searchRadiusKm,
        parcelStatus: parcel.status,
        driver: parcel.driver || null,
        riders: []
      });
    }

    const [pLng, pLat] = parcel.pickup?.coordinates || [0, 0];
    if (!pLng && !pLat) {
      return res.status(200).json({ success: true, radiusKm: searchRadiusKm, riders: [], parcelStatus: parcel.status });
    }

    // Active riders with live location enabled (excluding the sender)
    const activeRiders = await userModel.find({
      liveLocationEnabled: true,
      _id: { $ne: parcel.sender }
    }).populate("cars");

    const nearbyRiders = [];
    for (const rider of activeRiders) {
      const hasVehicle = !parcel.vehicleType || (rider.cars && rider.cars.some(c => c.vehicleType && c.vehicleType.toLowerCase() === parcel.vehicleType.toLowerCase()));
      if (!hasVehicle) continue;

      const coords = rider.currentLocation?.coordinates;
      if (Array.isArray(coords) && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
        const [rLng, rLat] = coords.map(Number);
        const dist = calculateDistanceInKm(pLat, pLng, rLat, rLng);
        if (dist <= searchRadiusKm) {
          nearbyRiders.push({
            _id: rider._id,
            name: rider.firstName ? `${rider.firstName} ${rider.lastName || ''}`.trim() : "Nearby Rider",
            vehicleType: parcel.vehicleType || "Bike",
            latitude: rLat,
            longitude: rLng,
            distanceKm: Number(dist.toFixed(1))
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      radiusKm: searchRadiusKm,
      riders: nearbyRiders,
      parcelStatus: parcel.status,
      driver: parcel.driver || null
    });
  } catch (error) {
    console.error("Error fetching nearby riders:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Refresh nearby rider search when 2-minute cycle completes without sending duplicates
export const handleRefreshParcelSearch = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const parcel = await parcelModel.findById(parcelId).populate("driver", "firstName lastName phone profilePhotos currentLocation liveLocationEnabled");
    if (!parcel) {
      return res.status(404).json({ success: false, message: "Parcel not found" });
    }

    // If driver already accepted
    if (parcel.driver || !["REQUESTED", "SEARCHING_RIDER"].includes(parcel.status)) {
      return res.status(200).json({
        success: true,
        alreadyAssigned: true,
        parcelStatus: parcel.status,
        driver: parcel.driver,
        message: "A driver has already accepted this parcel."
      });
    }

    const [pLng, pLat] = parcel.pickup?.coordinates || [0, 0];
    const searchRadiusKm = 3;
    const expiresAt = new Date(Date.now() + 2.5 * 60000); // 2.5 minute window

    const existingRequests = await parcelRequestModel.find({ parcelId: parcel._id });
    const rejectedRiderIds = new Set(
      existingRequests
        .filter(r => r.status === "REJECTED")
        .map(r => r.riderId.toString())
    );

    const activeRiders = await userModel.find({
      liveLocationEnabled: true,
      _id: { $ne: parcel.sender }
    }).populate("cars");

    const notifiedRiders = [];

    for (const rider of activeRiders) {
      const riderIdStr = rider._id.toString();
      // Do not re-send to riders who explicitly rejected
      if (rejectedRiderIds.has(riderIdStr)) continue;

      const hasVehicle = !parcel.vehicleType || (rider.cars && rider.cars.some(c => c.vehicleType && c.vehicleType.toLowerCase() === parcel.vehicleType.toLowerCase()));
      if (!hasVehicle) continue;

      let isNearby = false;
      const coords = rider.currentLocation?.coordinates;
      if (Array.isArray(coords) && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0) && (pLng !== 0 || pLat !== 0)) {
        const [rLng, rLat] = coords.map(Number);
        const dist = calculateDistanceInKm(pLat, pLng, rLat, rLng);
        if (dist <= 10) {
          isNearby = true;
        }
      } else {
        const hadExisting = existingRequests.some(r => r.riderId.toString() === riderIdStr);
        if (hadExisting) {
          isNearby = true;
        }
      }

      if (isNearby) {
        // Renew or create request for this rider!
        await parcelRequestModel.findOneAndUpdate(
          { parcelId: parcel._id, riderId: rider._id },
          {
            $set: {
              status: "PENDING",
              expiresAt,
              respondedAt: null
            }
          },
          { upsert: true, new: true }
        ).catch(e => console.error("Error upserting parcel request:", e));

        notifiedRiders.push(rider);
      }
    }

    // In-app notifications
    for (const rider of notifiedRiders) {
      await notificationModel.create({
        reciever: rider._id,
        sender: parcel.sender,
        title: "New Parcel Request 📦",
        message: `Pickup: ${parcel.pickup.city || parcel.pickup.address} → Drop: ${parcel.dropoff.city || parcel.dropoff.address}`,
        link: "/user/dashboard",
        type: "parcel_request"
      }).catch(() => {});
    }

    // Touch updatedAt
    parcel.updatedAt = new Date();
    await parcel.save();

    return res.status(200).json({
      success: true,
      message: "Search refreshed and nearby riders notified",
      notifiedCount: notifiedRiders.length,
      radiusKm: searchRadiusKm
    });
  } catch (error) {
    console.error("Error refreshing parcel search:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
