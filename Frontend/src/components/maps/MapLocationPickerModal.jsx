import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GoogleMap,
  MarkerF,
  CircleF,
} from "@react-google-maps/api";
import {
  MapPin,
  Crosshair,
  Search,
  X,
  Check,
  Loader2,
  Navigation,
  Compass,
  AlertCircle,
  Map,
  ZoomIn,
  ZoomOut,
  Layers,
} from "lucide-react";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { toast } from "react-toastify";

// SVG Pin generator
const getPinSvgDataUri = (color, label = "P") => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
      <defs>
        <filter id="pinShadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>
      <path d="M19 0C8.5 0 0 8.5 0 19c0 14.5 19 29 19 29s19-14.5 19-29C38 8.5 29.5 0 19 0z" fill="${color}" filter="url(#pinShadow)"/>
      <circle cx="19" cy="18" r="11" fill="#FFFFFF"/>
      <text x="19" y="23" font-size="12" font-family="system-ui, -apple-system, sans-serif" font-weight="900" fill="${color}" text-anchor="middle">${label}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Pulsing user location dot SVG
const getUserDotSvgDataUri = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="12" fill="rgba(37, 99, 235, 0.25)"/>
      <circle cx="14" cy="14" r="7" fill="#2563EB" stroke="#FFFFFF" stroke-width="2.5"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const extractCityFromGoogle = (place) => {
  const components = place?.address_components || [];
  const types = [
    "locality",
    "administrative_area_level_2",
    "administrative_area_level_3",
    "sublocality",
  ];
  for (const type of types) {
    const c = components.find((x) => x.types?.includes(type));
    if (c) return c.long_name;
  }
  if (place?.formatted_address) {
    const parts = place.formatted_address.split(",");
    return parts[parts.length - 2]?.trim();
  }
  return "";
};

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // New Delhi fallback

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy",
  clickableIcons: true,
  styles: [
    { featureType: "poi.business", stylers: [{ visibility: "off" }] },
    { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  ],
};

const MapLocationPickerModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialCoords = [0, 0], // [longitude, latitude]
  initialAddress = "",
  initialCity = "",
  title = "Select Location on Map",
  type = "pickup", // "pickup" | "dropoff"
}) => {
  const isPickup = type === "pickup";
  const primaryColor = isPickup ? "#E10600" : "#2563EB";
  const markerLetter = isPickup ? "P" : "D";

  const [mapInstance, setMapInstance] = useState(null);
  const [selectedPos, setSelectedPos] = useState(null); // { lat, lng }
  const [currentGpsPos, setCurrentGpsPos] = useState(null); // { lat, lng }
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  const [address, setAddress] = useState(initialAddress || "");
  const [city, setCity] = useState(initialCity || "");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Search autocomplete inside modal
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [mapTypeId, setMapTypeId] = useState("roadmap"); // "roadmap" | "hybrid"

  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);

  // Initialize Services
  useEffect(() => {
    if (window.google?.maps) {
      if (!autocompleteServiceRef.current && window.google.maps.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
      if (!placesServiceRef.current && window.google.maps.places) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement("div"));
      }
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }
    }
  }, [isOpen]);

  // Reverse Geocode Handler
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsGeocoding(true);
    let resolvedAddress = "";
    let resolvedCity = "";

    // 1. Try Google Geocoder
    if (window.google?.maps?.Geocoder) {
      try {
        if (!geocoderRef.current) {
          geocoderRef.current = new window.google.maps.Geocoder();
        }
        const result = await new Promise((resolve) => {
          geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          });
        });

        if (result) {
          resolvedAddress = result.formatted_address || "";
          resolvedCity = extractCityFromGoogle(result) || "";
        }
      } catch (err) {
        console.warn("Google geocode error:", err);
      }
    }

    // 2. Fallback to backend reverse geocode if Google was empty
    if (!resolvedAddress) {
      try {
        const res = await Axios.post(api.location.getByCoordinates, {
          latitude: lat,
          longitude: lng,
        });
        if (res.data?.success && res.data?.location) {
          const loc = res.data.location;
          resolvedAddress = loc.display_name || "";
          resolvedCity =
            loc.address?.city ||
            loc.address?.town ||
            loc.address?.suburb ||
            loc.address?.state_district ||
            "";
        }
      } catch (err) {
        console.warn("Backend reverse geocode fallback error:", err);
      }
    }

    // 3. Last fallback
    if (!resolvedAddress) {
      resolvedAddress = `Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
    }

    setAddress(resolvedAddress);
    setCity(resolvedCity);
    setIsGeocoding(false);
  }, []);

  // Fetch Current GPS Location
  const locateUserCurrentPosition = useCallback(
    (shouldMoveSelected = false) => {
      if (!navigator.geolocation) {
        toast.error("Geolocation not supported by your browser");
        return;
      }

      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const userCoords = { lat: latitude, lng: longitude };
          setCurrentGpsPos(userCoords);
          setGpsAccuracy(Math.round(accuracy));
          setIsDetectingGps(false);

          if (shouldMoveSelected || !selectedPos) {
            setSelectedPos(userCoords);
            if (mapInstance) {
              mapInstance.panTo(userCoords);
              mapInstance.setZoom(16);
            }
            reverseGeocode(latitude, longitude);
          }
        },
        (err) => {
          console.error("GPS detection error:", err);
          setIsDetectingGps(false);
          if (shouldMoveSelected) {
            toast.error("Unable to retrieve current location. Please check GPS permissions.");
          }
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    },
    [mapInstance, reverseGeocode, selectedPos]
  );

  // Setup initial coordinates and detect GPS when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const hasInitial =
      Array.isArray(initialCoords) &&
      initialCoords.length >= 2 &&
      initialCoords[0] !== 0 &&
      initialCoords[1] !== 0;

    if (hasInitial) {
      const initialPos = { lat: initialCoords[1], lng: initialCoords[0] };
      setSelectedPos(initialPos);
      setAddress(initialAddress || "");
      setCity(initialCity || "");
      // Still fetch current GPS in the background so user can see their current position & button
      locateUserCurrentPosition(false);
    } else {
      // No initial location: Automatically locate user and center map there
      locateUserCurrentPosition(true);
    }
  }, [isOpen]); // Only run when modal opens

  // Map Click Handler
  const handleMapClick = (e) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPos = { lat, lng };
    setSelectedPos(newPos);
    setShowPredictions(false);
    reverseGeocode(lat, lng);
  };

  // Marker Drag End Handler
  const handleMarkerDragEnd = (e) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPos = { lat, lng };
    setSelectedPos(newPos);
    reverseGeocode(lat, lng);
  };

  // In-modal search handler
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (!text || !text.trim()) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (!autocompleteServiceRef.current && window.google?.maps?.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }

    if (!autocompleteServiceRef.current) return;

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: text,
        componentRestrictions: { country: "in" },
      },
      (results) => {
        setPredictions(results || []);
        setShowPredictions(true);
      }
    );
  };

  const handleSelectPrediction = (placeId, description) => {
    if (!placesServiceRef.current && window.google?.maps?.places) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement("div"));
    }

    setSearchQuery(description);
    setShowPredictions(false);

    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        { placeId, fields: ["geometry", "formatted_address", "address_components"] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const newPos = { lat, lng };
            setSelectedPos(newPos);
            setAddress(place.formatted_address || description);
            setCity(extractCityFromGoogle(place));

            if (mapInstance) {
              mapInstance.panTo(newPos);
              mapInstance.setZoom(16);
            }
          } else {
            // Fallback: reverse geocode description search
            setAddress(description);
          }
        }
      );
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.setZoom((mapInstance.getZoom() || 15) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.setZoom((mapInstance.getZoom() || 15) - 1);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (!selectedPos) {
      toast.error("Please choose a location on the map");
      return;
    }

    onSelectLocation({
      address: address || `Location (${selectedPos.lat.toFixed(5)}, ${selectedPos.lng.toFixed(5)})`,
      city: city || "",
      coordinates: [selectedPos.lng, selectedPos.lat], // [lng, lat] format expected by backend
      accuracy: gpsAccuracy,
      source: "MAP",
    });

    toast.success(`${isPickup ? "Pickup" : "Drop-off"} location set from map!`);
    onClose();
  };

  // Map Center: selected position or current GPS or default
  const mapCenter = selectedPos || currentGpsPos || DEFAULT_CENTER;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-[var(--bg-surface)] rounded-2xl sm:rounded-3xl shadow-2xl border border-[var(--border-subtle)] w-full max-w-4xl h-[92vh] sm:h-[88vh] flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-3.5 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                style={{
                  backgroundColor: isPickup ? "rgba(225, 6, 0, 0.1)" : "rgba(37, 99, 235, 0.1)",
                  color: primaryColor,
                }}
              >
                <MapPin size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                  {title || (isPickup ? "Select Pickup Location" : "Select Drop-off Location")}
                </h3>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Drag pin or tap anywhere on the map to pin your exact spot
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Map Area */}
          <div className="relative flex-1 w-full bg-gray-100 overflow-hidden">
            {/* In-Map Floating Search Bar */}
            <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-96 z-10">
              <div className="relative bg-[var(--bg-surface)]/95 backdrop-blur-md rounded-xl shadow-lg border border-[var(--border-subtle)]/90 flex items-center">
                <Search size={18} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={`Search ${isPickup ? "pickup" : "drop-off"} location or landmark...`}
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setPredictions([]);
                      setShowPredictions(false);
                    }}
                    className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-md"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showPredictions && predictions.length > 0 && (
                <div className="mt-1.5 bg-[var(--bg-surface)] rounded-xl shadow-xl border border-[var(--border-subtle)] max-h-56 overflow-y-auto divide-y divide-gray-100 z-30">
                  {predictions.map((p) => (
                    <div
                      key={p.place_id}
                      onClick={() => handleSelectPrediction(p.place_id, p.description)}
                      className="p-3 hover:bg-red-50/50 cursor-pointer flex items-start gap-2.5 text-left transition"
                    >
                      <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {p.structured_formatting?.main_text || p.description}
                        </p>
                        {p.structured_formatting?.secondary_text && (
                          <p className="text-[11px] text-gray-500 truncate">
                            {p.structured_formatting.secondary_text}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floating Map Controls (Right Side) */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col gap-2">
              {/* Locate Me Button */}
              <button
                type="button"
                onClick={() => locateUserCurrentPosition(true)}
                disabled={isDetectingGps}
                title="Go to my current location"
                className={`p-2.5 sm:p-3 rounded-xl shadow-lg border backdrop-blur-md transition-all flex items-center justify-center cursor-pointer ${
                  isDetectingGps
                    ? "bg-red-50 border-red-200 text-[#E10600] animate-pulse"
                    : "bg-[var(--bg-surface)]/95 border-[var(--border-subtle)]/90 text-gray-700 hover:bg-red-50 hover:text-[#E10600] hover:scale-105 active:scale-95"
                }`}
              >
                {isDetectingGps ? (
                  <Loader2 size={19} className="animate-spin text-[#E10600]" />
                ) : (
                  <Crosshair size={19} className="text-[#E10600]" />
                )}
              </button>

              {/* Map Type Toggle */}
              <button
                type="button"
                onClick={() => setMapTypeId((prev) => (prev === "roadmap" ? "hybrid" : "roadmap"))}
                title={mapTypeId === "roadmap" ? "Switch to Satellite" : "Switch to Roadmap"}
                className="p-2.5 sm:p-3 bg-[var(--bg-surface)]/95 backdrop-blur-md rounded-xl shadow-lg border border-[var(--border-subtle)]/90 text-gray-700 hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Layers size={19} />
              </button>

              {/* Zoom Controls */}
              <div className="bg-[var(--bg-surface)]/95 backdrop-blur-md rounded-xl shadow-lg border border-[var(--border-subtle)]/90 flex flex-col divide-y divide-gray-100 overflow-hidden">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-2 sm:p-2.5 text-gray-700 hover:bg-gray-100 active:scale-95 transition cursor-pointer"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-2 sm:p-2.5 text-gray-700 hover:bg-gray-100 active:scale-95 transition cursor-pointer"
                >
                  <ZoomOut size={18} />
                </button>
              </div>
            </div>

            {/* Instruction Badge */}
            <div className="absolute top-16 sm:top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="bg-black/75 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                <Compass size={14} className="animate-spin" />
                <span>Tap anywhere or drag pin to position</span>
              </div>
            </div>

            {/* Google Map */}
            {window.google && window.google.maps ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                mapTypeId={mapTypeId}
                options={mapOptions}
                onLoad={(map) => {
                  setMapInstance(map);
                }}
                onClick={handleMapClick}
              >
                {/* 1. Selected Location Pin (Draggable) */}
                {selectedPos && (
                  <MarkerF
                    position={selectedPos}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    icon={{
                      url: getPinSvgDataUri(primaryColor, markerLetter),
                      scaledSize: new window.google.maps.Size(38, 48),
                      anchor: new window.google.maps.Point(19, 48),
                    }}
                    title="Drag to adjust location"
                    animation={window.google.maps.Animation.DROP}
                  />
                )}

                {/* 2. User Current GPS Marker & Accuracy Circle */}
                {currentGpsPos && (
                  <>
                    <MarkerF
                      position={currentGpsPos}
                      icon={{
                        url: getUserDotSvgDataUri(),
                        scaledSize: new window.google.maps.Size(28, 28),
                        anchor: new window.google.maps.Point(14, 14),
                      }}
                      title="You are here (Current GPS Location)"
                      zIndex={1}
                    />
                    {gpsAccuracy && gpsAccuracy < 200 && (
                      <CircleF
                        center={currentGpsPos}
                        radius={gpsAccuracy}
                        options={{
                          strokeColor: "#2563EB",
                          strokeOpacity: 0.35,
                          strokeWeight: 1,
                          fillColor: "#3B82F6",
                          fillOpacity: 0.12,
                          clickable: false,
                        }}
                      />
                    )}
                  </>
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-3 p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E10600]" />
                <p className="text-sm font-semibold text-gray-700">Loading Google Maps...</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Please wait while map components are initializing.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Confirmation Card */}
          <div className="p-4 sm:p-5 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] shrink-0 z-20 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5 shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                {markerLetter}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: isPickup ? "rgba(225, 6, 0, 0.08)" : "rgba(37, 99, 235, 0.08)",
                      color: primaryColor,
                    }}
                  >
                    {isPickup ? "Selected Pickup Location" : "Selected Drop-off Location"}
                  </span>
                  {city && (
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                      {city}
                    </span>
                  )}
                </div>

                {isGeocoding ? (
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                    <Loader2 size={14} className="animate-spin text-[#E10600]" />
                    <span>Resolving street address...</span>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mt-1 leading-snug break-words">
                    {address || "Click on map to choose location"}
                  </p>
                )}

                {selectedPos && (
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 font-mono">
                    <span>
                      {selectedPos.lat.toFixed(5)}° N, {selectedPos.lng.toFixed(5)}° E
                    </span>
                    {currentGpsPos && (
                      <span className="text-emerald-600 font-sans font-medium flex items-center gap-1">
                        <Navigation size={11} /> GPS Active
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--border-subtle)] text-gray-700 hover:bg-gray-50 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedPos || isGeocoding}
                className="flex-2 sm:flex-1 py-2.5 sm:py-3 px-5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                }}
              >
                <Check size={16} />
                <span>Confirm {isPickup ? "Pickup" : "Drop-off"} Location</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MapLocationPickerModal;
