import {Router} from "express"
import { createCar, handleBulkUpdateCarStatus, handleDeactivateCar, handleGetAllCars, handleGetCarsByStatus, handleGetCarsByUserId, handleGetCarVerificationHistory, handleUpdateCarStatus, handleUseSurePassApi } from "../controller/car.controller.js"
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
const carRouter = Router()


carRouter.post("/add" , auth , createCar);
carRouter.post("/deactivate" , auth , handleDeactivateCar);
carRouter.get("/get-by-user" , auth , handleGetCarsByUserId);
carRouter.post("/surepass-api", auth, handleUseSurePassApi);
carRouter.post("/get-all-car", isAdmin, handleGetAllCars);
carRouter.get("/get-all-car", isAdmin, handleGetAllCars);
carRouter.post("/update-car-status", isAdmin, handleUpdateCarStatus);
carRouter.post("/bulk-update-car-status", isAdmin, handleBulkUpdateCarStatus);
carRouter.post("/get-car-by-status", isAdmin, handleGetCarsByStatus);
carRouter.get("/get-car-by-status", isAdmin, handleGetCarsByStatus);
carRouter.post("/get-car-verifivation-history", isAdmin, handleGetCarVerificationHistory);



export default carRouter