import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Search,
  ChevronRight,
  Target,
  Loader2,
  Compass,
  ArrowDownUp,
  Trash2,
  Car,
  Route,
  Navigation,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getBrowserCoords,
  getCityFromCoords,
  getlocationFromCoords,
} from "../../utils/GetLocation";
import { useGoogleMaps } from "../../components/maps/GoogleMapsProvider";
import axios from "axios";
import { api } from "../../services/endpoints";
import Axios from "../../services/axios";

/* ---------------- GOOGLE MAP LOADER ---------------- */

const libraries = ["places", "geometry"];

let googleMapsLoaded = false;
let googleMapsLoadingPromise = null;

const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    googleMapsLoaded = true;
    return Promise.resolve();
  }

  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=${libraries.join(",")}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleMapsLoaded = true;
      resolve();
    };

    script.onerror = reject;
    document.head.appendChild(script);
  });

  return googleMapsLoadingPromise;
};

/* ---------------- HELPERS ---------------- */

const extractCity = (place) => {
  const components = place.address_components || [];
  const types = [
    "locality",
    "administrative_area_level_2",
    "administrative_area_level_3",
    "sublocality",
  ];

  for (const type of types) {
    const c = components.find((x) => x.types.includes(type));
    if (c) return c.long_name;
  }

  if (place.formatted_address) {
    const parts = place.formatted_address.split(",");
    return parts[parts.length - 2]?.trim();
  }

  return null;
};

/* ---------------- COMPONENT ---------------- */

const RideSearchCard = ({ location }) => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { isLoaded } = useGoogleMaps();
  const [fromPredictions, setFromPredictions] = useState([]);
  const [toPredictions, setToPredictions] = useState([]);
  const [showFromPredictions, setShowFromPredictions] = useState(false);
  const [showToPredictions, setShowToPredictions] = useState(false);

  /* ---------------- REFS ---------------- */
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromContainerRef = useRef(null);
  const toContainerRef = useRef(null);
  const formRef = useRef(null);

  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  useEffect(() => { getCity() }, []);

  const getCity = async () => {
    if (!isLoaded) return alert("Google not loaded yet");

    try {
      const { lat, lng } = await getBrowserCoords();


      const streetLocation = await getlocationFromCoords(lat, lng);
      console.log(streetLocation, "this is location");
      if (fromInputRef.current) {
        fromInputRef.current.value = streetLocation;
      }

      const city = await getCityFromCoords(lat, lng)
      updateLocation(city, streetLocation)

      return streetLocation;
    } catch (err) {
      console.log("Location error:", err);
    }
  };

  const updateLocation = async (city, address) => {
    try {
      await Axios.post(api.user.updateLocation, { city, address })
    } catch (error) {
      console.log(error, "this is error")
    }
  }




  /* ---------------- INIT GOOGLE ---------------- */
  useEffect(() => {
    const init = async () => {
      await loadGoogleMaps();
      setIsMapsLoaded(true);

      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();

      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div"),
      );
    };
    init();
  }, []);

  /* ---------------- AUTOCOMPLETE ---------------- */

  const fetchPredictions = (value, type) => {
    if (!value || !value.trim()) {
      type === "from" ? setFromPredictions([]) : setToPredictions([]);
      return;
    }

    if (!autocompleteServiceRef.current && window.google?.maps?.places) {
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
    }

    if (!autocompleteServiceRef.current) {
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: "in" },
      },
      (results) => {
        if (type === "from") {
          setFromPredictions(results || []);
          setShowFromPredictions(true);
        } else {
          setToPredictions(results || []);
          setShowToPredictions(true);
        }
      },
    );
  };

  const selectPlace = (placeId, description, type) => {
    if (!placesServiceRef.current && window.google?.maps?.places) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div"),
      );
    }

    const applySelection = (place) => {
      const city = place ? extractCity(place) : (description.split(",")[0]?.trim() || "");
      const location = place?.geometry?.location || null;

      if (type === "from") {
        setFrom(location);
        setFromCity(city || description.split(",")[0]?.trim() || "");
        if (fromInputRef.current) {
          fromInputRef.current.value = place?.formatted_address || description;
        }
        setFromPredictions([]);
        setShowFromPredictions(false);
      } else {
        setTo(location);
        setToCity(city || description.split(",")[0]?.trim() || "");
        if (toInputRef.current) {
          toInputRef.current.value = place?.formatted_address || description;
        }
        setToPredictions([]);
        setShowToPredictions(false);
      }
    };

    if (!placesServiceRef.current) {
      applySelection(null);
      return;
    }

    try {
      placesServiceRef.current.getDetails(
        {
          placeId,
          fields: ["geometry", "formatted_address", "address_components"],
        },
        (place) => {
          applySelection(place);
        },
      );
    } catch (e) {
      applySelection(null);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const swapLocations = () => {
    const tempFrom = from;
    const tempFromCity = fromCity;
    const tempFromValue = fromInputRef.current.value;

    setFrom(to);
    setFromCity(toCity);
    fromInputRef.current.value = toInputRef.current.value;

    setTo(tempFrom);
    setToCity(tempFromCity);
    toInputRef.current.value = tempFromValue;

    setFromPredictions([]);
    setToPredictions([]);
    setShowFromPredictions(false);
    setShowToPredictions(false);
  };

  const handleSearch = async () => {
    if (!fromInputRef.current.value || !toInputRef.current.value) {
      // You can add toast notification here
      return;
    }

    setIsSearching(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    navigate("/rides", {
      state: {
        fromCity,
        toCity,
        date,
        fromLocation: fromInputRef.current.value,
        toLocation: toInputRef.current.value,
      },
    });

    setIsSearching(false);
  };

  const clearForm = () => {
    setFrom(null);
    setTo(null);
    setFromCity("");
    setToCity("");
    setDate(getTomorrowDate());
    if (fromInputRef.current) fromInputRef.current.value = "";
    if (toInputRef.current) toInputRef.current.value = "";
    setFromPredictions([]);
    setToPredictions([]);
    setShowFromPredictions(false);
    setShowToPredictions(false);
  };

  // Click outside to close predictions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromContainerRef.current && !fromContainerRef.current.contains(event.target)) {
        setShowFromPredictions(false);
      }
      if (toContainerRef.current && !toContainerRef.current.contains(event.target)) {
        setShowToPredictions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const popularRoutes = [
    { from: "Delhi", to: "Chandigarh" },
    { from: "Mumbai", to: "Pune" },
    ,
  ];

  if (!isMapsLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-red-100 border-t-red-500 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-700 font-medium">Loading Maps...</p>
          <p className="text-sm text-gray-500 mt-1">
            Setting up location services
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="relative">
      {/* Background Effects */}
      <div className="absolute -inset-4 bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 rounded-3xl blur-xl" />
      <div className="absolute -inset-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-2xl" />

      {/* Main Card */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/80 shadow-card-hover mt-6 lg:mt-0">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-red-50/40 via-white to-orange-50/30 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>

              <h2 className="text-2xl font-extrabold text-[#111111]">
                Find Your Perfect Ride
              </h2>
            </div>
            {/* <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100/70 flex items-center justify-center text-[#E10600] shadow-sm">
              <Car className="w-5 h-5" />
             
            </div> */}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 sm:px-8 py-6">
          {/* Location Inputs */}
          <div className="space-y-4">
            {/* From Location */}
            <div className={`relative transition-all ${showFromPredictions ? "z-30" : "z-20"}`} ref={fromContainerRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Starting Point
                </div>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Navigation className="w-4 h-4" />
                  </div>
                </div>
                <input
                  ref={fromInputRef}
                  placeholder="Where are you starting from?"
                  onChange={(e) => fetchPredictions(e.target.value, "from")}
                  onFocus={() => {
                    setShowToPredictions(false);
                    setShowFromPredictions(true);
                    const val = fromInputRef.current?.value || "";
                    if (val.trim()) {
                      fetchPredictions(val, "from");
                    }
                  }}
                  className="w-full pl-15 pr-4 py-3.5 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:border-[#E10600] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-sm font-medium text-gray-900 placeholder-gray-400 shadow-xs hover:border-gray-300"
                />

                {/* Predictions Dropdown */}
                <AnimatePresence>
                  {showFromPredictions && fromPredictions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="absolute z-50 left-0 right-0 w-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-card-hover max-h-64 overflow-y-auto hide-scrollbar"
                    >
                      {fromPredictions.map((p) => (
                        <motion.button
                          key={p.place_id}
                          type="button"
                          onClick={() =>
                            selectPlace(p.place_id, p.description, "from")
                          }
                          whileHover={{ backgroundColor: "#F9FAFB" }}
                          className="w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 flex items-center gap-3 hover:bg-red-50/40 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-[#E10600] shrink-0" />
                          <div className="text-left min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {p.structured_formatting.main_text}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {p.structured_formatting.secondary_text}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1 relative z-10">
              <motion.button
                type="button"
                onClick={swapLocations}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-[#E10600] hover:text-[#E10600] transition-all z-10"
                title="Swap Locations"
              >
                <ArrowDownUp className="w-4 h-4 text-gray-600 hover:text-[#E10600]" />
              </motion.button>
            </div>

            {/* To Location */}
            <div className={`relative transition-all ${showToPredictions ? "z-30" : "z-10"}`} ref={toContainerRef}>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Destination
                </div>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <input
                  ref={toInputRef}
                  placeholder="Where do you want to go?"
                  onChange={(e) => fetchPredictions(e.target.value, "to")}
                  onFocus={() => {
                    setShowFromPredictions(false);
                    setShowToPredictions(true);
                    const val = toInputRef.current?.value || "";
                    if (val.trim()) {
                      fetchPredictions(val, "to");
                    }
                  }}
                  className="w-full pl-15 pr-4 py-3.5 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:border-[#E10600] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-sm font-medium text-gray-900 placeholder-gray-400 shadow-xs hover:border-gray-300"
                />

                {/* Predictions Dropdown */}
                <AnimatePresence>
                  {showToPredictions && toPredictions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      className="absolute z-50 left-0 right-0 w-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-card-hover max-h-64 overflow-y-auto hide-scrollbar"
                    >
                      {toPredictions.map((p) => (
                        <motion.button
                          key={p.place_id}
                          type="button"
                          onClick={() =>
                            selectPlace(p.place_id, p.description, "to")
                          }
                          whileHover={{ backgroundColor: "#F9FAFB" }}
                          className="w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 flex items-center gap-3 hover:bg-red-50/40 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="text-left min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {p.structured_formatting.main_text}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {p.structured_formatting.secondary_text}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2 relative z-0">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Departure Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={date}
                  min={getTodayDate()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl focus:bg-white focus:border-[#E10600] focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-sm font-medium text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-5 mt-5 border-t border-gray-100">
            <motion.button
              type="button"
              onClick={clearForm}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm text-gray-700 flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </motion.button>

            <motion.button
              type="button"
              onClick={handleSearch}
              disabled={
                isSearching ||
                !fromInputRef.current?.value ||
                !toInputRef.current?.value
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-red-glow transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Search Rides</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </div>

          {/* Popular Routes */}
          <div className="pt-5 mt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E10600]" />
                <span className="text-xs font-bold text-gray-800">
                  Popular Routes
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Trending now</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {popularRoutes.filter(Boolean).map((route) => (
                <motion.button
                  key={`${route.from}-${route.to}`}
                  type="button"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    fromInputRef.current.value = route.from;
                    toInputRef.current.value = route.to;
                    setFromCity(route.from);
                    setToCity(route.to);
                    setFromPredictions([]);
                    setToPredictions([]);
                  }}
                  className="p-2.5 bg-gray-50/80 hover:bg-red-50/50 rounded-xl border border-gray-200/60 hover:border-red-200 transition-all text-left group"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Route className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E10600] transition-colors" />
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {route.from} → {route.to}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Daily rides available
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideSearchCard;

/* ---------------- UTILS ---------------- */

function getTodayDate() {
  const d = new Date();
  d.setDate(d.getDate());
  return d.toISOString().split("T")[0];
}

function getWeekendDate() {
  const d = new Date();
  // Get next Saturday
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().split("T")[0];
}
