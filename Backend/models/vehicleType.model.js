import mongoose from "mongoose";

const priceSlabSchema = new mongoose.Schema({
    minKm: { type: Number, required: true },
    maxKm: { type: Number, required: true },   // use 9999 for "above 20"
    baseFare: { type: Number, required: true },
    perKm: { type: Number, required: true },
    fullSharing: { type: Boolean, default: false }
}, { _id: false });


const vehicleTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    pricing: {
        slabs: [priceSlabSchema],
        currency: {
            type: String,
            default: "INR"
        }
    },
    parcelPricing: {
        baseFare: { type: Number, default: 50 },
        includedKm: { type: Number, default: 1 },
        perKm: { type: Number, default: 10 },
    },
    maxParcelWeight: {
        type: Number
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    description: {
        type: String
    },
}, { timestamps: true })

export default mongoose.model("VehicleType", vehicleTypeSchema)