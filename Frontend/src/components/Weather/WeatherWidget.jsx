import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, AlertTriangle, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';

const WeatherWidget = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // In a real app we might get this from user preferences, or geolocation API
    const user = useSelector(state => state?.user || {});
    
    useEffect(() => {
        const fetchWeather = async (lat, lon) => {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:4000/api/weather?lat=${lat}&lon=${lon}`);
                const data = await res.json();
                if (data.success) {
                    setWeather(data.data);
                } else {
                    setError("Failed to load weather");
                }
            } catch (err) {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        };

        // Default location or user preference
        const lat = user?.weatherPreferences?.location?.lat || 28.7041; // Delhi default
        const lon = user?.weatherPreferences?.location?.lon || 77.1025;
        
        fetchWeather(lat, lon);
    }, [user]);

    if (loading) return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 animate-pulse h-32 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Loading weather...</span>
        </div>
    );
    
    if (error || !weather) return null;

    // Map WMO weather codes to icons
    const getWeatherIcon = (code) => {
        if (code <= 3) return <Sun className="w-8 h-8 text-amber-500" />;
        if (code <= 48) return <Cloud className="w-8 h-8 text-gray-400" />;
        if (code <= 67) return <CloudRain className="w-8 h-8 text-blue-400" />;
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
    };

    const currentTemp = Math.round(weather.current.temperature_2m);
    const condition = weather.current.weather_code <= 3 ? "Clear/Cloudy" : "Rain/Severe";

    return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Current Weather
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-800">{currentTemp}°C</span>
                        <span className="text-sm text-gray-500">{condition}</span>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Wind className="w-3 h-3"/> {weather.current.wind_speed_10m} km/h</span>
                        <span className="flex items-center gap-1">Hum: {weather.current.relative_humidity_2m}%</span>
                    </div>
                </div>
                <div className="p-3 bg-blue-50/50 rounded-full border border-blue-100/50">
                    {getWeatherIcon(weather.current.weather_code)}
                </div>
            </div>
            
            {/* Quick Alert Example */}
            {weather.current.precipitation > 0 && (
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-2 flex items-center gap-2 text-xs text-blue-700">
                    <CloudRain className="w-4 h-4"/> Rain expected today. Drive safely.
                </div>
            )}
        </div>
    );
};

export default WeatherWidget;
