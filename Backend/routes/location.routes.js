import { Router } from "express";
import { handleGetLocationByCordinates, handleGetLocationSuggestion } from "../controller/location.controller.js";

const locationRouter = Router()


locationRouter.post("/get-suggetions" , handleGetLocationSuggestion)
locationRouter.post("/get-by-coordinates" , handleGetLocationByCordinates)



export default locationRouter