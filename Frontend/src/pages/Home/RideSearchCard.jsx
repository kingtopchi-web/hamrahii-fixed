import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Search,
  ChevronDown,
  ArrowRightLeft,
  Navigation,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getBrowserCoords,
  getCityFromCoords,
  getlocationFromCoords,
} from "../../utils/GetLocation";
import { useGoogleMaps } from "../../components/maps/GoogleMapsProvider";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";

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

function getTodayDate() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/* ---------------- COMPONENT ---------------- */
const RideSearchCard = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [passengers, setPassengers] = useState("1");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

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

  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  /* Auto-detect user's current city silently if available */
  useEffect(() => {
    if (!isLoaded) return;
    const detectLocation = async () => {
      try {
        const { lat, lng } = await getBrowserCoords();
        const streetLocation = await getlocationFromCoords(lat, lng);
        const city = await getCityFromCoords(lat, lng);
        if (fromInputRef.current && !fromInputRef.current.value && streetLocation) {
          fromInputRef.current.value = streetLocation;
          setFromCity(city || streetLocation.split(",")[0]?.trim() || "");
        }
        if (city && streetLocation) {
          try {
            await Axios.post(api.user.updateLocation, { city, address: streetLocation });
          } catch (err) {
            // ignore
          }
        }
      } catch (err) {
        // user denied or location unavailable - silent fallback
      }
    };
    detectLocation();
  }, [isLoaded]);

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
      }
    );
  };

  const selectPlace = (placeId, description, type) => {
    if (!placesServiceRef.current && window.google?.maps?.places) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }

    const applySelection = (place) => {
      const city =
        place ? extractCity(place) : description.split(",")[0]?.trim() || "";

      if (type === "from") {
        setFromCity(city || description.split(",")[0]?.trim() || "");
        if (fromInputRef.current) {
          fromInputRef.current.value = place?.formatted_address || description;
        }
        setFromPredictions([]);
        setShowFromPredictions(false);
      } else {
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
        }
      );
    } catch (e) {
      applySelection(null);
    }
  };

  /* Swap From and To */
  const swapLocations = () => {
    const prevFromVal = fromInputRef.current ? fromInputRef.current.value : "";
    const prevToVal = toInputRef.current ? toInputRef.current.value : "";
    const prevFromCity = fromCity;
    const prevToCity = toCity;

    if (fromInputRef.current) fromInputRef.current.value = prevToVal;
    if (toInputRef.current) toInputRef.current.value = prevFromVal;

    setFromCity(prevToCity);
    setToCity(prevFromCity);

    setFromPredictions([]);
    setToPredictions([]);
    setShowFromPredictions(false);
    setShowToPredictions(false);
  };

  /* Locate Me */
  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const { lat, lng } = await getBrowserCoords();
      const streetLocation = await getlocationFromCoords(lat, lng);
      const city = await getCityFromCoords(lat, lng);
      if (fromInputRef.current && streetLocation) {
        fromInputRef.current.value = streetLocation;
        setFromCity(city || streetLocation.split(",")[0]?.trim() || "");
      }
    } catch (err) {
      // ignore
    } finally {
      setIsLocating(false);
    }
  };

  /* ---------------- SEARCH SUBMIT ---------------- */
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const fromVal = fromInputRef.current?.value || "";
    const toVal = toInputRef.current?.value || "";

    const fromQuery = fromCity || fromVal.split(",")[0]?.trim() || fromVal;
    const toQuery = toCity || toVal.split(",")[0]?.trim() || toVal;

    setIsSearching(true);

    navigate("/rides", {
      state: {
        fromCity: fromQuery,
        toCity: toQuery,
        date,
        fromLocation: fromVal,
        toLocation: toVal,
        seats: parseInt(passengers, 10) || 1,
      },
    });

    setIsSearching(false);
  };

  // Click outside to dismiss predictions
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

  return (
    <div className="w-full relative z-30">
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 p-4 md:p-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 items-end">
          {/* 1. LEAVING FROM */}
          <div className="lg:col-span-3 relative" ref={fromContainerRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                LEAVING FROM
              </label>
              <button
                type="button"
                onClick={handleLocateMe}
                title="Use current location"
                className="text-[10px] text-gray-400 hover:text-[#E10600] flex items-center gap-1 transition-colors"
              >
                {isLocating ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Navigation className="w-2.5 h-2.5" />
                )}
                <span>Current</span>
              </button>
            </div>
            <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gray-200/90 hover:border-gray-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white">
              <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              </div>
              <input
                ref={fromInputRef}
                placeholder="Where from?"
                defaultValue={fromCity}
                onChange={(e) => {
                  setFromCity(e.target.value);
                  fetchPredictions(e.target.value, "from");
                }}
                onFocus={() => {
                  setShowToPredictions(false);
                  setShowFromPredictions(true);
                  const val = fromInputRef.current?.value || "";
                  if (val.trim()) fetchPredictions(val, "from");
                }}
                className="w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              />
            </div>

            {/* From Predictions Dropdown */}
            <AnimatePresence>
              {showFromPredictions && fromPredictions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-60 overflow-y-auto"
                >
                  {fromPredictions.map((p) => (
                    <button
                      key={p.place_id}
                      type="button"
                      onClick={() => selectPlace(p.place_id, p.description, "from")}
                      className="w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 flex items-center gap-3 hover:bg-red-50/50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#E10600] shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="font-semibold text-xs text-gray-900 truncate">
                          {p.structured_formatting.main_text}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {p.structured_formatting.secondary_text}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. GOING TO */}
          <div className="lg:col-span-3 relative" ref={toContainerRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                GOING TO
              </label>
              <button
                type="button"
                onClick={swapLocations}
                title="Swap locations"
                className="text-[10px] text-gray-400 hover:text-[#E10600] flex items-center gap-1 transition-colors"
              >
                <ArrowRightLeft className="w-2.5 h-2.5" />
                <span>Swap</span>
              </button>
            </div>
            <div className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gray-200/90 hover:border-gray-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white">
              <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <input
                ref={toInputRef}
                placeholder="Where to?"
                defaultValue={toCity}
                onChange={(e) => {
                  setToCity(e.target.value);
                  fetchPredictions(e.target.value, "to");
                }}
                onFocus={() => {
                  setShowFromPredictions(false);
                  setShowToPredictions(true);
                  const val = toInputRef.current?.value || "";
                  if (val.trim()) fetchPredictions(val, "to");
                }}
                className="w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              />
            </div>

            {/* To Predictions Dropdown */}
            <AnimatePresence>
              {showToPredictions && toPredictions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-60 overflow-y-auto"
                >
                  {toPredictions.map((p) => (
                    <button
                      key={p.place_id}
                      type="button"
                      onClick={() => selectPlace(p.place_id, p.description, "to")}
                      className="w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 flex items-center gap-3 hover:bg-red-50/50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#E10600] shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="font-semibold text-xs text-gray-900 truncate">
                          {p.structured_formatting.main_text}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {p.structured_formatting.secondary_text}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. DATE */}
          <div className="lg:col-span-2 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              DATE
            </label>
            <div className="relative flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200/90 hover:border-gray-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white">
              <input
                type="date"
                value={date}
                min={getTodayDate()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 outline-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* 4. PASSENGERS */}
          <div className="lg:col-span-2 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              PASSENGERS
            </label>
            <div className="relative flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200/90 hover:border-gray-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all bg-white cursor-pointer">
              <select
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 outline-none bg-transparent cursor-pointer appearance-none pr-4"
              >
                <option value="1">1 Seat</option>
                <option value="2">2 Seats</option>
                <option value="3">3 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
                <option value="6">6 Seats</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-3 shrink-0" />
            </div>
          </div>

          {/* 5. SEARCH RIDES BUTTON */}
          <div className="lg:col-span-2">
            <motion.button
              type="submit"
              disabled={isSearching}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[42px] md:h-[44px] bg-[#E10600] hover:bg-[#c90500] text-white font-bold text-sm tracking-wide rounded-xl shadow-md hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4 stroke-[2.5]" />
              )}
              <span className="whitespace-nowrap font-bold">Search Rides</span>
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RideSearchCard;
