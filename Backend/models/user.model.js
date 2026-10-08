import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: Number,
    type: String,
    source: String,
    status: String,
    referenceId: String,
    balanceAfter: Number,
    description: String
}, { timestamps: true });

const virtualMoneyTransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        type: {
            type: String,
            enum: ["credit", "debit"],
            required: true,
        },

        source: {
            type: String,
            enum: ["referral", "signup", "promo", "admin", "system"],
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "completed", "failed", "reverted"],
            default: "completed",
        },


        referenceId: {
            type: String, // rideId, referralId, orderId etc.
        },


        description: {
            type: String,
            maxlength: 255,
        },

        balanceAfter: {
            type: Number,
        },
    },
    { timestamps: true }
);

const dlSchema = new mongoose.Schema({
    blood_group: {
        type: String,
    },
    citizenship: {
        type: String,
    },
    dob: {
        type: String,
    },
    doe: {
        type: String,
    },
    doi: {
        type: String,
    },
    initial_doi: {
        type: String,
    },
    father_or_husband_name: {
        type: String,
    },
    gender: {
        type: String,
    },
    license_number: {
        type: String,
        index: true,
        trim: true,
    },
    name: {
        type: String,
    },
    ola_code: {
        type: String,
    },
    permanent_address: {
        type: String,
    },
    permanent_zip: {
        type: String,
    },
    temporary_address: {
        type: String,
    },
    temporary_zip: {
        type: String,
    },
    state: {
        type: String,
    },
    transport_doe: {
        type: String,
    },
    vehicle_classes: [String],
})

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        sparse: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: 'prefer-not-to-say'
    },
    countryCode: {
        type: String,
        default: "IN"
    },
    countryName: {
        type: String,
        default: "India"
    },
    dial_code: {
        type: String,
        default: "+91"
    },
    profilePhotos: [{
        url: {
            type: String,
            default: 'https://res.cloudinary.com/hamrahi/image/upload/v1/default-avatar.png',
        },
        isDefault: {
            type: Boolean,
            default: true
        }
    }],
    bio: {
        type: String,
        maxlength: [800, 'Bio cannot exceed 800 characters'],
        default: ''
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point' , "point"],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        },
        address: String,
        city: String,
        state: String,
        pincode: String,
        accuracy: Number
    },
    trustScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    preferences: {
        smoking: {
            type: String,
            enum: ['allowed', 'not-allowed', 'ask-me', 'neutral'],
            default: 'not-allowed'
        },
        music: {
            type: String,
            enum: ['allowed', 'not-allowed', 'ask-me', 'neutral'],
            default: 'allowed'
        },
        pets: {
            type: String,
            enum: ['allowed', 'not-allowed', 'ask-me', 'neutral'],
            default: 'ask-me'
        },
        conversation: {
            type: String,
            enum: ['chatty', 'quiet', 'either', 'neutral'],
            default: 'either'
        },
        luggageSpace: {
            small: { type: Boolean, default: true },
            medium: { type: Boolean, default: true },
            large: { type: Boolean, default: false }
        }
    },
    kyc: {
        status: {
            type: String,
            enum: ["NOT_SUBMITTED", "PENDING", "VERIFIED", "REJECTED"],
            default: "NOT_SUBMITTED"
        },
        provider: {
            type: String,
            default: null
        },
        verificationReference: {
            type: String,
            default: null
        },
        verifiedAt: {
            type: Date,
            default: null
        },
        rejectionReason: {
            type: String,
            default: null
        }
    },
    wallet: {
        balance: {
            type: Number,
            default: 0,
            min: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        transactions: [walletTransactionSchema]
    },
    paymentMethods: [{
        type: {
            type: String,
            enum: ['card', 'upi', 'netbanking', 'wallet']
        },
        provider: String,
        lastFour: String,
        isDefault: { type: Boolean, default: false },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    socialProfiles: {
        facebook: String,
        google: String,
        linkedin: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'deleted'],
        default: 'active'
    },
    isVerified: {
        type: String,
        enum: ["review", "rejected", "verified", "incomplete", "pending"],
        default: "incomplete"
    },
    verificationMessage: {
        type: String,
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    latestNotification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification"
    },
    cars: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car"
        }
    ],
    fcm: [
        {
            type: String
        }
    ],
    referralCode: {
        type: String,
        required: true,
        unique: true,
        sparse: true,
    },
    virtualMoney: {
        balance: {
            type: Number,
            default: 0,
            min: 0
        },
        transactions: [virtualMoneyTransactionSchema]
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    referrals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    dlVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    dlDetials: [dlSchema],
    dl_number: {
        type: String,
        default: "",
        index: true,
        trim: true,
        unique: true
    },
    mobileFcm : [String],
    liveLocationEnabled: {
        type: Boolean,
        default: false
    },
    lastLocationUpdate: {
        type: Date
    },
    maxParcelWeight: {
        type: Number,
        default: 0
    },
    weatherPreferences: {
        location: {
            name: { type: String, default: "" },
            lat: { type: Number },
            lon: { type: Number }
        },
        notificationsEnabled: { type: Boolean, default: false },
        dailyUpdates: { type: Boolean, default: false },
        severeAlerts: { type: Boolean, default: false }
    }
}, { timestamps: true })

export default mongoose.model("User", userSchema)