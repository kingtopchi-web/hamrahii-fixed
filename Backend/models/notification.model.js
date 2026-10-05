import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    title: {
        type: String,
        default: "Hamrahii Notification"
    },
    message: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        default: "broadcast"
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);