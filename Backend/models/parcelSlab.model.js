import mongoose from "mongoose";

const parcelSlabSchema = new mongoose.Schema({
  fromKm: { type: Number, required: true },
  toKm: { type: Number, required: true },
  fromWeight: { type: Number, required: true },
  toWeight: { type: Number, required: true },
  parcelType: { type: String, required: true },
  vehicleType: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" }
}, { timestamps: true });

export default mongoose.model("ParcelSlab", parcelSlabSchema);
