import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import polylineLib from "@mapbox/polyline";
import {
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import {
  MapPin,
  X,
  Trash2,
  Compass,
  Route,
  Clock,
  Map,
  ArrowDownUp,
  Target,
  Loader2,
  Search,
  ZoomIn,
  ZoomOut,
  CheckCircle,
} from "lucide-react";

const libraries = ["places", "geometry"];
const center = { lat: 26.9124, lng: 80.9446 };

const COLORS = {
  background: "#FFFFFF",
  surface: "#F7F7F7",
  primary: "#E10600",
  textPrimary: "#111111",
  textSecondary: "#555555",
  border: "#E5E5E5",
  accent: "#B8B8B8",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
  error: "#EF4444",
};

let googleMapsLoaded = false;
let googleMapsLoadingPromise = null;

const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    googleMapsLoaded = true;
    return Promise.resolve();
  }

  if (googleMapsLoadingPromise) {
    return googleMapsLoadingPromise;
  }

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

    script.onerror = () => {
      googleMapsLoadingPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };

    document.head.appendChild(script);
  });

  return googleMapsLoadingPromise;
};

// Helper function to extract city from address string
const extractCityFromAddress = (address) => {
  if (!address) return "";

  const parts = address.split(",");
  if (parts.length > 1) {
    const cityIndex = Math.max(parts.length - 3, 1);
    return parts[cityIndex]?.trim() || parts[parts.length - 2]?.trim() || "";
  }
  return "";
};

// Helper function to extract city from Google Places result
function extractCity(place) {
  const components = place.address_components || [];

  const cityTypes = [
    "locality",
    "administrative_area_level_2",
    "administrative_area_level_3",
    "sublocality_level_1",
    "sublocality",
    "postal_town",
  ];

  for (const type of cityTypes) {
    const component = components.find((c) => c.types.includes(type));
    if (component) {
      return component.long_name;
    }
  }

  if (place.formatted_address) {
    const addressParts = place.formatted_address.split(",");
    if (addressParts.length >= 2) {
      return addressParts[addressParts.length - 2].trim();
    }
  }

  return place.name || null;
}

export function AddressForm({
  data,
  updateData,
  onRouteCalculated,
  setFormData,
}) {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [routeSummary, setRouteSummary] = useState(null);
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(12);
  const [distanceInKm, setDistanceInKm] = useState(0);
  const [activeInput, setActiveInput] = useState("from");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedLocationType, setSelectedLocationType] = useState(null);
  const [draggableMarker, setDraggableMarker] = useState(null);
  const [isDraggingMarker, setIsDraggingMarker] = useState(false);
  const [isMapsLoaded, setIsMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [price, setPrice] = useState(0);
  const fromAutocompleteRef = useRef(null);
  const toAutocompleteRef = useRef(null);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const mapRef = useRef(null);
  const lastRouteHashRef = useRef("");
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // console.log(data, "this si data");
    if (Number(data?.distance > 2.5)) {
      setPrice(Math.round(data?.distance * 2));
    } else {
      setPrice(Math.round(data?.distance * 3 + 25));
    }
  }, [data?.distance]);

  // Initialize data from props
  useEffect(() => {
    if (
      data &&
      data.from &&
      data.from.lat &&
      data.from.lng &&
      window.google &&
      window.google.maps &&
      window.google.maps.LatLng
    ) {
      const latLng = new window.google.maps.LatLng(
        data.from.lat,
        data.from.lng,
      );
      setFrom(latLng);
      setFromAddress(data.from.address || "");
      setFromCity(
        data.from.city || extractCityFromAddress(data.from.address || ""),
      );
      if (fromInputRef.current)
        fromInputRef.current.value = data.from.address || "";
    }
    if (
      data &&
      data.to &&
      data.to.lat &&
      data.to.lng &&
      window.google &&
      window.google.maps &&
      window.google.maps.LatLng
    ) {
      const latLng = new window.google.maps.LatLng(data.to.lat, data.to.lng);
      setTo(latLng);
      setToAddress(data.to.address || "");
      setToCity(data.to.city || extractCityFromAddress(data.to.address || ""));
      if (toInputRef.current) toInputRef.current.value = data.to.address || "";
    }
  }, [data]);

  const getRouteHash = useCallback((fromCoords, toCoords) => {
    if (!fromCoords || !toCoords) return "";
    return `${fromCoords.lat().toFixed(6)},${fromCoords
      .lng()
      .toFixed(6)}-${toCoords.lat().toFixed(6)},${toCoords.lng().toFixed(6)}`;
  }, []);

  useEffect(() => {
    if (!from || !to || !isMapsLoaded) return;

    const currentHash = getRouteHash(from, to);

    if (currentHash !== lastRouteHashRef.current) {
      calculateRoute(currentHash);
    }
  }, [from, to, isMapsLoaded, getRouteHash]);

  // 1. Reverse geocode single point → city
  const getCity = (lat, lng) => {
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const city = extractCity(results[0]);
          resolve(city);
        } else {
          resolve(null);
        }
      });
    });
  };

  // Get cities from polyline
  async function getCitiesFromPolyline(encodedPolyline) {
    if (!encodedPolyline || !window.google?.maps?.geometry) return [];

    const points = polylineLib.decode(encodedPolyline);
    const latLngs = points.map(
      ([lat, lng]) => new window.google.maps.LatLng(lat, lng),
    );

    const sampled = [];
    let lastPoint = latLngs[0];
    sampled.push(lastPoint);

    const MIN_DISTANCE = 5000;

    for (let i = 1; i < latLngs.length; i++) {
      const dist = window.google.maps.geometry.spherical.computeDistanceBetween(
        lastPoint,
        latLngs[i],
      );

      if (dist >= MIN_DISTANCE) {
        sampled.push(latLngs[i]);
        lastPoint = latLngs[i];
      }
    }

    const cityPromises = sampled.map((p) => getCity(p.lat(), p.lng()));
    const cities = await Promise.all(cityPromises);

    return [...new Set(cities.filter(Boolean))];
  }

  const calculateRoute = useCallback(
    async (routeHash) => {
      if (!from || !to || !window.google || !window.google.maps) return;

      if (routeHash === lastRouteHashRef.current && directions) return;

      setIsLoading(true);
      setIsCalculating(true);

      try {
        const service = new window.google.maps.DirectionsService();
        const result = await service.route({
          origin: from,
          destination: to,
          travelMode: window.google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
          },
          unitSystem: window.google.maps.UnitSystem.METRIC,
        });

        if (result.routes.length > 0) {
          if (!mountedRef.current) return;

          setDirections(result);
          setRoutes(result.routes);
          setSelectedRouteIndex(0);
          lastRouteHashRef.current = routeHash;

          const bounds = new window.google.maps.LatLngBounds();
          result.routes[0].legs.forEach((leg) => {
            bounds.extend(leg.start_location);
            bounds.extend(leg.end_location);
          });

          const boundsCenter = bounds.getCenter();
          setMapCenter({ lat: boundsCenter.lat(), lng: boundsCenter.lng() });
          setMapZoom(11);

          const leg = result.routes[0].legs[0];
          const distanceValue = leg.distance ? leg.distance.value : 0;
          const distanceInKmValue = (distanceValue / 1000).toFixed(2);
          setDistanceInKm(parseFloat(distanceInKmValue));
          // setFormData((prev) => ({ ...prev, distance: distanceInKmValue }));

          const polyline = result.routes[0]?.overview_polyline || "";
          const routeCities = await getCitiesFromPolyline(polyline);

          setFormData((prev) => ({ ...prev, routeCities }));

          const summary = {
            distance: leg.distance ? leg.distance.text : "N/A",
            distanceInKm: distanceInKmValue,
            duration: leg.duration ? leg.duration.text : "N/A",
            warnings: result.routes[0].warnings || [],
            polyline: polyline,
            bounds: result.routes[0].bounds,
            alternativeRoutes: result.routes.slice(1).map((route, idx) => ({
              id: idx + 1,
              distance:
                route.legs[0] && route.legs[0].distance
                  ? route.legs[0].distance.text
                  : "",
              distanceInKm: (
                (route.legs[0] &&
                route.legs[0].distance &&
                route.legs[0].distance.value
                  ? route.legs[0].distance.value
                  : 0) / 1000
              ).toFixed(2),
              duration:
                route.legs[0] && route.legs[0].duration
                  ? route.legs[0].duration.text
                  : "",
              summary: route.summary,
              polyline: route.overview_polyline?.points || "",
            })),
          };
          setRouteSummary(summary);

          if (onRouteCalculated && mountedRef.current) {
            const completeRouteData = {
              ...summary,
              from: {
                address: fromAddress,
                city: fromCity,
                coordinates: [from.lat(), from.lng()],
                lat: from.lat(),
                lng: from.lng(),
              },
              to: {
                address: toAddress,
                city: toCity,
                coordinates: [to.lat(), to.lng()],
                lat: to.lat(),
                lng: to.lng(),
              },
              distanceInKm: distanceInKmValue,
              selectedRouteIndex: 0,
              totalRoutes: result.routes.length,
              timestamp: new Date().toISOString(),
              routeId: `route_${Date.now()}`,
              status: "calculated",
              metadata: {
                travelMode: "DRIVING",
                unitSystem: "METRIC",
                departureTime: new Date().toISOString(),
                polyline: polyline,
                routePolyline: result.routes[0].overview_polyline || {},
              },
            };
            onRouteCalculated(completeRouteData);
          }

          if (updateData && mountedRef.current) {
            updateData(
              {
                address: fromAddress,
                city: fromCity,
                coordinates: [from.lat(), from.lng()],
                lat: from.lat(),
                lng: from.lng(),
              },
              {
                address: toAddress,
                city: toCity,
                coordinates: [to.lat(), to.lng()],
                lat: to.lat(),
                lng: to.lng(),
              },
            );
          }
        }
      } catch (error) {
        // console.error("Error calculating route:", error);
        if (mountedRef.current) {
          lastRouteHashRef.current = "";
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          setIsCalculating(false);
        }
      }
    },
    [
      from,
      to,
      fromAddress,
      toAddress,
      fromCity,
      toCity,
      onRouteCalculated,
      updateData,
      directions,
    ],
  );

  const handleRouteSelect = async (index) => {
    setSelectedRouteIndex(index);
    if (directions && directions.routes && directions.routes[index]) {
      const route = directions.routes[index];
      const leg = route.legs[0];

      const distanceValue = leg.distance ? leg.distance.value : 0;
      const distanceInKmValue = (distanceValue / 1000).toFixed(2);
      setDistanceInKm(parseFloat(distanceInKmValue));
      // setFormData((prev) => ({ ...prev, distance: distanceInKm }));

      const polyline = route.overview_polyline || "";
      const routeCities = await getCitiesFromPolyline(polyline);

      setFormData((prev) => ({ ...prev, routeCities }));

      updateData(
        {
          address: fromAddress,
          city: fromCity,
          coordinates: [from.lat(), from.lng()],
          lat: from.lat(),
          lng: from.lng(),
        },
        {
          address: toAddress,
          city: toCity,
          coordinates: [to.lat(), to.lng()],
          lat: to.lat(),
          lng: to.lng(),
        },
      );

      const updatedSummary = {
        ...routeSummary,
        distance: leg.distance ? leg.distance.text : "N/A",
        distanceInKm: distanceInKmValue,
        duration: leg.duration ? leg.duration.text : "N/A",
        warnings: route.warnings || [],
        polyline: polyline,
      };
      setRouteSummary(updatedSummary);

      if (onRouteCalculated && mountedRef.current) {
        onRouteCalculated((prev) => ({
          ...prev,
          ...updatedSummary,
          selectedRouteIndex: index,
          routeId: `route_${Date.now()}_${index}`,
          metadata: {
            ...prev?.metadata,
            polyline: polyline,
            routePolyline: route.overview_polyline || {},
          },
        }));
      }
    }
  };

  const swapLocations = () => {
    setFrom(to);
    setTo(from);
    setFromAddress(toAddress);
    setToAddress(fromAddress);
    setFromCity(toCity);
    setToCity(fromCity);
    setDirections(null);
    setRoutes([]);
    setDistanceInKm(0);
    setRouteSummary(null);
    lastRouteHashRef.current = "";

    if (fromInputRef.current && toInputRef.current) {
      const temp = fromInputRef.current.value;
      fromInputRef.current.value = toInputRef.current.value;
      toInputRef.current.value = temp;
    }

    // Update parent data
    if (updateData && mountedRef.current) {
      updateData(
        {
          address: toAddress,
          city: toCity,
          coordinates: to ? [to.lat(), to.lng()] : [],
          lat: to ? to.lat() : null,
          lng: to ? to.lng() : null,
        },
        {
          address: fromAddress,
          city: fromCity,
          coordinates: from ? [from.lat(), from.lng()] : [],
          lat: from ? from.lat() : null,
          lng: from ? from.lng() : null,
        },
      );
    }
  };

  const clearRoute = () => {
    setFrom(null);
    setTo(null);
    setFromAddress("");
    setToAddress("");
    setFromCity("");
    setToCity("");
    setDirections(null);
    setRoutes([]);
    setRouteSummary(null);
    setDistanceInKm(0);
    setMapCenter(center);
    setMapZoom(12);
    setSelectedLocationType(null);
    setDraggableMarker(null);
    lastRouteHashRef.current = "";

    if (fromInputRef.current) fromInputRef.current.value = "";
    if (toInputRef.current) toInputRef.current.value = "";

    if (updateData && mountedRef.current) {
      updateData(
        {
          address: "",
          city: "",
          coordinates: [],
          lat: null,
          lng: null,
        },
        {
          address: "",
          city: "",
          coordinates: [],
          lat: null,
          lng: null,
        },
      );
    }

    if (onRouteCalculated && mountedRef.current) {
      onRouteCalculated(null);
    }
  };

  const getCurrentLocation = (type) => {
    setIsGettingLocation(true);
    setActiveInput(type);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!mountedRef.current) return;

          const latLng = new window.google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude,
          );

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: latLng }, (results, status) => {
            if (mountedRef.current) {
              if (status === "OK" && results[0]) {
                const address = results[0].formatted_address;
                const city = extractCity(results[0]);
                handleLocationSelect(latLng, address, city, type);
              }
              setIsGettingLocation(false);
            }
          });
        },
        (error) => {
          // console.error("Error getting location:", error);
          if (mountedRef.current) {
            setIsGettingLocation(false);
          }
        },
      );
    }
  };

  const handleLocationSelect = (latLng, address, city, type) => {
    // console.log("handleLocationSelect called:", { address, city, type });

    if (type === "from") {
      setFrom(latLng);
      setFromAddress(address || "");
      setFromCity(city || extractCityFromAddress(address || ""));
      if (fromInputRef.current) fromInputRef.current.value = address || "";
    } else {
      setTo(latLng);
      setToAddress(address || "");
      setToCity(city || extractCityFromAddress(address || ""));
      if (toInputRef.current) toInputRef.current.value = address || "";
    }

    // Update parent data with city information
    if (updateData && mountedRef.current) {
      if (type === "from") {
        updateData(
          {
            address: address || "",
            city: city || extractCityFromAddress(address || ""),
            coordinates: [latLng.lat(), latLng.lng()],
            lat: latLng.lat(),
            lng: latLng.lng(),
          },
          data?.to || {},
        );
      } else {
        updateData(data?.from || {}, {
          address: address || "",
          city: city || extractCityFromAddress(address || ""),
          coordinates: [latLng.lat(), latLng.lng()],
          lat: latLng.lat(),
          lng: latLng.lng(),
        });
      }
    }

    setMapCenter({ lat: latLng.lat(), lng: latLng.lng() });
    setMapZoom(14);
  };

  const startDraggableMarker = (type) => {
    setSelectedLocationType(type);
    setActiveInput(type);

    let initialPosition;
    if (type === "from" && from) {
      initialPosition = from;
    } else if (type === "to" && to) {
      initialPosition = to;
    } else {
      initialPosition = new window.google.maps.LatLng(
        mapCenter.lat,
        mapCenter.lng,
      );
    }

    if (initialPosition) {
      setDraggableMarker({
        position: initialPosition,
        type: type,
      });

      setMapCenter({ lat: initialPosition.lat(), lng: initialPosition.lng() });
      setMapZoom(14);
    }
  };

  const onFromLoad = (autocomplete) => {
    fromAutocompleteRef.current = autocomplete;
  };

  const onToLoad = (autocomplete) => {
    toAutocompleteRef.current = autocomplete;
  };

  const onFromPlaceChanged = () => {
    if (fromAutocompleteRef.current) {
      const place = fromAutocompleteRef.current.getPlace({
        componentRestrictions: { country: "in" },
      });
      if (place.geometry) {
        const city = extractCity(place);
        handleLocationSelect(
          place.geometry.location,
          place.formatted_address || place.name,
          city,
          "from",
        );
      }
    }
  };

  const onToPlaceChanged = () => {
    if (toAutocompleteRef.current) {
      const place = toAutocompleteRef.current.getPlace({
        componentRestrictions: { country: "in" },
      });
      if (place.geometry) {
        const city = extractCity(place);
        handleLocationSelect(
          place.geometry.location,
          place.formatted_address || place.name,
          city,
          "to",
        );
      }
    }
  };

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapClick = (event) => {
    if (!selectedLocationType || !window.google || !window.google.maps) return;

    const latLng = event.latLng;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        const city = extractCity(results[0]);
        handleLocationSelect(latLng, address, city, selectedLocationType);

        setDraggableMarker({
          position: latLng,
          type: selectedLocationType,
        });
      }
    });
  };

  const handleMarkerDragEnd = (event) => {
    const latLng = event.latLng;
    setIsDraggingMarker(false);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        const city = extractCity(results[0]);
        handleLocationSelect(latLng, address, city, selectedLocationType);

        setDraggableMarker((prev) => ({
          ...prev,
          position: latLng,
        }));
      }
    });
  };

  const getMarkerIcon = (type, isDraggable = false) => {
    const baseUrl = "https://maps.google.com/mapfiles/ms/icons/";

    if (isDraggable) {
      return {
        url: `${baseUrl}red-dot.png`,
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 40),
      };
    }

    return type === "from"
      ? `${baseUrl}green-dot.png`
      : `${baseUrl}red-dot.png`;
  };

  const handleManualCalculate = () => {
    if (from && to) {
      lastRouteHashRef.current = "";
      calculateRoute(getRouteHash(from, to));
    }
  };

  // Initialize Google Maps
  useEffect(() => {
    let isMounted = true;

    const initMaps = async () => {
      try {
        if (window.google && window.google.maps) {
          if (isMounted) {
            setIsMapsLoaded(true);
          }
          return;
        }

        await loadGoogleMaps();

        if (isMounted) {
          setIsMapsLoaded(true);
        }
      } catch (error) {
        // console.error("Failed to load Google Maps:", error);
        if (isMounted) {
          setMapsError(error.message);
        }
      }
    };

    initMaps();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isMapsLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[600px] bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-subtle)]"
      >
        <div className="text-center p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#F7F7F7] border-t-[#E10600] rounded-full mx-auto mb-6"
          />
          <p className="text-lg font-semibold text-[#111111] mb-2">
            Loading Maps
          </p>
          <p className="text-sm text-[#555555]">
            Please wait while we initialize the map
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Locations Card */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-subtle)] p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#E10600]/10 rounded-lg">
                <MapPin className="w-5 h-5 text-[#E10600]" />
              </div>
              <h2 className="text-lg font-semibold text-[#111111]">
                Enter Locations
              </h2>
            </div>

            <div className="space-y-2">
              {/* From Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#111111]">
                    Starting Point
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => getCurrentLocation("from")}
                    disabled={isGettingLocation && activeInput === "from"}
                    className="text-xs text-[#E10600] hover:text-[#C80500] flex items-center gap-1 disabled:opacity-50"
                  >
                    {isGettingLocation && activeInput === "from" ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Compass size={12} />
                    )}
                    {isGettingLocation && activeInput === "from"
                      ? "Locating..."
                      : "Use Current"}
                  </motion.button>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <div className="p-1.5 bg-[#E10600]/10 rounded-lg">
                      <MapPin size={14} className="text-[#E10600]" />
                    </div>
                  </div>
                  {/* {window.google && window.google.maps && (
                    <Autocomplete
                      onLoad={onFromLoad}
                      onPlaceChanged={onFromPlaceChanged}
                    >
                      <input
                        ref={fromInputRef}
                        type="text"
                        placeholder="Enter starting point..."
                        className="w-full pl-12 pr-12 py-3 text-sm border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none transition-all hover:border-[#B8B8B8] bg-[var(--bg-surface)]"
                        onFocus={() => setActiveInput("from")}
                      />
                    </Autocomplete>
                  )} */}
                  {window.google && window.google.maps && (
                    <Autocomplete
                      onLoad={onFromLoad}
                      onPlaceChanged={onFromPlaceChanged}
                      // 🔥 ADD THIS
                      options={{
                        componentRestrictions: { country: "in" },
                        fields: [
                          "geometry",
                          "formatted_address",
                          "name",
                          "address_components",
                        ],
                        types: ["geocode"],
                      }}
                    >
                      <input
                        ref={fromInputRef}
                        type="text"
                        placeholder="Enter starting point..."
                        className="w-full pl-12 pr-12 py-3 text-sm border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none transition-all hover:border-[#B8B8B8] bg-[var(--bg-surface)]"
                        onFocus={() => setActiveInput("from")}
                      />
                    </Autocomplete>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startDraggableMarker("from")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                    title="Select on map"
                  >
                    <Target size={16} className="text-[#E10600]" />
                  </motion.button>
                </div>
                {fromCity && (
                  <div className="mt-1 text-xs text-[#555555] px-4">
                    City: {fromCity}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center py-2">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={swapLocations}
                  className="p-2 bg-[var(--bg-surface)] hover:bg-[#F7F7F7] rounded-full border border-[var(--border-subtle)] transition-colors shadow-sm"
                  title="Swap locations"
                >
                  <ArrowDownUp size={18} className="text-[#555555]" />
                </motion.button>
              </div>

              {/* To Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#111111]">
                    Destination
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => getCurrentLocation("to")}
                    disabled={isGettingLocation && activeInput === "to"}
                    className="text-xs text-[#E10600] hover:text-[#C80500] flex items-center gap-1 disabled:opacity-50"
                  >
                    {isGettingLocation && activeInput === "to" ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Compass size={12} />
                    )}
                    {isGettingLocation && activeInput === "to"
                      ? "Locating..."
                      : "Use Current"}
                  </motion.button>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <div className="p-1.5 bg-[#E10600]/10 rounded-lg">
                      <MapPin size={14} className="text-[#E10600]" />
                    </div>
                  </div>
                  {window.google && window.google.maps && (
                    <Autocomplete
                      onLoad={onToLoad}
                      onPlaceChanged={onToPlaceChanged}
                    >
                      <input
                        ref={toInputRef}
                        type="text"
                        placeholder="Enter destination..."
                        className="w-full pl-12 pr-12 py-3 text-sm border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-[#E10600] focus:border-transparent outline-none transition-all hover:border-[#B8B8B8] bg-[var(--bg-surface)]"
                        onFocus={() => setActiveInput("to")}
                      />
                    </Autocomplete>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startDraggableMarker("to")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                    title="Select on map"
                  >
                    <Target size={16} className="text-[#E10600]" />
                  </motion.button>
                </div>
                {toCity && (
                  <div className="mt-1 text-xs text-[#555555] px-4">
                    City: {toCity}
                  </div>
                )}
              </div>

              {/* Draggable Marker Notification */}
              <AnimatePresence>
                {selectedLocationType && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-[#E10600]/5 border border-[#E10600]/20 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-[#E10600]">
                        <Target size={16} className="animate-pulse" />
                        <span className="text-sm font-medium">
                          Adjust{" "}
                          {selectedLocationType === "from"
                            ? "starting point"
                            : "destination"}{" "}
                          on map
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedLocationType(null);
                          setDraggableMarker(null);
                        }}
                        className="p-1 hover:bg-[#E10600]/10 rounded-lg"
                      >
                        <X size={16} className="text-[#E10600]" />
                      </button>
                    </div>
                    <div className="text-xs text-[#555555]">
                      Drag marker or click map to set location
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualCalculate}
                  disabled={!from || !to || isLoading}
                  className="flex-1 bg-[#E10600] hover:bg-[#C80500] text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      {directions ? "Recalculate Route" : "Find Route"}
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearRoute}
                  className="px-4 py-3 bg-[var(--bg-surface)] hover:bg-[#F7F7F7] rounded-xl border border-[var(--border-subtle)] transition-colors shadow-sm"
                  title="Clear all"
                >
                  <Trash2 size={18} className="text-[#111111]" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Available Routes */}
          <AnimatePresence>
            {routes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-subtle)] p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#10B981]/10 rounded-lg">
                    <Route className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111]">
                    Available Routes ({routes.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {routes.map((route, index) => {
                    const leg = route.legs[0];
                    const distanceValue = leg.distance ? leg.distance.value : 0;
                    const distanceInKmValue = (distanceValue / 1000).toFixed(1);

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          handleRouteSelect(index);
                          setFormData((prev) => ({
                            ...prev,
                            distance: distanceInKmValue,
                          }));
                        }}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          selectedRouteIndex === index
                            ? "border-[#E10600] bg-[#E10600]/5 shadow-sm"
                            : "border-[var(--border-subtle)] hover:border-[#E10600]/30 hover:bg-[#F7F7F7]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                selectedRouteIndex === index
                                  ? "bg-[#E10600] text-white"
                                  : "bg-[#F7F7F7] text-[#555555]"
                              }`}
                            >
                              <span className="font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-[#111111]">
                                Route {index + 1}
                              </div>
                              <div className="text-xs text-[#555555] mt-1 flex items-center gap-1">
                                <Clock size={12} />
                                {leg.duration ? leg.duration.text : ""}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#111111] text-lg">
                              {distanceInKmValue} km
                            </div>
                            <div className="text-xs text-[#555555]">
                              {leg.distance ? leg.distance.text : ""}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-[var(--bg-surface)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden h-[60vh] md:h-[80vh] flex flex-col"
          >
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E10600]/10 rounded-lg">
                    <Map className="w-5 h-5 text-[#E10600]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111]">
                    Route Map
                  </h3>
                </div>
                <div className="text-sm font-medium">
                  {fromAddress && toAddress ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex flex-col">
                        <div className="px-3 py-1.5 bg-[#E10600]/5 rounded-lg">
                          <span className="font-semibold text-[#111111]">
                            {fromAddress.split(",")[0]} →{" "}
                            {toAddress.split(",")[0]}
                          </span>
                        </div>
                        {(fromCity || toCity) && (
                          <div className="text-xs text-[#555555] mt-1 px-3">
                            {fromCity && <span>From: {fromCity}</span>}
                            {fromCity && toCity && <span> • </span>}
                            {toCity && <span>To: {toCity}</span>}
                          </div>
                        )}
                      </div>
                      {distanceInKm > 0 && (
                        <div className="px-3 py-1.5 bg-[#E10600] text-white rounded-lg flex items-center gap-2">
                          <span className="font-bold">{distanceInKm} km</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#555555]">
                      Select locations to view route
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative flex-1 min-h-[600px]">
              {window.google && window.google.maps && (
                <GoogleMap
                  center={mapCenter}
                  zoom={mapZoom}
                  mapContainerStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                  onLoad={onMapLoad}
                  onClick={handleMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: false,
                    mapTypeControlOptions: {
                      position: window.google.maps.ControlPosition.TOP_RIGHT,
                    },
                    styles: [
                      {
                        featureType: "poi.business",
                        stylers: [{ visibility: "off" }],
                      },
                      {
                        featureType: "transit",
                        elementType: "labels.icon",
                        stylers: [{ visibility: "off" }],
                      },
                    ],
                  }}
                >
                  {draggableMarker && (
                    <Marker
                      position={draggableMarker.position}
                      draggable={true}
                      onDragStart={() => setIsDraggingMarker(true)}
                      onDragEnd={handleMarkerDragEnd}
                      icon={getMarkerIcon(draggableMarker.type, true)}
                      title={`Drag to set ${
                        draggableMarker.type === "from"
                          ? "starting point"
                          : "destination"
                      }`}
                    />
                  )}

                  {directions && (
                    <DirectionsRenderer
                      directions={directions}
                      routeIndex={selectedRouteIndex}
                      options={{
                        polylineOptions: {
                          strokeColor: COLORS.primary,
                          strokeWeight: 6,
                          strokeOpacity: 0.9,
                          zIndex: 1,
                        },
                        markerOptions: {
                          opacity: 0.9,
                          zIndex: 2,
                        },
                        suppressMarkers: false,
                        preserveViewport: false,
                      }}
                    />
                  )}

                  {from &&
                    !(draggableMarker && draggableMarker.type === "from") && (
                      <Marker
                        position={from}
                        icon={getMarkerIcon("from")}
                        title="Starting Point"
                      />
                    )}

                  {to &&
                    !(draggableMarker && draggableMarker.type === "to") && (
                      <Marker
                        position={to}
                        icon={getMarkerIcon("to")}
                        title="Destination"
                      />
                    )}
                </GoogleMap>
              )}

              {selectedLocationType && !isDraggingMarker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-[#E10600] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
                >
                  <Target size={16} className="animate-pulse" />
                  <span className="text-sm font-medium">
                    Drag marker to adjust{" "}
                    {selectedLocationType === "from"
                      ? "starting point"
                      : "destination"}
                  </span>
                </motion.div>
              )}

              {isCalculating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-6 right-6 bg-[var(--bg-surface)]/90 backdrop-blur-sm  py-3 rounded-xl shadow-lg flex items-center gap-3 border border-[var(--border-subtle)]"
                >
                  <Loader2 size={16} className="animate-spin text-[#E10600]" />
                  <span className="text-sm font-medium text-[#111111]">
                    Calculating route...
                  </span>
                </motion.div>
              )}

              {/* Map Controls */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    mapRef.current &&
                    mapRef.current.setZoom(mapRef.current.getZoom() + 1)
                  }
                  className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-lg hover:bg-[#F7F7F7] transition-colors"
                >
                  <ZoomIn size={20} className="text-[#111111]" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    mapRef.current &&
                    mapRef.current.setZoom(mapRef.current.getZoom() - 1)
                  }
                  className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-lg hover:bg-[#F7F7F7] transition-colors"
                >
                  <ZoomOut size={20} className="text-[#111111]" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
