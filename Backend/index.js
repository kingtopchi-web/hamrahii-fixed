import express from "express"
import fs from "fs"
import path from "path"
import { handleDefaultGetRequest, handleHealthCheck } from "./controller/default.controller.js";
import { handleError } from "./middleware/handleError.js";
import userRouter from "./routes/user.routes.js";
import { configDotenv } from "dotenv";
import { connectDatabase } from "./config/connectDb.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import fileRouter from "./routes/file.routes.js";
import carRouter from "./routes/car.routes.js";
import rideRouter from "./routes/ride.routes.js";
import locationRouter from "./routes/location.routes.js";
import adminRouter from "./routes/admin.routes.js";
import supportRouter from "./routes/support.routes.js";
import blogRouter from "./routes/blog.routes.js";
import VehicleTypeRouter from "./routes/vehicleType.routes.js";
import paymentRouter from "./routes/payment/payment.routes.js";
import parcelRouter from "./routes/parcel.routes.js";
import userModel from "./models/user.model.js";
import supportModel from "./models/support.model.js";
import vehicleDataModel from "./models/vehicleData.model.js";
import rideModel from "./models/ride.model.js";
import vehicleTypeModel from "./models/vehicleType.model.js";
import bcrypt from "bcryptjs";
import { sendToMultiple, sendToSingle } from "./config/firebase/sendMobileNotification.js";
import { handleSendNotificationOnRideCreate } from "./utils/rideNotificationSender/rideNotificationSender.js";
import otpModel from "./models/otp.model.js";
import { sendToMany } from "./utils/sendNotification/sendToMany.js";

configDotenv()
const app = express();
connectDatabase()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://yourdomain.com",
  "https://humrahii.com",
  "https://www.humrahii.com",
  "https://admin.humrahii.com",
  "https://alternate-inquiry-explain-magnetic.trycloudflare.com",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",

];
 
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, mobile apps

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else { 
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(cookieParser());
app.get("/", handleDefaultGetRequest)
app.get("/api/health", handleHealthCheck)

app.use("/api/user", userRouter)
app.use("/api/file", fileRouter)
app.use("/api/car", carRouter)
app.use("/api/ride", rideRouter)
app.use("/api/location", locationRouter)
app.use("/api/admin", adminRouter)
app.use("/api/support", supportRouter)
app.use("/api/blog", blogRouter)
app.use("/api/vehicleType", VehicleTypeRouter)
app.use("/api/payment", paymentRouter) 
app.use("/api/parcel", parcelRouter)

const uploadsDir = fs.existsSync("/pictures") ? "/pictures" : path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const profileUploadsDir = path.join(uploadsDir, "profile");
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
}
const carUploadsDir = path.join(uploadsDir, "car");
if (!fs.existsSync(carUploadsDir)) {
  fs.mkdirSync(carUploadsDir, { recursive: true });
}
const vehiclesUploadsDir = path.join(uploadsDir, "vehicles");
if (!fs.existsSync(vehiclesUploadsDir)) {
  fs.mkdirSync(vehiclesUploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));
app.use("/uploads", (req, res) => {
  const remoteUrl = `https://server.humrahii.com/uploads${req.url}`;
  return res.redirect(remoteUrl);
});
app.use("/vehicles", express.static(vehiclesUploadsDir));
app.use("/vehicles", (req, res) => {
  const remoteUrl = `https://server.humrahii.com/vehicles${req.url}`;
  return res.redirect(remoteUrl);
});


 


 
 
const handleShowUser = async () => {

  const Rides = await rideModel.deleteMany({driver : "6986fa58da3398151886cea6"})
  console.log(Rides)

  const user = await userModel.findByIdAndUpdate("6986fa58da3398151886cea6" , {
    $set : {
      wallet : { 
        balance : 0,
        transactions : []
      }
    }
  })

  console.log(user)

  // const data = {
  //   tokens : user.mobileFcm,
  //   title : "Testing",
  //   body : "This is for testing purpose ",
  //   icon : "", 
  //   link : "https://humrahii.com",
  //   image : "https://cdn.pixabay.com/photo/2015/04/19/08/32/flower-729510_1280.jpg"
  // }

  // const result = await sendToMany(data) 
  // console.log(result , "this is result...") 
} 
 
// handleShowUser()
  

app.post("/api/check-error", (req, res) => {
  console.log(req.body, "this is body ")
})  
  
 



app.use(handleError)
// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


