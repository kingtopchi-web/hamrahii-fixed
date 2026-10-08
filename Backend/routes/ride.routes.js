import { Router } from "express";
import { GetAllUpcomingRideByVehicalType, getRidesWithPagination, handleAcceptRideRequest, handleCreateRide, handleFindRides, handleGetLocationSuggestion, handleGetNewBookingRequests, handleGetOfferdRide, handleGetOfferdRideDetails, handleGetRecentRide, handleGetRecentRideByUserId, handleGetRideDetailsById, handleRejectRideRequest, handleRequestRide } from "../controller/ride.controller.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { requireKyc } from "../middleware/requireKyc.js";

const rideRouter = Router()

rideRouter.post("/create"  , auth, requireKyc, handleCreateRide)
rideRouter.post("/get-offered", auth, handleGetOfferdRide)
rideRouter.get("/get-rides", isAdmin,  getRidesWithPagination)
rideRouter.post("/get-location-suggestion", handleGetLocationSuggestion)
rideRouter.post("/find-rides" , auth, requireKyc, handleFindRides)
rideRouter.post("/get-details-by-id" , auth , handleGetRideDetailsById)
rideRouter.post("/request-for-ride" , auth , requireKyc, handleRequestRide)
rideRouter.post("/get-offered-ride-details" , auth ,handleGetOfferdRideDetails)
rideRouter.post("/accept-ride", auth , handleAcceptRideRequest)
rideRouter.post("/reject-ride", auth, handleRejectRideRequest)
rideRouter.post("/recent-ride", handleGetRecentRide)
rideRouter.post("/recent-ride-by-userId", auth,  handleGetRecentRideByUserId)
rideRouter.post("/get-ride-by-vehical-type", GetAllUpcomingRideByVehicalType)
rideRouter.get("/get-new-bookings" , auth , handleGetNewBookingRequests)

export default rideRouter