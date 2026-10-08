import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  GoogleMap,
  MarkerF,
  DirectionsRenderer,
  PolylineF,
} from "@react-google-maps/api";
import { useGoogleMaps } from "../maps/GoogleMapsProvider";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import {
  MapPin,
  Navigation,
  RefreshCw,
  Clock,
  Radio,
  AlertTriangle,
  Compass,
  Maximize2,
  Minimize2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Car,
  Bike,
} from "lucide-react";

// --- VEHICLE SVG ICONS (Data URI Generator) ---
const getVehicleSvgDataUri = (type = "bike", isStale = false) => {
  const normType = (type || "").toLowerCase();
  const themeColor = isStale ? "#9CA3AF" : "#2563EB";
  const glowColor = isStale ? "rgba(156,163,175,0.3)" : "rgba(37,99,235,0.35)";

  let vehiclePath = "";
  if (normType.includes("scoot") || normType.includes("activa") || normType.includes("moped")) {
    // Scooty SVG path
    vehiclePath = `
      <path d="M14 26a3 3 0 1 0 6 0 3 3 0 1 0-6 0m14 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" fill="#1E293B"/>
      <path d="M17 26h6l3-8h5v-2h-6l-2 5h-4l-1-4h-4v2h2.5z" fill="#0284C7"/>
      <circle cx="28" cy="14" r="1.5" fill="#0284C7"/>
    `;
  } else if (normType.includes("auto") || normType.includes("rickshaw") || normType.includes("tuk")) {
    // Auto-Rickshaw SVG path
    vehiclePath = `
      <path d="M14 27a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0m15 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0" fill="#1E293B"/>
      <path d="M16 26h13l1-8h-16l2 8z" fill="#EAB308"/>
      <path d="M13 18l3-6h11l3 6h-17z" fill="#15803D"/>
      <circle cx="24" cy="18" r="1.5" fill="#FFFFFF"/>
    `;
  } else if (normType.includes("car") || normType.includes("cab") || normType.includes("sedan") || normType.includes("suv")) {
    // Car SVG path
    vehiclePath = `
      <path d="M14 27a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0m14 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0" fill="#1E293B"/>
      <path d="M11 25h26v-4l-3-6h-18l-3 6v4z" fill="#2563EB"/>
      <path d="M15 19h6v3h-7l1-3zm8 0h6l1 3h-7v-3z" fill="#E2E8F0"/>
    `;
  } else {
    // Motorcycle / Bike SVG path (Default)
    vehiclePath = `
      <path d="M14 26a3 3 0 1 0 6 0 3 3 0 1 0-6 0m14 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" fill="#1E293B"/>
      <path d="M17 26l4-7 4 3 4-6h3v2h-2l-3 5-4-3-3 6h-2z" fill="#EA580C"/>
      <circle cx="28" cy="14" r="2" fill="#EA580C"/>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <!-- Pulse Ring -->
      <circle cx="24" cy="24" r="22" fill="${glowColor}"/>
      <!-- Outer Border -->
      <circle cx="24" cy="24" r="18" fill="#FFFFFF" stroke="${themeColor}" stroke-width="2.5" filter="url(#glow)"/>
      <!-- Inner Icon Graphics -->
      <g transform="translate(0, 0)">
        ${vehiclePath}
      </g>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getPinSvgDataUri = (color, label = "P") => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
      <defs>
        <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <path d="M17 0C7.6 0 0 7.6 0 17c0 12.8 17 25 17 25s17-12.2 17-25c0-9.4-7.6-17-17-17z" fill="${color}" filter="url(#pinShadow)"/>
      <circle cx="17" cy="16" r="10" fill="#FFFFFF"/>
      <text x="17" y="20.5" font-size="11" font-family="system-ui, -apple-system, sans-serif" font-weight="800" fill="${color}" text-anchor="middle">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Map default configurations
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

const formatRelativeTime = (dateString) => {
  if (!dateString) return "No updates yet";
  const diffSec = Math.max(0, Math.floor((new Date() - new Date(dateString)) / 1000));
  if (diffSec < 15) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
};

const LiveRouteTrackingMap = ({ parcel, isDriverView = false }) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef(null);

  const [tracking, setTracking] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isUserPanned, setIsUserPanned] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [canRenderMap, setCanRenderMap] = useState(false);

  // Delay map rendering until modal animation finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanRenderMap(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Extract initial coordinates from parcel prop
  useEffect(() => {
    console.log("TRACKING PARCEL:", parcel);
    console.log("PICKUP:", parcel?.pickup?.coordinates);
    console.log("DROP:", parcel?.dropoff?.coordinates);
  }, [parcel]);

  const pickupCoords = useMemo(() => {
    const coords = parcel?.pickup?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2 && coords[0] !== undefined && coords[1] !== undefined) {
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      } else {
        console.warn("Invalid pickup coordinates received:", coords);
      }
    } else {
      console.warn("Pickup coordinates unavailable in parcel:", parcel);
    }
    return null;
  }, [parcel]);

  const dropoffCoords = useMemo(() => {
    const coords = parcel?.dropoff?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2 && coords[0] !== undefined && coords[1] !== undefined) {
      let lng = Number(coords[0]);
      let lat = Number(coords[1]);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        // If exactly identical to pickup, add a tiny offset so both markers are visible during testing
        if (
          parcel?.pickup?.coordinates &&
          parcel.pickup.coordinates[0] === coords[0] &&
          parcel.pickup.coordinates[1] === coords[1]
        ) {
          lat += 0.0002;
          lng += 0.0002;
        }
        return { lat, lng };
      } else {
        console.warn("Invalid dropoff coordinates received:", coords);
      }
    } else {
      console.warn("Dropoff coordinates unavailable in parcel:", parcel);
    }
    return null;
  }, [parcel]);

  // Fetch authoritative tracking data from API
  const fetchTracking = useCallback(async () => {
    if (!parcel?._id) return;
    try {
      setIsFetching(true);
      const res = await Axios.get(api.parcel.track(parcel._id));
      if (res.data?.success && res.data?.data) {
        setTracking(res.data.data);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn("Live tracking fetch warning:", err?.message || err);
    } finally {
      setIsFetching(false);
    }
  }, [parcel?._id]);

  // Periodic polling setup
  useEffect(() => {
    fetchTracking();

    const isTerminal = ["DELIVERED", "COMPLETED", "CANCELLED"].includes(
      parcel?.status
    );
    if (isTerminal) return;

    const intervalId = setInterval(() => {
      fetchTracking();
    }, 7000); // 7-second poll interval

    return () => clearInterval(intervalId);
  }, [fetchTracking, parcel?.status]);

  // Real-time relative timestamp refresh every 5s
  const [, setTick] = useState(0);
  useEffect(() => {
    const tickInterval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(tickInterval);
  }, []);

  // Compute resolved Rider location
  const riderLocation = useMemo(() => {
    const rawRider = tracking?.driver || tracking?.rider;
    
    // Check populated driver's currentLocation
    let rLat = undefined;
    let rLng = undefined;
    let accuracy = undefined;

    if (rawRider?.currentLocation?.coordinates && Array.isArray(rawRider.currentLocation.coordinates)) {
      const coords = rawRider.currentLocation.coordinates;
      if (coords.length >= 2) {
        rLat = Number(coords[1]);
        rLng = Number(coords[0]);
        accuracy = rawRider.currentLocation.accuracy;
      }
    } else {
      rLat = rawRider?.latitude ?? rawRider?.lat;
      rLng = rawRider?.longitude ?? rawRider?.lng;
      accuracy = rawRider?.accuracy;
    }

    if (
      typeof rLat === "number" &&
      typeof rLng === "number" &&
      !isNaN(rLat) && !isNaN(rLng) &&
      (rLat !== 0 || rLng !== 0)
    ) {
      return {
        lat: rLat,
        lng: rLng,
        isLive: Boolean(rawRider.isLive || rawRider.liveLocationEnabled),
        isStale: Boolean(rawRider.isStale),
        accuracy: accuracy,
        lastUpdated: rawRider.updatedAt || rawRider.lastLocationUpdate || rawRider.lastUpdated,
        vehicleType: rawRider.vehicleType || parcel?.vehicleType || "Bike",
        vehicleNumber: rawRider.vehicleNumber,
        vehicleModel: rawRider.vehicleModel,
        name: rawRider.name,
        profileImage: 
          (rawRider?.profilePhoto && !rawRider.profilePhoto.startsWith("http")
            ? `${import.meta.env.VITE_ASSETS_URL}/${rawRider.profilePhoto}`
            : rawRider?.profilePhoto) ||
          (parcel?.driver?.profilePhotos?.[0]?.url && !parcel.driver.profilePhotos[0].url.startsWith("http")
            ? `${import.meta.env.VITE_ASSETS_URL}/${parcel.driver.profilePhotos[0].url}`
            : parcel?.driver?.profilePhotos?.[0]?.url) ||
          null,
      };
    }

    // Fallback to driver info in parcel if tracking API is pending
    const driverLoc = parcel?.driver?.currentLocation?.coordinates;
    if (Array.isArray(driverLoc) && driverLoc.length >= 2 && driverLoc[0] && driverLoc[1]) {
      return {
        lat: Number(driverLoc[1]),
        lng: Number(driverLoc[0]),
        isLive: parcel?.driver?.liveLocationEnabled,
        isStale: false,
        accuracy: parcel?.driver?.currentLocation?.accuracy,
        lastUpdated: parcel?.driver?.lastLocationUpdate,
        vehicleType: parcel?.vehicleType || "Bike",
        vehicleNumber: parcel?.driver?.vehicleNumber,
        vehicleModel: parcel?.driver?.vehicleModel,
        name: `${parcel?.driver?.firstName || ""} ${parcel?.driver?.lastName || ""}`.trim(),
        profileImage: parcel?.driver?.profilePhotos?.[0]?.url 
          ? (parcel.driver.profilePhotos[0].url.startsWith("http") 
              ? parcel.driver.profilePhotos[0].url 
              : `${import.meta.env.VITE_ASSETS_URL}/${parcel.driver.profilePhotos[0].url}`)
          : null,
      };
    }

    return null;
  }, [tracking, parcel]);

  // Request driving directions between Pickup and Dropoff
  useEffect(() => {
    console.log("PICKUP COORDS COMPUTED:", pickupCoords);
    console.log("DROP COORDS COMPUTED:", dropoffCoords);
    console.log("RIDER LOCATION COMPUTED:", riderLocation);
  }, [pickupCoords, dropoffCoords, riderLocation]);

  useEffect(() => {
    if (!isLoaded || !window.google?.maps || !pickupCoords || !dropoffCoords) return;

    try {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.warn("Google Directions error, using fallback line:", status);
          }
        }
      );
    } catch (e) {
      console.error("DirectionsService error:", e);
    }
  }, [isLoaded, pickupCoords, dropoffCoords]);

  // Auto-fit bounds logic
  const fitRouteBounds = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    let count = 0;

    if (pickupCoords) {
      bounds.extend(pickupCoords);
      count++;
    }
    if (dropoffCoords) {
      bounds.extend(dropoffCoords);
      count++;
    }
    if (riderLocation && typeof riderLocation.lat === "number" && typeof riderLocation.lng === "number") {
      bounds.extend({ lat: riderLocation.lat, lng: riderLocation.lng });
      count++;
    }

    if (count > 0) {
      mapRef.current.fitBounds(bounds, {
        top: 60,
        bottom: 60,
        left: 60,
        right: 60,
      });
      
      // Prevent max zoom when points are very close
      const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
        if (mapRef.current.getZoom() > 16) {
          mapRef.current.setZoom(16);
        }
      });
      
      setIsUserPanned(false);
    }
  }, [pickupCoords, dropoffCoords, riderLocation]);

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      fitRouteBounds();
    },
    [fitRouteBounds]
  );

  // We intentionally do NOT auto-fit bounds every time riderLocation updates,
  // to avoid annoying the user if they are manually panning.
  // The map will fit bounds once on load, and manually when the user clicks the 'Re-center' button.
  useEffect(() => {
    if (mapRef.current && !isUserPanned && !window.initialBoundsFitDone) {
      fitRouteBounds();
      window.initialBoundsFitDone = true;
    }
  }, [fitRouteBounds, isUserPanned]);

  // Helper status badge determination
  const statusInfo = useMemo(() => {
    const s = parcel?.status || "PENDING";
    switch (s) {
      case "ASSIGNED":
        return {
          label: "Rider Assigned",
          desc: "Rider is preparing to head to pickup location",
          color: "text-blue-700 bg-blue-50 border-blue-200",
        };
      case "OUT_FOR_PICKUP":
        return {
          label: "Rider On The Way To Pickup",
          desc: "Rider is heading towards your pickup location",
          color: "text-amber-700 bg-amber-50 border-amber-200",
        };
      case "PICKED_UP":
        return {
          label: "Parcel Picked Up",
          desc: "Package collected. Starting journey to destination",
          color: "text-purple-700 bg-purple-50 border-purple-200",
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "Out For Delivery",
          desc: "Rider is en route to drop-off point",
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        };
      case "DELIVERED":
        return {
          label: "Delivered",
          desc: "Package successfully handed over to receiver",
          color: "text-emerald-800 bg-emerald-100 border-emerald-300",
        };
      case "COMPLETED":
        return {
          label: "Delivery Completed",
          desc: "Transaction finalized and completed",
          color: "text-gray-800 bg-gray-100 border-[var(--border-subtle)]",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          desc: "Delivery request has been cancelled",
          color: "text-red-700 bg-red-50 border-red-200",
        };
      default:
        return {
          label: "Searching for Rider",
          desc: "Waiting for a nearby rider to accept your parcel",
          color: "text-gray-700 bg-gray-50 border-[var(--border-subtle)]",
        };
    }
  }, [parcel?.status]);

  const vehicleName = riderLocation?.vehicleType || parcel?.vehicleType || "Bike";
  const isScootyOrBike = vehicleName.toLowerCase().includes("scoot") || vehicleName.toLowerCase().includes("bike");

  return (
    <div className="space-y-4 w-full">
      {/* ======================================================== */}
      {/* 1. VISUALLY CONNECTED ROUTE DETAILS SECTION               */}
      {/* ======================================================== */}
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Live Route & Location
              </h4>
              <p className="text-[11px] text-gray-400">
                Authoritative GPS Track
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Visually connected timeline: Pickup -> Rider -> Dropoff */}
        <div className="relative pl-7 sm:pl-9 py-1 space-y-5">
          {/* Continuous vertical road line */}
          <div className="absolute left-[13px] sm:left-[17px] top-3.5 bottom-3.5 w-1 bg-gradient-to-b from-emerald-500 via-blue-500 to-rose-500 rounded-full" />

          {/* ● PICKUP NODE */}
          <div className="relative">
            <div className="absolute -left-[27px] sm:-left-[31px] top-0 w-7 h-7 rounded-full bg-emerald-500 text-white border-4 border-white shadow-sm flex items-center justify-center">
              <span className="text-[10px] font-black">P</span>
            </div>
            <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Pickup Point
                </span>
                {parcel?.pickup?.city && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {parcel.pickup.city}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5 leading-snug">
                {parcel?.pickup?.address || "Pickup address not specified"}
              </p>
              {pickupCoords && (
                <p className="text-[10px] font-mono text-gray-400 mt-1">
                  GPS: {pickupCoords.lat.toFixed(4)}° N, {pickupCoords.lng.toFixed(4)}° E
                </p>
              )}
            </div>
          </div>

          {/* 🚗 LIVE RIDER NODE (Authoritative Position) */}
          <div className="relative">
            <div className="absolute -left-[27px] sm:-left-[31px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-blue-600 text-white border-2 border-white shadow-sm flex items-center justify-center z-10 overflow-hidden">
              {riderLocation?.profileImage ? (
                <img 
                  src={riderLocation.profileImage} 
                  alt="Rider" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                />
              ) : null}
              
              <div style={{ display: riderLocation?.profileImage ? 'none' : 'block' }}>
                {isScootyOrBike ? (
                  <Bike className="w-3.5 h-3.5" />
                ) : (
                  <Car className="w-3.5 h-3.5" />
                )}
              </div>
            </div>

            {riderLocation ? (
              <div
                className={`rounded-xl p-3 border transition-all ${
                  riderLocation.isStale
                    ? "bg-amber-50/50 border-amber-200"
                    : "bg-blue-50/50 border-blue-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      {!riderLocation.isStale && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          riderLocation.isStale ? "bg-amber-500" : "bg-blue-600"
                        }`}
                      />
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      Rider: {riderLocation.name || "Assigned Driver"}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-gray-700 border border-[var(--border-subtle)] shadow-2xs">
                      {riderLocation.vehicleType}
                      {riderLocation.vehicleNumber ? ` • ${riderLocation.vehicleNumber}` : ""}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-medium flex items-center gap-1 ${
                      riderLocation.isStale ? "text-amber-700" : "text-gray-500"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(riderLocation.lastUpdated)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600">
                  <span className="font-mono">
                    Live GPS: {riderLocation.lat.toFixed(4)}° N, {riderLocation.lng.toFixed(4)}° E
                  </span>
                  {typeof riderLocation.accuracy === "number" && (
                    <span className="text-gray-500 bg-[var(--bg-surface)]/70 px-1.5 py-0.5 rounded border border-[var(--border-subtle)]/60 font-mono text-[10px]">
                      Accuracy: ±{Math.round(riderLocation.accuracy)}m
                    </span>
                  )}
                </div>

                {riderLocation.isStale && (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium text-amber-700 bg-amber-100/70 px-2 py-1 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Location may be outdated (last signal &gt; 2 mins ago).</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-[var(--border-subtle)] rounded-xl p-3 text-gray-500 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-gray-400 animate-pulse" />
                  <span>
                    {parcel?.status === "PENDING"
                      ? "Waiting for a driver to accept the parcel..."
                      : "Rider location unavailable or device offline"}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  {statusInfo.desc}
                </span>
              </div>
            )}
          </div>

          {/* ● DROPOFF NODE */}
          <div className="relative">
            <div className="absolute -left-[27px] sm:-left-[31px] top-0 w-7 h-7 rounded-full bg-rose-500 text-white border-4 border-white shadow-sm flex items-center justify-center">
              <span className="text-[10px] font-black">D</span>
            </div>
            <div className="bg-rose-50/40 border border-rose-100/80 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Drop-off Point
                </span>
                {parcel?.dropoff?.city && (
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md">
                    {parcel.dropoff.city}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5 leading-snug">
                {parcel?.dropoff?.address || "Drop-off address not specified"}
              </p>
              {dropoffCoords && (
                <p className="text-[10px] font-mono text-gray-400 mt-1">
                  GPS: {dropoffCoords.lat.toFixed(4)}° N, {dropoffCoords.lng.toFixed(4)}° E
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. INTERACTIVE GOOGLE MAP WITH REAL-TIME MARKERS         */}
      {/* ======================================================== */}
      <div
        className={`relative bg-gray-100 rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-xs transition-all w-full ${
          isFullScreen ? "fixed inset-4 z-50 shadow-2xl h-[calc(100vh-32px)]" : "h-[380px] sm:h-[440px] md:h-[480px]"
        }`}
      >
        {/* Top Floating Info Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-[var(--bg-surface)]/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-[var(--border-subtle)]/80 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  riderLocation && !riderLocation.isStale ? "bg-emerald-400" : "bg-blue-400"
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  riderLocation && !riderLocation.isStale ? "bg-emerald-500" : "bg-blue-500"
                }`}
              />
            </span>
            <span className="text-xs font-bold text-gray-800">
              {riderLocation && !riderLocation.isStale && <span className="text-red-600 mr-1">● LIVE</span>}
              {riderLocation
                ? `${vehicleName} en route`
                : statusInfo.label}
            </span>
            {isFetching && (
              <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
            )}
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5 bg-[var(--bg-surface)]/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-[var(--border-subtle)]/80">
            <button
              onClick={fitRouteBounds}
              title="Re-center route"
              className="p-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullScreen((prev) => !prev)}
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Map"}
              className="p-1.5 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Map Body or Fallback */}
        {(!isLoaded || !canRenderMap) ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <p className="text-xs font-medium text-gray-500">Loading Google Maps...</p>
          </div>
        ) : loadError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mb-1" />
            <p className="text-xs font-semibold text-gray-700">Map Loading Issue</p>
            <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
              Unable to load Google Maps. Please check network connectivity or API key.
            </p>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            options={mapOptions}
            onLoad={onMapLoad}
            onDragStart={() => setIsUserPanned(true)}
          >
            {/* Driving Road Route via DirectionsRenderer */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: "#2563EB",
                    strokeWeight: 5,
                    strokeOpacity: 0.85,
                  },
                }}
              />
            )}

            {/* Direct fallback Polyline if DirectionsService fails */}
            {!directions && pickupCoords && dropoffCoords && (
              <PolylineF
                path={
                  riderLocation
                    ? [pickupCoords, { lat: riderLocation.lat, lng: riderLocation.lng }, dropoffCoords]
                    : [pickupCoords, dropoffCoords]
                }
                options={{
                  strokeColor: "#3B82F6",
                  strokeWeight: 4,
                  strokeOpacity: 0.8,
                  strokeDashStyle: "dashed",
                }}
              />
            )}

            {/* 1. Pickup Marker (Green) */}
            {pickupCoords && (
              <MarkerF
                position={pickupCoords}
                icon={
                  window.google
                    ? {
                        url: getPinSvgDataUri("#10B981", "P"),
                        scaledSize: new window.google.maps.Size(32, 40),
                        anchor: new window.google.maps.Point(16, 40),
                      }
                    : undefined
                }
                title="Pickup Point"
              />
            )}

            {/* 2. Dropoff Marker (Red) */}
            {dropoffCoords && (
              <MarkerF
                position={dropoffCoords}
                icon={
                  window.google
                    ? {
                        url: getPinSvgDataUri("#F43F5E", "D"),
                        scaledSize: new window.google.maps.Size(32, 40),
                        anchor: new window.google.maps.Point(16, 40),
                      }
                    : undefined
                }
                title="Drop-off Point"
              />
            )}

            {/* 3. Authoritative Rider Vehicle Marker */}
            {riderLocation && (
              <MarkerF
                position={{ lat: riderLocation.lat, lng: riderLocation.lng }}
                icon={
                  window.google
                    ? {
                        url: riderLocation.profileImage || getVehicleSvgDataUri(
                          riderLocation.vehicleType,
                          riderLocation.isStale
                        ),
                        scaledSize: riderLocation.profileImage 
                          ? new window.google.maps.Size(40, 40)
                          : new window.google.maps.Size(46, 46),
                        anchor: riderLocation.profileImage 
                          ? new window.google.maps.Point(20, 20)
                          : new window.google.maps.Point(23, 23),
                      }
                    : undefined
                }
                title={`Rider: ${riderLocation.name || vehicleName}`}
                zIndex={999}
              />
            )}
          </GoogleMap>
        )}

        {/* Bottom Floating Legend / Status Pill */}
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex items-center justify-between">
          <div className="pointer-events-auto bg-[var(--bg-surface)]/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-[var(--border-subtle)]/80 text-[11px] text-gray-600 flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Pickup
            </span>
            <span className="flex items-center gap-1 font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              {vehicleName}
            </span>
            <span className="flex items-center gap-1 font-semibold text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Drop-off
            </span>
          </div>

          {isUserPanned && (
            <button
              onClick={() => {
                fitRouteBounds();
                setIsUserPanned(false);
              }}
              className="pointer-events-auto bg-gray-900 text-white hover:bg-gray-800 text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Re-center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveRouteTrackingMap;
