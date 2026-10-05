import { UAParser } from "ua-parser-js";
import { Car } from "../models/car.model.js";
import userModel from "../models/user.model.js";
import {
  validateField,
  validateObjectId,
} from "../utils/validator/validateFields.js";
import axios from "axios";
import vehicleDataModel from "../models/vehicleData.model.js";
import { sendToMultiple } from "../config/firebase/sendMobileNotification.js";
import { sendToMany } from "../utils/sendNotification/sendToMany.js";

export const createCar = async (req, res) => {
  try {
    const {
      userId,
      brand,
      model,
      year,
      fuelType,
      transmission,
      seats,
      images,
      plateNumber,
      plateImage,
      chassisNumber,
      engineNumber,
      vehicleType,
      vehicleTypeId,
      surepass, // Add surepass from request body
    } = req.body;

    const owner = userId;
    // console.log(req.body , "this si body ")

    // ---------- VALIDATIONS ----------
    if (!validateObjectId(owner, "Invalid owner id", res)) return;

    // Required fields validation
    if (!validateField(brand, "Brand is required", res)) return;
    if (!validateField(model, "Model is required", res)) return;
    if (!validateField(year, "Year is required", res)) return;
    if (!validateField(fuelType, "Fuel type is required", res)) return;
    if (!validateField(transmission, "Transmission is required", res)) return;
    if (!validateField(seats, "Seats are required", res)) return;
    if (!validateField(plateNumber, "RC number is required", res)) return;
    if (!validateField(chassisNumber, "Chassis number is required", res)) return;
    if (!validateField(engineNumber, "Engine number is required", res)) return;
    if (!validateField(vehicleType, "vehicle Type is required", res)) return;
    if (!validateField(vehicleTypeId, "vehicle Type id is required", res)) return;
    if (!validateObjectId(vehicleTypeId, "Vehicle Type is invalid", res)) return


    // Validate year is a number
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid year",
      });
    }

    // Validate seats is a number
    if (isNaN(seats) || seats < 1 || seats > 20) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid number of seats (1-20)",
      });
    }

    // Validate fuel type
    const validFuel = ["petrol", "diesel", "cng", "electric", "hybrid"];
    if (!validFuel.includes(fuelType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid fuel type",
      });
    }

    // Validate transmission
    const validTransmission = ["manual", "automatic"];
    if (!validTransmission.includes(transmission.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid transmission",
      });
    }

    // Validate mandatory vehicle images
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one vehicle image is required",
      });
    }

    // Validate mandatory license plate image
    if (!validateField(plateImage, "License plate image is required", res)) return;





    const chassisMatches = surepass?.vehicle_chasi_number && chassisNumber && (
      surepass.vehicle_chasi_number.toUpperCase().includes(chassisNumber.trim().toUpperCase()) ||
      chassisNumber.trim().toUpperCase().includes(surepass.vehicle_chasi_number.toUpperCase().split("*")[0])
    );
    const engineMatches = surepass?.vehicle_engine_number && engineNumber && (
      surepass.vehicle_engine_number.toUpperCase().includes(engineNumber.trim().toUpperCase()) ||
      engineNumber.trim().toUpperCase().includes(surepass.vehicle_engine_number.toUpperCase().split("*")[0])
    );
    const isVerified = (chassisMatches && engineMatches) ? "approved" : "pending";

    // ---------- CREATE CAR ----------
    const car = await Car.create({
      owner,
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year),
      fuelType: fuelType.toLowerCase(),
      transmission: transmission.toLowerCase(),
      seats: parseInt(seats),
      images: images || [],
      plateNumber: plateNumber.trim().toUpperCase(),
      plateImage: plateImage || null,
      chassisNumber: chassisNumber.trim().toUpperCase(),
      engineNumber: engineNumber.trim().toUpperCase(),
      surepass: surepass || null, // Save surepass data,
      status: isVerified,
      vehicleType,
      vehicleTypeId
      // Status will be determined automatically by schema default (pending)
    });

    // Update user's cars array
    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          $push: {
            cars: car._id,
          },
        },
        { new: true },
      )
      .select("-password"); // Exclude password for security

    // Safely dispatch push notifications without breaking request
    try {
      if (updatedUser?.mobileFcm && Array.isArray(updatedUser.mobileFcm) && updatedUser.mobileFcm.length > 0) {
        const data = {
          tokens: updatedUser.mobileFcm,
          title: "New vehicle added",
          body: `Dear ${updatedUser?.firstName || "User"} you added a new vehicle. vehicle Rc number is ${plateNumber}`,
          image: car?.images[0] ? "https://server.humrahii.com" + car?.images[0] : "https://humrahii.com/favicon.jpg",
          route: "/"
        };
        sendToMultiple(data).catch(() => {});

        const notify = {
          tokens: updatedUser.mobileFcm,
          title: "New vehicle added",
          body: `Dear ${updatedUser?.firstName || "User"} you added a new vehicle. vehicle Rc number is ${plateNumber}`,
          icon: "",
          link: "https://humrahii.com",
          image: car?.images[0] ? "https://server.humrahii.com" + car?.images[0] : "https://humrahii.com/favicon.jpg"
        };
        sendToMany(notify).catch(() => {});
      }
    } catch (notifError) {
      console.log("Push notification skipped:", notifError?.message);
    }

    return res.status(201).json({
      success: true,
      message: "Car created successfully",
      data: {
        _id: car._id,
        owner: car.owner,
        brand: car.brand,
        model: car.model,
        year: car.year,
        fuelType: car.fuelType,
        transmission: car.transmission,
        seats: car.seats,
        images: car.images,
        plateNumber: car.plateNumber,
        chassisNumber: car.chassisNumber,
        engineNumber: car.engineNumber,
        status: car.status,
        surepass: car.surepass,
        createdAt: car.createdAt,
      },
      user: updatedUser,
    });
  } catch (error) {
    // console.error("Create car error:", error);

    // Check for duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = "Duplicate value found";

      if (field === 'plateNumber') {
        message = "RC number already exists";
      } else if (field === 'engineNumber') {
        message = "Engine number already exists";
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    console.log(error , "this is error....")

    return res.status(500).json({
      success: false,
      message: "Server error while creating car",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


export const handleDeactivateCar = async (req, res, next) => {
  try {
    const userId = req.body?.userId || req.userId;
    const { carId } = req.body;

    if (!validateObjectId(userId, "User id is required", res)) return;
    if (!validateObjectId(carId, "Car id is required", res)) return;

    const user = await userModel.findById(userId);
    if (!validateField(user, "User not found", res)) return;

    const car = await Car.findOne({
      _id: carId,
      owner: userId,
      isDeleted: false,
    });

    if (!validateField(car, "Car not found", res)) return;

    await Car.findByIdAndUpdate(carId, {
      $set: { isDeleted: true },
    });

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          cars: carId,
        },
      },
      { new: true },
    );

    const text = `Dear ${user.firstName || "User"} Your ${car.vehicleType || "Vehicle"} is no longer be used for ride creation on Humrahii`;

    try {
      if (user?.mobileFcm && Array.isArray(user.mobileFcm) && user.mobileFcm.length > 0) {
        const data = {
          tokens: user.mobileFcm,
          title: "Vehicle Deactivated",
          body: text,
          icon: "",
          link: "https://humrahii.com",
          image: car?.images[0] ? "https://server.humrahii.com" + car?.images[0] : "https://humrahii.com/favicon.jpg"
        };
        sendToMany(data).catch(() => {});
      }
    } catch (notifErr) {
      console.log("Deactivate notification skipped:", notifErr?.message);
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Car deleted successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetCarsByUserId = async (req, res, next) => {
  try {
    const userId = req.body?.userId || req.userId;

    if (!validateObjectId(userId, "UserId is required", res)) return;

    const user = await userModel.findById(userId);
    if (!validateField(user, "User not found", res)) return;

    const cars = await Car.find({ owner: userId, isDeleted: false });

    return res.status(200).json({
      success: true,
      error: false,
      message: "These are your cars",
      cars: cars || [],
    });
  } catch (error) {
    next(error);
  }
};

export const handleUseSurePassApi = async (req, res, next) => {
  try {
    const { rcNumber, userId } = req.body;
    // console.log(req.body, "this is body  ");

    if (!validateField(rcNumber, "Rc number is required", res)) return;

    if (!userId) {
      return res.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }


    const data = await vehicleDataModel.findOne({ rc_number: rcNumber })

    if (data) {
      console.log("Search Saved")
      return res.status(200).json({
        message: "These are vehicle Details",
        error: false,
        success: true,
        data: { data }
      })
    }


    const response = await axios.post(
      process.env.SUREPASS_API_KEY,
      { id_number: rcNumber },
      {
        headers: {
          Authorization: `Bearer ${process.env.AUTHENTICATION_TOKEN}`,
        },
      },
    );


    const save = response?.data?.data
    const saveData = {
      rc_number: save?.rc_number,
      fit_up_to: save?.fit_up_to,
      registration_date: save?.registration_date,
      owner_name: save?.owner_name,
      father_name: save?.father_name,
      present_address: save?.present_address,
      permanent_address: save?.permanent_address,
      mobile_number: save?.mobile_number,
      vehicle_category: save?.vehicle_category,
      vehicle_chasi_number: save?.vehicle_chasi_number,
      vehicle_engine_number: save?.vehicle_engine_number,
      maker_description: save?.maker_description,
      maker_model: save?.maker_model,
      body_type: save?.body_type,
      fuel_type: save?.fuel_type,
      color: save?.color,
      norms_type: save?.norms_type,
      financer: save?.financer,
      financed: save?.financed,
      insurance_company: save?.insurance_company,
      insurance_policy_number: save?.insurance_policy_number,
      insurance_upto: save?.insurance_upto,
      manufacturing_date: save?.manufacturing_date,
      manufacturing_date_formatted: save?.manufacturing_date_formatted,
      registered_at: save?.registered_at,
      latest_by: save?.latest_by,
      less_info: save?.less_info,
      tax_upto: save?.tax_upto,
      tax_paid_upto: save?.tax_paid_upto,
      cubic_capacity: save?.cubic_capacity,
      vehicle_gross_weight: save?.vehicle_gross_weight,
      no_cylinders: save?.no_cylinders,
      seat_capacity: save?.seat_capacity,
      sleeper_capacity: save?.sleeper_capacity,
      standing_capacity: save?.standing_capacity,
      wheelbase: save?.wheelbase,
      unladen_weight: save?.unladen_weight,
      vehicle_category_description: save?.vehicle_category,
      pucc_number: save?.pucc_number,
      pucc_upto: save?.pucc_upto,
      permit_number: save?.permit_number,
      permit_issue_date: save?.permit_issue_date,
      permit_valid_from: save?.permit_valid_from,
      permit_valid_upto: save?.permit_valid_upto,
      permit_type: save?.permit_type,
      national_permit_number: save?.national_permit_number,
      national_permit_upto: save?.national_permit_upto,
      national_permit_issued_by: save?.national_permit_issued_by,
      non_use_status: save?.non_use_status,
      non_use_from: save?.non_use_from,
      non_use_to: save?.non_use_to,
      blacklist_status: save?.blacklist_status,
      noc_details: save?.noc_details,
      owner_number: save?.owner_number,
      rc_status: save?.rc_status,
      masked_name: save?.masked_name,
    }


    await vehicleDataModel.create(saveData)


    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetAllCars = async (req, res, next) => {
  try {
    const adminId = req.body?.adminId || req.adminId;
    const page = req.body?.page || req.query?.page || 1;
    const limit = req.body?.limit || req.query?.limit || 10;
    const brand = req.body?.brand || req.query?.brand;
    const color = req.body?.color || req.query?.color;
    const search = req.body?.search || req.query?.search;
    const bodyType = req.body?.bodyType || req.query?.bodyType;
    const financed = req.body?.financed !== undefined ? req.body.financed : req.query?.financed;
    const status = req.body?.status || req.query?.status;
    const seat = req.body?.seat !== undefined ? req.body.seat : req.query?.seat;

    // ---------------- VALIDATION ----------------
    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Admin authorization required",
      });
    }

    // ---------------- PAGINATION ----------------
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // ---------------- FILTERS ----------------
    const query = {};

    // 🔹 FUZZY TEXT MATCHING
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    if (color) {
      query.color = { $regex: color, $options: "i" };
    }

    if (search) {
      const regex = new RegExp(search, "i");

      query.$or = [
        { plateNumber: regex },
        { brand: regex },
        { model: regex },
        { fuelType: regex },
        { status: regex },
      ];
    }

    // 🔹 BOOLEAN (Exact)
    if (financed !== undefined) {
      query.financed = financed;
    }

    // 🔹 ENUM STATUS (Strict but validated)
    if (status) {
      const allowedStatus = ["pending", "approved", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid status value",
        });
      }
      query.status = status;
    }

    // 🔹 FUZZY SEAT LOGIC (±1 tolerance)
    if (seat !== undefined) {
      const seatNumber = Number(seat);
      if (isNaN(seatNumber) || seatNumber <= 0) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid seat value",
        });
      }

      query.seats = {
        $gte: seatNumber - 1,
        $lte: seatNumber + 1,
      };
    }


    // ---------------- DB QUERY ----------------
    const [cars, totalCars] = await Promise.all([
      Car.find(query)
        .populate("owner", "firstName lastName email phone")
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 }),
      Car.countDocuments(query),
    ]);

    // if (!cars || cars.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     error: true,
    //     message: "No cars found",
    //   });
    // }

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      error: false,
      message: "Cars fetched successfully",
      data: cars,
      pagination: {
        totalRecords: totalCars,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCars / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateCarStatus = async (req, res, next) => {
  try {
    const { adminId, carId, status, rejectionReason } = req.body;

    // ---------------- VALIDATION ----------------
    if (!adminId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Admin ID is required",
      });
    }

    if (!carId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Car ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Status is required",
      });
    }

    // Validate status
    const allowedStatus = ["pending", "approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid status. Allowed values: pending, approved, rejected",
      });
    }

    // Check if admin exists (optional, depends on your auth system)
    // const admin = await User.findById(adminId);
    // if (!admin || admin.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     error: true,
    //     message: "Unauthorized access. Admin privileges required.",
    //   });
    // }

    // ---------------- FIND CAR ----------------
    const car = await Car.findById(carId).populate(
      "owner",
      "firstName lastName email phone",
    );
    // .populate("verifiedBy", "name email");

    if (!car) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Car not found",
      });
    }

    // Check if car is already in the requested status
    if (car.status === status) {
      return res.status(400).json({
        success: false,
        error: true,
        message: `Car is already ${status}`,
        data: car,
      });
    }

    // If rejecting, require a reason
    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Rejection reason is required when rejecting a car",
      });
    }

    // ---------------- UPDATE CAR STATUS ----------------
    const updateData = {
      status,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };

    // Add rejection reason if provided
    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      updateData.rejectionAt = new Date();
    }

    // If approving, clear any previous rejection data
    if (status === "approved") {
      updateData.rejectionReason = null;
      updateData.rejectionAt = null;
    }

    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).populate("owner", "firstName lastName email phone");
    // .populate("verifiedBy", "name email");

    // ---------------- SEND NOTIFICATION TO CAR OWNER ----------------
    try {
      const owner = await userModel.findById(car.owner._id);
      if (owner) {
        // Create notification for car owner
        const notification = {
          type: "car_status_update",
          title: `Car ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: `Your car (${car.brand} ${car.model}) has been ${status} ${status === "rejected" ? `: ${rejectionReason}` : "and is now active"
            }`,
          read: false,
          createdAt: new Date(),
        };

        // Add notification to user
        owner.notifications = owner.notifications || [];
        owner.notifications.unshift(notification);

        // Keep only last 50 notifications
        if (owner.notifications.length > 50) {
          owner.notifications = owner.notifications.slice(0, 50);
        }

        await owner.save();

        // Optional: Send email notification
        // await sendCarStatusEmail(owner.email, car, status, rejectionReason);
      }
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
      // Don't fail the request if notification fails
    }

    // ---------------- LOG THE ACTION ----------------
    const adminLog = {
      action: `car_status_update`,
      adminId,
      carId,
      previousStatus: car.status,
      newStatus: status,
      rejectionReason: status === "rejected" ? rejectionReason : null,
      timestamp: new Date(),
    };

    // Save to admin logs (you need to create AdminLog model)
    // await AdminLog.create(adminLog);

    // console.log("Admin action logged:", adminLog);

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      error: false,
      message: `Car ${status} successfully`,
      data: {
        car: updatedCar,
        previousStatus: car.status,
        newStatus: status,
        updatedBy: adminId,
        updatedAt: new Date(),
        notificationSent: true,
      },
    });
  } catch (error) {
    // console.error("Update car status error:", error);

    // Handle specific errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid car ID format",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    next(error);
  }
};

export const handleBulkUpdateCarStatus = async (req, res, next) => {
  try {
    const { adminId, carIds, status, rejectionReason } = req.body;

    // ---------------- VALIDATION ----------------
    if (!adminId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Admin ID is required",
      });
    }

    if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Car IDs array is required and must not be empty",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Status is required",
      });
    }

    const allowedStatus = ["pending", "approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid status. Allowed values: pending, approved, rejected",
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Rejection reason is required for bulk rejection",
      });
    }

    // ---------------- BULK UPDATE ----------------
    const updateData = {
      status,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };

    if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
      updateData.rejectionAt = new Date();
    }

    if (status === "approved") {
      updateData.rejectionReason = null;
      updateData.rejectionAt = null;
    }

    // Update all cars
    const updateResult = await Car.updateMany(
      {
        _id: { $in: carIds },
      },
      { $set: updateData },
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "No cars were updated. Check if car IDs are valid.",
      });
    }

    // ---------------- GET UPDATED CARS ----------------
    const updatedCars = await Car.find({ _id: { $in: carIds } }).populate(
      "owner",
      "firstName lastName email phone",
    );
    // .populate("verifiedBy", "name email");

    // ---------------- SEND NOTIFICATIONS ----------------
    const ownerIds = [
      ...new Set(updatedCars.map((car) => car.owner._id.toString())),
    ];

    await Promise.all(
      ownerIds.map(async (ownerId) => {
        try {
          const owner = await User.findById(ownerId);
          if (owner) {
            const ownerCars = updatedCars.filter(
              (car) => car.owner._id.toString() === ownerId,
            );

            const notification = {
              type: "car_status_bulk_update",
              title: `${ownerCars.length} Car${ownerCars.length > 1 ? "s" : ""} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
              message: `${ownerCars.length} of your car${ownerCars.length > 1 ? "s have" : " has"} been ${status} ${status === "rejected" ? `: ${rejectionReason}` : ""
                }`,
              read: false,
              createdAt: new Date(),
            };

            owner.notifications = owner.notifications || [];
            owner.notifications.unshift(notification);

            if (owner.notifications.length > 50) {
              owner.notifications = owner.notifications.slice(0, 50);
            }

            await owner.save();
          }
        } catch (error) {
          // console.error(`Notification error for owner ${ownerId}:`, error);
        }
      }),
    );

    // ---------------- RESPONSE ----------------
    return res.status(200).json({
      success: true,
      error: false,
      message: `${updateResult.modifiedCount} car${updateResult.modifiedCount > 1 ? "s" : ""} ${status} successfully`,
      data: {
        updatedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount,
        cars: updatedCars,
      },
    });
  } catch (error) {
    // console.error("Bulk update car status error:", error);
    next(error);
  }
};

export const handleGetCarVerificationHistory = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Admin ID is required",
      });
    }

    const car = await Car.findById(carId)
      .populate("owner", "firstName lastName email phone")
      // .populate("verifiedBy", "name email")
      .select(
        "status verificationHistory verifiedAt verifiedBy rejectionReason rejectionAt createdAt updatedAt",
      );

    if (!car) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Car not found",
      });
    }

    // Get verification history from logs or create from current data
    const verificationHistory = [
      {
        status: car.status,
        // verifiedBy: car.verifiedBy,
        verifiedAt: car.verifiedAt,
        rejectionReason: car.rejectionReason,
        rejectionAt: car.rejectionAt,
        createdAt: car.createdAt,
        updatedAt: car.updatedAt,
      },
    ];

    return res.status(200).json({
      success: true,
      error: false,
      message: "Verification history fetched successfully",
      data: {
        car: {
          _id: car._id,
          brand: car.brand,
          model: car.model,
          plateNumber: car.plateNumber,
          owner: car.owner,
        },
        currentStatus: car.status,
        verificationHistory,
      },
    });
  } catch (error) {
    // console.error("Get verification history error:", error);
    next(error);
  }
};

export const handleGetCarsByStatus = async (req, res, next) => {
  try {
    const { adminId, status, page = 1, limit = 10 } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Admin ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Status is required",
      });
    }

    const allowedStatus = ["pending", "approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid status. Allowed values: pending, approved, rejected",
      });
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [cars, totalCars] = await Promise.all([
      Car.find({ status })
        .populate("owner", "firstName lastName email phone")
        .skip(skip)
        .limit(limitNumber)
        .sort({ createdAt: -1 }),
      Car.countDocuments({ status }),
    ]);

    return res.status(200).json({
      success: true,
      error: false,
      message: `Cars with status '${status}' fetched successfully`,
      data: cars,
      pagination: {
        totalRecords: totalCars,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCars / limitNumber),
        limit: limitNumber,
        status,
      },
    });
  } catch (error) {
    // console.error("Get cars by status error:", error);
    next(error);
  }
};
