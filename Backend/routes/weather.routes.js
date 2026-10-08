import express from "express";
import { getWeather, updateWeatherPreferences } from "../controller/weather.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getWeather);
router.post("/preferences", auth, updateWeatherPreferences);

export default router;
