import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GoogleMap,
  MarkerF,
  CircleF,
} from "@react-google-maps/api";
import { useGoogleMaps } from "../maps/GoogleMapsProvider";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { toast } from "react-toastify";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Star,
  Navigation,
  RefreshCw,
  X,
  Radio,
  Car,
  Bike
} from "lucide-react";

// --- VEHICLE MARKER SVG GENERATOR ---
const getSmallVehicleMarkerUri = (type = "bike") => {
  const norm = (type || "").toLowerCase();
  let path = "";
  if (norm.includes("car") || norm.includes("auto")) {
    path = `<path d="M12 25h24v-4l-3-6h-18l-3 6v4z" fill="#2563EB"/><circle cx="16" cy="26" r="2.5" fill="#1E293B"/><circle cx="32" cy="26" r="2.5" fill="#1E293B"/>`;
  } else {
    path = `<circle cx="16" cy="26" r="3" fill="#1E293B"/><circle cx="32" cy="26" r="3" fill="#1E293B"/><path d="M18 25l4-7 4 3 4-6h3v2h-2l-3 5-4-3-3 6h-2z" fill="#EA580C"/>`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="20" fill="rgba(37, 99, 235, 0.25)"/>
      <circle cx="24" cy="24" r="15" fill="#FFFFFF" stroke="#2563EB" stroke-width="2"/>
      <g transform="translate(0, 0)">${path}</g>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getPickupMarkerUri = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M18 0C8.1 0 0 8.1 0 18c0 13.5 18 28 18 28s18-14.5 18-28c0-9.9-8.1-18-18-18z" fill="#059669" filter="url(#shadow)"/>
      <circle cx="18" cy="17" r="11" fill="#FFFFFF"/>
      <circle cx="18" cy="17" r="6" fill="#059669"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "simplified" }] },
  ],
};

const STATUS_MESSAGES = [
  "Finding driver near you...",
  "Searching nearby riders...",
  "Looking for available drivers...",
  "Still searching for a driver..."
];

const FindingDriverScreen = ({ parcel: initialParcel, onBack, onDriverAssigned, onCancelled }) => {
  const [parcel, setParcel] = useState(initialParcel);
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assignedDriver, setAssignedDriver] = useState(initialParcel.driver || null);
  const [isAccepted, setIsAccepted] = useState(
    Boolean(initialParcel.driver || ["ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(initialParcel.status))
  );

  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const messageIntervalRef = useRef(null);

  // 2-Minute (120s) Countdown Timer synchronized with parcel creation/update
  const calculateInitialSeconds = () => {
    const createdAt = new Date(initialParcel.createdAt || Date.now()).getTime();
    const elapsedSeconds = Math.floor((Date.now() - createdAt) / 1000);
    const rem = 120 - (elapsedSeconds % 120);
    return rem > 0 && rem <= 120 ? rem : 120;
  };

  const [timeLeft, setTimeLeft] = useState(calculateInitialSeconds);

  // Center Coordinates: Pickup location
  const pickupCoords = parcel.pickup?.coordinates;
  const centerLat = Array.isArray(pickupCoords) && pickupCoords.length === 2 ? Number(pickupCoords[1]) : 28.6139;
  const centerLng = Array.isArray(pickupCoords) && pickupCoords.length === 2 ? Number(pickupCoords[0]) : 77.2090;

  // 1. Fetch Nearby Riders from backend
  const fetchNearbyRiders = useCallback(async () => {
    if (isAccepted) return;
    try {
      const res = await Axios.get(api.parcel.getNearbyRiders(parcel._id));
      if (res.data?.success) {
        setNearbyRiders(res.data.riders || []);
        if (res.data.driver) {
          setAssignedDriver(res.data.driver);
          setIsAccepted(true);
          if (onDriverAssigned) onDriverAssigned(res.data.driver);
        }
      }
    } catch (err) {
      console.error("Failed to fetch nearby riders:", err);
    }
  }, [parcel._id, isAccepted, onDriverAssigned]);

  // 2. Poll parcel tracking/status to check for driver acceptance
  const checkParcelStatus = useCallback(async () => {
    if (isAccepted) return;
    try {
      const res = await Axios.get(api.parcel.track(parcel._id));
      if (res.data?.success) {
        const pData = res.data.data;
        if (pData.driver || ["ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(pData.status)) {
          setAssignedDriver(pData.driver);
          setIsAccepted(true);
          setParcel((prev) => ({ ...prev, status: pData.status, driver: pData.driver }));
          toast.success("Driver assigned to your parcel!");
          if (onDriverAssigned) onDriverAssigned(pData.driver);
        }
      }
    } catch (err) {
      console.error("Error polling parcel status:", err);
    }
  }, [parcel._id, isAccepted, onDriverAssigned]);

  // 3. Refresh Search when 2-minute cycle completes
  const handleRefreshCycle = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await Axios.post(api.parcel.refreshSearch(parcel._id));
      if (res.data?.alreadyAssigned) {
        setAssignedDriver(res.data.driver);
        setIsAccepted(true);
        if (onDriverAssigned) onDriverAssigned(res.data.driver);
      } else {
        fetchNearbyRiders();
      }
    } catch (err) {
      console.error("Failed to refresh search:", err);
    } finally {
      setIsRefreshing(false);
      setTimeLeft(120);
    }
  }, [parcel._id, fetchNearbyRiders, onDriverAssigned]);

  // Status message rotation
  useEffect(() => {
    messageIntervalRef.current = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 3500);
    return () => clearInterval(messageIntervalRef.current);
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (isAccepted) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleRefreshCycle();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [isAccepted, handleRefreshCycle]);

  // Initial & periodic polling
  useEffect(() => {
    if (isAccepted) return;

    fetchNearbyRiders();
    checkParcelStatus();

    pollIntervalRef.current = setInterval(() => {
      checkParcelStatus();
      fetchNearbyRiders();
    }, 4000);

    return () => clearInterval(pollIntervalRef.current);
  }, [isAccepted, fetchNearbyRiders, checkParcelStatus]);

  // Map center/fit on load
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    map.setCenter({ lat: centerLat, lng: centerLng });
    map.setZoom(14);
  }, [centerLat, centerLng]);

  // Cancel Request Handler
  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await Axios.patch(api.parcel.updateStatus(parcel._id), {
        status: "CANCELLED"
      });
      if (res.data?.success) {
        toast.info("Parcel driver search cancelled");
        clearInterval(pollIntervalRef.current);
        clearInterval(timerIntervalRef.current);
        if (onCancelled) onCancelled(parcel._id);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel parcel request");
    } finally {
      setIsCancelling(false);
      setCancelModalOpen(false);
    }
  };

  // Format timer MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-10rem)] max-w-xl mx-auto flex flex-col justify-between bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      
      {/* Top Navigation Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100 bg-white/90 backdrop-blur-md z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>My Parcel</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
            {isAccepted ? "Driver Assigned" : "Finding a Driver"}
          </h2>
          <p className="text-[11px] text-gray-500 font-medium">
            {isAccepted ? "Parcel accepted by rider" : "Searching near you"}
          </p>
        </div>

        <div className="w-16 flex justify-end">
          {isRefreshing && (
            <RefreshCw size={15} className="animate-spin text-blue-600" />
          )}
        </div>
      </div>

      {/* Main Interactive Map Section */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-gray-100 overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={mapOptions}
            center={{ lat: centerLat, lng: centerLng }}
            zoom={14}
            onLoad={onMapLoad}
          >
            {/* User Pickup Location Marker */}
            <MarkerF
              position={{ lat: centerLat, lng: centerLng }}
              icon={{
                url: getPickupMarkerUri(),
                scaledSize: new window.google.maps.Size(36, 46),
                anchor: new window.google.maps.Point(18, 46),
              }}
              title="Pickup Location"
            />

            {/* 3 KM Search Radius Circle with pulsing visual */}
            {!isAccepted && (
              <CircleF
                center={{ lat: centerLat, lng: centerLng }}
                radius={3000} // 3 km in meters
                options={{
                  strokeColor: "#0284C7",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: "#38BDF8",
                  fillOpacity: 0.12,
                }}
              />
            )}

            {/* Nearby Active Riders Markers */}
            {!isAccepted && nearbyRiders.map((rider) => (
              <MarkerF
                key={rider._id}
                position={{ lat: rider.latitude, lng: rider.longitude }}
                icon={{
                  url: getSmallVehicleMarkerUri(rider.vehicleType || parcel.vehicleType),
                  scaledSize: new window.google.maps.Size(36, 36),
                  anchor: new window.google.maps.Point(18, 18),
                }}
                title={`${rider.name} (~${rider.distanceKm} km away)`}
              />
            ))}

            {/* If Accepted, show assigned driver live position */}
            {isAccepted && assignedDriver?.latitude && assignedDriver?.longitude && (
              <MarkerF
                position={{ lat: assignedDriver.latitude, lng: assignedDriver.longitude }}
                icon={{
                  url: getSmallVehicleMarkerUri(parcel.vehicleType || "bike"),
                  scaledSize: new window.google.maps.Size(42, 42),
                  anchor: new window.google.maps.Point(21, 21),
                }}
                title="Assigned Driver"
              />
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {/* Pulse Radar Overlay on Map */}
        {!isAccepted && (
          <div className="absolute top-3 left-3 pointer-events-none">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200/80 shadow-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              <span className="text-[11px] font-bold text-gray-700">
                Searching within 3 km
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Content / Status & Actions */}
      <div className="p-5 sm:p-6 bg-white space-y-4">
        
        {/* State A: Still Finding Driver */}
        {!isAccepted && (
          <div className="space-y-4">
            {/* Countdown Timer Block */}
            <div className="flex flex-col items-center justify-center text-center py-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                Finding Driver
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl sm:text-4xl font-black text-gray-900 tracking-wider">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              {/* Dynamic Status Text */}
              <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-2 h-5 transition-all">
                {STATUS_MESSAGES[statusMessageIndex]}
              </p>
            </div>

            {/* Parcel Route Summary Mini Card */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <p className="truncate font-semibold text-gray-800">
                  <span className="text-gray-400 font-normal">Pickup: </span>
                  {parcel.pickup?.address || parcel.pickup?.city}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <p className="truncate font-semibold text-gray-800">
                  <span className="text-gray-400 font-normal">Drop: </span>
                  {parcel.dropoff?.address || parcel.dropoff?.city}
                </p>
              </div>
            </div>

            {/* Cancel Request Button */}
            <button
              onClick={() => setCancelModalOpen(true)}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200/80 hover:border-red-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
            >
              Cancel Request
            </button>
          </div>
        )}

        {/* State B: Driver Accepted / Assigned */}
        {isAccepted && assignedDriver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-emerald-900">
                    Parcel Request Accepted!
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Your rider is on the way to pick up the parcel.
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Profile Card */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center shrink-0">
                  {assignedDriver.profilePhoto ? (
                    <img
                      src={assignedDriver.profilePhoto}
                      alt={assignedDriver.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Bike size={24} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-gray-900">
                      {assignedDriver.name || "Delivery Partner"}
                    </h4>
                    <span className="flex items-center text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                      <Star size={10} className="fill-amber-400 text-amber-400 mr-0.5" />
                      4.9
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {parcel.vehicleType || "Bike"} Delivery
                  </p>
                </div>
              </div>

              {assignedDriver.phone && (
                <a
                  href={`tel:${assignedDriver.phone}`}
                  className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition border border-emerald-200 shrink-0"
                  title="Call Driver"
                >
                  <Phone size={18} />
                </a>
              )}
            </div>

            <button
              onClick={onBack}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Navigation size={15} />
              <span>Track Live Delivery</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AnimatePresence>
        {cancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-lg font-bold text-gray-900">
                Cancel Parcel Request?
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Are you sure you want to cancel your driver search?
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Keep Searching
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Cancel Request"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FindingDriverScreen;
