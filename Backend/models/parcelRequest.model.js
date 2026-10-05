import mongoose from "mongoose";

const parcelRequestSchema = new mongoose.Schema({
  parcelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parcel",
    required: true,
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED", "ASSIGNED_TO_OTHER", "EXPIRED"],
    default: "PENDING",
  },
  respondedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  }
}, { timestamps: true });

export default mongoose.model("ParcelRequest", parcelRequestSchema);
