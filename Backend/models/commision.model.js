import mongoose, { mongo } from "mongoose";


const commisionSchema = new mongoose.Schema({
    isCommision: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ["Percentage", "Fixed"],
        default: "Percentage"
    },
    value: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    parcelRequestExpiry: {
        type: Number, // In minutes
        default: 5
    }
}, { timestamps: true })


const Commision = mongoose.model("Commision", commisionSchema)
export default Commision