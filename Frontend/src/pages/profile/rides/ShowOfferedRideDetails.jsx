import React, { useEffect, useState } from "react";
import { getCarImageUrl } from "../../../utils/profileImageHelper";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Package,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  Clock,
  Navigation2,
  User,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Loader2,
  UserX,
  Clock4,
  MessageSquare,
  ExternalLink,
  Navigation,
  Smartphone,
  MapPinned,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Hash,
  TrendingUp,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Wifi,
  Music,
  Ban,
  MessageCircle,
  Heart,
  Zap,
  Wind,
  Fuel,
  Settings,
  Bell,
  HelpCircle,
  Menu,
  Compass,
  Map,
  Droplets,
  Wind as WindIcon,
  PieChart,
  UserPlus,
  UserCheck,
  UserMinus,
  CheckSquare,
  XSquare,
  AlertTriangle,
  Maximize2,
  LocateFixed,
  Map as MapIcon,
  X,
  Filter,
  MoreVertical,
  Star,
  Edit,
  Share2,
  Download,
  Printer
} from "lucide-react";
import { api } from "../../../services/endpoints";
import Axios from "../../../services/axios";

const ShowOfferedRideDetails = () => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState({});
  const [weather, setWeather] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  // Fetch ride details
  const fetchRideDetails = async (rideId) => {
    try {
      setLoading(true);
      const res = await Axios.post(api.ride.getOfferedRideDetails, { rideId });

      if (res.data.success) {
        setRide(res.data.ride);
        // Fetch weather data based on departure location
        fetchWeatherData(res.data.ride.from.coordinates);
      } else {
        throw new Error(res.data.message || "Failed to fetch ride details");
      }
    } catch (error) {
      // console.error("Error fetching ride:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load ride details",
      );
      toast.error("Failed to load ride details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRideParcels = async (rideId) => {
    try {
      const res = await Axios.get(api.parcel.getRideParcels(rideId));
      if (res.data.success) {
        setParcels(res.data.data);
      }
    } catch (error) {
      console.log("Failed to fetch parcels", error);
    }
  };



  // Fetch weather data
  const fetchWeatherData = async (coordinates) => {
    try {
      const mockWeather = {
        temp: 18,
        condition: "Sunny",
        icon: "☀️",
        humidity: "65%",
        wind: "12 km/h",
        feelsLike: 19,
      };
      setWeather(mockWeather);
    } catch (error) {
      // console.error("Weather fetch error:", error);
    }
  };

  // Handle passenger actions
  const handleAcceptPassenger = async (passengerId) => {
    setActionLoading((prev) => ({ ...prev, [passengerId]: true }));

    try {
      const res = await Axios.post(api.ride.acceptRideRequest, {
        rideId: ride._id,
        passangerId: passengerId,
      });

      if (res.data.success) {
        toast.success("Passenger request accepted!");
        setRide((prev) => ({
          ...prev,
          passengers: prev.passengers.map((passenger) =>
            passenger.user._id === passengerId
              ? { ...passenger, status: "accepted" }
              : passenger,
          ),
        }));
      }
    } catch (error) {
      // console.log(error , "this is error")
      toast.error(
        error.response?.data?.message || "Failed to accept passenger",
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [passengerId]: false }));
    }
  };

  const handleRejectPassenger = async (passengerId) => {
    setActionLoading((prev) => ({ ...prev, [passengerId]: true }));

    try {
     const res = await Axios.post(api.ride.rejectRideRequest, {
      rideId : ride?._id,
      passangerId: passengerId
     })

      // console.log(res, "this is res")

      if (res.data.success) {
        toast.success("Passenger request rejected!");
        setRide((prev) => ({
          ...prev,
          passengers: prev.passengers.map((passenger) =>
            passenger._id === passengerId
              ? { ...passenger, status: "rejected" }
              : passenger,
          ),
        }));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reject passenger",
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [passengerId]: false }));
    }
  };

  const handleUpdateParcelStatus = async (parcelId, status, otp) => {
    setParcelActionLoading((prev) => ({ ...prev, [parcelId]: true }));
    try {
      const res = await Axios.patch(api.parcel.updateStatus(parcelId), { status, otp });
      if (res.data.success) {
        toast.success(`Parcel ${status.toLowerCase().replace('_', ' ')} successfully!`);
        setParcels((prev) => prev.map((p) => p._id === parcelId ? res.data.data : p));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update parcel status");
    } finally {
      setParcelActionLoading((prev) => ({ ...prev, [parcelId]: false }));
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "N/A" };

    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      shortDate: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      relative: getRelativeTime(date),
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    return "";
  };

  // Calculate seat statistics
  const calculateSeatStatistics = () => {
    if (!ride)
      return {
        totalSeats: 0,
        availableSeats: 0,
        filledSeats: 0,
        confirmedSeats: 0,
        pendingSeats: 0,
        fillPercentage: 0,
      };

    const totalSeats = ride.totalSeats || 0;
    const confirmedPassengers =
      ride.passengers?.filter(
        (p) => p.status === "accepted" || p.status === "confirmed",
      ) || [];
    const pendingPassengers =
      ride.passengers?.filter((p) => p.status === "requested") || [];

    const confirmedSeats = confirmedPassengers.reduce(
      (sum, p) => sum + (p.seatsBooked || 0),
      0,
    );
    const pendingSeats = pendingPassengers.reduce(
      (sum, p) => sum + (p.seatsBooked || 0),
      0,
    );
    const filledSeats = confirmedSeats;
    const availableSeats = totalSeats - confirmedSeats;
    const fillPercentage =
      totalSeats > 0 ? Math.round((confirmedSeats / totalSeats) * 100) : 0;

    return {
      totalSeats,
      availableSeats,
      filledSeats,
      confirmedSeats,
      pendingSeats,
      fillPercentage,
    };
  };

  // Calculate earnings
  const calculateEarnings = () => {
    if (!ride?.passengers) return 0;
    const confirmedPassengers = ride.passengers.filter(
      (p) => p.status === "accepted" || p.status === "confirmed",
    );
    const totalSeats = confirmedPassengers.reduce(
      (sum, p) => sum + (p.seatsBooked || 0),
      0,
    );
    return totalSeats * (ride.pricePerSeat || 0);
  };

  const getPassengerStats = () => {
    if (!ride?.passengers)
      return { total: 0, requested: 0, accepted: 0, rejected: 0 };

    return {
      total: ride.passengers.length,
      requested: ride.passengers.filter((p) => p.status === "requested").length,
      accepted: ride.passengers.filter(
        (p) => p.status === "accepted" || p.status === "confirmed",
      ).length,
      rejected: ride.passengers.filter((p) => p.status === "rejected").length,
    };
  };

  const getFilteredPassengers = () => {
    if (!ride?.passengers) return [];

    switch (activeTab) {
      case "pending":
        return ride.passengers.filter((p) => p.status === "requested");
      case "confirmed":
        return ride.passengers.filter(
          (p) => p.status === "accepted" || p.status === "confirmed",
        );
      case "rejected":
        return ride.passengers.filter((p) => p.status === "rejected");
      default:
        return ride.passengers;
    }
  };

  // Open maps functions
  const openInGoogleMaps = (location, label) => {
    if (!location?.coordinates) {
      toast.error("Location coordinates not available");
      return;
    }
    const [latitude, longitude] = location.coordinates;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(mapsUrl, "_blank");
  };

  const openNavigation = (startLocation, endLocation) => {
    if (!startLocation?.coordinates || !endLocation?.coordinates) {
      toast.error("Location coordinates not available");
      return;
    }
    const [startLat, startLng] = startLocation.coordinates;
    const [endLat, endLng] = endLocation.coordinates;
    const navigationUrl = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${endLat},${endLng}&travelmode=driving`;
    window.open(navigationUrl, "_blank");
  };

  // Preference Icon Component
  const PreferenceIcon = ({ type, value }) => {
    const config = {
      smoking: {
        "not-allowed": {
          icon: <Ban className="w-4 h-4 text-red-500" />,
          label: "No Smoking",
        },
        allowed: {
          icon: <Wind className="w-4 h-4 text-green-500" />,
          label: "Smoking Allowed",
        },
      },
      music: {
        "not-allowed": {
          icon: <Ban className="w-4 h-4 text-red-500" />,
          label: "No Music",
        },
        allowed: {
          icon: <Music className="w-4 h-4 text-green-500" />,
          label: "Music Allowed",
        },
      },
      pets: {
        "not-allowed": {
          icon: <Ban className="w-4 h-4 text-red-500" />,
          label: "No Pets",
        },
        allowed: {
          icon: <Heart className="w-4 h-4 text-green-500" />,
          label: "Pets Allowed",
        },
      },
      conversation: {
        either: {
          icon: <MessageCircle className="w-4 h-4 text-blue-500" />,
          label: "Chat Friendly",
        },
        "prefer-quiet": {
          icon: <Zap className="w-4 h-4 text-yellow-500" />,
          label: "Quiet Ride",
        },
      },
    };

    const setting = config[type]?.[value] || {
      icon: <Hash className="w-4 h-4 text-gray-500" />,
      label: value,
    };

    return (
      <div className="flex flex-col items-center p-2 sm:p-3 bg-gray-50 rounded-xl min-w-[80px] sm:min-w-[90px]">
        <div className="mb-1 sm:mb-2">{setting.icon}</div>
        <span className="text-xs font-semibold text-gray-700 text-center line-clamp-2">
          {setting.label}
        </span>
      </div>
    );
  };

  // Location Card Component
  const LocationCard = ({
    location,
    label,
    type = "pickup",
    showMapButton = true,
  }) => {
    if (!location) return null;

    return (
      <div className="bg-gradient-to-br from-white to-gray-50 border border-[var(--border-subtle)] rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  type === "pickup" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">
                {label}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {location.city}
            </p>
            {location.address && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                {location.address}
              </p>
            )}
            {location.coordinates && (
              <p className="text-xs text-gray-500 mt-2">
                {location.coordinates[1]?.toFixed(4)}°,{" "}
                {location.coordinates[0]?.toFixed(4)}°
              </p>
            )}
          </div>
          {showMapButton && (
            <button
              onClick={() => openInGoogleMaps(location, label)}
              className="p-1 sm:p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              title="Open in Maps"
            >
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Passenger Location Card Component
  const PassengerLocationCard = ({ location, label, type = "pickup" }) => {
    if (!location) return null;

    return (
      <div className="bg-gradient-to-br from-white to-gray-50 border border-[var(--border-subtle)] rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                  type === "pickup" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700 truncate">
                {label}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {location.city}
            </p>
            {location.address && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                {location.address}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 ml-2">
            <button
              onClick={() => openInGoogleMaps(location, label)}
              className="p-1 sm:p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
              title="Open in Google Maps"
            >
              <MapIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 hidden xs:inline">
                Map
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Parcel Card Component
  const ParcelCard = ({ parcel }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [otp, setOtp] = useState("");
    
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm mb-4">
        <div 
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {parcel.pickup.city} → {parcel.dropoff.city}
              </h3>
              <p className="text-xs text-gray-500 font-semibold">{parcel.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-gray-900 text-sm">₹{parcel.amount}</p>
              <p className="text-xs text-gray-500">{parcel.weight} kg</p>
            </div>
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400"/> : <ChevronDown className="w-5 h-5 text-gray-400"/>}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[var(--border-subtle)] bg-gray-50/50"
            >
              <div className="p-4 space-y-4">
                <div className="text-sm">
                  <p><span className="font-semibold">Receiver:</span> {parcel.receiverDetails.name} ({parcel.receiverDetails.phone})</p>
                  <p className="mt-1 text-xs text-gray-600"><span className="font-semibold text-gray-800">Pickup:</span> {parcel.pickup.address}</p>
                  <p className="mt-1 text-xs text-gray-600"><span className="font-semibold text-gray-800">Dropoff:</span> {parcel.dropoff.address}</p>
                </div>

                <div className="flex gap-2 items-center">
                  {parcel.status === "REQUESTED" && (
                    <button
                      onClick={() => handleUpdateParcelStatus(parcel._id, "ACCEPTED", "")}
                      disabled={parcelActionLoading[parcel._id]}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
                    >
                      {parcelActionLoading[parcel._id] ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Accept Parcel"}
                    </button>
                  )}

                  {parcel.status === "ACCEPTED" && (
                    <button
                      onClick={() => handleUpdateParcelStatus(parcel._id, "PICKED_UP", "")}
                      disabled={parcelActionLoading[parcel._id]}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                    >
                      {parcelActionLoading[parcel._id] ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Confirm Pickup"}
                    </button>
                  )}

                  {parcel.status === "PICKED_UP" && (
                    <button
                      onClick={() => handleUpdateParcelStatus(parcel._id, "IN_TRANSIT", "")}
                      disabled={parcelActionLoading[parcel._id]}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                    >
                      {parcelActionLoading[parcel._id] ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Start Transit"}
                    </button>
                  )}

                  {parcel.status === "IN_TRANSIT" && (
                    <>
                      <input 
                        type="text" 
                        placeholder="Delivery OTP" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
                      />
                      <button
                        onClick={() => handleUpdateParcelStatus(parcel._id, "DELIVERED", otp)}
                        disabled={parcelActionLoading[parcel._id] || otp.length !== 4}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:bg-green-300"
                      >
                        {parcelActionLoading[parcel._id] ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Verify & Deliver"}
                      </button>
                    </>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Passenger Card Component
  const PassengerCard = ({ passenger, index }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const statusConfig = {
      requested: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock4,
        text: "Pending",
        badgeColor: "bg-yellow-500",
      },
      accepted: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Confirmed",
        badgeColor: "bg-green-500",
      },
      confirmed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: "Confirmed",
        badgeColor: "bg-green-500",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Rejected",
        badgeColor: "bg-red-500",
      },
    };

    const config = statusConfig[passenger.status] || statusConfig.requested;
    const StatusIcon = config.icon;
    const dateTime = formatDateTime(passenger.joinedAt);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm"
      >
        <div className="p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                {passenger.user?.profilePhotos?.[0]?.url ? (
                  <img
                    src={import.meta.env.VITE_ASSETS_URL + passenger.user.profilePhotos[0].url}
                    alt={passenger.user.firstName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border flex items-center justify-center">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                )}
                <div
                  className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 ${config.badgeColor} rounded-full flex items-center justify-center border border-white`}
                >
                  <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                  <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
                    {passenger.user?.firstName} {passenger.user?.lastName}
                  </h3>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${config.color} self-start`}
                  >
                    {config.text}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:flex-wrap gap-1 xs:gap-3 mt-1">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 truncate">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{passenger.user?.phone}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-[150px]">
                      {passenger.user?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border-subtle)] space-y-3 sm:space-y-4">
                  {/* Ride Details */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Seats Booked</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">
                        {ride?.isFullSharing ? "full Vehicle" : passenger.seatsBooked}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Requested On</p>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        {dateTime.shortDate}
                      </p>
                      <p className="text-xs text-gray-500">{dateTime.time}</p>
                    </div>
                  </div>

                  {/* Route Information with Map Buttons */}
                 

                  {/* Actions */}
                  {passenger.status === "requested" && (
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() =>
                          handleAcceptPassenger(passenger.user._id)
                        }
                        disabled={actionLoading[passenger._id]}
                        className="flex-1 bg-green-600 text-white py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-2 text-sm"
                      >
                        {actionLoading[passenger._id] ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <>
                            <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Accept</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectPassenger(passenger._id)}
                        disabled={actionLoading[passenger._id]}
                        className="flex-1 bg-red-600 text-white py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-2 text-sm"
                      >
                        {actionLoading[passenger._id] ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <>
                            <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Reject</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  // Seat Occupancy Component - Responsive
  const SeatOccupancy = ({ seatStats }) => {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Seat Occupancy
          </h3>
          <div className="text-sm font-semibold text-gray-700">
            {seatStats.fillPercentage}% Filled
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm mb-1">
            <span className="text-gray-600">Occupancy</span>
            <span className="font-semibold text-gray-900">
              {seatStats.filledSeats}/{seatStats.totalSeats} seats
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 sm:h-3 rounded-full transition-all duration-500"
              style={{ width: `${seatStats.fillPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Seat Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700">
                CONFIRMED
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {seatStats.filledSeats}
            </p>
            <p className="text-xs text-gray-600 mt-1">seats occupied</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-700">AVAILABLE</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {seatStats.availableSeats}
            </p>
            <p className="text-xs text-gray-600 mt-1">seats remaining</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-700">Total Seats</span>
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base">
                {seatStats.totalSeats}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs sm:text-sm text-gray-700">Pending Requests</span>
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base">
                {seatStats.pendingSeats}
              </span>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {seatStats.availableSeats === 0 && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
              <span className="text-xs sm:text-sm font-semibold text-yellow-800">
                Ride is fully booked!
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Ride Overview Component - Responsive
  const RideOverview = () => {
    const dateTime = formatDateTime(ride.departureTime || ride.departureDate);

    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          Ride Overview
        </h3>

        <div className="space-y-3 sm:space-y-4">
          {/* Main Route */}
          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl p-3 sm:p-4">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <Navigation2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="font-bold text-gray-900 text-sm sm:text-base">Main Route</span>
              </div>
              <button
                onClick={() => openNavigation(ride.from, ride.to)}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 self-start xs:self-center"
              >
                <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                Navigate
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <LocationCard
                location={ride.from}
                label="Departure"
                type="pickup"
              />
              <LocationCard
                location={ride.to}
                label="Destination"
                type="drop"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">Departure Time</h4>
                <p className="text-xs sm:text-sm text-purple-600">{dateTime.relative}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
              <div className="bg-[var(--bg-surface)] p-2 sm:p-3 rounded-lg border border-[var(--border-subtle)]">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                  {dateTime.date}
                </p>
              </div>
              <div className="bg-[var(--bg-surface)] p-2 sm:p-3 rounded-lg border border-[var(--border-subtle)]">
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="font-bold text-gray-900 text-sm sm:text-base">
                  {dateTime.time}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-gray-50 to-white border border-[var(--border-subtle)] rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                <span className="text-xs font-bold text-gray-500">PRICE</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                ₹{ride.pricePerSeat}
              </p>
              <p className="text-xs text-gray-500 mt-1">per seat</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                <span className="text-xs font-bold text-gray-500">
                  DISTANCE
                </span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {ride.distance} km
              </p>
              <p className="text-xs text-gray-500 mt-1">total distance</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Stats Banner
  const MobileStatsBanner = () => {
    const passengerStats = getPassengerStats();
    const seatStats = calculateSeatStatistics();
    const earnings = calculateEarnings();

    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold">Ride Analytics</h2>
            <p className="text-blue-100 text-xs opacity-90">
              Manage passengers & track performance
            </p>
          </div>
          <button
            onClick={() => setIsExpandedView(!isExpandedView)}
            className="p-1 hover:bg-[var(--bg-surface)]/20 rounded-lg"
          >
            {isExpandedView ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isExpandedView && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/20">
                <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-xs text-blue-100 mb-1">Passengers</div>
                  <div className="text-sm font-bold">{passengerStats.total}</div>
                </div>
                <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-xs text-blue-100 mb-1">Occupied</div>
                  <div className="text-sm font-bold text-green-300">
                    {seatStats.filledSeats}/{seatStats.totalSeats}
                  </div>
                </div>
                <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-xs text-blue-100 mb-1">Confirmed</div>
                  <div className="text-sm font-bold">
                    {passengerStats.accepted}
                  </div>
                </div>
                <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-xs text-blue-100 mb-1">Earnings</div>
                  <div className="text-sm font-bold">₹{earnings}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const [parcels, setParcels] = useState([]);
  const [parcelActionLoading, setParcelActionLoading] = useState({});

  useEffect(() => {
    if (params.data) {
      const id = params.data.split("$$$")[0];
      if (id) {
        fetchRideDetails(id);
        fetchRideParcels(id);
      } else {
        navigate("/my-profile");
      }
    }
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-semibold text-sm sm:text-base">
            Loading ride details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {error ? "Unable to Load Ride" : "Ride Not Found"}
          </h3>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            {error || "The ride details aren't available."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold hover:bg-blue-700 text-sm sm:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const passengerStats = getPassengerStats();
  const seatStats = calculateSeatStatistics();
  const earnings = calculateEarnings();
  const filteredPassengers = getFilteredPassengers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-sm">
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg mr-2 sm:mr-4"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Ride Management
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <span>
                    {ride.from.city} → {ride.to.city}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>
                    {
                      formatDateTime(ride.departureTime || ride.departureDate)
                        .date
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile header */}
            <div className="sm:hidden flex-1 min-w-0">
              <h2 className="text-sm font-bold text-gray-900 truncate">
                {ride.from.city} → {ride.to.city}
              </h2>
              <p className="text-xs text-gray-600 truncate">
                {formatDateTime(ride.departureTime || ride.departureDate).date}
              </p>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Desktop Actions */}
              {/* <div className="hidden sm:flex items-center gap-2">
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
                <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              </div> */}

              {/* Mobile Actions */}
              <div className="sm:hidden flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Mobile Filter Menu */}
          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]"
              >
                <div className="py-2">
                  {[
                    {
                      id: "all",
                      label: "All Passengers",
                      count: passengerStats.total,
                    },
                    {
                      id: "pending",
                      label: "Pending",
                      count: passengerStats.requested,
                    },
                    {
                      id: "confirmed",
                      label: "Confirmed",
                      count: passengerStats.accepted,
                    },
                    {
                      id: "rejected",
                      label: "Rejected",
                      count: passengerStats.rejected,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowFilterMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-sm font-medium">{tab.label}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="sm:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]"
              >
                <div className="py-2">
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Bell className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Notifications</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Share2 className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Share Ride</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <Download className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Export Data</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Help & Support</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Mobile Stats Banner */}
        <div className="sm:hidden">
          <MobileStatsBanner />
        </div>

        {/* Desktop Stats Banner */}
        <div className="hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">
                Ride Analytics Dashboard
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm">
                Manage passenger requests and track performance
              </p>
            </div>

              {ride?.isFullSharing ? <p className="font-semibold">This is full Vehicle Sharing</p> :  <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-xs text-blue-100 mb-1">
                  Total Passengers
                </div>
                <div className="text-base sm:text-lg font-bold">{passengerStats.total}</div>
              </div>
              <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-xs text-blue-100 mb-1">Seats Occupied</div>
                <div className="text-base sm:text-lg font-bold text-green-300">
                  {seatStats.filledSeats}/{seatStats.totalSeats}
                </div>
              </div>
              <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-xs text-blue-100 mb-1">Confirmed</div>
                <div className="text-base sm:text-lg font-bold">
                  {passengerStats.accepted}
                </div>
              </div>
              <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-xs text-blue-100 mb-1">Earnings</div>
                <div className="text-base sm:text-lg font-bold">₹{earnings}</div>
              </div>
            </div>}
           
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Passengers */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Filter Tabs - Desktop */}
            <div className="hidden sm:block bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              <div className="flex overflow-x-auto border-b border-[var(--border-subtle)]">
                {[
                  {
                    id: "all",
                    label: "All Passengers",
                    count: passengerStats.total,
                  },
                  {
                    id: "pending",
                    label: "Pending",
                    count: passengerStats.requested,
                  },
                  {
                    id: "confirmed",
                    label: "Confirmed",
                    count: passengerStats.accepted,
                  },
                  {
                    id: "rejected",
                    label: "Rejected",
                    count: passengerStats.rejected,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Passengers List */}
              <div className="p-4 space-y-3 sm:space-y-4">
                {filteredPassengers.length > 0 ? (
                  filteredPassengers.map((passenger, index) => (
                    <PassengerCard
                      key={passenger._id || index}
                      passenger={passenger}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-600 text-sm sm:text-base">No passengers found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Passengers List */}
            <div className="sm:hidden space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Passengers ({filteredPassengers.length})
                </h3>
                <span className="text-xs text-gray-500">
                  Showing {activeTab === "all" ? "all" : activeTab}
                </span>
              </div>
              {filteredPassengers.length > 0 ? (
                filteredPassengers.map((passenger, index) => (
                  <PassengerCard
                    key={passenger._id || index}
                    passenger={passenger}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-6">
                  <User className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No passengers found</p>
                </div>
              )}
            </div>

            {/* Ride Overview */}
            <RideOverview />

            {/* Parcels List */}
            {parcels.length > 0 && (
              <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-subtle)]">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Parcel Requests ({parcels.length})
                  </h3>
                </div>
                <div className="p-4">
                  {parcels.map((parcel) => (
                    <ParcelCard key={parcel._id} parcel={parcel} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Ride Details */}
          <div className="space-y-4 sm:space-y-6">
            {/* Seat Occupancy */}
            {ride.isFullSharing ? null :    <SeatOccupancy seatStats={seatStats} /> }
          

            {/* Preferences */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                Ride Preferences
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                {ride.preferences &&
                  Object.entries(ride.preferences).map(([key, value]) => (
                    <PreferenceIcon key={key} type={key} value={value} />
                  ))}
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Vehicle Details
              </h3>

              {ride.carDetails?.images?.[0] ? (
                <img
                  src={getCarImageUrl(ride.carDetails)}
                  alt={`${ride.carDetails.brand} ${ride.carDetails.model}`}
                  className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3 sm:mb-4 border border-[var(--border-subtle)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/default-car.svg";
                  }}
                />
              ) : (
                <div className="w-full h-32 sm:h-40 bg-gray-100 flex items-center justify-center rounded-lg mb-3 sm:mb-4 border border-[var(--border-subtle)]">
                  <Car className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <div className="space-y-1 sm:space-y-2">
                <h4 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                  {ride.carDetails?.brand} {ride.carDetails?.model}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  {ride.carDetails?.year} • {ride.carDetails?.fuelType} •{" "}
                  {ride.carDetails?.transmission}
                </p>
                {ride.carDetails?.plateNumber && (
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    Plate: {ride.carDetails.plateNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions - Mobile Only */}
            <div className="sm:hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openNavigation(ride.from, ride.to)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </button>
                <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4" />
                  Message All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

   
    </div>
  );
};

export default ShowOfferedRideDetails;