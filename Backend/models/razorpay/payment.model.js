

import mongoose from "mongoose";

const razorpayPaymentSchema = new mongoose.Schema({
  paymentId: String,
  orderId: String,
  signature: String,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  amount: Number,

  status: {
    type: String,
    enum: ["success", "failed", "pending"]
  },

  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


export default mongoose.model("RazorpayPayment" , razorpayPaymentSchema)