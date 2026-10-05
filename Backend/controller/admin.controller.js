import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import Ride from "../models/ride.model.js";
import {
  validateEmail,
  validateField,
  validateObjectId,
} from "../utils/validator/validateFields.js";
import { generateExpiryTime, generateOtp } from "../utils/helpers/generate.js";
import otpModel from "../models/otp.model.js";
import { sendEmailByType } from "../config/emailServices.js";
import jwt from "jsonwebtoken";
import rideModel from "../models/ride.model.js";
import customerSupport from "../models/customer.support.js";
import { sendToMany } from "../utils/sendNotification/sendToMany.js";
import bannerModel from "../models/banner.model.js";
import Commision from "../models/commision.model.js";
import notificationModel from "../models/notification.model.js";
import parcelModel from "../models/parcel.model.js";

export const handleGetAllParcels = async (req, res, next) => {
  try {
    const parcels = await parcelModel.find()
      .populate("sender", "firstName lastName name email phone")
      .populate("driver", "firstName lastName name email phone")
      .populate("ride", "from to")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Parcels fetched successfully",
      data: parcels,
    });
  } catch (error) {
    next(error);
  }
};

export const handleSendLoginOtp = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email, "Invalid email", res)) return;
    if (!validateField(password, "Password is required", res)) return;

    // console.log(req.body , "this is body ")

    const isUser = await userModel
      .findOne({ email, role: "admin" })
      .select("+password +name");

     console.log(isUser , "this is user ")

    if (!validateField(isUser?.password, "Admin not found", res)) return;

    const isMatch = await bcrypt.compareSync(password, isUser?.password);

    if (!validateField(isMatch, "Email or password not matched", res)) return;

    const otp = generateOtp(6);
    const expiresAt = generateExpiryTime(2);

    console.log(`\n========================================`);
    console.log(`🔑 [ADMIN LOGIN OTP] Email: ${email} -> OTP: ${otp}`);
    console.log(`========================================\n`);

    await otpModel.create({
      email,
      otp,
      expiresAt,
    });

    await sendEmailByType("ADMIN_LOGIN_OTP", email, {
      name: isUser?.name && email,
      otp,
      expiresAt,
    });

    return res.status(200).json({
      message: "Otp sended on mail",
      error: false,
      success: true,
      expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

export const handleVerifyOtpAndLogin = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!validateField(email, "Invalid email", res)) return;
    if (!validateField(otp, "Otp is required", res)) return;

    const isOtp = await otpModel.findOne({ email });

    if (!validateField(isOtp?.otp, "Otp not matched", res)) return;

    const now = new Date(Date.now());
    const isExpired = now > isOtp?.expiresAt;
    if (!validateField(!isExpired, "Otp Expired", res)) return;

    const enteredOtp = Array.isArray(otp) ? otp.join("").trim() : String(otp).trim();
    const savedOtp = String(isOtp?.otp).trim();
    const isMatch = enteredOtp === savedOtp;

    if (!validateField(isMatch, "Otp not matched", res)) return;

    const admin = await userModel.findOne({ email, role: "admin" });

    if (!validateField(admin, "Admin not found", res)) return;

    const token = jwt.sign({ adminId: admin?._id }, process.env.JWT_SECRET);

    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd, // true only in HTTPS prod
      sameSite: isProd ? "none" : "lax", // lax for localhost
      path: "/",
    };

    res.cookie("adminAccessToken", token, cookieOptions);

    await otpModel.findOneAndDelete({ email });

    return res.status(200).json({
      message: "Login succesfully",
      error: false,
      success: true,
      admin,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetAdminDetails = async (req, res, next) => {
  try {
    const adminId = req.body?.adminId || req.adminId;

    if (!validateObjectId(adminId, "Invalid Admin Id", res)) return;

    const isAdmin = await userModel.findOne({ _id: adminId, role: "admin" });

    if (!validateField(isAdmin?.email, "Admin not found", res)) return;

    return res.status(200).json({
      message: "These are admin details",
      error: false,
      success: true,
      admin: isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSingleUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!validateObjectId(userId, "Invalid User Id", res)) return;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const handleLogOut = async (req, res, next) => {
  try {
    res.clearCookie("adminAccessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/", // must match
    });

    return res.status(200).json({
      message: "Logout succesfully",
      error: false,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetAllUserWithPagination = async (req, res, next) => {
  try {
    const { query, isVerified, page = 1, limit = 20 } = req.body;

    const filters = {};

    // ✅ Support boolean and string verification filters
    if (typeof isVerified === "boolean") {
      filters.isVerified = isVerified ? { $in: ["verified", true] } : { $nin: ["verified", true] };
    } else if (typeof isVerified === "string" && isVerified.trim()) {
      const v = isVerified.trim().toLowerCase();
      if (v === "verified") {
        filters.isVerified = { $in: ["verified", true] };
      } else if (v === "unverified") {
        filters.isVerified = { $nin: ["verified", true] };
      } else {
        filters.isVerified = v;
      }
    }

    let searchConditions = [];

    if (query && query.trim()) {
      const search = query.trim();

      // 🔹 Name fuzzy: jhn → j.*h.*n
      const nameRegex = new RegExp(search.split("").join(".*"), "i");

      // 🔹 Email partial
      const emailRegex = new RegExp(search, "i");

      // 🔹 Phone / DL fuzzy (digits & chars)
      const normalized = search.replace(/[^a-zA-Z0-9]/g, "");
      const numberRegex =
        normalized.length >= 2
          ? new RegExp(normalized.split("").join(".*"), "i")
          : null;

      searchConditions = [
        // Name
        {
          $or: [
            { firstName: { $regex: nameRegex } },
            { lastName: { $regex: nameRegex } },
          ],
        },

        // Email
        { email: { $regex: emailRegex } },

        // Phone
        ...(numberRegex ? [{ phone: { $regex: numberRegex } }] : []),

        // DL Number
        ...(numberRegex ? [{ dl_number: { $regex: numberRegex } }] : []),
      ];
    }

    const finalQuery = {
      ...filters,
      ...(searchConditions.length > 0 && { $or: searchConditions }),
      role: "user",
    };

    const skip = (page - 1) * Number(limit);

    const [users, total, verifiedCount, unverifiedCount] = await Promise.all([
      userModel
        .find(finalQuery)
        .select("-password")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      userModel.countDocuments(finalQuery),
      userModel.countDocuments({ role: "user", isVerified: { $in: ["verified", true] } }),
      userModel.countDocuments({ role: "user", isVerified: { $nin: ["verified", true] } }),
    ]);

    res.status(200).json({
      success: true,
      total,
      verifiedCount,
      unverifiedCount,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};


export const handleUpdateUserVerificationStatus = async (req, res, next) => {
  try {
    const { adminId, status, message, userId } = req.body;

    if (!validateObjectId(adminId, "Admin id is required", res)) return;
    if (!validateObjectId(userId, "User id is required", res)) return;
    if (!validateField(status, "status is required", res)) return;
    if (!validateField(message, "message is required", res)) return;

    const isUser = await userModel.findById(userId);

    if (!validateField(isUser?.email, "user not found", res)) return;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          isVerified: status,
          verificationMessage: message,
        },
      },
      { new: true },
    );

    const dataforEmail = {
      name: isUser?.name,
      email: isUser?.email,
      message,
      status,
    };

    await sendEmailByType(
      "GENERIC_STATUS_NOTIFICATION",
      isUser?.email,
      dataforEmail,
    );

    return res.status(200).json({
      message: "User Status updated",
      error: false,
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetRideStats = async (req, res, next) => {
  try {
    // const {isAdmin } = req.body
    // if(!validateObjectId(isAdmin , "Invalid admin id" ,res)) return

    const today = new Date().toISOString().split("T")[0];
    const upcomingRidesCount = await rideModel.countDocuments({
      departureDate: { $gt: today },
    });
    const todayRidesCount = await rideModel.countDocuments({
      departureDate: today,
    });

    const totalSeatRes = await rideModel.aggregate([
      {
        $match: {
          departureDate: { $gt: today },
        },
      },
      {
        $group: {
          _id: null,
          totalSeats: { $sum: "$totalSeats" },
        },
      },
    ]);

    const totalSeats = totalSeatRes[0]?.totalSeats || 0

    const result = await rideModel.aggregate([
      {
        $match: {
          departureDate: today,
        },
      },
      {
        $group: {
          _id: null,
          totalSeatsForToday: { $sum: "$totalSeats" },
        },
      },
    ]);

    const totalSeatsForToday = result[0]?.totalSeatsForToday || 0;

    return res.status(200).json({
      message: "These are stats",
      error: false,
      success: true,
      data: {
        upcomingRidesCount,
        todayRidesCount,
        totalSeatsForToday,
        totalSeats
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardOverview = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // -------------------------
    // TODAY'S RIDES
    // -------------------------
    const todayRides = await Ride.countDocuments({
      departureDate: todayStr,
      isDeleted: false
    });

    // -------------------------
    // TOTAL COUNTS
    // -------------------------
    const totalRides = await Ride.countDocuments({ isDeleted: false });

    const activeUser = await userModel.countDocuments({
      isActive: true
    });

    const inactiveUser = await userModel.countDocuments({
      isActive: false
    });

    const totalUsers = await userModel.countDocuments({});

    // -------------------------
    // TOTAL & TODAY REVENUE (Offer Ride Fees + Bookings)
    // -------------------------
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const revenueAgg = await Ride.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $project: {
          createdAt: 1,
          rideFee: { $ifNull: ["$creationFee", { $ifNull: ["$commission", 0] }] },
          passengerRevenue: {
            $reduce: {
              input: {
                $filter: {
                  input: { $ifNull: ["$passengers", []] },
                  as: "p",
                  cond: { $in: ["$$p.status", ["accepted", "completed"]] }
                }
              },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $multiply: [
                      { $ifNull: ["$$this.seatsBooked", 1] },
                      { $ifNull: ["$pricePerSeat", 0] }
                    ]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          createdAt: 1,
          totalRideRevenue: { $add: ["$rideFee", "$passengerRevenue"] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalRideRevenue" },
          todayRevenue: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", todayStart] },
                "$totalRideRevenue",
                0
              ]
            }
          }
        }
      }
    ]);

    const totalRevenue = Math.round((revenueAgg[0]?.totalRevenue || 0) * 100) / 100;
    const todayRevenue = Math.round((revenueAgg[0]?.todayRevenue || 0) * 100) / 100;

    // -------------------------
    // OCCUPANCY RATE
    // -------------------------
    const occupancyAgg = await Ride.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: null,
          totalSeats: { $sum: "$totalSeats" },
          occupiedSeats: {
            $sum: {
              $subtract: ["$totalSeats", "$availableSeats"]
            }
          }
        }
      }
    ]);

    const occupancyRate =
      occupancyAgg[0]?.totalSeats > 0
        ? Math.round(
          (occupancyAgg[0].occupiedSeats /
            occupancyAgg[0].totalSeats) *
          100
        )
        : 0;

    // -------------------------
    // PENDING PASSENGER REQUESTS
    // -------------------------
    const pendingRequestsAgg = await Ride.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: "$passengers" },
      {
        $match: {
          "passengers.status": "requested"
        }
      },
      { $count: "count" }
    ]);

    const pendingRequests = pendingRequestsAgg[0]?.count || 0;

    // -------------------------
    // RESPONSE
    // -------------------------
    return res.status(200).json({
      success: true,
      data: {
        totalRides,
        todayRides,
        activeUser,
        inactiveUser,
        totalUsers,
        totalRevenue,
        todayRevenue,
        occupancyRate,
        pendingRequests
      }
    });
  } catch (error) {
    // console.error("Dashboard overview error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard overview",
      error: error.message
    });
  }
};

export const getRecentRides = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(
        "driver",
        "firstName lastName email profilePhotos phone "
      )
      .lean();

    const formattedRides = rides.map((ride) => {
      const bookedSeats =
        ride.passengers?.reduce(
          (sum, p) =>
            p.status === "accepted" || p.status === "completed"
              ? sum + (p.seatsBooked || 0)
              : sum,
          0
        ) || 0;

      return {
        _id: ride._id,
        from: ride.from,
        to: ride.to,
        carDetails: ride?.carDetails,
        departureDate: ride.departureDate,
        departureTime: ride.departureTime,
        driver: ride.driver,
        pricePerSeat: ride.pricePerSeat,
        totalSeats: ride.totalSeats,
        availableSeats: ride.availableSeats,
        status: ride.status,
        totalAmount: bookedSeats * ride.pricePerSeat,
        createdAt: ride.createdAt,
        stops: ride.stops,
        distance: ride.distance,
      };
    });

    const total = await Ride.countDocuments({ isDeleted: false });

    return res.status(200).json({
      success: true,
      data: formattedRides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    // console.error("Recent rides error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching recent rides",
      error: error.message
    });
  }
};

export const getPopularRoutes = async (req, res) => {
  try {
    const range = req.query.range || "week";

    const startDate = new Date();
    switch (range) {
      case "day":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
        break;
    }

    // 🔹 1. POPULAR ROUTES (based on bookings)
    const popularRoutes = await Ride.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isDeleted: false
        }
      },
      { $unwind: "$passengers" },
      {
        $match: {
          "passengers.status": { $in: ["accepted", "completed"] }
        }
      },
      {
        $group: {
          _id: {
            fromCity: "$from.city",
            toCity: "$to.city"
          },
          rides: { $addToSet: "$_id" },
          bookedSeats: { $sum: "$passengers.seatsBooked" },
          avgPrice: { $avg: "$pricePerSeat" },
          totalRevenue: {
            $sum: {
              $multiply: ["$passengers.seatsBooked", "$pricePerSeat"]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          from: "$_id.fromCity",
          to: "$_id.toCity",
          rides: { $size: "$rides" },
          bookings: "$bookedSeats",
          avgPrice: { $round: ["$avgPrice", 2] },
          totalRevenue: { $round: ["$totalRevenue", 2] }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    // ✅ If popular routes exist → return them
    if (popularRoutes.length > 0) {
      return res.status(200).json({
        success: true,
        type: "popular",
        data: popularRoutes
      });
    }

    // 🔹 2. FALLBACK: NORMAL ROUTES (no bookings)
    const normalRoutes = await Ride.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            fromCity: "$from.city",
            toCity: "$to.city"
          },
          rides: { $sum: 1 },
          avgPrice: { $avg: "$pricePerSeat" }
        }
      },
      {
        $project: {
          _id: 0,
          from: "$_id.fromCity",
          to: "$_id.toCity",
          rides: 1,
          avgPrice: { $round: ["$avgPrice", 2] }
        }
      },
      { $sort: { rides: -1 } },
      { $limit: 5 }
    ]);

    return res.status(200).json({
      success: true,
      type: "normal",
      data: normalRoutes
    });

  } catch (error) {
    // console.error("Popular routes error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching routes",
      error: error.message
    });
  }
};

export const getDriverStats = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const driverStats = await userModel.aggregate([
      {
        $match: {
          role: "driver",
          status: "active"
        }
      },

      {
        $lookup: {
          from: "rides",
          localField: "_id",
          foreignField: "driver",
          as: "rides"
        }
      },

      { $unwind: { path: "$rides", preserveNullAndEmptyArrays: true } },

      { $unwind: { path: "$rides.passengers", preserveNullAndEmptyArrays: true } },

      {
        $match: {
          $or: [
            { "rides.passengers.status": { $in: ["accepted", "completed"] } },
            { "rides.passengers": { $exists: false } }
          ]
        }
      },

      {
        $group: {
          _id: "$_id",

          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          email: { $first: "$email" },
          profilePhotos: { $first: "$profilePhotos" },
          isActive: { $first: "$isActive" },
          joinedAt: { $first: "$createdAt" },

          totalRides: { $addToSet: "$rides._id" },

          totalSeatsBooked: {
            $sum: {
              $ifNull: ["$rides.passengers.seatsBooked", 0]
            }
          },

          totalEarnings: {
            $sum: {
              $multiply: [
                { $ifNull: ["$rides.passengers.seatsBooked", 0] },
                { $ifNull: ["$rides.pricePerSeat", 0] }
              ]
            }
          }
        }
      },

      {
        $project: {
          _id: 1,
          name: {
            $trim: {
              input: { $concat: ["$firstName", " ", "$lastName"] }
            }
          },
          email: 1,
          profilePhotos: 1,
          isActive: 1,
          joinedAt: 1,
          totalRides: { $size: "$totalRides" },
          totalSeatsBooked: 1,
          earnings: { $round: ["$totalEarnings", 2] }
        }
      },

      { $sort: { earnings: -1 } },
      { $limit: limit }
    ]);

    return res.status(200).json({
      success: true,
      data: driverStats
    });
  } catch (error) {
    // console.error("Driver stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching driver statistics",
      error: error.message
    });
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const period = req.query.period || "week";

    const startDate = new Date();
    let groupBy;

    switch (period) {
      case "day":
        startDate.setDate(startDate.getDate() - 1);
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" }
        };
        break;

      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
        break;

      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        };
        break;

      case "week":
      default:
        startDate.setDate(startDate.getDate() - 7);
        groupBy = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
        break;
    }

    const revenueData = await Ride.aggregate([
      {
        $match: {
          isDeleted: false,
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          createdAt: 1,
          rideFee: { $ifNull: ["$creationFee", { $ifNull: ["$commission", 0] }] },
          passengerRevenue: {
            $reduce: {
              input: {
                $filter: {
                  input: { $ifNull: ["$passengers", []] },
                  as: "p",
                  cond: { $in: ["$$p.status", ["accepted", "completed"]] }
                }
              },
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    $multiply: [
                      { $ifNull: ["$$this.seatsBooked", 1] },
                      { $ifNull: ["$pricePerSeat", 0] }
                    ]
                  }
                ]
              }
            }
          },
          passengerBookings: {
            $size: {
              $filter: {
                input: { $ifNull: ["$passengers", []] },
                as: "p",
                cond: { $in: ["$$p.status", ["accepted", "completed"]] }
              }
            }
          }
        }
      },
      {
        $project: {
          createdAt: 1,
          totalRideRevenue: { $add: ["$rideFee", "$passengerRevenue"] },
          totalBookings: { $add: [1, "$passengerBookings"] }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$totalRideRevenue" },
          bookings: { $sum: "$totalBookings" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
          "_id.hour": 1
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format:
                period === "day"
                  ? "%H:00"
                  : period === "year"
                    ? "%b %Y"
                    : "%d %b",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: { $ifNull: ["$_id.month", 1] },
                  day: { $ifNull: ["$_id.day", 1] },
                  hour: { $ifNull: ["$_id.hour", 0] }
                }
              }
            }
          },
          revenue: { $round: ["$revenue", 2] },
          bookings: 1
        }
      }
    ]);

    // -------------------------
    // Growth Calculation
    // -------------------------
    let growth = 0;
    if (revenueData.length >= 2) {
      const current = revenueData.at(-1).revenue;
      const previous = revenueData.at(-2).revenue;
      growth = previous > 0 ? ((current - previous) / previous) * 100 : 100;
    }

    return res.status(200).json({
      success: true,
      data: {
        revenueData,
        summary: {
          totalRevenue: Math.round(revenueData.reduce((s, r) => s + r.revenue, 0) * 100) / 100,
          totalBookings: revenueData.reduce((s, r) => s + r.bookings, 0),
          growth: Number(growth.toFixed(2)),
          period
        }
      }
    });
  } catch (error) {
    // console.error("Revenue analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching revenue analytics",
      error: error.message
    });
  }
};

export const getPerformanceMetrics = async (req, res) => {
  try {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    // -------------------------
    // Date ranges (createdAt based)
    // -------------------------
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);

    // -------------------------
    // Parallel Queries
    // -------------------------
    const [
      ridesData,
      usersData,
      revenueData,
      currentWeekRides,
      previousWeekRides,
      upcomingRides,
      todayUpcomingRides
    ] = await Promise.all([

      // -------------------------
      // Ride Performance (30 days)
      // -------------------------
      Ride.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            isDeleted: false
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            totalRides: { $sum: 1 },
            seatsFilledAvg: {
              $avg: {
                $subtract: ["$totalSeats", "$availableSeats"]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // -------------------------
      // User Growth (30 days)
      // -------------------------
      userModel.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // -------------------------
      // Revenue + Bookings
      // -------------------------
      Ride.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            isDeleted: false
          }
        },
        {
          $project: {
            createdAt: 1,
            rideFee: { $ifNull: ["$creationFee", { $ifNull: ["$commission", 0] }] },
            passengerRevenue: {
              $reduce: {
                input: {
                  $filter: {
                    input: { $ifNull: ["$passengers", []] },
                    as: "p",
                    cond: { $in: ["$$p.status", ["accepted", "completed"]] }
                  }
                },
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    {
                      $multiply: [
                        { $ifNull: ["$$this.seatsBooked", 1] },
                        { $ifNull: ["$pricePerSeat", 0] }
                      ]
                    }
                  ]
                }
              }
            },
            passengerBookings: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$passengers", []] },
                  as: "p",
                  cond: { $in: ["$$p.status", ["accepted", "completed"]] }
                }
              }
            }
          }
        },
        {
          $project: {
            createdAt: 1,
            totalRevenue: { $add: ["$rideFee", "$passengerRevenue"] },
            totalBookings: { $add: [1, "$passengerBookings"] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            totalBookings: { $sum: "$totalBookings" },
            revenue: { $sum: "$totalRevenue" }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // -------------------------
      // Current week rides
      // -------------------------
      Ride.countDocuments({
        createdAt: { $gte: oneWeekAgo },
        isDeleted: false
      }),

      // -------------------------
      // Previous week rides
      // -------------------------
      Ride.countDocuments({
        createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
        isDeleted: false
      }),

      // -------------------------
      // ALL Upcoming rides
      // -------------------------
      Ride.countDocuments({
        status: "scheduled",
        departureDate: { $gte: todayDate },
        isDeleted: false
      }),

      // -------------------------
      // TODAY Upcoming rides
      // -------------------------
      Ride.countDocuments({
        status: "scheduled",
        departureDate: todayDate,
        isDeleted: false
      })
    ]);

    // -------------------------
    // Calculations
    // -------------------------
    const rideGrowth =
      previousWeekRides > 0
        ? ((currentWeekRides - previousWeekRides) / previousWeekRides) * 100
        : currentWeekRides > 0
          ? 100
          : 0;

    // 🔥 YOUR REQUIRED AVERAGE
    const todayUpcomingRidePercentage =
      upcomingRides > 0
        ? (todayUpcomingRides / upcomingRides) * 100
        : 0;

    // -------------------------
    // Response
    // -------------------------
    res.status(200).json({
      success: true,
      data: {
        rides: ridesData,
        users: usersData,
        revenue: revenueData,
        metrics: {
          currentWeekRides,
          previousWeekRides,
          rideGrowth: Number(rideGrowth.toFixed(2)),

          upcomingRides,
          todayUpcomingRides,
          todayUpcomingRidePercentage: Number(
            todayUpcomingRidePercentage.toFixed(2)
          )
        }
      }
    });
  } catch (error) {
    // console.error("Performance metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching performance metrics",
      error: error.message
    });
  }
};

export const handleGetAllMessage = async (req, res, next) => {
  try {
    const message = await customerSupport.find({})
    // console.log(message, " this is messages")

    if (!message) {
      return res.status(400).json({
        message: "messages not found",
        error: true,
        success: false

      })
    }
    return res.status(200).json({
      message: "message get succesfully ",
      error: false,
      success: true,
      message
    })

  } catch (error) {
    next(error)

  }
}

export const handleGetAllRides = async (req, res, next) => {
  try {
    const rides = await Ride.find();

    if (rides.length === 0) {
      return res.status(200).json({
        message: "No rides available",
        error: false,
        success: true,
        data: []
      });
    }

    return res.status(200).json({
      message: "Rides fetched successfully",
      error: false,
      success: true,
      data: rides
    });

  } catch (error) {
    next(error);
  }
};

export const handleGetAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.find({ role: "user" }).select("-password");
    if (!users || users.length === 0) {
      return res.status(200).json({
        message: "No User",
        error: false,
        success: true,
        users: [],
        total: 0
      });
    }

    return res.status(200).json({
      message: "Users fetch successfully",
      error: false,
      success: true,
      total: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const handleBroadcast = async (req, res, next) => {
  try {
    const { title, body, icon, image, link } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification title is required",
      });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Notification body is required",
      });
    }

    // Helper to format absolute image URL for FCM
    const formatAbsoluteUrl = (urlStr) => {
      if (!urlStr || typeof urlStr !== "string" || !urlStr.trim()) return "";
      const clean = urlStr.trim();
      if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
      const baseUrl = (
        process.env.BACKEND_ASSETS_URL ||
        process.env.VITE_ASSETS_URL ||
        "https://server.humrahii.com"
      ).replace(/\/$/, "");
      const normalized = clean.startsWith("/") ? clean : `/${clean}`;
      return `${baseUrl}${normalized}`;
    };

    const broadcastIcon = formatAbsoluteUrl(icon);
    const broadcastImage = formatAbsoluteUrl(image || icon);

    const users = await userModel
      .find({ fcm: { $exists: true, $ne: [] } })
      .select("fcm");

    const tokens = [
      ...new Set(users.flatMap((user) => user.fcm).filter(Boolean)),
    ];

    // Send push via Firebase Cloud Messaging
    const result = await sendToMany({
      tokens,
      title: title.trim(),
      body: body.trim(),
      icon: broadcastIcon,
      image: broadcastImage,
      link: link?.trim() || undefined,
    });

    // Save broadcast record in MongoDB for user in-app notification history
    try {
      const newNotification = await notificationModel.create({
        sender: req.adminId || null,
        title: title.trim(),
        message: body.trim(),
        icon: broadcastIcon || undefined,
        image: broadcastImage || undefined,
        link: link?.trim() || undefined,
        type: "broadcast",
      });

      // Update latestNotification on active users
      if (newNotification?._id) {
        await userModel.updateMany(
          {},
          { $set: { latestNotification: newNotification._id } }
        );
      }
    } catch (saveErr) {
      console.error("Error persisting broadcast notification:", saveErr);
    }

    return res.status(200).json({
      message: "Broadcast sent successfully",
      success: true,
      stats: result,
    });

  } catch (error) {
    next(error);
  }
};



// 🔹 1. CREATE Banner
export const createBanner = async (req, res, next) => {
  try {
    const { title, description, image, page, adminId } = req.body;

    if (!validateObjectId(adminId, "invalid AdminId", res)) return

    if (!title || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const banner = await bannerModel.create({
      title,
      description,
      image,
      page,
    });

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 2. UPDATE Banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params, "this is parameters")

    const updatedBanner = await bannerModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 3. GET All Banners (with filter)
export const getBanners = async (req, res) => {
  try {
    const { page } = req.body;

    let filter = {};

    // filter by page: home or login
    if (page) {
      filter.page = page;
    }

    const banners = await bannerModel.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const handleDeleteBanner = async (req, res, next) => {
  try {
    const { bannerId } = req.body;
    const adminId = req.body?.adminId || req.adminId;

    if (!validateObjectId(adminId, "invalid AdminId", res)) return;
    if (!validateObjectId(bannerId, "invalid bannerId", res)) return;

    await bannerModel.findByIdAndDelete(bannerId);

    return res.status(200).json({
      message: "Banner deleted",
      success: true,
      error: false
    });
  } catch (error) {
    next(error);
  }
};



// commision controller


export const handleUpdateCommision = async (req, res, next) => {
  try {
    console.log(req.body, "this sib ody ")
    const { isCommision, type, value, adminId, parcelRequestExpiry } = req.body


    if (!adminId) return res.status(400).json({
      message: "Admin is required",
      error: true,
      success: false
    })

    if (typeof value != "number") return res.status(400).json({
      message: "Commision value should be number",
      error: true,
      success: false
    })


    const commision = await Commision.findOne()

    console.log(commision, "this is comision")

    if (commision) {
      commision.type = type,
        commision.value = value
      commision.isCommision = isCommision
      
      if (parcelRequestExpiry !== undefined) {
          commision.parcelRequestExpiry = parcelRequestExpiry
      }
      
      commision.save()

      return res.status(200).json({
        message: "Commision updated sucessfully",
        error: false,
        success: true
      })
    }

    const newCommision = await Commision.create({
      type,
      isCommision,
      value,
      createdBy: adminId,
      parcelRequestExpiry: parcelRequestExpiry !== undefined ? parcelRequestExpiry : 5
    })

    return res.status(200).json({
      message: "Commision created succesfully",
      error: false,
      success: true,
      commision: newCommision
    })



  } catch (error) {
    next(error)
  }
}

export const handleAdminAddWalletMoney = async (req, res, next) => {
  try {
    const { targetUserId, amount, note } = req.body;
    const adminId = req.adminId;

    if (!validateObjectId(targetUserId, "Invalid Target User ID", res)) return;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Please enter a valid positive amount greater than 0",
        error: true,
        success: false,
      });
    }

    if (!note || typeof note !== "string" || !note.trim()) {
      return res.status(400).json({
        message: "Reason / Note is mandatory when adding virtual money to user account",
        error: true,
        success: false,
      });
    }

    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        message: "Target user not found",
        error: true,
        success: false,
      });
    }

    const previousBalance = Number(targetUser.virtualMoney?.balance || 0);
    const newBalance = previousBalance + numericAmount;

    const transaction = {
      userId: targetUserId,
      amount: numericAmount,
      type: "credit",
      source: "admin",
      status: "completed",
      referenceId: `ADM_VM_${adminId || "SUPERADMIN"}_${Date.now()}`,
      description: note?.trim() || `Virtual money credited with ₹${numericAmount} by Admin`,
      balanceAfter: newBalance,
      createdAt: new Date(),
    };

    const updatedUser = await userModel.findByIdAndUpdate(
      targetUserId,
      {
        $inc: { "virtualMoney.balance": numericAmount },
        $push: { "virtualMoney.transactions": transaction },
      },
      { new: true }
    );

    if (targetUser.fcm && targetUser.fcm.length > 0) {
      sendToMany({
        tokens: targetUser.fcm,
        title: "Virtual Money Credited by Admin",
        body: `Your virtual money balance has been credited with ₹${numericAmount} by Admin. New balance: ₹${updatedUser.virtualMoney?.balance ?? newBalance}.`,
      });
    }

    return res.status(200).json({
      message: `₹${numericAmount} added to virtual money successfully`,
      error: false,
      success: true,
      previousBalance,
      newBalance: updatedUser.virtualMoney?.balance ?? newBalance,
      transaction,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};