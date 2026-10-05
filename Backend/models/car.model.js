import mongoose from "mongoose";

export const carSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Basic car info
    brand: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },

    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "cng", "electric", "hybrid"],
      required: true
    },

    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    seats: {
      type: Number,
      required: true
    },

    // Images
    images: [String],

    // Optional but realistic
    plateNumber: {
      type: String,
      required: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },

    plateImage: {
      type: String,
      maxlength: 500
    },
    rejectionReason: {
      type: String,
    },
    chassisNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // Ensure chassis numbers are unique
    },

    engineNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    surepass: {
      type: Object,
      sparse: true
    },
    vehicleType : {
      type : String,
      required : true
    },
    vehicleTypeId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "VehicleType",
      required : true
    }


  },
  { timestamps: true }
);

export const Car = mongoose.model("Car", carSchema);
