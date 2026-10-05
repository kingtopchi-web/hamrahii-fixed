import userModel from "../models/user.model.js";
import vehicleTypeModel from "../models/vehicleType.model.js";
import VehicleType from "../models/vehicleType.model.js";
import { validateField, validateObjectId } from "../utils/validator/validateFields.js";
import mongoose from "mongoose";

export const handleCreateVehicleType = async (req, res, next) => {
  try {
    const { type, image, description, adminId, maxParcelWeight } = req.body;

    // Field validation
    if (!validateField(type, "Vehicle type is required", res)) return;
    if (!validateField(image, "Vehicle image is required", res)) return;
    if (!validateField(description, "Description is required", res)) return;
    
    // Validate maxParcelWeight
    let parsedWeight = parseFloat(maxParcelWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      parsedWeight = 5; // Default if not provided correctly
    }

    // Verify admin
    const admin = await userModel.findOne({
      _id: adminId,
      role: "admin",
    });

    if (!admin) {
      return res.status(403).json({
        message: "Admin not authorized",
        error: true,
        success: false,
      });
    }

    // Create vehicle type
    const vehicle = await VehicleType.create({
      type,
      image,
      description,
      maxParcelWeight: parsedWeight,
      createdBy: admin._id,
    });

    return res.status(201).json({
      message: "Vehicle type created successfully",
      success: true,
      error: false,
      data: vehicle,
    });

  } catch (error) {
    next(error);
  }
};


export const handleGetVehicleType = async (req, res, next) => {
  try {
    const { type } = req.query;

    const query = {};

    // 🔍 Search by type (case-insensitive)
    if (type) {
      query.type = { $regex: type, $options: "i" };
    }

    const vehicle = await VehicleType.find(query);

    if (!vehicle || vehicle.length === 0) {
      return res.status(404).json({
        message: "No vehicle type found",
        error: true,
        success: false
      });
    }

    return res.status(200).json({
      message: "Vehicle type fetched successfully",
      error: false,
      success: true,
      vehicle
    });

  } catch (error) {
    next(error);
  }
};

export const handleDeleteVehicleType = async (req, res, next) => {
  try {
    const { adminId, vehicleTypeId } = req.body;

    // Validate inputs
    if (!validateField(adminId, "Admin ID is required", res)) return;
    if (!validateField(vehicleTypeId, "Vehicle Type ID is required", res)) return;

    if (!mongoose.Types.ObjectId.isValid(vehicleTypeId)) {
      return res.status(400).json({
        message: "Invalid Vehicle Type ID",
        error: true,
        success: false,
      });
    }

    // Verify admin
    const admin = await userModel.findOne({
      _id: adminId,
      role: "admin",
    });

    if (!admin) {
      return res.status(403).json({
        message: "Admin not authorized",
        error: true,
        success: false,
      });
    }

    // Check if vehicle type exists
    const vehicleType = await VehicleType.findById(vehicleTypeId);

    if (!vehicleType) {
      return res.status(404).json({
        message: "Vehicle Type not found",
        error: true,
        success: false,
      });
    }

    // Delete
    await VehicleType.findByIdAndDelete(vehicleTypeId);

    return res.status(200).json({
      message: "Vehicle Type deleted successfully",
      success: true,
      error: false,
    });

  } catch (error) {
    next(error);
  }
};

export const handleGetVehicleTypes = async (req , res , next) => {
  try {
    const vehicleTypes = await VehicleType.find();

    return res.status(200).json({
      message: "These are vehicle types",
      error: false,
      success: true,
      vehicleTypes
    });
  } catch (error) {
    next(error);
  }
};

export const handleAddPricingSlabs = async (req, res, next) => {
  try {
    const { vehicleTypeId, adminId, slabs } = req.body;

    if (!validateObjectId(vehicleTypeId, "Vehicle type id is invalid", res)) return;
    if (!validateObjectId(adminId, "Admin id is invalid", res)) return;

    if (!Array.isArray(slabs) || slabs.length < 1) {
      return res.status(400).json({ message: "At least one slab is required" });
    }

    const vehicle = await VehicleType.findById(vehicleTypeId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle type not found" });
    }

    // ----- validations skipped here (you already have them) -----



    vehicle.pricing = {
      slabs,
      currency: "INR"
    };

    const updatedVehicle = await vehicle.save();

    // 🔥 THIS IS WHAT YOU NEED FOR FRONTEND
    return res.status(200).json({
      success: true,
      message: "Pricing slabs updated",
      vehicleType: updatedVehicle
    });

  } catch (error) {
    next(error);
  }
};

export const handleGetPricingSlabsByVehicleTypeId = async (req , res , next) => {
  try {
    const {userId, vehicleTypeId} = req.body


    if(!validateObjectId(userId, "Invalid user Id" , res)) return 
    if(!validateObjectId(vehicleTypeId , "Invalid Vehicle type id" , res)) return 


    const isUser  = await userModel.findById(userId)

    if(!validateField(isUser , "User not found" , res)) return 


    const vehicleType = await VehicleType.findById(vehicleTypeId)

    if(!validateField(vehicleType , "Vehicle type is not found" , res)) return 

    // console.log(vehicleType , "this is vehicle type ")

    return res.status(200).json({
      message : "These are slabs",
      error : false,
      success : true,
      slabs : vehicleType?.pricing?.slabs
    })
  } catch (error) {
    next(error)
  }
}
export const handleUpdateParcelPricing = async (req, res, next) => {
  try {
    const { vehicleTypeId, type, baseFare, includedKm, perKm, maxParcelWeight, status } = req.body;
    let vehicle;
    
    if (vehicleTypeId) {
      vehicle = await VehicleType.findById(vehicleTypeId);
      if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle type not found' });
      if (type) vehicle.type = type;
    } else {
      if (!type) return res.status(400).json({ success: false, message: 'Vehicle type name is required' });
      // Create a new vehicle type for parcel
      vehicle = new VehicleType({
        type: type,
        image: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // default box icon
        description: 'Parcel Delivery Vehicle'
      });
    }

    vehicle.parcelPricing = { baseFare, includedKm, perKm };
    vehicle.maxParcelWeight = maxParcelWeight;
    if (status) vehicle.status = status;
    
    await vehicle.save();
    res.status(200).json({ success: true, vehicleType: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

