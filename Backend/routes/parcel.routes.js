import express from "express";
import { auth } from "../middleware/auth.js";
import {
  handleCreateParcel,
  handleGetMyParcels,
  handleGetRideParcels,
  handleUpdateParcelStatus,
  handleAcceptParcel,
  handleRejectParcel,
  handleGetParcelRequests,
  handleGetRiderDeliveries,
  handleVerifyOnlinePayment,
  handleCashReceived,
  handleCalculateFare,
  handleGetParcelTracking,
  handleGetNearbyRiders,
  handleRefreshParcelSearch
} from "../controller/parcel.controller.js";

const router = express.Router();

router.use(auth);

router.post("/calculate-fare", handleCalculateFare);
router.post("/create", handleCreateParcel);
router.get("/my-parcels", handleGetMyParcels);
router.get("/requests", handleGetParcelRequests);
router.get("/deliveries", handleGetRiderDeliveries);
router.get("/ride/:rideId", handleGetRideParcels);
router.get("/:parcelId/track", handleGetParcelTracking);
router.get("/:parcelId/nearby-riders", handleGetNearbyRiders);
router.post("/:parcelId/refresh-search", handleRefreshParcelSearch);
router.patch("/:parcelId/status", handleUpdateParcelStatus);
router.post("/:parcelId/accept", handleAcceptParcel);
router.post("/:parcelId/reject", handleRejectParcel);
router.post("/:parcelId/verify-payment", handleVerifyOnlinePayment);
router.post("/:parcelId/cash-received", handleCashReceived);

export default router;
