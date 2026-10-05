import mongoose from "mongoose";
import { carSchema } from "./car.model.js";

const rideSchema = new mongoose.Schema(
  {
    // -------------------------
    // CORE REFERENCES
    // -------------------------
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true
    },

    carDetails: {
      type: carSchema,
      required: true,
      sparse: true
    },

    // -------------------------
    // ROUTE
    // -------------------------
    from: {
      city: String,
      address: String,
      coordinates: { type: [Number], required: true }
    },

    to: {
      city: String,
      address: String,
      coordinates: { type: [Number], required: true }
    },

    departureTime: {
      type: String,
      required: true
    },
    departureDate: {
      type: String,
      required: true
    },

    // -------------------------
    // SEATS & PRICE
    // -------------------------
    totalSeats: {
      type: Number,
      required: true,
      min: 1
    },

    availableSeats: {
      type: Number,
      required: true
    },

    pricePerSeat: {
      type: Number,
      required: true
    },

    // -------------------------
    // STATUS
    // -------------------------
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled"
    },
    distance: {
      type: Number,
      required: true
    },


    passengers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },

        pickup: {
          address: String,
          city: String,
          coordinates: [Number]
        },

        drop: {
          address: String,
          city: String,
          coordinates: [Number]
        },

        seatsBooked: {
          type: Number,
          default: 1
        },

        status: {
          type: String,
          enum: ["requested", "accepted", "rejected", "cancelled", "completed"],
          default: "requested"
        },

        cancelledAt: Date,
        cancellationReason: String,

        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],


    chatRoomId: {
      type: String,
      unique: true
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },

    // -------------------------
    // PREFERENCES & LUGGAGE
    // -------------------------
    preferences: {
      smoking: { type: String, enum: ["allowed", "not-allowed"], default: "not-allowed" },
      music: { type: String, enum: ["allowed", "not-allowed"], default: "allowed" },
      pets: { type: String, enum: ["allowed", "not-allowed"], default: "not-allowed" },
      conversation: { type: String, enum: ["chatty", "quiet", "either", "preferred"], default: "either" },
      luggageSpace: { type: String }
    },

    parcels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parcel"
      }
    ],

    // -------------------------
    // STOPS
    // -------------------------
    stops: [
      {
        address: String,
        city: String,
        coordinates: [Number]
      }
    ],

    // -------------------------
    // RIDE-LEVEL CANCELLATION
    // -------------------------
    cancelledBy: {
      type: String,
      enum: ["driver", "system", "admin"],
    },

    cancellationReason: {
      type: String
    },

    cancelledAt: {
      type: Date
    },

    // -------------------------
    // SOFT DELETE
    // -------------------------
    isDeleted: {
      type: Boolean,
      default: false
    },
    isFullSharing: {
      type: Boolean,
      default: false
    },

    // -------------------------
    // FEES & COMMISSION
    // -------------------------
    creationFee: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      default: 0
    },
    commission: {
      type: Number,
      default: 0
    }

  },
  { timestamps: true }
);

export default mongoose.model("Ride", rideSchema);
