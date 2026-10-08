import userModel from "../models/user.model.js";

// Basic in-memory cache for weather requests
const weatherCache = new Map();

// Helper to fetch from Open-Meteo
const fetchWeatherData = async (lat, lon) => {
    // Round to 2 decimal places to increase cache hit rate and avoid redundant API calls
    const cacheKey = `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
    
    if (weatherCache.has(cacheKey)) {
        const cached = weatherCache.get(cacheKey);
        // Cache for 15 minutes (900000 ms)
        if (Date.now() - cached.timestamp < 900000) {
            return cached.data;
        }
    }

    // Open-Meteo Free API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch weather data");
    }
    const data = await response.json();
    
    weatherCache.set(cacheKey, {
        timestamp: Date.now(),
        data
    });
    
    return data;
};

export const getWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
        }

        const weatherData = await fetchWeatherData(lat, lon);
        
        return res.status(200).json({
            success: true,
            data: weatherData
        });
        
    } catch (error) {
        console.error("Weather Fetch Error:", error);
        return res.status(500).json({ success: false, message: "Error fetching weather data" });
    }
};

export const updateWeatherPreferences = async (req, res) => {
    try {
        const userId = req.userId;
        const { location, notificationsEnabled, dailyUpdates, severeAlerts } = req.body;
        
        const updateData = {};
        if (location) updateData['weatherPreferences.location'] = location;
        if (typeof notificationsEnabled === 'boolean') updateData['weatherPreferences.notificationsEnabled'] = notificationsEnabled;
        if (typeof dailyUpdates === 'boolean') updateData['weatherPreferences.dailyUpdates'] = dailyUpdates;
        if (typeof severeAlerts === 'boolean') updateData['weatherPreferences.severeAlerts'] = severeAlerts;
        
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );
        
        return res.status(200).json({
            success: true,
            message: "Weather preferences updated",
            data: updatedUser.weatherPreferences
        });

    } catch (error) {
        console.error("Update Weather Prefs Error:", error);
        return res.status(500).json({ success: false, message: "Error updating preferences" });
    }
};
