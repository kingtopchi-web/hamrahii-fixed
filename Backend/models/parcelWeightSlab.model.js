import mongoose from "mongoose";

const parcelWeightSlabSchema = new mongoose.Schema({
    fromWeight: { type: Number, required: true },
    toWeight: { type: Number, required: true },
    extraCharge: { type: Number, required: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" }
}, { timestamps: true });

export default mongoose.model("ParcelWeightSlab", parcelWeightSlabSchema);
