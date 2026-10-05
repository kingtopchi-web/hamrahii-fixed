import { Router } from "express";
import { isAdmin } from "../middleware/isAdmin.js";
import { handleAddPricingSlabs, handleCreateVehicleType, handleDeleteVehicleType, handleGetPricingSlabsByVehicleTypeId, handleGetVehicleType, handleGetVehicleTypes, handleUpdateParcelPricing } from "../controller/vehicleType.controller.js";
import { auth } from "../middleware/auth.js";
import vehicleTypeModel from "../models/vehicleType.model.js";

const VehicleTypeRouter =  Router()

VehicleTypeRouter.post("/create-vehicle-type", isAdmin, handleCreateVehicleType)
VehicleTypeRouter.post("/get-vehicle-type", isAdmin, handleGetVehicleType)
VehicleTypeRouter.post("/delete-vehicle-type", isAdmin, handleDeleteVehicleType)
VehicleTypeRouter.get("/get-types-by-user", handleGetVehicleTypes)
VehicleTypeRouter.post("/get-types-by-user", handleGetVehicleTypes)
VehicleTypeRouter.post("/add-pricing-slabs" , isAdmin , handleAddPricingSlabs)
VehicleTypeRouter.post("/update-parcel-pricing" , isAdmin , handleUpdateParcelPricing)
VehicleTypeRouter.post("/get-slabs-by-id" , auth , handleGetPricingSlabsByVehicleTypeId)

export default VehicleTypeRouter