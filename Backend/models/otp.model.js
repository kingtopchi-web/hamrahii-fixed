import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true, 
    trim: true,
  },
  phone : {
    type: String
    
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index → auto deletes document when expired
  },
}, { timestamps: true });

export default mongoose.model("Otp", otpSchema);
