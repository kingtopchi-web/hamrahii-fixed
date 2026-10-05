import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  validateEmail,
  validateField,
  validateObjectId,
} from "../utils/validator/validateFields.js";
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmailByType } from "../config/emailServices.js";
import { capitalize } from "../utils/helpers/capitalize.js";
import {
  generateLoginActivity,
  getDeviceInfo,
  getReadableDeviceInfo,
} from "../utils/helpers/loginInfo.js";
import axios from "axios";
import { generateExpiryTime, generateOtp } from "../utils/helpers/generate.js";
import otpModel from "../models/otp.model.js";
import { calculateAge } from "../utils/helpers/calculateAge.js";
import { jwtDecode } from "jwt-decode";
import customerSupport from "../models/customer.support.js";
import mongoose from "mongoose";
import { sendToMany } from "../utils/sendNotification/sendToMany.js";
import rideModel from "../models/ride.model.js";
import { sendSms } from "../utils/sendOtpOnMobile.js";
import { customAlphabet } from "nanoid";
import { formatToYYYYMMDD } from "../utils/helpers/formatToYYYYMMDD.js";
import dlModel from "../models/dl.model.js";
import notificationModel from "../models/notification.model.js";


export const handleRegisterUser = async (req, res, next) => {
  try {
    const { phone, password, referralCode, country } = req.body;

    /* ---------------- VALIDATION ---------------- */
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    /* ---------------- CHECK EXISTING USER ---------------- */
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    /* ---------------- HASH PASSWORD ---------------- */
    const hashedPassword = await bcrypt.hash(password, 10);
    const referralId = customAlphabet(
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      6
    );

    const myReferralCode = referralId();


    let isReferred = ""

    if (referralCode) {

      isReferred = await User.findOne({ referralCode: referralCode.toUpperCase() })

      if (!validateField(isReferred, "Invalid Referral code", res)) return
    }




    /* ---------------- CREATE USER ---------------- */
    const user = await User.create({
      phone,
      password: hashedPassword,
      phoneVerified: true,
      isVerified: "verified",
      referralCode: myReferralCode,
      referredBy: isReferred?._id ? isReferred._id : null,
      countryName: country?.name,
      countryCode: country?.code,
      dial_code: country?.dial_code
    });

    if (isReferred?._id) {
      const transaction = {
        userId: isReferred._id,
        amount: 100,
        type: "credit",
        source: "referral",
        status: "completed",
        referenceId: `REF-${user?._id}`,
        description: `Virtual money credited by Referral`,
      };


      await User.findByIdAndUpdate(isReferred?._id, {
        $push: {
          referrals: user?._id,
          "virtualMoney.transactions": transaction
        },
        $inc: {
          "virtualMoney.balance": 100
        }
      })

    }


    const transaction = {
      userId: user?._id,
      amount: 100,
      type: "credit",
      source: "System",
      status: "success",
      referenceId: `SYS_${user?._id}_${Date.now()}`,
      description: `Joining Bonus Rs. 100`,
      balanceAfter: 100,
    };


    const updatedUser = await userModel.findByIdAndUpdate(
      user?._id,
      {
        $inc: { "wallet.balance": 100 },
        $push: { "wallet.transactions": transaction },
      },
      { new: true },
    );

    const isProd = process.env.NODE_ENV === "production";
    const token = jwt.sign({ userId: user?._id }, process.env.JWT_SECRET);
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    };

    res.cookie("accessToken", token, cookieOptions);

    /* ---------------- RESPONSE ---------------- */
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userResponse,
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const handleUserLogin = async (req, res, next) => {
  try {
    const { phone, password, rememberMe = false } = req.body;
    // console.log(req.body, "this is body ");

    if (!validateField(phone, "phone is required", res)) return;

    const isUser = await userModel.findOne({ phone }).select("password");

    // console.log(isUser, "this is user");
    if (!validateField(isUser?.password, "phone and password not found", res))
      return;

    const isMatch = bcrypt.compareSync(password, isUser?.password);
    if (!validateField(isMatch, "phone or password not matched", res)) return;

    const user = await userModel.findOne({ phone });

    const token = jwt.sign({ userId: user?._id }, process.env.JWT_SECRET);

    const deviceInfo = getDeviceInfo(req);

    // Generate login activity with session ID
    const loginActivity = generateLoginActivity(deviceInfo, user);

    // Get readable device info for response
    const readableDeviceInfo = getReadableDeviceInfo(deviceInfo);

    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    };

    if (rememberMe) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000;
    }

    res.cookie("accessToken", token, cookieOptions);

    await userModel.findByIdAndUpdate(user?._id, {
      $set: { lastLogin: new Date() },
    });

    return res.status(200).json({
      message: "Login successfully",
      error: false,
      success: true,
      user,
      token,
      readableDeviceInfo,
    });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

export const handleGetFullUserDetails = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!validateObjectId(userId, "userId is required", res)) return;

    const isUser = await userModel.findById(userId);

    if (!validateField(isUser?.phone, "User not found", res)) return;

    const hasOfferedRides = await rideModel.exists({ driver: userId });
    const isFirstRide = !hasOfferedRides;

    // Fetch dynamic counts for the user dashboard
    const totalRides = await rideModel.countDocuments({ driver: userId });
    const bookingsCount = await rideModel.countDocuments({ 
      "passengers.user": userId,
      "passengers.status": { $in: ["accepted", "completed"] }
    });
    
    // For parcels, user could be sender or driver. The dashboard says "Parcels Sent & Received" so we check sender.
    let parcelsCount = 0;
    try {
      // using mongoose.model to dynamically fetch Parcel since it might not be imported in this file
      const Parcel = mongoose.model("Parcel");
      parcelsCount = await Parcel.countDocuments({ sender: userId });
    } catch(err) {
       // Ignore if model is not registered yet or require fails
       console.error("Error fetching parcels count:", err);
    }

    const userObj = isUser.toObject();
    userObj.isFirstRide = isFirstRide;
    userObj.totalRides = totalRides;
    userObj.bookingsCount = bookingsCount;
    userObj.parcelsCount = parcelsCount;

    return res.status(200).json({
      message: "These are user details",
      error: false,
      success: true,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUserLogout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/", // must match
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const handleSendOtpForPasswordReset = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({
        message: "Phone is required",
        error: true,
        success: false,
      });
    }

    // remove old OTPs
    await otpModel.deleteMany({ phone });

    const otp = generateOtp(4);
    const expiresAt = generateExpiryTime(5); // minutes

    await otpModel.create({ phone, otp, expiresAt });
    // console.log(phone, "this is phone");

    const message = `${otp} is your account verification OTP. Treat this as confidential. Don't share this with anyone (otp) Houda Carjour Tourism`;
    await sendSms(phone, message);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const handleVerifyOtpAndResetPassword = async (req, res, next) => {
  try {
    const { phone, otp, password } = req.body;
    // console.log(req.body, "this is body for reset password")

    // Validate phone number
    if (!phone || phone.trim() === '') {
      return res.status(400).json({
        message: "Phone number is required",
        error: true,
        success: false
      });
    }

    // Validate Indian phone number format
    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit Indian phone number",
        error: true,
        success: false
      });
    }

    // Validate OTP
    if (!otp || otp.trim() === '') {
      return res.status(400).json({
        message: "OTP is required",
        error: true,
        success: false
      });
    }

    // Validate 6-digit password
    if (!password || password.trim() === '') {
      return res.status(400).json({
        message: "Password is required",
        error: true,
        success: false
      });
    }

    // Validate password is 6 digits
    const passwordRegex = /^\d{6}$/;
    if (!passwordRegex.test(password.trim())) {
      return res.status(400).json({
        message: "Password must be exactly 6 digits",
        error: true,
        success: false
      });
    }

    // Find OTP record for the phone number
    const otpRecord = await otpModel.findOne({
      phone: phone.trim()
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "OTP not found",
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "OTP expired",
      });
    }

    // Verify OTP matches
    if (String(otp).trim() !== String(otpRecord.otp).trim()) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid OTP",
      });
    }

    // Find user by phone number
    const user = await userModel.findOne({ phone: phone.trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User not found",
      });
    }

    // Hash the 6-digit password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Update user's password
    await userModel.findOneAndUpdate(
      { phone: phone.trim() },
      {
        $set: {
          password: hashedPassword
        }
      },
      { new: true }
    );

    // Delete the used OTP record
    await otpModel.deleteOne({
      phone: phone.trim()
    });

    return res.status(200).json({
      success: true,
      error: false,
      message: "Password reset successfully",
    });
  } catch (error) {
    // console.error("Reset password error:", error);
    next(error);
  }
};

export const handleUploadProfilePic = async (req, res, next) => {
  try {
    const { profilePhotos, userId } = req.body;
    const effectiveUserId = userId || req.userId;

    if (!validateField(profilePhotos, "Profile Photo is required", res)) return;

    if (!validateObjectId(effectiveUserId, "Invalid userId", res)) return;

    const isUser = await userModel.findById(effectiveUserId);

    if (!validateField(isUser, "User not found", res, 404)) return;

    const user = await userModel.findByIdAndUpdate(
      effectiveUserId,
      {
        $set: {
          profilePhotos: profilePhotos,
        },
      },
      { new: true },
    );

    return res.status(200).json({
      message: "Profile picture updated",
      error: false,
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const handleEditBasicDetails = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      gender,
      userId,
      language,
      location,
    } = req.body;

    if (!validateField(firstName, "First Name is required", res)) return;
    if (!validateField(lastName, "Last Name is required", res)) return;
    if (!validateEmail(email, "Please enter a valid email", res)) return;
    if (!validateField(dateOfBirth, "Please fill Date of Birth", res)) return;
    if (!validateField(gender, "Gender is required", res)) return;
    if (!validateObjectId(userId, "User is required", res)) return;

    const age = await calculateAge(dateOfBirth);
    if (!validateField(age.years >= 18, "Age must be 18 or above", res)) return;

    const isUser = await userModel.findById(userId);
    if (!validateField(isUser, "User not found", res)) return;

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName: capitalize(firstName).trim(),
          lastName: capitalize(lastName).trim(),
          email: email.trim(),
          gender: gender,
          dateOfBirth,

          // NEW FIELDS
          language: language?.trim(),
          currentLocation:
            typeof location === "string" && location.trim()
              ? {
                  ...(isUser.currentLocation?.toObject?.() ||
                    isUser.currentLocation ||
                    { type: "Point", coordinates: [0, 0] }),
                  city: location.trim(),
                }
              : (location || isUser.currentLocation),
        },
      },
      { new: true },
    );

    return res.status(200).json({
      message: "Basic details updated",
      error: false,
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "credential in required",
        error: true,
        success: false,
      });
    }

    const decodedUser = jwtDecode(credential);

    const user = {
      isLogin: true,
      email: decodedUser.email,
      firstName: decodedUser.name,
      avatar: decodedUser.picture,
      googleId: decodedUser.sub,
    };

    // await user.save();
    const isUser = await User.findOne({ email: user.email });

    if (!isUser?.email) {
      return res.status(200).json({
        message: "user data fetched succesfully ",
        error: false,
        success: true,
        user,
      });
    }

    const token = await jwt.sign(
      { userId: isUser?._id },
      process.env.JWT_SECRET,
    );

    const isProd = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    };

    res.cookie("accessToken", token, cookieOptions);

    return res.status(200).json({
      message: "Login succesfully",
      error: false,
      success: true,
      user: isUser,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGoogleSignIn = async (req, res, next) => {
  try {
    const { email } = req.body;
    // console.log(email, " rbgjsbrgjsrgsbgjsrgnsjbgjsb");
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "User is not registerd",
        error: false,
        success: true,
      });
    }

    return res.status(200).json({
      message: "User login successfully",
      error: false,
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUserContactSupport = async (req, res, next) => {
  try {
    const { customer } = req.body;
    // console.log(customer, " this is customer details ok ");

    if (!customer) {
      return res.status(400).json({
        message: "customer  data is required",
        error: true,
        success: false,
      });
    }

    const newCustomer = new customerSupport({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      subject: customer.subject,
      category: customer.category,
      message: customer.message,
    });
    newCustomer.save();

    return res.status(200).json({
      message: "form submitted is successfully okk ",
      error: false,
      success: true,
      newCustomer,
    });
  } catch (error) {
    next(error);
  }
};

export const handleCreditWallet = async (req, res, next) => {
  try {
    const { userId, amount, source, description, referenceId } = req.body;

    if (!validateObjectId(userId, "Invalid user id", res)) return;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // New balance
    const newBalance = user.wallet.balance + numericAmount;

    // Create transaction object
    const transaction = {
      userId,
      amount: numericAmount,
      type: "credit",
      source: source || "system",
      status: "success",
      referenceId: referenceId || null,
      description: description || "Wallet credited",
      balanceAfter: newBalance,
    };

    // Atomic update
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $inc: { "wallet.balance": numericAmount },
        $push: { "wallet.transactions": transaction },
      },
      { new: true },
    );

    sendToMany({
      tokens: user.fcm,
      title: "Wallet credited",
      description: `Wallet credited by amount Rs.${amount} . your current balance is ${updatedUser?.wallet.balance} and the source is ${source} `,
    });

    return res.status(200).json({
      success: true,
      message: `₹${numericAmount} added to wallet`,
      balance: updatedUser.wallet.balance,
      transaction,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const handleSaveNewFcmToken = async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    if (!validateField(userId, "Invalid userid", res)) return;
    if (!validateField(token?.trim(), "Token not found", res)) return;

    const user = await userModel.findByIdAndUpdate(
      userId,
      {
        $addToSet: { fcm: token.trim() }, // 👈 prevents duplicates automatically
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "FCM token saved successfully",
      fcm: user.fcm,
    });
  } catch (error) {
    next(error);
  }
};

export const handeGetTransactionDetails = async (req, res, next) => {
  try {
    const { userId, page = 1, limit = 10 } = req.body;

    if (!validateObjectId(userId, "Invalid user id", res)) return;

    const skip = (Number(page) - 1) * Number(limit);

    const user = await userModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },

      {
        $project: {
          wallet: 1,

          transactions: {
            $slice: [
              {
                $reverseArray: {
                  $ifNull: ["$wallet.transactions", []],
                },
              },
              skip,
              Number(limit),
            ],
          },

          totalTransactions: {
            $size: {
              $ifNull: ["$wallet.transactions", []],
            },
          },
        },
      },
    ]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const total = user[0].totalTransactions;

    res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
      transactions: user[0].transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const handleDebitAmountFromWallet = async ({
  amount,
  source = "system",
  description = "Wallet debited",
  referenceId = null,
  userId,
}) => {
  try {
    if (!userId) {
      return { success: false, error: true, message: "userId is required" };
    }

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return {
        success: false,
        error: true,
        message: "Valid amount is required",
      };
    }

    // First: check if user exists
    const userExists = await userModel.findById(userId);
    if (!userExists) {
      return {
        success: false,
        error: true,
        message: "User not found",
      };
    }

    console.log(userExists?.wallet?.balance, numericAmount, "these are amoutns")

    if ((Number(userExists?.wallet?.balance) || 0) < numericAmount) {
      return {
        success: false,
        error: true,
        message: "Insufficient wallet balance",
      };
    }


    // Second: atomic debit only if balance sufficient
    const updatedUser = await userModel.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $inc: { "wallet.balance": -numericAmount },
        $push: {
          "wallet.transactions": {
            userId,
            amount: numericAmount,
            type: "debit",
            source,
            status: "success",
            referenceId,
            description,
            createdAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return {
        success: false,
        error: true,
        message: "Insufficient wallet balance",
      };
    }

    return {
      success: true,
      error: false,
      message: "Amount debited successfully",
      balance: updatedUser.wallet.balance,
    };
  } catch (error) {
    return {
      success: false,
      error: true,
      message: error?.message || "Failed to debit wallet",
    };
  }
};

// export const handleGetRidesBooking = async (req, res, next) => {
//   try {
//     const {
//       userId,
//       page = 1,
//       limit = 10,
//       rideStatus,
//       bookingStatus,
//       fromDate,
//       toDate,
//     } = req.body;

//     if (!validateObjectId(userId, "User not found", res)) return;

//     const pageNumber = Number(page);
//     const limitNumber = Number(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     const userObjectId = new mongoose.Types.ObjectId(userId);

//     /* -------------------------
//        MATCH CONDITIONS
//     ------------------------- */
//     const matchStage = {
//       isDeleted: false,
//       "passengers.user": userObjectId,
//     };

//     if (rideStatus) {
//       matchStage.status = rideStatus;
//     }

//     if (fromDate || toDate) {
//       matchStage.departureDate = {};
//       if (fromDate) matchStage.departureDate.$gte = fromDate;
//       if (toDate) matchStage.departureDate.$lte = toDate;
//     }

//     /* -------------------------
//        AGGREGATION PIPELINE
//     ------------------------- */
//     const pipeline = [
//       { $match: matchStage },

//       /* Filter ONLY logged-in user's passenger + booking status */
//       {
//         $addFields: {
//           passengers: {
//             $filter: {
//               input: "$passengers",
//               as: "p",
//               cond: {
//                 $and: [
//                   { $eq: ["$$p.user", userObjectId] },
//                   ...(bookingStatus
//                     ? [{ $eq: ["$$p.status", bookingStatus] }]
//                     : []),
//                 ],
//               },
//             },
//           },
//         },
//       },

//       /* 🔥 IMPORTANT: remove rides with no matching passenger */
//       {
//         $match: {
//           "passengers.0": { $exists: true },
//         },
//       },

//       { $sort: { createdAt: -1 } },

//       {
//         $facet: {
//           data: [
//             { $skip: skip },
//             { $limit: limitNumber },

//             /* populate driver */
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "driver",
//                 foreignField: "_id",
//                 as: "driver",
//               },
//             },
//             { $unwind: "$driver" },

//             /* populate car */
//             {
//               $lookup: {
//                 from: "cars",
//                 localField: "car",
//                 foreignField: "_id",
//                 as: "car",
//               },
//             },
//             { $unwind: "$car" },
//           ],
//           totalCount: [{ $count: "count" }],
//         },
//       },
//     ];

//     const result = await rideModel.aggregate(pipeline);

//     const rides = result[0]?.data || [];
//     const totalCount = result[0]?.totalCount[0]?.count || 0;

//     return res.status(200).json({
//       success: true,
//       message: "Booked rides fetched successfully",
//       data: rides,
//       pagination: {
//         currentPage: pageNumber,
//         totalPages: Math.ceil(totalCount / limitNumber),
//         totalRecords: totalCount,
//         limit: limitNumber,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const handleGetRidesBooking = async (req, res, next) => {
  try {
    const {
      userId,
      page = 1,
      limit = 10,
      rideStatus,
      bookingStatus,
      fromDate,
      toDate,
    } = req.body;

    if (!validateObjectId(userId, "User not found", res)) return;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* -------------------------
       MATCH CONDITIONS
    ------------------------- */
    const matchStage = {
      isDeleted: false,
      "passengers.user": userObjectId,
    };

    if (rideStatus) {
      matchStage.status = rideStatus;
    }

    /* -------------------------
       PIPELINE
    ------------------------- */
    const pipeline = [
      { $match: matchStage },

      /* 🔥 Convert string → date */
      {
        $addFields: {
          departureDateObj: {
            $toDate: "$departureDate",
          },
        },
      },

      /* 🔥 FILTER UPCOMING RIDES ONLY */
      {
        $match: {
          departureDateObj: { $gte: today },
        },
      },

      /* Optional date filters */
      ...(fromDate || toDate
        ? [
            {
              $match: {
                departureDateObj: {
                  ...(fromDate && { $gte: new Date(fromDate) }),
                  ...(toDate && { $lte: new Date(toDate) }),
                },
              },
            },
          ]
        : []),

      /* Filter only logged-in user's booking */
      {
        $addFields: {
          passengers: {
            $filter: {
              input: "$passengers",
              as: "p",
              cond: {
                $and: [
                  { $eq: ["$$p.user", userObjectId] },
                  ...(bookingStatus
                    ? [{ $eq: ["$$p.status", bookingStatus] }]
                    : []),
                ],
              },
            },
          },
        },
      },

      {
        $match: {
          "passengers.0": { $exists: true },
        },
      },

      /* 🔥 SORT BY NEAREST DEPARTURE */
      {
        $sort: {
          departureDateObj: 1, // nearest date first
          departureTime: 1,    // nearest time first
        },
      },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limitNumber },

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
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await rideModel.aggregate(pipeline);

    const rides = result[0]?.data || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    return res.status(200).json({
      success: true,
      message: "Booked rides fetched successfully",
      data: rides,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        totalRecords: totalCount,
        limit: limitNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const sendEmailVerificationOTP = async (req, res, next) => {
  try {
    const { userId, email } = req.body;

    if (!validateObjectId(userId, "Invalid user id", res)) return;

    if (!validateEmail(email, "Invalid email", res)) return

    let user = await User.find({ _id: userId, email });
    if (!user) {
      const isUser = await User.findByIdAndUpdate(userId, {
        $set: {
          email
        }
      }, { new: true })

      if (!validateField(isUser, "User not found", res)) return

    }

    if (user?.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    await otpModel.deleteMany({email})

    const otp = await generateOtp(6);
    const expiresAt = await generateExpiryTime(2);

    await otpModel.create({
      email,
      otp,
      expiresAt,
    });

    sendEmailByType("VERIFY_EMAIL", email, {
      name: user?.firstName + " " + user.lastName  || "User",
      otp,
      expiryMinutes: expiresAt,
    });

    res.status(200).json({
      success: true,
      message: "Verification OTP sent to email",
    });
  } catch (error) {
    next(error);
  }
};
 
export const verifyEmailOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    // console.log(req.body, "this is body");

    if (!validateObjectId(userId, "Invalid user id", res)) return;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }


    const isotp = await otpModel.findOne({ email: user.email });

    console.log(isotp , "this is otp ")

    if (!validateField(isotp, "otp is not found", res)) return;

    if (isotp.otp !== otp || isotp.expiresAt < new Date(Date.now())) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.emailVerified = true;
    otpModel.otp = undefined;
    otpModel.expiresAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user
    });
  } catch (error) {
    next(error);
  }
};

export const sendPhoneVerificationOTP = async (req, res, next) => {
  try {
    const { phone, referalCode } = req.body;
    console.log("requesting......")

    if (!phone) {
      res.status(400).json({
        message: "Phone is required",
        error: true,
        success: false,
      });
    }

    const isPhone = await userModel.findOne({ phone })
    // console.log(isPhone, "this is phone ")
    if (!validateField(isPhone === null, "Phone number is already exists", res)) return

    if (referalCode) {
      const isRefered = await userModel.findOne({ referralCode: referalCode.toUpperCase() })

      if (!validateField(isRefered, "Invalid referal Code", res)) return
    }
    // remove old OTPs
    await otpModel.deleteMany({ phone });

    const otp = generateOtp(4);
    const expiresAt = generateExpiryTime(2); // minutes

    await otpModel.create({ phone, otp, expiresAt });
    // console.log(phone, "this is phone");

    const message = `${otp} is your account verification OTP. Treat this as confidential. Don't share this with anyone (otp) Houda Carjour Tourism`;
    await sendSms(phone, message);
    console.log(otp, "this is otp")

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error)
    next(error);
  }
};

export const verifyPhoneOTP = async (req, res, next) => {
  try {
    const { otp, phone } = req.body;

    // console.log(req.body)

    if (!otp || !phone) {
      res.status(400).json({
        message: "Phone and OTP are required",
        error: true,
        success: false,
      });
    }

    const otpDocs = await otpModel.findOne({ phone });
    if (!otpDocs) {
      return res.status(400).json({
        message: "Otp not found",
        error: true,
        success: false,
      });
    }


    if (otpDocs.otp != otp || otpDocs.expiresAt < new Date(Date.now())) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      message: "Phone verify successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { userId, smoking, music, pets, conversation, luggageSpace } =
      req.body;

    // 🔹 Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    // 🔹 Build update object dynamically
    const updateData = {};

    if (smoking) updateData["preferences.smoking"] = smoking;
    if (music) updateData["preferences.music"] = music;
    if (pets) updateData["preferences.pets"] = pets;
    if (conversation) updateData["preferences.conversation"] = conversation;

    if (luggageSpace) {
      if (typeof luggageSpace.small === "boolean") {
        updateData["preferences.luggageSpace.small"] = luggageSpace.small;
      }
      if (typeof luggageSpace.medium === "boolean") {
        updateData["preferences.luggageSpace.medium"] = luggageSpace.medium;
      }
      if (typeof luggageSpace.large === "boolean") {
        updateData["preferences.luggageSpace.large"] = luggageSpace.large;
      }
    }

    // 🔹 Update user preferences
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

export const handleAddBio = async (req, res, next) => {
  try {
    const { bio, userId } = req.body;

    // 🔹 Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    // 🔹 Validate bio
    if (!bio || typeof bio !== "string") {
      return res.status(400).json({
        success: false,
        message: "Bio is required and must be a string",
      });
    }

    if (bio.length > 800) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 800 characters",
      });
    }

    // 🔹 Update bio
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { bio } },
      { new: true },
    ).select("bio");

    // 🔹 User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bio updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetReferralDetails = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!validateObjectId(userId, "Invalid User Id", res)) return;

    const user = await userModel
      .findById(userId)
      .select({
        referralCode: 1,
        referrals: 1,
        "virtualMoney.balance": 1,
        "virtualMoney.transactions": 1,
      })
      .populate({
        path: "referrals",
        select: {
          firstName: 1,
          lastName: 1,
          gender: 1,
          profilePhotos: 1,
          createdAt: 1,
        },
        options: {
          skip,
          limit,
          sort: { createdAt: -1 },
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 💰 Calculate total referral earnings
    const totalReferralEarnings = user.virtualMoney.transactions
      .filter(
        (tx) =>
          tx.source === "referral" &&
          tx.type === "credit" &&
          tx.status === "completed"
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

    return res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        totalReferrals: user.referrals.length,
        currentBalance: user.virtualMoney.balance,
        totalReferralEarnings,
        referrals: user.referrals,
        pagination: {
          page,
          limit,
          hasMore: user.referrals.length === limit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handlegetVirtualTransaction = async (req, res, next) => {
  try {
    const { userId } = req.body

    if (!validateObjectId(userId, "Invalid userId", res)) return

    const user = await User.findById(userId).select({ "virtualMoney.transactions": { $slice: -10 } });


    return res.status(200).json({
      message: "These are virtual transactions",
      error: false,
      success: true,
      virtualTransaction: user?.virtualMoney
    })
  } catch (error) {
    next(error)
  }
}

export const handleVerifyDrivingLicences = async (req, res, next) => {
  try {
    const { userId, dob, id_number } = req.body

    console.log(req.body, "this is body ")
    if (!validateObjectId(userId, "Invalid userId", res)) return
    if (!validateField(dob, "Dob is required", res)) return
    if (!validateField(id_number, "DL Number is required", res)) return

   



    const dl = await dlModel.findOne({ license_number: id_number })

    if (dl?.name) {

      console.log("credit saved...")

      return res.status(200).json({
        message: "These are driving details",
        error: false,
        success: true,
        details: dl
      })
    }


    const formatedDate = await formatToYYYYMMDD(dob)


    const data = {
      id_number: id_number || "TN9920190000999",
      dob: formatedDate
    }

    // console.log(data , "this is data")
    const response = await axios.post(process.env.SUREPASS_DL_VERIFICATION, data, {
      headers: {
        Authorization: `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
      },
    })



    await dlModel.create(response?.data?.data)

    // console.log(response , "this is response")
    return res.status(200).json({
      message: "These are driving details",
      error: false,
      success: true,
      details: response?.data?.data
    })

  } catch (error) {
    console.log(error, "this is error")
    next(error)
  }
}

export const handleConfirmDlDetails = async (req, res, next) => {
  try {
    const { details, isConfirmed, dl_number, userId } = req.body;

    if (!validateObjectId(userId, "Invalid userId", res)) return;
    if (!details) return res.status(400).json({ message: "DL details are required" });
    if (isConfirmed !== true) return res.status(400).json({ message: "Confirmation must be true" });
    if (!dl_number) return res.status(400).json({ message: "DL number is required" });

    const isUser = await userModel.findById(userId);

    if (!isUser)
      return res.status(404).json({ message: "User not found" });

    // -------- Name Split Safe --------
    if (!isUser.firstName && details?.name) {
      const nameParts = details.name.split(" ");
      isUser.firstName = nameParts[0];
      isUser.lastName = nameParts.slice(1).join(" ");
    }

    if (details?.dob) {
      isUser.dob = details.dob;
    }

    await isUser.save();

    // -------- MAIN UPDATE --------
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          dlVerified: true,
          dl_number: dl_number,
          dlDetails: [details]   // ✅ single object
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "DL updated successfully",
      error: false,
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    next(error);
  }
};

export const handleSaveMobileFcm = async (req , res , next) => {
  try {
    const {userId , token} = req.body
    console.log(req.body  , "this is body ")
    if(!validateObjectId(userId , "Invalid userId" , res )) return 

    if(!validateField(token , "Token is required" , res)) return  

    const user = await userModel.findById(userId)

    if(!user){
      return res.status(400).json({
        message : "NO user found",
        error : true,
        success : false
      })
    }

    const updateUser = await userModel.findByIdAndUpdate(userId , {
      $addToSet : {
        mobileFcm : token
      }
    }, {new : true})

    return res.status(200).json({
      message : "User fcm save succesfully",
      error : false,
      success : true,
      user : updateUser
    })
  } catch (error) {
    next(error)
  }
}

export const handleUpdateUserLocation = async (req , res , next) => {
  try {
    const {userId , city  , address, coordinates, latitude, longitude} = req.body 

    if(!validateObjectId(userId , "Invalid user Id" , res)) return 
    if(!validateField(city , "City is required" , res)) return 
    if(!validateField(typeof city === "string" , "City should be string" , res)) return 
    if(!validateField(address , "Address is required" , res)) return 
    if(!validateField(typeof address === "string" , "address should be string" , res)) return 

    const user = await userModel.findById(userId)

    if(!validateField(user , "user not found" , res)) return 

    let userCoords = user.currentLocation?.coordinates || [0, 0];
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      const c0 = Number(coordinates[0]);
      const c1 = Number(coordinates[1]);
      if (!isNaN(c0) && !isNaN(c1)) {
        userCoords = [c0, c1];
      }
    } else if (latitude !== undefined && longitude !== undefined) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        userCoords = [lat, lng];
      }
    }

    await userModel.findByIdAndUpdate(userId , {
      $set : {
        currentLocation : {
          type : "point",
          coordinates : userCoords,
          address : address.trim(),
          city : city.trim()
        }
      }
    })

    return res.status(200).json({
      message : "Address saved succesfully",
      error : false,
      success : true
    })

  } catch (error) {
    next(error)
  }
}

export const handleGetUserNotifications = async (req, res, next) => {
  try {
    const userId = req.userId;
    const query = {
      $or: [
        { reciever: userId },
        { reciever: null },
        { type: "broadcast" }
      ]
    };

    const notifications = await notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length
    });
  } catch (error) {
    next(error);
  }
};

export const handleMarkNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.body || {};
    if (notificationId) {
      await notificationModel.findByIdAndUpdate(notificationId, { isRead: true });
    } else {
      await notificationModel.updateMany(
        {
          $or: [
            { reciever: userId },
            { reciever: null },
            { type: "broadcast" }
          ],
          isRead: false
        },
        { isRead: true }
      );
    }
    return res.status(200).json({
      success: true,
      message: "Notifications marked as read"
    });
  } catch (error) {
    next(error);
  }
};export const handleToggleLiveLocation = async (req, res, next) => {
  try {
    const { liveLocationEnabled, maxParcelWeight } = req.body;
    const userId = req.userId;
    
    let updateData = {};
    if (liveLocationEnabled !== undefined) {
      updateData.liveLocationEnabled = !!liveLocationEnabled;
    }
    if (maxParcelWeight !== undefined) {
      updateData.maxParcelWeight = Number(maxParcelWeight);
    }

    const user = await userModel.findByIdAndUpdate(userId, {
      $set: updateData
    }, { new: true });
    
    return res.status(200).json({ 
      success: true, 
      message: "Live location status updated", 
      liveLocationEnabled: user.liveLocationEnabled, 
      maxParcelWeight: user.maxParcelWeight 
    });
  } catch (error) { next(error); }
};

export const handleUpdateLiveLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user || !user.liveLocationEnabled) {
      return res.status(400).json({ success: false, message: "Live location is disabled" });
    }
    
    const prevAddress = typeof user.currentLocation === "string" 
      ? user.currentLocation 
      : (user.currentLocation?.address || "");

    const parsedAccuracy = accuracy !== undefined && accuracy !== null && !isNaN(Number(accuracy))
      ? Number(accuracy)
      : (user.currentLocation?.accuracy || null);

    await userModel.findByIdAndUpdate(userId, {
      $set: {
        lastLocationUpdate: new Date(),
        currentLocation: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
          address: prevAddress,
          city: user.currentLocation?.city || "",
          state: user.currentLocation?.state || "",
          pincode: user.currentLocation?.pincode || "",
          accuracy: parsedAccuracy
        }
      }
    });
    return res.status(200).json({ success: true, message: "Location updated" });
  } catch (error) { next(error); }
};
