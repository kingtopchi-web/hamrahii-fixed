import { Router } from "express";
import {  handeGetTransactionDetails, handleAddBio, handleConfirmDlDetails, handleCreditWallet, handleEditBasicDetails, handleGetFullUserDetails, handleGetReferralDetails, handleGetRidesBooking, handleGetUserNotifications, handleMarkNotificationsAsRead, handlegetVirtualTransaction, handleGoogleLogin, handleGoogleSignIn, handleRegisterUser, handleSaveMobileFcm, handleSaveNewFcmToken, handleSendOtpForPasswordReset, handleUpdateUserLocation, handleToggleLiveLocation, handleUpdateLiveLocation, handleUploadProfilePic, handleUserContactSupport, handleUserLogin, handleUserLogout, handleVerifyDrivingLicences, handleVerifyOtpAndResetPassword, sendEmailVerificationOTP, sendPhoneVerificationOTP, updatePreferences, verifyEmailOTP, verifyPhoneOTP } from "../controller/user.controller.js";
import { auth } from "../middleware/auth.js";
import { handleExe } from "../controller/ride.controller.js";
import { handleGetCommision } from "../controller/default.controller.js";


const userRouter =  Router()


userRouter.post("/register" ,handleRegisterUser )
userRouter.post("/login" ,handleUserLogin )
userRouter.post("/get-user-details" , auth , handleGetFullUserDetails)
userRouter.get("/logout" ,  handleUserLogout)
userRouter.post("/send-otp-for-password-reset" ,  handleSendOtpForPasswordReset)
userRouter.post("/reset-password" ,  handleVerifyOtpAndResetPassword)
userRouter.post("/upload-profile-pic" , auth, handleUploadProfilePic)
userRouter.post("/edit-basic-details" , auth, handleEditBasicDetails)
userRouter.post("/google-login" , handleGoogleLogin)
userRouter.post("/google-registration" ,handleRegisterUser )
userRouter.post("/google-sign-in" ,handleGoogleSignIn)
userRouter.post("/contact" , handleUserContactSupport)
userRouter.post("/save-fcm" , auth , handleSaveNewFcmToken)
userRouter.post("/credit-wallet" , auth , handleCreditWallet)
userRouter.get("/transaction" , auth , handeGetTransactionDetails)
userRouter.post("/exe" , handleExe)
userRouter.get("/ride-booking-history", auth, handleGetRidesBooking)
userRouter.post("/send-email-verification-otp", auth, sendEmailVerificationOTP)
userRouter.post("/verify-email-otp", auth, verifyEmailOTP)
userRouter.post("/send-phone-verification-otp",  sendPhoneVerificationOTP)
userRouter.post("/verify-phone-opt", verifyPhoneOTP)
userRouter.post("/verify-phone-otp", verifyPhoneOTP)
userRouter.post("/edit-preferences", auth,  updatePreferences)
userRouter.post("/add-bio", auth, handleAddBio)
userRouter.get("/get-referrals" , auth , handleGetReferralDetails)
userRouter.get("/get-virtual-transaction" , auth , handlegetVirtualTransaction)
userRouter.post("/get-dl-details" , auth , handleVerifyDrivingLicences)
userRouter.post("/confirm-dl-details" , auth , handleConfirmDlDetails)
userRouter.post("/save-mobile-fcm" , handleSaveMobileFcm)
userRouter.post("/update-location" , auth , handleUpdateUserLocation)
userRouter.get("/commision" , handleGetCommision)
userRouter.get("/notifications", auth, handleGetUserNotifications)
userRouter.post("/notifications/mark-read", auth, handleMarkNotificationsAsRead)

userRouter.post("/toggle-live-location", auth, handleToggleLiveLocation);
userRouter.post("/update-live-location", auth, handleUpdateLiveLocation);

export default userRouter;
