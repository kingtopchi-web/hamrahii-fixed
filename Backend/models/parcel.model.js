import mongoose from "mongoose";

const parcelSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiverDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true }
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride"
    },

    // Route Details
    pickup: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: { type: [Number], required: true },
      accuracy: { type: Number },
      source: { type: String }
    },
    dropoff: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: { type: [Number], required: true }
    },

    // Parcel Specs
    vehicleType: {
      type: String,
      default: "Bike"
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "ONLINE"
    },
    distance: {
      type: Number,
      default: 0
    },
    weight: {
      type: Number,
      default: 0
    },
    parcelType: {
      type: String
    },
    fareDetails: {
      vehicleType: String,
      distanceKm: Number,
      parcelWeight: Number,
      baseFare: Number,
      includedKm: Number,
      extraDistanceKm: Number,
      extraKmRate: Number,
      distanceCharge: Number,
      weightCharge: Number,
      finalFare: Number
    },
    currency: {
      type: String,
      default: "INR"
    },
    
    // Status Flow
    status: {
      type: String,
      enum: [
        "REQUESTED",
        "CREATED",
        "SEARCHING_RIDER",
        "RIDER_ASSIGNED",
        "ACCEPTED",
        "PICKUP_PENDING",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "REJECTED"
      ],
      default: "REQUESTED"
    },
    paymentStatus: {
      type: String,
      enum: [
        "PAYMENT_PENDING",
        "PAYMENT_FAILED",
        "CASH_PENDING",
        "PAID",
        "REFUNDED"
      ],
      default: "PAYMENT_PENDING"
    },

    // Security OTPs
    pickupOtp: {
      type: String
    },
    deliveryOtp: {
      type: String
    },

    // Financials
    amount: {
      type: Number,
      default: 0
    },
    platformCommission: {
      type: Number,
      default: 0
    },
    driverAmount: {
      type: Number,
      default: 0
    },
    
    // Timestamps for status changes
    statusHistory: [
      {
        status: String,
        updatedAt: {
          type: Date,
          default: Date.now
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      }
    ],

    cancellationReason: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Parcel", parcelSchema);
