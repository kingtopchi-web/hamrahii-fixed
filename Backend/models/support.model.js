import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "booking",
        "payment",
        "refund",
        "ride-issue",
        "general",
        "account",
        "safety",
        "contact"
      ],
      default: "Booking",
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "pending", "resolved"],
      default: "open",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Support", supportSchema);
