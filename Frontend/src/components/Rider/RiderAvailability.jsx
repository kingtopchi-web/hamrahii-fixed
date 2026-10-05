import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Axios from "../../services/axios";
import { setUserDetails } from "../../store/userReducer";
import { toast } from "react-toastify";
import { Navigation, Loader2, Edit2, Check, X } from "lucide-react";

const RiderAvailability = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isLive, setIsLive] = useState(Boolean(user?.liveLocationEnabled));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLive(Boolean(user?.liveLocationEnabled));
  }, [user?.liveLocationEnabled]);

  const updateLocationToServer = async (latitude, longitude, accuracy) => {
    try {
      await Axios.post("/user/update-live-location", { latitude, longitude, accuracy });
    } catch (err) {
      console.error("Failed to update background location:", err);
    }
  };

  const toggleLocation = async () => {
    const nextState = !isLive;
    setLoading(true);
    try {
      if (nextState) {
        if (!navigator.geolocation) {
          toast.error("Geolocation is not supported by your browser");
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            try {
              const res = await Axios.post("/user/toggle-live-location", {
                liveLocationEnabled: true,
              });

              if (res.data?.success) {
                setIsLive(true);
                dispatch(setUserDetails({ ...user, liveLocationEnabled: true }));
                await updateLocationToServer(latitude, longitude, accuracy);
                toast.success("Parcel mode enabled!");
              }
            } catch (err) {
              console.error(err);
              toast.error(err.response?.data?.message || "Failed to enable live location");
            } finally {
              setLoading(false);
            }
          },
          (geoErr) => {
            console.error("Location permission denied or error:", geoErr);
            toast.error("Please allow location access in your browser to enable live location.");
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        const res = await Axios.post("/user/toggle-live-location", {
          liveLocationEnabled: false,
        });

        if (res.data?.success) {
          setIsLive(false);
          dispatch(setUserDetails({ ...user, liveLocationEnabled: false }));
          toast.info("Parcel mode disabled. You are now offline for parcel deliveries.");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update live location");
      setLoading(false);
    }
  };

  // Keep sending live location every 12 seconds when enabled
  useEffect(() => {
    let intervalId;
    if (isLive && navigator.geolocation) {
      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            updateLocationToServer(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
          },
          (err) => console.log("Background geo tick error:", err),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }, 12000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLive]);

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-sm transition-all p-4 sm:p-5 border border-gray-100 flex flex-col h-fit self-start w-full">
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isLive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
              <Navigation className={`w-4 h-4 ${isLive ? "animate-pulse" : ""}`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">Rider Availability</h3>
              <p className="text-[11px] text-gray-400 font-medium">Parcel Deliveries</p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
            isLive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-gray-100 text-gray-500"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
            {isLive ? "Online" : "Offline"}
          </span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed mb-4 min-h-[36px]">
          {isLive
            ? "Broadcasting location. Ready to receive delivery requests within 10 km."
            : "Turn on parcel mode to start receiving nearby parcel delivery requests."}
        </p>

        {/* Max weight capacity removed based on new requirements */}
      </div>

      <button
        onClick={toggleLocation}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-xs disabled:opacity-60 cursor-pointer ${
          isLive
            ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating...</span>
          </>
        ) : isLive ? (
          <span>Disable Parcel Mode</span>
        ) : (
          <>
            <Navigation className="w-3.5 h-3.5" />
            <span>Enable Parcel Mode</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RiderAvailability;
