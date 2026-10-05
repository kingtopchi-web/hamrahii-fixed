import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import {
  Package, MapPin, Navigation, Check, Edit2,
  ChevronDown, Phone, User as UserIcon, Loader2, ArrowLeft, ArrowRight,
  ShieldCheck, IndianRupee, CreditCard, Banknote, Crosshair, Map, Truck, ArrowUpDown
} from "lucide-react";
import { useGoogleMaps } from "../../components/maps/GoogleMapsProvider";
import MapLocationPickerModal from "../../components/maps/MapLocationPickerModal";
import LiveParcelTrackingModal from "../../components/Tracking/LiveParcelTrackingModal";

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=${libraries.join(",")}`;
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

// Helper for distance calc
const calculateDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const SendParcel = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user || {});

  const [step, setStep] = useState(1);

  // Location Details
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupCoords, setPickupCoords] = useState([0, 0]); // [longitude, latitude] for backend, but we need [lat, lng] for leaflet
  const [pickupAccuracy, setPickupAccuracy] = useState(null);
  const [pickupLocationSource, setPickupLocationSource] = useState("SEARCH"); // "GPS", "MAP", "SEARCH"
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isDetectingDropoffLocation, setIsDetectingDropoffLocation] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);

  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCity, setDropoffCity] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState([0, 0]); 
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const { isLoaded } = useGoogleMaps();
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Map Location Picker Modal
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerType, setMapPickerType] = useState("pickup"); // "pickup" | "dropoff"

  const handleOpenMapPicker = (type) => {
    setMapPickerType(type);
    setMapPickerOpen(true);
  };

  const handleSelectFromMap = ({ address, city, coordinates, accuracy, source }) => {
    if (mapPickerType === "pickup") {
      setPickupAddress(address);
      setPickupCity(city);
      setPickupCoords(coordinates);
      setPickupAccuracy(accuracy || null);
      setPickupLocationSource(source || "MAP");
      setShowPickupSuggestions(false);
    } else {
      setDropoffAddress(address);
      setDropoffCity(city);
      setDropoffCoords(coordinates);
      setShowDropoffSuggestions(false);
    }
  };

  // Vehicle
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Receiver
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [useMyDetails, setUseMyDetails] = useState(false);
  const [parcelType, setParcelType] = useState("Document");
  const [parcelWeight, setParcelWeight] = useState("");

  // Payment
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE"); // "COD" | "ONLINE"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingActiveParcel, setExistingActiveParcel] = useState(null);
  const [isCheckingActive, setIsCheckingActive] = useState(true);
  const [showActiveParcelModal, setShowActiveParcelModal] = useState(false);

  useEffect(() => {
    const checkActiveParcels = async () => {
      try {
        const res = await Axios.get(api.parcel.getMyParcels);
        if (res.data?.success) {
          const parcels = res.data.data || [];
          let active = parcels.filter(p => {
            if (['CANCELLED', 'REJECTED'].includes(p.status)) return false;
            if (['DELIVERED', 'COMPLETED'].includes(p.status) && ['PAID', 'REFUNDED'].includes(p.paymentStatus)) return false;
            return true;
          });
          if (active.length > 0) {
            active = active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setExistingActiveParcel(active[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch parcels", err);
      } finally {
        setIsCheckingActive(false);
      }
    };
    checkActiveParcels();
  }, []);

  // Load Razorpay
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  /* ---------------- INIT GOOGLE ---------------- */
  useEffect(() => {
    const init = async () => {
      await loadGoogleMaps();
      setIsMapsLoaded(true);

      if (window.google?.maps?.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement("div"));
      }
    };
    init();
  }, []);

  // Fetch Vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      try {
        const res = await Axios.post(api.vehicleType.getByUser, { userId: user._id });
        if (res.data?.success) {
          const filteredVehicles = (res.data.vehicleTypes || []).filter(v => v.type.toLowerCase() !== 'car');
          setVehicleTypes(filteredVehicles);
        }
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
      } finally {
        setLoadingVehicles(false);
      }
    };
    if (user?._id) fetchVehicles();
  }, [user]);

  // GPS Detection
  const handleUseCurrentLocation = (type = "pickup") => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    if (type === "pickup") setIsDetectingLocation(true);
    else setIsDetectingDropoffLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        
        console.log(`[GPS] Lat: ${latitude}, Lon: ${longitude}, Accuracy: ${accuracy}m`);

        if (type === "pickup") {
            setPickupCoords([longitude, latitude]);
            setPickupAccuracy(Math.round(accuracy));
            setPickupLocationSource("GPS");
        } else {
            setDropoffCoords([longitude, latitude]);
        }
        
        try {
          const res = await Axios.post(api.location.getByCoordinates, { latitude, longitude });
          if (res.data?.success && res.data?.location) {
            const loc = res.data.location;
            const fullAddr = loc.display_name;
            const city = loc.address?.city || loc.address?.town || loc.address?.state_district || "";
            if (type === "pickup") {
                setPickupAddress(fullAddr);
                setPickupCity(city);
            } else {
                setDropoffAddress(fullAddr);
                setDropoffCity(city);
            }
          } else {
            const fallback = `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            if (type === "pickup") setPickupAddress(fallback);
            else setDropoffAddress(fallback);
          }
        } catch (err) {
          console.error("[GPS] Reverse geocoding failed", err);
          const fallback = `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          if (type === "pickup") setPickupAddress(fallback);
          else setDropoffAddress(fallback);
        } finally {
          if (type === "pickup") setIsDetectingLocation(false);
          else setIsDetectingDropoffLocation(false);
        }
      },
      (err) => {
        console.error("[GPS] Error:", err);
        if (type === "pickup") setIsDetectingLocation(false);
        else setIsDetectingDropoffLocation(false);
        
        if (err.code === 1) toast.error("Location permission denied. Please allow location access.");
        else if (err.code === 2) toast.error("Location unavailable. Please check your device GPS.");
        else toast.error("Location detection timed out.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    handleUseCurrentLocation("pickup");
  }, []);

  // Searching Pickup location
  const handleSwapLocations = (e) => {
    e?.stopPropagation();
    
    const tempAddr = pickupAddress;
    const tempCoords = pickupCoords;
    const tempCity = pickupCity;
    const tempSource = pickupLocationSource;
    
    setPickupAddress(dropoffAddress);
    setPickupCoords(dropoffCoords);
    setPickupCity(dropoffCity);
    setPickupLocationSource("SEARCH"); // Reset source for safety
    
    setDropoffAddress(tempAddr);
    setDropoffCoords(tempCoords);
    setDropoffCity(tempCity);
  };

  const handlePickupSearch = (text) => {
    setPickupAddress(text);
    setPickupLocationSource("SEARCH");
    setPickupAccuracy(null);
    
    if (!text || !text.trim()) {
      setPickupSuggestions([]);
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
        setPickupSuggestions(results || []);
        setShowPickupSuggestions(true);
      }
    );
  };

  const selectPickup = (placeId, description) => {
    if (!placesServiceRef.current && window.google?.maps?.places) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement("div"));
    }
    
    const applySelection = (place) => {
      const city = place ? extractCity(place) : (description.split(",")[0]?.trim() || "");
      const location = place?.geometry?.location || null;
      
      setPickupAddress(place?.formatted_address || description);
      if (location) {
        setPickupCoords([location.lng(), location.lat()]);
      }
      setPickupCity(city);
      setPickupLocationSource("SEARCH");
      setPickupAccuracy(null);
      setShowPickupSuggestions(false);
    };

    if (!placesServiceRef.current) {
      applySelection(null);
      return;
    }

    placesServiceRef.current.getDetails(
      { placeId, fields: ["geometry", "formatted_address", "address_components"] },
      (place) => applySelection(place)
    );
  };

  // Searching Drop location 
  const handleDropoffSearch = (text) => {
    setDropoffAddress(text);
    
    if (!text || !text.trim()) {
      setDropoffSuggestions([]);
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
        setDropoffSuggestions(results || []);
        setShowDropoffSuggestions(true);
      }
    );
  };

  const selectDropoff = (placeId, description) => {
    if (!placesServiceRef.current && window.google?.maps?.places) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement("div"));
    }
    
    const applySelection = (place) => {
      const city = place ? extractCity(place) : (description.split(",")[0]?.trim() || "");
      const location = place?.geometry?.location || null;
      
      setDropoffAddress(place?.formatted_address || description);
      if (location) {
        setDropoffCoords([location.lng(), location.lat()]);
      }
      setDropoffCity(city);
      setShowDropoffSuggestions(false);
    };

    if (!placesServiceRef.current) {
      applySelection(null);
      return;
    }

    placesServiceRef.current.getDetails(
      { placeId, fields: ["geometry", "formatted_address", "address_components"] },
      (place) => applySelection(place)
    );
  };

  const handleToggleMyDetails = (checked) => {
    setUseMyDetails(checked);
    if (checked) {
      const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.name || "";
      setReceiverName(fullName);
      setReceiverPhone(user?.phone || "");
    } else {
      setReceiverName("");
      setReceiverPhone("");
    }
  };

  // Removed local preview pricing logic as it is now calculated dynamically on the backend.

  const getVehicleMaxWeight = (vehicle) => {
    if (vehicle?.maxParcelWeight) return vehicle.maxParcelWeight;
    const type = vehicle?.type?.toLowerCase() || '';
    if (type.includes('car')) return 50;
    if (type.includes('auto')) return 80;
    if (type.includes('bike')) return 10;
    return 5;
  };

  const handleAddWeight = (val) => {
    const current = parseFloat(parcelWeight) || 0;
    const maxAllowed = getVehicleMaxWeight(selectedVehicle);
    const nextVal = Math.round((current + val) * 10) / 10;
    if (nextVal > maxAllowed) {
      setParcelWeight(maxAllowed.toString());
      toast.info(`Capped at maximum weight of ${maxAllowed} KG for ${selectedVehicle?.type || "vehicle"}`);
    } else {
      setParcelWeight(nextVal.toString());
    }
  };

  const [calculatingFare, setCalculatingFare] = useState(false);
  const [fareData, setFareData] = useState(null);

  const handleNext = async () => {
    if (step === 1 && (!pickupAddress.trim() || pickupCoords[0] === 0)) return toast.error("Please select a valid pickup location from suggestions");
    if (step === 2 && (!dropoffAddress.trim() || dropoffCoords[0] === 0)) return toast.error("Please select a valid drop-off location from suggestions");
    if (step === 3 && !selectedVehicle) return toast.error("Select a vehicle type");
    if (step === 4) {
      if (!parcelType) return toast.error("Please select a parcel type");
      if (parcelWeight !== "" && parcelWeight !== null && parcelWeight !== undefined) {
        const numWeight = Number(parcelWeight);
        if (isNaN(numWeight) || numWeight <= 0) {
          return toast.error("Please enter a valid parcel weight");
        }
        const maxAllowed = getVehicleMaxWeight(selectedVehicle);
        if (numWeight > maxAllowed) {
          return toast.error(`Maximum allowed parcel weight for ${selectedVehicle.type} is ${maxAllowed} KG`);
        }
      }
    }
    if (step === 5) {
      if (!receiverName.trim()) return toast.error("Enter receiver name");
      if (receiverPhone.replace(/\D/g, "").length !== 10) return toast.error("Valid 10-digit mobile number required");
      
      // Calculate fare
      setCalculatingFare(true);
      try {
        const { data } = await Axios.post(api.parcel.calculateFare, {
          pickupLatitude: pickupCoords[1],
          pickupLongitude: pickupCoords[0],
          dropLatitude: dropoffCoords[1],
          dropLongitude: dropoffCoords[0],
          parcelWeight: parcelWeight ? Number(parcelWeight) : 0,
          parcelType: parcelType,
          vehicleType: selectedVehicle.type
        });
        
        if (data.success) {
          setFareData(data.data);
          setCalculatedPrice(data.data.amount);
          setStep((prev) => prev + 1);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to calculate fare");
      } finally {
        setCalculatingFare(false);
      }
      return;
    }
    setStep((prev) => prev + 1);
  };
  const handleBack = () => setStep((prev) => prev - 1);

  const finalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createParcelBackend();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to process parcel");
      setIsSubmitting(false);
    }
  };

  const createParcelBackend = async () => {
    try {
      const payload = {
        receiverDetails: { name: receiverName.trim(), phone: receiverPhone.trim().replace(/\D/g, "") },
        pickup: { 
          address: pickupAddress.trim(), 
          city: pickupCity, 
          coordinates: pickupCoords,
          accuracy: pickupAccuracy,
          source: pickupLocationSource 
        },
        dropoff: { address: dropoffAddress.trim(), city: dropoffCity || pickupCity, coordinates: dropoffCoords },
        vehicleType: selectedVehicle.type,
        parcelType: parcelType,
        weight: parcelWeight ? Number(parcelWeight) : 0,
        paymentMethod: paymentMethod,
        amount: calculatedPrice,
      };

      const res = await Axios.post(api.parcel.create, payload);
      if (res.data?.success) {
        toast.success("Parcel request created successfully!");
        navigate("/user/my-parcels", { state: { findingParcelId: res.data.data?._id } });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create parcel");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-4 sm:pt-6 md:pt-12 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center justify-center p-2.5 bg-red-50 text-[#E10600] rounded-2xl mb-1.5 shadow-xs">
            <Package size={26} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Send a Parcel</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-200/80 p-5 sm:p-7">
          
          {isCheckingActive ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#E10600] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Checking your parcels...</p>
            </div>
          ) : existingActiveParcel ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border-4 border-red-100">
                <Truck className="w-8 h-8 text-[#E10600]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Active Parcel In Progress</h2>
              <p className="text-gray-600 mb-6 max-w-sm">
                You already have a parcel in progress. Please wait until this parcel is delivered and payment is completed before creating a new one.
              </p>
              <button 
                onClick={() => setShowActiveParcelModal(true)}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-black transition-colors shadow-md w-full sm:w-auto"
              >
                Track Current Parcel
              </button>
            </div>
          ) : (
          <>
            <AnimatePresence mode="wait">
            
            {/* STEP 1: PICKUP */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Where is the pickup?</h2>
                </div>
                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => handleOpenMapPicker("pickup")}
                    title="Click to choose pickup location on map"
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-lg text-[#E10600] hover:bg-red-50 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 group"
                  >
                    <MapPin size={21} className="transition-transform group-hover:-translate-y-0.5" />
                  </button>
                  <input
                    autoFocus
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => handlePickupSearch(e.target.value)}
                    placeholder="Search pickup location or click pin..."
                    className="w-full pl-11 sm:pl-12 pr-28 sm:pr-48 py-3.5 sm:py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none text-sm sm:text-base transition bg-gray-50 shadow-sm"
                  />
                  {/* Current Location & Map Quick Buttons */}
                  <div className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUseCurrentLocation("pickup")}
                      disabled={isDetectingLocation}
                      title="Detect and use current location"
                      className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                        isDetectingLocation
                          ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                          : pickupCoords[0] !== 0 && pickupLocationSource === "GPS"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
                      }`}
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Crosshair className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {isDetectingLocation ? "Locating..." : (pickupCoords[0] !== 0 && pickupLocationSource === "GPS") ? "GPS Active" : "Current Location"}
                      </span>
                    </button>
                  </div>
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {pickupSuggestions.map((s) => (
                        <div key={s.place_id} onClick={() => selectPickup(s.place_id, s.description)} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex flex-col gap-0.5 text-left">
                          <span className="font-semibold text-sm text-gray-900">{s.structured_formatting?.main_text || s.description}</span>
                          {s.structured_formatting?.secondary_text && <span className="text-xs text-gray-500">{s.structured_formatting.secondary_text}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    Tip: Click the red pin <MapPin size={12} className="inline text-[#E10600]" /> to choose directly on map
                  </span>
                  {pickupCoords[0] !== 0 && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check size={12} /> Location set
                    </span>
                  )}
                </div>

              </motion.div>
            )}

            {/* STEP 2: DROP */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <div 
                    onClick={() => setStep(1)}
                    className="cursor-pointer p-3 bg-gray-50 hover:bg-gray-100/70 rounded-xl border border-gray-200 mb-2 flex items-center justify-between gap-3 transition"
                    title="Edit pickup location"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">A</div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Pickup Location</span>
                        <p className="text-xs sm:text-sm font-medium text-gray-800 break-words leading-snug">{pickupAddress}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSwapLocations}
                    type="button"
                    className="absolute -bottom-[22px] right-6 z-20 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-[#E10600] hover:border-red-200 hover:bg-red-50 transition-all hover:rotate-180"
                    title="Swap locations"
                  >
                    <ArrowUpDown size={16} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-6">Where is it going?</h2>
                <div className="relative z-50">
                  <button
                    type="button"
                    onClick={() => handleOpenMapPicker("dropoff")}
                    title="Click to choose drop-off location on map"
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 group"
                  >
                    <MapPin size={21} className="transition-transform group-hover:-translate-y-0.5" />
                  </button>
                  <input
                    autoFocus
                    type="text"
                    value={dropoffAddress}
                    onChange={(e) => handleDropoffSearch(e.target.value)}
                    placeholder="Search drop-off location or click pin..."
                    className="w-full pl-11 sm:pl-12 pr-28 sm:pr-48 py-3.5 sm:py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm sm:text-base transition bg-gray-50 shadow-sm"
                  />
                  {/* Current Location & Map Quick Buttons */}
                  <div className="absolute right-2 sm:right-2.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUseCurrentLocation("dropoff")}
                      disabled={isDetectingDropoffLocation}
                      title="Detect and use current location"
                      className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                        isDetectingDropoffLocation
                          ? "bg-blue-50 text-blue-600 border border-blue-200 animate-pulse"
                          : dropoffCoords[0] !== 0
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                      }`}
                    >
                      {isDetectingDropoffLocation ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Crosshair className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">
                        {isDetectingDropoffLocation ? "Locating..." : dropoffCoords[0] !== 0 ? "GPS Active" : "Current Location"}
                      </span>
                    </button>
                  </div>
                  {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {dropoffSuggestions.map((s) => (
                        <div key={s.place_id} onClick={() => selectDropoff(s.place_id, s.description)} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex flex-col gap-0.5 text-left">
                          <span className="font-semibold text-sm text-gray-900">{s.structured_formatting?.main_text || s.description}</span>
                          {s.structured_formatting?.secondary_text && <span className="text-xs text-gray-500">{s.structured_formatting.secondary_text}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    Tip: Click the blue pin <MapPin size={12} className="inline text-blue-600" /> to choose directly on map
                  </span>
                  {dropoffCoords[0] !== 0 && (
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      <Check size={12} /> Location set
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: VEHICLE */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Select Vehicle Type</h2>
                <div className="grid grid-cols-7 gap-1 w-full px-1">
                  {vehicleTypes.map((v) => (
                    <div
                      key={v._id}
                      onClick={() => setSelectedVehicle(v)}
                      className={`cursor-pointer transition-all flex flex-col items-center gap-1 relative group pt-1 pb-2 ${
                        selectedVehicle?._id === v._id ? "opacity-100 scale-110" : "opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
                      }`}
                    >
                      {/* Removed card backgrounds and borders as requested */}
                      <div className="w-8 h-8 sm:w-12 sm:h-10 flex items-center justify-center bg-transparent transition-transform duration-300">
                        <img 
                          src={v.image?.startsWith('http') ? v.image : `${import.meta.env.VITE_ASSETS_URL || 'http://localhost:9898'}/${(v.image || '').replace(/^[\/\\]/, '').replace(/\\/g, '/')}`} 
                          alt={v.type} 
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                      </div>
                      
                      <div className="text-center w-full flex flex-col items-center">
                        <div className={`font-extrabold text-[9px] sm:text-[11px] capitalize tracking-tight leading-tight mb-0.5 ${selectedVehicle?._id === v._id ? "text-[#E10600]" : "text-gray-700"}`}>
                          {v.type}
                        </div>
                        <div className={`text-[8px] sm:text-[9px] font-bold ${selectedVehicle?._id === v._id ? "text-red-500" : "text-gray-400"}`}>
                          {getVehicleMaxWeight(v)}kg
                        </div>
                      </div>
                    </div>
                  ))}
                  {loadingVehicles && <p className="text-sm text-gray-500 col-span-full text-center py-8">Loading vehicles...</p>}
                  {!loadingVehicles && vehicleTypes.length === 0 && <p className="text-sm text-gray-500 col-span-full text-center py-8">No vehicles available for parcels right now.</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 4: PARCEL TYPE & WEIGHT */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Parcel Type & Weight</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Parcel Type</label>
                    <div className="flex flex-wrap gap-3">
                      {["Document", "Electronics", "Clothes", "Food", "Other"].map((type) => (
                        <div
                          key={type}
                          onClick={() => setParcelType(type)}
                          className={`cursor-pointer px-4 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                            parcelType === type
                              ? "border-[#E10600] bg-red-50 text-[#E10600]"
                              : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                          }`}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Parcel Weight (KG) <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Package className="absolute left-4 top-3.5 text-gray-400" size={18} />
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        placeholder={`Weight in KG (Optional - Max ${selectedVehicle ? getVehicleMaxWeight(selectedVehicle) : ''} KG)`}
                        value={parcelWeight}
                        onChange={(e) => setParcelWeight(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#E10600] outline-none text-base"
                      />
                    </div>

                    {/* Quick Add Weight Buttons */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-semibold">Quick Add Weight:</span>
                        {parcelWeight && Number(parcelWeight) > 0 && (
                          <button
                            type="button"
                            onClick={() => setParcelWeight("")}
                            className="text-[11px] text-gray-400 hover:text-red-500 font-semibold transition cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 5, 10, 20].filter(n => !selectedVehicle || n <= getVehicleMaxWeight(selectedVehicle)).map((num) => {
                          const maxAllowed = getVehicleMaxWeight(selectedVehicle);
                          const isExceeded = (parseFloat(parcelWeight) || 0) + num > maxAllowed;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleAddWeight(num)}
                              disabled={isExceeded}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                isExceeded
                                  ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50"
                                  : "bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-[#E10600] border border-gray-200 hover:border-red-200 shadow-2xs active:scale-95"
                              }`}
                              title={isExceeded ? `Adding ${num} KG exceeds max ${maxAllowed} KG` : `Add ${num} KG`}
                            >
                              <span>+{num}</span>
                              <span className="text-[10px] opacity-75">KG</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: RECEIVER */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Receiver Details</h2>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer bg-gray-100 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition">
                    <input type="checkbox" checked={useMyDetails} onChange={(e) => handleToggleMyDetails(e.target.checked)} className="w-4 h-4 text-[#E10600] rounded focus:ring-red-500 accent-[#E10600]" />
                    <span>Use My Details</span>
                  </label>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input required type="text" placeholder="Receiver Name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#E10600] outline-none text-base" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input required type="tel" maxLength={10} placeholder="Mobile Number" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value.replace(/\D/g, ""))} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-[#E10600] outline-none text-base" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: CONFIRM */}
            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-200">
                  <div className="flex justify-between items-start border-b border-gray-200 pb-4 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Route</p>
                      <p className="text-xs sm:text-sm font-semibold flex items-start gap-2 mb-2 text-gray-800 break-words leading-snug"><MapPin size={16} className="text-emerald-600 mt-0.5 shrink-0" /> <span>{pickupAddress}</span></p>
                      <p className="text-xs sm:text-sm font-semibold flex items-start gap-2 text-gray-800 break-words leading-snug"><MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" /> <span>{dropoffAddress}</span></p>
                      {fareData?.distanceKm && <p className="text-xs font-semibold text-gray-500 mt-2">Distance: {fareData.distanceKm.toFixed(1)} KM</p>}
                    </div>
                    <button onClick={() => setStep(1)} className="text-blue-600 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 shrink-0"><Edit2 size={14}/></button>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-4 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Parcel Details</p>
                      <p className="text-xs sm:text-sm font-semibold capitalize break-words">
                        {selectedVehicle?.type} Delivery{parcelWeight && Number(parcelWeight) > 0 ? ` • ${parcelWeight} KG` : ""}
                      </p>
                      {parcelType && <p className="text-xs font-semibold text-gray-500 mt-1">Type: {parcelType}</p>}
                    </div>
                    <button onClick={() => setStep(4)} className="text-blue-600 p-2 bg-blue-50 rounded-lg hover:bg-blue-100 shrink-0"><Edit2 size={14}/></button>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Receiver</p>
                      <p className="text-sm font-semibold">{receiverName} • {receiverPhone}</p>
                    </div>
                    <button onClick={() => setStep(5)} className="text-blue-600 p-2 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit2 size={14}/></button>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Fare Summary</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Base Fare</span>
                        <span className="font-semibold">₹{Number(fareData?.baseFare || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Distance Charge</span>
                        <span className="font-semibold">₹{Number(fareData?.distanceCharge || 0).toFixed(2)}</span>
                      </div>
                      {Number(fareData?.weightCharge || 0) > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Weight Charge</span>
                          <span className="font-semibold">₹{Number(fareData.weightCharge).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <p className="text-sm font-bold text-gray-900">Total Price</p>
                      <p className="text-xl font-extrabold text-[#E10600]">₹{calculatedPrice}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 7: PAYMENT */}
            {step === 7 && (
              <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                <div className="space-y-3">
                  <div
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`cursor-pointer p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === "ONLINE" ? "border-[#E10600] bg-red-50/50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${paymentMethod === "ONLINE" ? "bg-[#E10600] text-white" : "bg-gray-100 text-gray-500"}`}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Online Payment</p>
                        <p className="text-xs text-gray-500">Pay securely via Wallet / UPI / Card</p>
                      </div>
                    </div>
                    {paymentMethod === "ONLINE" && <Check className="text-[#E10600]" size={20}/>}
                  </div>
                  
                  <div
                    onClick={() => setPaymentMethod("COD")}
                    className={`cursor-pointer p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === "COD" ? "border-[#E10600] bg-red-50/50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${paymentMethod === "COD" ? "bg-[#E10600] text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Banknote size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay cash when rider arrives</p>
                      </div>
                    </div>
                    {paymentMethod === "COD" && <Check className="text-[#E10600]" size={20}/>}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-6 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft size={18} /> Back
              </button>
            )}
            
            {step < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={calculatingFare}
                className="flex-1 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {calculatingFare ? "Calculating..." : (
                  <>Continue <ArrowRight size={18} /></>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={finalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-[#E10600] hover:bg-red-700 text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><Check className="w-5 h-5" /> Confirm & Book (₹{calculatedPrice})</>
                )}
              </button>
            )}
          </div>
          </>
          )}
        </div>
      </div>

      {/* Map Location Picker Modal */}
      <MapLocationPickerModal
        isOpen={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        type={mapPickerType}
        title={mapPickerType === "pickup" ? "Select Pickup Location" : "Select Drop-off Location"}
        initialCoords={mapPickerType === "pickup" ? pickupCoords : dropoffCoords}
        initialAddress={mapPickerType === "pickup" ? pickupAddress : dropoffAddress}
        initialCity={mapPickerType === "pickup" ? pickupCity : dropoffCity}
        onSelectLocation={handleSelectFromMap}
      />

      {/* Live Parcel Tracking Modal for existing active parcel */}
      <LiveParcelTrackingModal 
        isOpen={showActiveParcelModal}
        onClose={() => setShowActiveParcelModal(false)}
        parcel={existingActiveParcel}
        onPaymentSuccess={() => {
          setShowActiveParcelModal(false);
          // Re-check active parcels after payment
          Axios.get(api.parcel.getMyParcels).then(res => {
            const parcels = res.data.data || [];
            let active = parcels.filter(p => p.status !== "CANCELLED" && p.status !== "REJECTED" && (p.status !== "COMPLETED" && (p.status !== "DELIVERED" || (p.paymentMethod === "ONLINE" && p.paymentStatus !== "PAID") || (p.paymentMethod === "COD" && p.paymentStatus !== "PAID"))));
            if (active.length > 0) {
              setExistingActiveParcel(active[0]);
            } else {
              setExistingActiveParcel(null);
            }
          });
        }}
      />
    </div>
  );
};

export default SendParcel;
