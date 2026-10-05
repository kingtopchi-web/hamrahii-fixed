import mongoose from "mongoose";

const razorpayOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },

  amount: Number,
  amountDue: Number,
  amountPaid: Number,

  currency: String,

  status: {
    type: String,
    enum: ["created", "paid", "attempted", "failed"],
    default: "created"
  },

  receipt: String,

  notes: {
    type: mongoose.Schema.Types.Mixed
  },

  attempts: Number,

  createdAtRazorpay: Number,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

export default mongoose.model("RazorpayOrder", razorpayOrderSchema);
