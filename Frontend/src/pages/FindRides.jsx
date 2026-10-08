import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Navigation,
  Calendar,
  Users,
  Clock,
  Car,
  Filter,
  X,
  Loader2,
  ArrowRight,
  ArrowRightLeft,
  ArrowLeftRight,
  Star,
  ShieldCheck,
  Award,
  Percent,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Heart,
  Eye,
  Battery,
  Wifi,
  Music,
  Coffee,
  PawPrint,
  MessageSquare,
  Settings,
  Fuel,
  Sparkles,
  TrendingUp,
  Route,
  Compass,
  Target,
  Zap,
  Globe,
  Layers,
  Thermometer,
  Wind,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  UserCheck,
  CreditCard,
  Headphones,
  List,
  ExternalLink,
  Shield,
  Users as UsersIcon,
  Package,
  Smile,
  Truck,
  CornerDownRight,
  BadgeCheck,
  DollarSign,
  ArrowDownUp,
  Trash2,
} from "lucide-react";
import { api } from "../services/endpoints";
import Axios from "../services/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { getCarImageUrl } from "../utils/profileImageHelper";

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY
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

const gotTodayDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate());
  return tomorrow.toISOString().split("T")[0];
};

const FindRides = () => {
  // Google Maps State
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  // Geolocation & Nearby State
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationPermission, setLocationPermission] = useState("prompt"); // 'prompt' | 'granted' | 'denied' | 'unsupported' | 'error'
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);
  const [maxDistanceKm, setMaxDistanceKm] = useState(50);
  const [isNearbyActive, setIsNearbyActive] = useState(false);
  const [currentCity, setCurrentCity] = useState("");

  // Google Places State
  const [fromPredictions, setFromPredictions] = useState([]);
  const [toPredictions, setToPredictions] = useState([]);
  const [showFromPredictions, setShowFromPredictions] = useState(false);
  const [showToPredictions, setShowToPredictions] = useState(false);

  // Other State
  const [date, setDate] = useState(gotTodayDate());
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState("grid");
  const [hasSearched, setHasSearched] = useState(false);
  const [hasManuallySearched, setHasManuallySearched] = useState(false);
  const [favoriteRides, setFavoriteRides] = useState([]);
  const [timeFilter, setTimeFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [seatPreference, setSeatPreference] = useState("any");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState("recommended");

  const navigate = useNavigate();
  const location = useLocation();

  // Refs
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const formRef = useRef(null);

  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const sortMenuRef = useRef(null);
  const filterMenuRef = useRef(null);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  /* ---------------- REVERSE GEOCODE ---------------- */
  const reverseGeocode = (lat, lng) => {
    return new Promise((resolve) => {
      if (!window.google || !window.google.maps) {
        resolve(null);
        return;
      }
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const city = extractCity(results[0]);
            resolve({
              city: city || "",
              formattedAddress: results[0].formatted_address || "",
            });
          } else {
            resolve(null);
          }
        });
      } catch (e) {
        resolve(null);
      }
    });
  };

  /* ---------------- FETCH NEARBY RIDES ---------------- */
  const fetchNearbyRides = async ({
    userLat,
    userLng,
    maxDistanceKm: radius,
    toCityParam,
    dateParam,
  }) => {
    setSearching(true);
    setHasSearched(true);
    setError(null);
    try {
      const payload = {
        userLat,
        userLng,
        maxDistanceKm: radius || maxDistanceKm || 50,
        date: dateParam || date || gotTodayDate(),
      };
      if (toCityParam) {
        payload.toLocation = toCityParam;
      }
      const res = await Axios.post(api.ride.find, payload);
      if (res.data?.success) {
        setSearchResults(res.data.rides || []);
        setTotalResults(res.data.count || 0);
        setIsNearbyActive(true);
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search nearby rides");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setSearching(false);
      setIsLocating(false);
    }
  };

  /* ---------------- DETECT CURRENT LOCATION ---------------- */
  const detectCurrentLocation = useCallback(
    async (autoSearch = true) => {
      if (!navigator.geolocation) {
        setLocationPermission("unsupported");
        return;
      }

      setIsLocating(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setLocationPermission("granted");

          // Reverse geocode to get city name
          const geoRes = await reverseGeocode(lat, lng);
          const detectedCity = geoRes?.city || "";
          const detectedAddress = geoRes?.formattedAddress || "Current Location";

          if (detectedCity) {
            setCurrentCity(detectedCity);
            setFromCity(detectedCity);
          }
          if (fromInputRef.current) {
            fromInputRef.current.value = detectedCity || detectedAddress;
          }

          if (autoSearch) {
            fetchNearbyRides({
              userLat: lat,
              userLng: lng,
              maxDistanceKm: maxDistanceKm || 50,
              dateParam: date || gotTodayDate(),
            });
          } else {
            setIsLocating(false);
          }
        },
        (err) => {
          setIsLocating(false);
          if (err.code === 1) {
            setLocationPermission("denied");
          } else {
            setLocationPermission("error");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      );
    },
    [date, maxDistanceKm],
  );

  /* ---------------- INIT GOOGLE MAPS ---------------- */
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

  /* ---------------- ON LOAD / REDIRECT EFFECT ---------------- */
  useEffect(() => {
    if (!isMapsLoaded) return;

    if (location?.state?.fromCity) {
      fetchRedirectRides(
        location?.state?.fromCity,
        location?.state?.toCity,
        location?.state?.date,
      );
      setHasSearched(true);
      setHasManuallySearched(true);
      setSearching(true);
      setError(null);
      setShowFromPredictions(false);
      setShowToPredictions(false);
      setSelectedRide(null);
    } else {
      // Automatically detect user location and fetch nearby rides
      detectCurrentLocation(true);
    }
  }, [isMapsLoaded, location]);

  const fetchRedirectRides = async (from, to, date) => {
    try {
      const res = await Axios.post(api.ride.find, {
        fromLocation: from,
        toLocation: to,
        date: date || gotTodayDate(),
      });

      if (res.data?.success) {
        setSearchResults(res.data.rides || []);
        setTotalResults(res.data.count || 0);
        setIsNearbyActive(false);
        window.scrollTo({
          top: document.body.scrollHeight * 0.4,
          behavior: "smooth",
        });
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search rides");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setSearching(false);
    }
  };

  /* ---------------- AUTOCOMPLETE FUNCTIONS ---------------- */
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
        if (location && typeof location.lat === "function") {
          setUserCoords({ lat: location.lat(), lng: location.lng() });
          setCurrentCity(city || "");
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
    const tempFromValue = fromInputRef.current?.value || "";

    setFrom(to);
    setFromCity(toCity);
    if (fromInputRef.current) {
      fromInputRef.current.value = toInputRef.current?.value || "";
    }

    setTo(tempFrom);
    setToCity(tempFromCity);
    if (toInputRef.current) {
      toInputRef.current.value = tempFromValue;
    }

    setFromPredictions([]);
    setToPredictions([]);
    setShowFromPredictions(false);
    setShowToPredictions(false);
  };

  // Handle search
  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const fromValue = fromInputRef.current?.value || "";
    const toValue = toInputRef.current?.value || "";

    if (!fromValue && !userCoords) {
      setError("Please enter your starting location or enable location detection.");
      return;
    }

    if (fromValue && toValue && fromValue.toLowerCase().trim() === toValue.toLowerCase().trim()) {
      setError("From and To locations cannot be the same");
      return;
    }

    setHasSearched(true);
    setHasManuallySearched(true);
    setSearching(true);
    setError(null);
    setShowFromPredictions(false);
    setShowToPredictions(false);
    setSelectedRide(null);

    try {
      const payload = {
        date: date || gotTodayDate(),
      };

      if (userCoords) {
        payload.userLat = userCoords.lat;
        payload.userLng = userCoords.lng;
        payload.maxDistanceKm = maxDistanceKm;
      }

      if (fromCity || fromValue) {
        payload.fromLocation = fromCity || fromValue;
      }

      if (toCity || toValue) {
        payload.toLocation = toCity || toValue;
      }

      const res = await Axios.post(api.ride.find, payload);

      if (res.data?.success) {
        setSearchResults(res.data.rides || []);
        setTotalResults(res.data.count || 0);
        setIsNearbyActive(!!userCoords);
        window.scrollTo({
          top: document.body.scrollHeight * 0.4,
          behavior: "smooth",
        });
      } else {
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to search rides");
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setSearching(false);
    }
  };

  // Change proximity radius
  const handleRadiusChange = (newRadius) => {
    setMaxDistanceKm(newRadius);
    if (userCoords) {
      const toValue = toInputRef.current?.value || "";
      fetchNearbyRides({
        userLat: userCoords.lat,
        userLng: userCoords.lng,
        maxDistanceKm: newRadius,
        toCityParam: toCity || toValue,
        dateParam: date,
      });
    }
  };

  // Clear search
  const clearSearch = () => {
    setFrom(null);
    setTo(null);
    setFromCity("");
    setToCity("");
    setUserCoords(null);
    setCurrentCity("");
    setIsNearbyActive(false);
    setDate(gotTodayDate());
    setSearchResults([]);
    setTotalResults(0);
    setError(null);
    setFromPredictions([]);
    setToPredictions([]);
    setSelectedRide(null);
    setShowFilters(false);
    setHasSearched(false);
    setHasManuallySearched(false);

    if (fromInputRef.current) fromInputRef.current.value = "";
    if (toInputRef.current) toInputRef.current.value = "";
  };

  /* ---------------- CLICK OUTSIDE HANDLER ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromPredictions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToPredictions(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- FORMAT FUNCTIONS ---------------- */
  const formatTime = (timeStr, dateStr) => {
    if (!timeStr) return "";
    if (timeStr.includes("T")) {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    }
    const match = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = match[4] || (hours >= 12 ? "PM" : "AM");
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    const d = new Date(dateStr ? `${dateStr}T${timeStr}` : timeStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return timeStr;
  };

  const formatDate = (timeStr, dateStr) => {
    let d = null;
    if (dateStr) {
      d = new Date(dateStr);
    } else if (timeStr && timeStr.includes("T")) {
      d = new Date(timeStr);
    }
    if (!d || isNaN(d.getTime())) return "Upcoming";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  /* ---------------- PREFERENCE & FEATURE FUNCTIONS ---------------- */
  const getPreferenceIcon = (type, value) => {
    const baseClasses = "w-4 h-4";
    switch (type) {
      case "music":
        return value === "allowed" ? (
          <Volume2 className={`${baseClasses} text-blue-500`} />
        ) : (
          <VolumeX className={`${baseClasses} text-gray-400`} />
        );
      case "smoking":
        return value === "allowed" ? (
          <Coffee className={`${baseClasses} text-amber-500`} />
        ) : (
          <X className={`${baseClasses} text-gray-400`} />
        );
      case "pets":
        return value === "allowed" ? (
          <PawPrint className={`${baseClasses} text-green-500`} />
        ) : (
          <X className={`${baseClasses} text-gray-400`} />
        );
      case "conversation":
        return value === "allowed" ? (
          <MessageSquare className={`${baseClasses} text-purple-500`} />
        ) : value === "preferred" ? (
          <MessageSquare className={`${baseClasses} text-indigo-500`} />
        ) : (
          <MessageSquare className={`${baseClasses} text-gray-400`} />
        );
      default:
        return null;
    }
  };

  const getPreferenceLabel = (type, value) => {
    switch (type) {
      case "music":
        return "Music";
      case "smoking":
        return "Smoking";
      case "pets":
        return "Pets";
      case "conversation":
        return value === "allowed"
          ? "Chat Allowed"
          : value === "preferred"
            ? "Chat Preferred"
            : "Quiet Ride";
      default:
        return "";
    }
  };

  const getCarFeatures = (carDetails) => {
    const features = [];
    if (carDetails?.transmission === "automatic")
      features.push({ icon: Settings, label: "Auto", color: "text-blue-500" });
    if (carDetails?.fuelType === "petrol")
      features.push({ icon: Fuel, label: "Petrol", color: "text-amber-500" });
    if (carDetails?.year)
      features.push({
        icon: Car,
        label: `${carDetails.year}`,
        color: "text-purple-500",
      });
    if (carDetails?.seats)
      features.push({
        icon: Users,
        label: `${carDetails.seats} Seats`,
        color: "text-green-500",
      });
    return features;
  };

  const toggleFavorite = (rideId) => {
    setFavoriteRides((prev) =>
      prev.includes(rideId)
        ? prev.filter((id) => id !== rideId)
        : [...prev, rideId],
    );
  };

  const toggleView = () => {
    setActiveView(activeView === "grid" ? "list" : "grid");
  };

  /* ---------------- QUICK DATE FUNCTIONS ---------------- */
  const setTodayDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  };

  const setTomorrowDate = () => {
    setDate(gotTodayDate());
  };

  const setNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDate(nextWeek.toISOString().split("T")[0]);
  };

  /* ---------------- POPULAR ROUTES ---------------- */
  const popularRoutes = [
    { from: "Delhi", to: "Chandigarh" },
    { from: "Mumbai", to: "Pune" },
    { from: "Bangalore", to: "Chennai" },
    { from: "Hyderabad", to: "Vijayawada" },
    { from: "Kolkata", to: "Bhubaneswar" },
    { from: "Lucknow", to: "Delhi" },
    { from: "Ahmedabad", to: "Surat" },
    { from: "Jaipur", to: "Udaipur" },
  ];

  /* ---------------- SORT OPTIONS ---------------- */
  const sortOptions = [
    { id: "recommended", label: "Recommended (Nearest & Upcoming)", icon: Sparkles },
    { id: "proximity", label: "Nearest First", icon: MapPin },
    { id: "price_low", label: "Price: Low to High", icon: DollarSign },
    { id: "price_high", label: "Price: High to Low", icon: DollarSign },
    { id: "departure_early", label: "Departure: Early First", icon: Clock },
    { id: "departure_late", label: "Departure: Late First", icon: Clock },
    { id: "rating", label: "Highest Rated", icon: Star },
  ];

  /* ---------------- FILTERED & SORTED RIDES ---------------- */
  const displayedRides = useMemo(() => {
    let list = [...searchResults];

    // Price filter
    if (priceRange && priceRange.length === 2) {
      list = list.filter(
        (r) => r.pricePerSeat >= priceRange[0] && r.pricePerSeat <= priceRange[1]
      );
    }

    // Seat preference filter
    if (seatPreference && seatPreference !== "any") {
      const needed = parseInt(seatPreference, 10);
      if (!isNaN(needed)) {
        list = list.filter((r) => r.availableSeats >= needed);
      }
    }

    // Time filter
    if (timeFilter && timeFilter !== "all") {
      list = list.filter((r) => {
        if (!r.departureTime) return false;
        
        let hours = 0;
        // Parse time if it's an ISO string or HH:MM
        if (r.departureTime.includes("T")) {
          const d = new Date(r.departureTime);
          if (!isNaN(d.getTime())) hours = d.getHours();
        } else {
          const match = r.departureTime.match(/(\d{1,2}):(\d{2})/);
          if (match) {
            hours = parseInt(match[1], 10);
            if (r.departureTime.toLowerCase().includes("pm") && hours < 12) hours += 12;
            if (r.departureTime.toLowerCase().includes("am") && hours === 12) hours = 0;
          }
        }

        switch (timeFilter) {
          case "morning": return hours >= 6 && hours < 12; // 6 AM - 11:59 AM
          case "afternoon": return hours >= 12 && hours < 17; // 12 PM - 4:59 PM
          case "evening": return hours >= 17 && hours < 21; // 5 PM - 8:59 PM
          case "night": return hours >= 21 || hours < 6; // 9 PM - 5:59 AM
          default: return true;
        }
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "proximity") {
        if (
          a.distanceKm !== null &&
          a.distanceKm !== undefined &&
          b.distanceKm !== null &&
          b.distanceKm !== undefined
        ) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== null && a.distanceKm !== undefined) return -1;
        if (b.distanceKm !== null && b.distanceKm !== undefined) return 1;
      }
      if (sortBy === "price_low") {
        return a.pricePerSeat - b.pricePerSeat;
      }
      if (sortBy === "price_high") {
        return b.pricePerSeat - a.pricePerSeat;
      }
      if (sortBy === "departure_early") {
        return (a.departureTime || "").localeCompare(b.departureTime || "");
      }
      if (sortBy === "departure_late") {
        return (b.departureTime || "").localeCompare(a.departureTime || "");
      }
      return 0;
    });

    // Limit to 3 if user hasn't searched explicitly yet
    if (!hasManuallySearched) {
      list = list.slice(0, 3);
    }

    return list;
  }, [searchResults, sortBy, priceRange, seatPreference, timeFilter, hasManuallySearched]);

  /* ---------------- LOADING STATE ---------------- */
  if (!isMapsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50/30 via-white to-blue-50/20 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50/30 via-white to-blue-50/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-red-500/5 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-t from-blue-500/5 to-transparent" />

        {/* Floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-red-200/20 to-orange-200/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(40px)",
            }}
            animate={{
              y: [0, Math.random() * 100 - 50, 0],
              x: [0, Math.random() * 50 - 25, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
        </motion.div>

        {/* Search Section - Glass Morphism */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mb-16"
          ref={formRef}
        >
          {/* Background Blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-red-50/30 rounded-3xl blur-2xl" />
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10 rounded-3xl blur-xl" />

          {/* Main Card */}
          <div className="relative bg-[var(--bg-surface)]/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-[var(--border-subtle)]/50 p-4 sm:p-6 md:p-8 shadow-xl sm:shadow-2xl">
            {/* Form Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="hidden md:block w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Smart Ride Search
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Find the perfect ride in seconds
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearSearch}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-xs sm:text-sm text-gray-700 flex items-center gap-1.5 sm:gap-2"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Clear</span>
              </motion.button>
            </div>

            {/* Location Permission Alert Banner */}
            <AnimatePresence>
              {locationPermission === "denied" && !locationBannerDismissed && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-amber-50/90 backdrop-blur-sm border border-amber-200/80 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Location access is disabled in your browser
                      </p>
                      <p className="text-xs text-amber-700">
                        Enter your pickup city manually below, or enable browser location to view rides departing closest to you.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationBannerDismissed(true)}
                    className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-2 md:space-y-6">
              {/* Location Inputs Row */}
              <div className={`grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 relative transition-all ${showFromPredictions || showToPredictions ? "z-30" : "z-10"}`}>
                {/* From Location */}
                <div className={`relative transition-all ${showFromPredictions ? "z-40" : "z-20"}`} ref={fromRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        From Location
                      </div>
                      {userCoords && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          GPS Detected
                        </span>
                      )}
                    </div>
                  </label>
                  <div className="relative group">
                    <input
                      ref={fromInputRef}
                      type="text"
                      onChange={(e) => {
                        fetchPredictions(e.target.value, "from");
                        if (userCoords && e.target.value !== currentCity) {
                          setUserCoords(null);
                        }
                      }}
                      onFocus={() => {
                        setShowToPredictions(false);
                        setShowFromPredictions(true);
                        const val = fromInputRef.current?.value || "";
                        if (val.trim()) {
                          fetchPredictions(val, "from");
                        }
                      }}
                      className="w-full pl-10 md:pl-14 pr-24 py-4 bg-[var(--bg-surface)]/50 border-2 border-[var(--border-subtle)] rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Where are you starting?"
                    />
                    <div className="absolute left-0 md:left-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>

                    {/* Current Location Quick Button */}
                    <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 flex items-center">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => detectCurrentLocation(true)}
                        title="Detect and use current location"
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                          isLocating
                            ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                            : userCoords
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-[var(--border-subtle)]"
                        }`}
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span className="hidden sm:inline">Locating...</span>
                          </>
                        ) : (
                          <>
                            <Compass
                              className={`w-3.5 h-3.5 ${
                                userCoords ? "text-emerald-600 fill-emerald-100" : "text-gray-500"
                              }`}
                            />
                            <span className="hidden sm:inline">
                              {userCoords ? "Near You" : "Current"}
                            </span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Google Places Suggestions Dropdown */}
                  <AnimatePresence>
                    {showFromPredictions && fromPredictions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute z-50 left-0 right-0 w-full mt-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-2xl max-h-64 overflow-y-auto hide-scrollbar"
                      >
                        {fromPredictions.map((p) => (
                          <motion.button
                            key={p.place_id}
                            type="button"
                            onClick={() =>
                              selectPlace(p.place_id, p.description, "from")
                            }
                            whileHover={{ backgroundColor: "#F9FAFB" }}
                            className="w-full px-4 py-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 flex items-center gap-3 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-orange-50/50 transition-all"
                          >
                            <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                            <div className="text-left min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {p.structured_formatting.main_text}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {p.structured_formatting.secondary_text}
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Swap Button */}
                <div className="flex items-center lg:items-end justify-center z-10 py-1 lg:py-0">
                  <motion.button
                    type="button"
                    onClick={swapLocations}
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    title="Swap pickup and destination"
                    className="w-10 h-10 lg:w-16 lg:h-16 rounded-full lg:rounded-2xl bg-gradient-to-br from-gray-100 to-white border-2 border-[var(--border-subtle)] flex items-center justify-center hover:border-red-500 hover:shadow-lg transition-all shadow-sm"
                  >
                    <ArrowDownUp className="w-4 h-4 lg:hidden text-gray-700" />
                    <ArrowLeftRight className="hidden lg:block w-6 h-6 text-gray-700" />
                  </motion.button>
                </div>

                {/* To Location */}
                <div className={`relative transition-all ${showToPredictions ? "z-40" : "z-20"}`} ref={toRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      To Location
                    </div>
                  </label>
                  <div className="relative group">
                    <input
                      ref={toInputRef}
                      type="text"
                      onChange={(e) => fetchPredictions(e.target.value, "to")}
                      onFocus={() => {
                        setShowFromPredictions(false);
                        setShowToPredictions(true);
                        const val = toInputRef.current?.value || "";
                        if (val.trim()) {
                          fetchPredictions(val, "to");
                        }
                      }}
                      className="w-full pl-10 md:pl-14 pr-4 py-4 bg-[var(--bg-surface)]/50 border-2 border-[var(--border-subtle)] rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                      placeholder="Where to? (Optional for nearby rides)"
                    />
                    <div className="absolute left-0 md:left-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-10 h-10  flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Google Places Suggestions Dropdown */}
                  <AnimatePresence>
                    {showToPredictions && toPredictions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute z-50 left-0 right-0 w-full mt-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-2xl max-h-64 overflow-y-auto hide-scrollbar"
                      >
                        {toPredictions.map((p) => (
                          <motion.button
                            key={p.place_id}
                            type="button"
                            onClick={() =>
                              selectPlace(p.place_id, p.description, "to")
                            }
                            whileHover={{ backgroundColor: "#F9FAFB" }}
                            className="w-full px-4 py-3 text-left border-b border-[var(--border-subtle)] last:border-b-0 flex items-center gap-3 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-orange-50/50 transition-all"
                          >
                            <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                            <div className="text-left min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {p.structured_formatting.main_text}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
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

              {/* Date and Action Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-0">
                {/* Date Input */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      Travel Date
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={gotTodayDate()}
                      className="w-full pl-12 sm:pl-14 pr-4 py-3.5 sm:py-4 bg-[var(--bg-surface)]/50 border-2 border-[var(--border-subtle)] rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none text-gray-900 text-sm sm:text-base"
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                {/* Quick Date Buttons - hidden on mobile/tablet */}
                <div className="hidden lg:flex items-end gap-2">
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <motion.button
                    type="submit"
                    disabled={
                      searching ||
                      (!fromInputRef.current?.value && !userCoords)
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-base sm:text-lg hover:shadow-xl hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2.5 sm:gap-3 group disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {searching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Find Rides</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                      <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-red-700 font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Popular Routes */}
            {!hasSearched ? (
              <div className="mt-8 pt-8 border-t border-[var(--border-subtle)]/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-500" />
                    Popular Routes
                  </h3>
                  <span className="text-xs text-gray-500">Trending now</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {popularRoutes.map((route, idx) => {
                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (fromInputRef.current) {
                            fromInputRef.current.value = route.from;
                          }
                          if (toInputRef.current) {
                            toInputRef.current.value = route.to;
                          }
                          setFromCity(route.from);
                          setToCity(route.to);
                          setFromPredictions([]);
                          setToPredictions([]);
                        }}
                        className="px-4 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-300 font-medium text-gray-700 flex items-center gap-2 group"
                      >
                        <CornerDownRight className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                        {route.from} → {route.to}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </motion.div>

        {/* Results Section - REST OF YOUR EXISTING CODE REMAINS THE SAME */}
        {/* All the results display code below remains exactly as you had it */}
        <AnimatePresence mode="wait">
          {searching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-32 h-32 mx-auto mb-8"
              >
                <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Car className="w-16 h-16 text-white" />
                </div>
              </motion.div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Finding Your Perfect Ride
              </h3>
              <p className="text-xl text-gray-600 max-w-md mx-auto">
                Scanning thousands of available routes for you...
              </p>

              <div className="mt-8 max-w-md mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                    animate={{
                      width: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ) : hasSearched && displayedRides.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="max-w-lg mx-auto">
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Route className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {isNearbyActive ? "No nearby rides found" : "No rides found"}
                </h3>
                <p className="text-gray-600 mb-8">
                  {isNearbyActive ? (
                    <>
                      We couldn't find any upcoming rides within{" "}
                      <span className="font-semibold">{maxDistanceKm} km</span> of{" "}
                      <span className="font-semibold">
                        {currentCity || fromInputRef.current?.value || "your current location"}
                      </span>
                      {toInputRef.current?.value ? (
                        <>
                          {" "}towards{" "}
                          <span className="font-semibold">
                            {toInputRef.current?.value}
                          </span>
                        </>
                      ) : null}
                      . Try increasing the search radius or check back shortly.
                    </>
                  ) : (
                    <>
                      We couldn't find any rides from{" "}
                      <span className="font-semibold">
                        {fromInputRef.current?.value || "your location"}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold">
                        {toInputRef.current?.value || "destination"}
                      </span>{" "}
                      on{" "}
                      <span className="font-semibold">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      .
                    </>
                  )}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {isNearbyActive && maxDistanceKm < 100 && (
                    <button
                      onClick={() => handleRadiusChange(100)}
                      className="px-6 py-3 bg-[var(--bg-surface)] border-2 border-emerald-500 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      Expand Radius to 100 km
                    </button>
                  )}
                  <button
                    onClick={clearSearch}
                    className="px-6 py-3 bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] rounded-xl font-medium text-gray-700 hover:border-gray-300 transition-colors"
                  >
                    Try Another Route
                  </button>
                  <button
                    onClick={() => navigate("/offer-ride")}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all"
                  >
                    Offer Ride
                  </button>
                </div>
              </div>
            </motion.div>
          ) : displayedRides.length > 0 ? (
            // Show results when search returns rides
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Proximity Radius Bar (when nearby search is active) */}
              {isNearbyActive && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-3.5 mb-6 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-blue-50/90 border border-emerald-200/80 rounded-2xl shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-emerald-950">
                      Showing rides within <span className="font-extrabold text-emerald-700 underline decoration-emerald-400">{maxDistanceKm} km</span> of {currentCity || fromInputRef.current?.value || "your location"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs text-gray-500 font-medium">Distance radius:</span>
                    {[25, 50, 100].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => handleRadiusChange(radius)}
                        className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          maxDistanceKm === radius
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-[var(--bg-surface)] text-gray-700 hover:bg-gray-100 border border-[var(--border-subtle)]"
                        }`}
                      >
                        {radius} km
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 bg-[var(--bg-surface)]/80 backdrop-blur-sm rounded-2xl border border-[var(--border-subtle)]/50 shadow-lg relative z-30">
                <div>
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {isNearbyActive ? "Nearby & Upcoming Rides" : "Available Rides"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-xs sm:text-sm font-bold shadow-xs">
                        {displayedRides.length} Rides
                      </div>
                      <span>Found</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <p className="hidden sm:block text-xs sm:text-sm truncate max-w-xs md:max-w-md">
                      {isNearbyActive ? (
                        <>
                          Departing near <span className="font-semibold text-gray-900">{currentCity || fromInputRef.current?.value || "your location"}</span>
                          {toInputRef.current?.value ? (
                            <> towards <span className="font-semibold text-gray-900">{toInputRef.current?.value}</span></>
                          ) : null}
                        </>
                      ) : (
                        <>
                          From{" "}
                          <span className="font-semibold text-gray-900">
                            {fromInputRef.current?.value || "your location"}
                          </span>{" "}
                          to{" "}
                          <span className="font-semibold text-gray-900">
                            {toInputRef.current?.value || "destination"}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border-subtle)]">
                  {/* Filter Menu */}
                  <div className="relative z-50 flex-1 sm:flex-initial" ref={filterMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowFilters(!showFilters);
                        setShowSortMenu(false);
                      }}
                      className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--bg-surface)] border-2 rounded-xl transition-all flex items-center justify-center gap-2 text-xs sm:text-sm font-medium ${
                        showFilters || seatPreference !== "any" || timeFilter !== "all" || priceRange[0] > 0 || priceRange[1] < 5000
                          ? "border-red-500 text-red-600 shadow-sm"
                          : "border-[var(--border-subtle)] text-gray-700 hover:border-red-500"
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span>Filter</span>
                      {(seatPreference !== "any" || timeFilter !== "all" || priceRange[0] > 0 || priceRange[1] < 5000) && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showFilters && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute left-0 sm:left-auto right-auto sm:right-0 mt-2 w-[calc(100vw-2.5rem)] max-w-xs sm:w-72 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl p-4 sm:p-5 z-50"
                        >
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border-subtle)]">
                            <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                              <Filter className="w-4 h-4 text-red-500" />
                              Filter Rides
                            </span>
                            {(seatPreference !== "any" || timeFilter !== "all" || priceRange[0] > 0 || priceRange[1] < 5000) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSeatPreference("any");
                                  setTimeFilter("all");
                                  setPriceRange([0, 5000]);
                                }}
                                className="text-xs text-red-600 font-semibold hover:underline"
                              >
                                Reset
                              </button>
                            )}
                          </div>

                          {/* Departure Time */}
                          <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Departure Time
                            </label>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { id: "all", label: "Any Time" },
                                { id: "morning", label: "Morning (6AM - 12PM)" },
                                { id: "afternoon", label: "Afternoon (12PM - 5PM)" },
                                { id: "evening", label: "Evening (5PM - 9PM)" },
                                { id: "night", label: "Night (9PM - 6AM)" },
                              ].map((time) => (
                                <button
                                  key={time.id}
                                  type="button"
                                  onClick={() => setTimeFilter(time.id)}
                                  className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all ${
                                    timeFilter === time.id
                                      ? "bg-red-500 text-white shadow-sm"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  } ${time.id === "all" ? "col-span-2" : ""}`}
                                >
                                  {time.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Seats Required */}
                          <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Seats Required
                            </label>
                            <div className="grid grid-cols-4 gap-1.5">
                              {["any", "1", "2", "3"].map((seats) => (
                                <button
                                  key={seats}
                                  type="button"
                                  onClick={() => setSeatPreference(seats)}
                                  className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                                    seatPreference === seats
                                      ? "bg-red-500 text-white shadow-sm"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {seats === "any" ? "Any" : `${seats}+`}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Price Range */}
                          <div>
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
                              <span>Max Price</span>
                              <span className="text-red-600 font-bold">₹{priceRange[1]}</span>
                            </div>
                            <input
                              type="range"
                              min="100"
                              max="5000"
                              step="100"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                              className="w-full accent-red-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                              <span>₹100</span>
                              <span>₹2500</span>
                              <span>₹5000</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sort Menu */}
                  <div className="relative z-50 flex-1 sm:flex-initial" ref={sortMenuRef}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowSortMenu(!showSortMenu);
                        setShowFilters(false);
                      }}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] rounded-xl hover:border-red-500 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-amber-500" />
                      <span className="truncate max-w-[90px] sm:max-w-none">
                        {sortOptions.find((opt) => opt.id === sortBy)?.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform rotate-90 shrink-0 text-gray-400" />
                    </motion.button>

                    <AnimatePresence>
                      {showSortMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-[calc(100vw-2.5rem)] max-w-[260px] sm:w-64 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-2xl z-50"
                        >
                          {sortOptions.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => {
                                setSortBy(option.id);
                                setShowSortMenu(false);
                              }}
                              className={`w-full px-4 py-2.5 sm:py-3 text-left flex items-center gap-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl text-xs sm:text-sm ${
                                sortBy === option.id
                                  ? "bg-red-50 text-red-600 font-semibold"
                                  : "text-gray-700"
                              }`}
                            >
                              <option.icon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{option.label}</span>
                              {sortBy === option.id && (
                                <CheckCircle className="w-4 h-4 ml-auto shrink-0" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => setActiveView("grid")}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                        activeView === "grid"
                          ? "bg-[var(--bg-surface)] text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title="Grid View"
                    >
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => setActiveView("list")}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all ${
                        activeView === "list"
                          ? "bg-[var(--bg-surface)] text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Content */}
              {activeView === "grid" && (
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-0"
                >
                  {displayedRides.map((ride, index) => (
                    <motion.div
                      key={ride._id}
                      variants={fadeInUp}
                      whileHover={{ y: -6 }}
                      className="group bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)]/90 overflow-hidden shadow-card-subtle hover:shadow-card-hover hover:border-red-200/80 transition-all duration-300 relative flex flex-col justify-between"
                    >
                      {/* Status Badges */}
                      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                        {ride.departureDate === gotTodayDate() && (
                          <div className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold rounded-full flex items-center gap-1 shadow-md">
                            <Sparkles className="w-3 h-3 fill-white" />
                            TODAY
                          </div>
                        )}
                        {ride.pricePerSeat > 800 && (
                          <div className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-extrabold rounded-full flex items-center gap-1 shadow-md">
                            <Star className="w-3 h-3 fill-white" />
                            PREMIUM
                          </div>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => toggleFavorite(ride._id)}
                        className="absolute top-4 right-4 z-10 p-2 bg-[var(--bg-surface)]/90 backdrop-blur-md rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favoriteRides.includes(ride._id)
                              ? "fill-[#E10600] text-[#E10600]"
                              : "text-gray-400"
                          }`}
                        />
                      </button>

                      {/* Ride Image / Top banner */}
                      <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                        {ride.carDetails?.images?.[0] ? (
                          <img
                            src={getCarImageUrl(ride.carDetails?.images?.[0])}
                            alt="Car"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/default-car.svg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Car className="w-14 h-14 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                          <div className="text-white font-bold text-base sm:text-lg drop-shadow-sm truncate">
                            {ride.from?.city} → {ride.to?.city}
                          </div>
                        </div>
                      </div>

                      {/* Ride Content */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        {/* Departure Time & Driver */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E10600] flex items-center justify-center font-bold text-xs shrink-0">
                                <Clock className="w-4 h-4 text-[#E10600]" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-[#111111] truncate">
                                  {formatTime(ride.departureTime, ride.departureDate)}
                                </div>
                                <div className="text-xs text-gray-500 font-medium truncate">
                                  {formatDate(ride.departureTime, ride.departureDate)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                {ride.isFullSharing ? "Full Vehicle" : `${ride.availableSeats} seats left`}
                              </span>
                              {ride.distanceKm !== undefined && ride.distanceKm !== null && (
                                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50/90 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200/80 whitespace-nowrap">
                                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                  {ride.distanceKm < 1 ? `${Math.round(ride.distanceKm * 1000)}m away` : `${ride.distanceKm} km away`}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Car Details */}
                          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                            <h3 className="font-bold text-[#111111] text-sm sm:text-base truncate">
                              {ride.carDetails?.brand} {ride.carDetails?.model}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-gray-700">4.8</span>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
                            {getCarFeatures(ride.carDetails).slice(0, 3).map(
                              (feature, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-600"
                                >
                                  <feature.icon className={`w-3 h-3 ${feature.color}`} />
                                  <span>{feature.label}</span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[var(--border-subtle)] mt-2">
                          <div>
                            <div className="text-lg sm:text-xl font-extrabold text-[#111111]">
                              ₹{ride.pricePerSeat}
                              <span className="text-xs font-normal text-gray-500 ml-1">
                                {!ride?.isFullSharing && "/seat"} 
                              </span>
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-gray-400">
                              Total: ₹{ride.pricePerSeat * ride.availableSeats}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() =>
                              navigate("/view-ride-details", {
                                state: { rideId: ride?._id },
                              })
                            }
                            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-red-glow transition-all duration-200 flex items-center gap-1.5 group shrink-0"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* List View */}
              {activeView === "list" && (
                <div className="space-y-4 relative z-0">
                  {displayedRides.map((ride, index) => (
                    <motion.div
                      key={ride._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-4 sm:p-6 hover:border-red-300 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
                        {/* Left Section */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                  {ride.from?.city} → {ride.to?.city}
                                </h3>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {ride.departureDate === gotTodayDate() && (
                                    <div className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] sm:text-xs font-extrabold rounded-md shadow-sm">
                                      TODAY
                                    </div>
                                  )}
                                  {ride.pricePerSeat > 800 && (
                                    <div className="px-2 py-0.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg text-[11px] sm:text-xs font-bold text-amber-800">
                                      PREMIUM
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                                  {formatTime(ride.departureTime, ride.departureDate)} •{" "}
                                  {formatDate(ride.departureTime, ride.departureDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
                                  {ride.availableSeats}/{ride.totalSeats} seats
                                </span>
                                {ride.distanceKm !== undefined && ride.distanceKm !== null ? (
                                  <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs">
                                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                                    {ride.distanceKm < 1 ? `${Math.round(ride.distanceKm * 1000)}m away` : `${ride.distanceKm} km away`}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                                    <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                    Route Available
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleFavorite(ride._id)}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                            >
                              <Heart
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  favoriteRides.includes(ride._id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Car Details */}
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                              {ride.carDetails?.images?.[0] ? (
                                <img
                                  src={getCarImageUrl(ride.carDetails?.images?.[0])}
                                  alt="Car"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/default-car.svg";
                                  }}
                                />
                              ) : (
                                <Car className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                                {ride.carDetails?.brand}{" "}
                                {ride.carDetails?.model}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    4.8
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  {getCarFeatures(ride.carDetails).map(
                                    (feature, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md"
                                      >
                                        <feature.icon
                                          className={`w-3 h-3 ${feature.color}`}
                                        />
                                        <span>{feature.label}</span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Preferences */}
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {Object.entries(ride.preferences || {}).map(
                              ([key, value], idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs"
                                >
                                  {getPreferenceIcon(key, value)}
                                  <span className="text-[11px] sm:text-xs text-gray-600">
                                    {getPreferenceLabel(key, value)}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Right Section */}
                        <div className="w-full lg:w-48 pt-3 sm:pt-4 lg:pt-0 border-t lg:border-t-0 border-[var(--border-subtle)] flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 sm:gap-4 shrink-0">
                          <div className="text-left lg:text-right">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                              ₹{ride.pricePerSeat}
                              <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">
                                /seat
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              Total: ₹{ride.pricePerSeat * ride.availableSeats}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              navigate("/view-ride-details", {
                                state: { rideId: ride?._id },
                              })
                            }
                            className="w-auto lg:w-full px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 group text-xs sm:text-sm"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            // Initial State with Features (when no search has been performed)
            <motion.div
              key="features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-12"
            >
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Verified & Safe",
                    description:
                      "All drivers and vehicles are thoroughly verified with government ID",
                    color: "from-blue-500 to-cyan-500",
                    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
                  },
                  {
                    icon: Award,
                    title: "Premium Quality",
                    description:
                      "Comfortable rides with modern amenities and AC",
                    color: "from-purple-500 to-pink-500",
                    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
                  },
                  {
                    icon: Percent,
                    title: "Save 70%+",
                    description: "Share costs and save more on your travel",
                    color: "from-green-500 to-emerald-500",
                    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
                  },
                  {
                    icon: Clock,
                    title: "On Time Guarantee",
                    description:
                      "99% on-time departure with real-time tracking",
                    color: "from-amber-500 to-orange-500",
                    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`${feature.bgColor} rounded-2xl p-6 border border-[var(--border-subtle)]/50 hover:shadow-xl transition-all duration-300`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gr adient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 mb-6">
                    <Sparkles size={16} className="text-red-300" />
                    <span className="text-sm font-semibold text-white">
                      Ready to Travel?
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Start Your Journey Now
                  </h2>

                  <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                    Enter your route above to discover thousands of verified
                    rides across India. Save money, meet new people, and travel
                    smarter.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <Search size={20} />
                      <span>Search Rides</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/offer-ride")}
                      className="px-8 py-3.5 bg-[var(--bg-surface)]/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-[var(--bg-surface)]/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      <Car size={20} />
                      <span>Offer a Ride</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FindRides;
