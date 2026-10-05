import mongoose from "mongoose";
const customerSupportSchema = new mongoose.Schema({
  // Basic contact information (Required)
  name: {
    type: String,
    required: [true, 'Full Name is required'],
    trim: true,
    minlength: [2, 'Full Name must be at least 2 characters long'],
    maxlength: [100, 'Full Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email Address is required'],
    trim: true,
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['general', 'technical', 'billing', 'safety', 'feedback', 'other'],
    default: 'general'
  },
  
  subject: {
    type: String,
   
  },
  
  message: {
    type: String,
   
  
  
  },
},{timestamps:true}
)
export default mongoose.model('CustomerSupport', customerSupportSchema);