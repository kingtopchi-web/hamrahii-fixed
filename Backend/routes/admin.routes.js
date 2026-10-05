
import {Router} from "express"
import { createBanner, getBanners, getDashboardOverview, getDriverStats, getPerformanceMetrics, getPopularRoutes, getRecentRides, getRevenueAnalytics, handleAdminAddWalletMoney, handleBroadcast, handleDeleteBanner, handleGetAdminDetails, handleGetAllMessage, handleGetAllRides, handleGetAllUsers, handleGetAllUserWithPagination, handleGetRideStats, handleGetSingleUserDetails, handleLogOut, handleSendLoginOtp, handleUpdateCommision, handleUpdateUserVerificationStatus, handleVerifyOtpAndLogin, updateBanner, handleGetAllParcels } from "../controller/admin.controller.js"
import { isAdmin } from "../middleware/isAdmin.js"
import { getPlatformHealth } from "../controller/platformHealth.controller.js"
import { createParcelSlab, getParcelSlabs, updateParcelSlab, deleteParcelSlab } from "../controller/parcelSlab.controller.js"

const adminRouter = Router()

adminRouter.post("/add-wallet-money", isAdmin, handleAdminAddWalletMoney)
adminRouter.post("/add-virtual-money", isAdmin, handleAdminAddWalletMoney)
adminRouter.post("/send-login-otp" , handleSendLoginOtp)
adminRouter.post("/verify-otp-login" , handleVerifyOtpAndLogin)
adminRouter.get("/get-admin-details" , isAdmin , handleGetAdminDetails)
adminRouter.get("/logout" , handleLogOut)
adminRouter.post("/get-user-with-pagination" , isAdmin , handleGetAllUserWithPagination)
adminRouter.get("/get-user-with-pagination" , isAdmin , handleGetAllUserWithPagination)
adminRouter.get("/get-user/:userId", isAdmin, handleGetSingleUserDetails)
adminRouter.post("/get-user/:userId", isAdmin, handleGetSingleUserDetails)
adminRouter.post("/update-user-status" , isAdmin , handleUpdateUserVerificationStatus)
adminRouter.post("/get-rides-stats" , isAdmin, handleGetRideStats)
adminRouter.post("/get-all-message", isAdmin, handleGetAllMessage)
adminRouter.get("/dashboard-overview", isAdmin, getDashboardOverview)
adminRouter.get("/recent-rides", isAdmin, getRecentRides)
adminRouter.get("/popular-routes", isAdmin, getPopularRoutes)
adminRouter.get("/driver-stats" , isAdmin, getDriverStats)
adminRouter.get("/revenue-analytics" , isAdmin, getRevenueAnalytics)
adminRouter.get("/performance-metrics" , isAdmin, getPerformanceMetrics)
adminRouter.get("/get-all-rides", isAdmin, handleGetAllRides)
adminRouter.get("/get-all-parcels", isAdmin, handleGetAllParcels)
adminRouter.get("/get-all-users", isAdmin, handleGetAllUsers)
adminRouter.post("/perform-broadcast", isAdmin, handleBroadcast)
adminRouter.get("/platform-health", isAdmin, getPlatformHealth)
adminRouter.post("/create-banner" , isAdmin ,  createBanner)
adminRouter.post("/update-banner/:id" , isAdmin, updateBanner)
adminRouter.post("/get-banners" , isAdmin, getBanners)
adminRouter.post("/delete-banner" , isAdmin,  handleDeleteBanner)
adminRouter.post("/update-commision" , isAdmin , handleUpdateCommision)

adminRouter.post("/parcel-slabs", isAdmin, createParcelSlab)
adminRouter.get("/parcel-slabs", isAdmin, getParcelSlabs)
adminRouter.put("/parcel-slabs/:id", isAdmin, updateParcelSlab)
adminRouter.delete("/parcel-slabs/:id", isAdmin, deleteParcelSlab)

export default adminRouter