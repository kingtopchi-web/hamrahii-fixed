import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Users,
  MapPin,
  Car,
  Music,
  Cigarette,
  PawPrint,
  MessageCircle,
  DollarSign,
  Clock,
  Navigation,
  User,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  AlertCircle,
  Star,
  Shield,
  CheckCircle,
  Heart,
  Share2,
  Eye,
  Phone,
  Mail,
  Calendar,
  Route,
  Fuel,
  Settings,
  Wind,
  Volume2,
  MessageSquare,
} from "lucide-react";

import Axios from "../../services/axios";
import { api } from "../../services/api";

const Rides = () => {
  const [rides, setRides] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRides, setTotalRides] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSeats: 0,
  });

  const [statsData, setStatsData] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    city: "",
    toCity: "",
    date: "",
    priceMin: "",
    priceMax: "",
    seats: "",
    smoking: "",
    music: "",
    pets: "",
    conversation: "",
    sortBy: "departureTime",
    sortOrder: "asc",
  });

  const [showFilters, setShowFilters] = useState(true);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableToCities, setAvailableToCities] = useState([]);
  const [today] = useState(new Date().toISOString().split("T")[0]);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideDetail, setShowRideDetail] = useState(false);
  const [savedRides, setSavedRides] = useState([]);

  const handleGetStats = async () => {
    try {
      const res = await Axios.post(api.admin.getStats);
      //  console.log(res.data.data, "this is stats")
      setStatsData(res.data.data);
    } catch (error) {
      //  console.log(error)
    }
  };

  useEffect(() => {
    handleGetStats();
  }, []);

  const handleGetRides = async (page = 1, filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters for backend
      const backendFilters = {
        city: filterParams.city || "",
        toCity: filterParams.toCity || "",
        date: filterParams.date || "",
        minPrice: filterParams.priceMin || "",
        maxPrice: filterParams.priceMax || "",
        seats: filterParams.seats || "",
        smoking: filterParams.smoking || "",
        music: filterParams.music || "",
        pets: filterParams.pets || "",
        conversation: filterParams.conversation || "",
        sortBy: filterParams.sortBy || "departureTime",
        sortOrder: filterParams.sortOrder || "asc",
      };

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      // Add only non-empty filters
      Object.keys(backendFilters).forEach((key) => {
        const value = backendFilters[key];
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });

      // console.log("Fetching rides with params:", params.toString());

      // Use GET request
      const res = await Axios.get(
        `${api.ride.handleGetRides}?${params.toString()}`,
      );

      // console.log(res, "this s res")

      if (res.data.success) {
        setRides(res.data.data || []);
        setTotalRides(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setCurrentPage(res.data.pagination?.page || 1);
        setStats(res.data.stats || {});
        setStats((prev) => ({
          ...prev,
          totalSeats: res?.data?.totalSeats || 0,
        }));

        // Extract unique cities
        if (res.data.data?.length > 0) {
          const fromCities = [
            ...new Set(
              res.data.data
                .filter((ride) => ride.from?.city)
                .map((ride) => ride.from.city),
            ),
          ];
          setAvailableCities(fromCities);

          const toCities = [
            ...new Set(
              res.data.data
                .filter((ride) => ride.to?.city)
                .map((ride) => ride.to.city),
            ),
          ];
          setAvailableToCities(toCities);
        }
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      setError(
        error.response?.data?.message ||
          "Failed to load rides. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetRides();
    // Load saved rides from localStorage
    const saved = localStorage.getItem("savedRides");
    if (saved) {
      setSavedRides(JSON.parse(saved));
    }
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    handleGetRides(1, filters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      city: "",
      toCity: "",
      date: "",
      priceMin: "",
      priceMax: "",
      seats: "",
      smoking: "",
      music: "",
      pets: "",
      conversation: "",
      sortBy: "departureTime",
      sortOrder: "asc",
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    handleGetRides(1, resetFilters);
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder =
      filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc";
    const newFilters = {
      ...filters,
      sortBy,
      sortOrder: newSortOrder,
    };
    setFilters(newFilters);
    handleGetRides(currentPage, newFilters);
  };

  const handleSaveRide = (rideId) => {
    let updatedSavedRides;
    if (savedRides.includes(rideId)) {
      updatedSavedRides = savedRides.filter((id) => id !== rideId);
    } else {
      updatedSavedRides = [...savedRides, rideId];
    }
    setSavedRides(updatedSavedRides);
    localStorage.setItem("savedRides", JSON.stringify(updatedSavedRides));
  };

  const handleShareRide = (ride) => {
    const shareText = `Join me for a ride from ${ride.from.city} to ${ride.to.city} on ${formatDate(ride.departureTime)} at ${formatTime(ride.departureTime)}. Price: ₹${ride.pricePerSeat}/seat.`;

    if (navigator.share) {
      navigator.share({
        title: `Ride to ${ride.to.city}`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Ride details copied to clipboard!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const options = { weekday: "short", day: "numeric", month: "short" };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Time";
    }
  };

  const calculateDuration = (departureTime) => {
    if (!departureTime) return "Unknown";
    try {
      const departure = new Date(departureTime);
      const now = new Date();
      const diffTime = departure - now;
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 0) return "Departed";
      if (diffHours < 24) return "Today";
      if (diffHours < 48) return "Tomorrow";
      if (diffDays < 7) return `In ${diffDays} days`;
      return formatDate(departureTime);
    } catch (error) {
      return "Unknown";
    }
  };

  const calculateETA = (departureTime) => {
    if (!departureTime) return "";
    try {
      const departure = new Date(departureTime);
      const now = new Date();
      const diffHours = Math.floor((departure - now) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((departure - now) / (1000 * 60));

      if (diffHours < 0) return "Already departed";
      if (diffHours < 1) return `Departing in ${diffMinutes} minutes`;
      if (diffHours < 24) return `Departing in ${diffHours} hours`;
      return `Departing in ${Math.floor(diffHours / 24)} days`;
    } catch (error) {
      return "";
    }
  };

  const PreferenceIcon = ({ type, value }) => {
    const getIconColor = () => {
      if (value === "not-allowed") return "text-[#EF4444] bg-[#FEF2F2]";
      if (value === "allowed") return "text-[#10B981] bg-[#ECFDF5]";
      if (value === "preferred") return "text-blue-500 bg-[#EFF6FF]";
      return "text-[#64748B] bg-[#F8FAFC]";
    };

    const icons = {
      smoking: <Cigarette className="w-3 h-3" />,
      music: <Music className="w-3 h-3" />,
      pets: <PawPrint className="w-3 h-3" />,
      conversation: <MessageCircle className="w-3 h-3" />,
    };

    return (
      <div className={`p-1 rounded ${getIconColor()}`} title={type}>
        {icons[type]}
      </div>
    );
  };

  const getRideStatusBadge = (status) => {
    const s = (status || "scheduled").toLowerCase();
    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ECFDF5]0"></span>
          Completed
        </span>
      );
    }
    if (s === "ongoing") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFBEB]0 animate-pulse"></span>
          Ongoing
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EFF6FF]0"></span>
        Scheduled
      </span>
    );
  };

  const getDriverPhotoUrl = (driver) => {
    const photo = driver?.profilePhotos?.[0]?.url || driver?.profileImage;
    if (!photo) return null;
    if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
    const baseUrl = import.meta?.env?.VITE_ASSETS_URL || "";
    return `${baseUrl}${photo.startsWith("/") ? "" : "/"}${photo}`;
  };

  const ChevronRight = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );

  const RideCard = ({ ride }) => {
    const isToday = calculateDuration(ride.departureTime) === "Today";
    const driverPhoto = getDriverPhotoUrl(ride.driver);
    const driverName = [ride.driver?.firstName, ride.driver?.lastName].filter(Boolean).join(" ") || ride.driver?.name || "Driver";
    const driverInitial = (driverName?.[0] || "D").toUpperCase();
    const availableSeats = Number(ride.availableSeats ?? 0);
    const totalSeats = Number(ride.totalSeats ?? 1);
    const filledSeats = Math.max(0, totalSeats - availableSeats);
    const seatPercentage = totalSeats > 0 ? Math.round((filledSeats / totalSeats) * 100) : 0;

    return (
      <div className="bg-[#FFFFFF] rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-[#E2E8F0]/90 overflow-hidden flex flex-col justify-between group">
        {/* Header with Route & Status */}
        <div className="p-4 border-b border-[#E2E8F0] bg-gradient-to-b from-gray-50/70 to-white">
          {/* Top Row: Status & Time Horizon */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            {getRideStatusBadge(ride.status)}
            {isToday ? (
              <span className="px-2 py-0.5 bg-red-100 text-[#EF4444] text-[10px] font-bold rounded-full">
                Today
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#64748B]">
                {calculateDuration(ride.departureTime)}
              </span>
            )}
          </div>

          {/* Dedicated Date & Time Schedule Row */}
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 mb-3 bg-[#F8FAFC]/90 rounded-xl border border-[#E2E8F0]/70 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[#0F172A] min-w-0">
              <CalendarDays className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
              <span className="truncate">{formatDate(ride.departureTime)}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-[#0F172A] bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-[#E2E8F0] shadow-2xs shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
              <span>{formatTime(ride.departureTime)}</span>
            </div>
          </div>

          {/* Route Display */}
          <div className="space-y-2 relative pl-5 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:to-[#E10600]">
            <div className="relative">
              <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-[#ECFDF5]0 ring-2 ring-emerald-100"></span>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-[#0F172A] truncate">{ride.from?.city || "Unknown"}</p>
                <span className="text-[11px] text-[#94A3B8] truncate max-w-[110px]">{ride.from?.area}</span>
              </div>
            </div>
            <div className="relative">
              <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-red-100"></span>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-[#0F172A] truncate">{ride.to?.city || "Unknown"}</p>
                <span className="text-[11px] text-[#94A3B8] truncate max-w-[110px]">{ride.to?.area}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
          {/* Driver & Car */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {driverPhoto ? (
                <img
                  src={driverPhoto}
                  alt={driverName}
                  className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driverName)}&background=f3f4f6&color=111111`;
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-center text-[#EF4444] text-xs font-bold shrink-0">
                  {driverInitial}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] truncate">{driverName}</p>
                <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span>{ride.driver?.rating || "4.8"}</span>
                  <span className="text-gray-300">•</span>
                  <span className="truncate">{ride.car?.brand || "Car"}</span>
                </div>
              </div>
            </div>

            {ride.preferences && Object.keys(ride.preferences).length > 0 && (
              <div className="flex gap-1 shrink-0">
                {Object.entries(ride.preferences).slice(0, 3).map(([key, value]) => (
                  <PreferenceIcon key={key} type={key} value={value} />
                ))}
              </div>
            )}
          </div>

          {/* Seats Availability Bar */}
          <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-[#E2E8F0]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#64748B] font-medium">Seat Availability</span>
              <span className="font-bold text-[#0F172A]">
                <span className="text-[#EF4444]">{ride.availableSeats}</span> / {ride.totalSeats} left
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E10600] to-rose-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(10, Math.min(100, 100 - seatPercentage))}%` }}
              ></div>
            </div>
          </div>

          {/* Price & Action */}
          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-wider">Per Seat</span>
              <div className="text-lg font-black text-[#0F172A]">
                ₹{ride.pricePerSeat}
              </div>
            </div>

            <button
              onClick={() => setSelectedRide(ride)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#FEF2F2] text-[#0F172A] hover:text-[#EF4444] border border-[#E2E8F0] hover:border-[#FCA5A5] rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const RideDetailModal = ({ ride, onClose }) => {
    if (!ride) return null;
    const driverPhoto = getDriverPhotoUrl(ride.driver);
    const driverName = [ride.driver?.firstName, ride.driver?.lastName].filter(Boolean).join(" ") || ride.driver?.name || "Driver";
    const driverInitial = (driverName?.[0] || "D").toUpperCase();

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl border border-[#E2E8F0]">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-5 pb-4 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-[#0F172A]">Ride Details</h2>
                  {getRideStatusBadge(ride.status)}
                </div>
                <p className="text-xs text-[#64748B]">ID: {ride._id}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Route Timeline */}
            <div className="mb-5 p-4 bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-xl border border-[#E2E8F0]/80">
              <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Route Itinerary</h3>
              <div className="space-y-4 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:to-[#E10600]">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#ECFDF5]0 ring-4 ring-emerald-100"></span>
                  <p className="text-xs text-[#64748B] font-medium">Pickup Point</p>
                  <p className="text-base font-bold text-[#0F172A]">{ride.from?.city}</p>
                  <p className="text-xs text-[#475569]">{ride.from?.area || "Main city pickup"}</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#EF4444] ring-4 ring-red-100"></span>
                  <p className="text-xs text-[#64748B] font-medium">Drop Destination</p>
                  <p className="text-base font-bold text-[#0F172A]">{ride.to?.city}</p>
                  <p className="text-xs text-[#475569]">{ride.to?.area || "Main destination"}</p>
                </div>
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#FEF2F2]/50 border border-[#FCA5A5] p-3.5 rounded-xl">
                <div className="flex items-center gap-2 mb-1 text-[#EF4444]">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-xs font-semibold">Departure Date</span>
                </div>
                <p className="font-bold text-[#0F172A] text-sm">{formatDate(ride.departureTime)}</p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl">
                <div className="flex items-center gap-2 mb-1 text-[#0F172A]">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold">Departure Time</span>
                </div>
                <p className="font-bold text-[#0F172A] text-sm">{formatTime(ride.departureTime)}</p>
              </div>
            </div>

            {/* Driver Info */}
            <div className="mb-5 p-4 bg-[#F8FAFC]/80 rounded-xl border border-[#E2E8F0]/80">
              <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Driver Profile</h3>
              <div className="flex items-center gap-3">
                {driverPhoto ? (
                  <img
                    src={driverPhoto}
                    alt={driverName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(driverName)}&background=f3f4f6&color=111111`;
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] flex items-center justify-center text-[#EF4444] font-bold text-base shadow-sm shrink-0">
                    {driverInitial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#0F172A] text-sm truncate">{driverName}</p>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0] shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-[#0F172A]">{ride.driver?.rating || "4.8"}</span>
                    </div>
                    {ride.driver?.phone && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#94A3B8]" />
                          {ride.driver.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Car Details */}
            <div className="mb-5 p-4 bg-[#F8FAFC]/80 rounded-xl border border-[#E2E8F0]/80">
              <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Vehicle Details</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#0F172A] text-sm">
                    {ride.car?.brand} {ride.car?.model}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {ride.car?.year ? `${ride.car?.year} • ` : ""}{ride.car?.fuelType || "Petrol"} • {ride.car?.seats || 4} Total Seats
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] text-[#EF4444]">
                  <Car className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Preferences */}
            {ride.preferences && (
              <div className="mb-5">
                <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2.5">Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {ride.preferences.smoking && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#0F172A]">
                      <Cigarette className="w-3.5 h-3.5" />
                      <span>{ride.preferences.smoking === "allowed" ? "Smoking allowed" : "No smoking"}</span>
                    </div>
                  )}
                  {ride.preferences.pets && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#0F172A]">
                      <PawPrint className="w-3.5 h-3.5" />
                      <span>{ride.preferences.pets === "allowed" ? "Pets friendly" : "No pets"}</span>
                    </div>
                  )}
                  {ride.preferences.music && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#0F172A]">
                      <Music className="w-3.5 h-3.5" />
                      <span>{ride.preferences.music === "allowed" ? "Music on" : "Silent ride"}</span>
                    </div>
                  )}
                  {ride.preferences.conversation && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8FAFC] text-[#0F172A]">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>
                        {ride.preferences.conversation === "preferred"
                          ? "Conversation welcome"
                          : ride.preferences.conversation === "quiet"
                          ? "Quiet ride"
                          : "Flexible"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price & Seats Summary */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-[#FCA5A5] p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#64748B]">Price per seat</p>
                <p className="text-2xl font-black text-[#0F172A]">₹{ride.pricePerSeat}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-[#64748B]">Available capacity</p>
                <p className="text-base font-bold text-[#EF4444]">
                  {ride.availableSeats} of {ride.totalSeats} seats left
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilterPanel = () => (
    <div className="bg-[#FFFFFF] rounded-2xl shadow-sm p-5 mb-6 border border-[#E2E8F0]/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-[#E2E8F0]">
        <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#EF4444]" />
          Filter Rides
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] font-semibold rounded-xl hover:bg-[#F8FAFC] text-xs transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-[#EF4444] hover:bg-[#C10500] text-white font-semibold rounded-xl text-xs transition-all shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From City */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            From City
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
          >
            <option value="">All Cities</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* To City */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            To City
          </label>
          <select
            value={filters.toCity}
            onChange={(e) => handleFilterChange("toCity", e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
          >
            <option value="">All Cities</option>
            {availableToCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Date
          </label>
          <input
            type="date"
            min={today}
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
          />
        </div>

        {/* Seats */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Min Seats
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={filters.seats}
            placeholder="e.g. 1"
            onChange={(e) => handleFilterChange("seats", e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
          />
        </div>

        {/* Price Range */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Price Range (₹)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              min="0"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange("priceMin", e.target.value)}
              className="flex-1 px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
            />
            <input
              type="number"
              placeholder="Max ₹"
              min="0"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange("priceMax", e.target.value)}
              className="flex-1 px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
            />
          </div>
        </div>

        {/* Preferences */}
        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Smoking
          </label>
          <select
            value={filters.smoking}
            onChange={(e) => handleFilterChange("smoking", e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
          >
            <option value="">Any</option>
            <option value="allowed">Allowed</option>
            <option value="not-allowed">Not Allowed</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Pets
          </label>
          <select
            value={filters.pets}
            onChange={(e) => handleFilterChange("pets", e.target.value)}
            className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
          >
            <option value="">Any</option>
            <option value="allowed">Allowed</option>
            <option value="not-allowed">Not Allowed</option>
          </select>
        </div>
      </div>
    </div>
  );

  const SortOptions = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#FFFFFF] rounded-2xl p-4 shadow-sm border border-[#E2E8F0]/90">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Sort by:</span>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "departureTime", label: "Departure Time" },
            { key: "pricePerSeat", label: "Price" },
            { key: "availableSeats", label: "Available Seats" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => handleSortChange(option.key)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                filters.sortBy === option.key
                  ? "bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5] font-semibold"
                  : "border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"
              }`}
            >
              {option.label}
              {filters.sortBy === option.key &&
                (filters.sortOrder === "asc" ? (
                  <ChevronUp className="w-3.5 h-3.5 inline ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
                ))}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs font-medium text-[#64748B]">
        Showing <span className="font-bold text-[#0F172A]">{totalRides > 0 ? (currentPage - 1) * 12 + 1 : 0}</span>-
        <span className="font-bold text-[#0F172A]">{Math.min(currentPage * 12, totalRides)}</span> of{" "}
        <span className="font-bold text-[#0F172A]">{totalRides}</span> rides
      </div>
    </div>
  );

  const Pagination = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
        <button
          onClick={() =>
            currentPage > 1 && handleGetRides(currentPage - 1, filters)
          }
          disabled={currentPage === 1}
          className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
          Previous
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => handleGetRides(page, filters)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentPage === page
                  ? "bg-[#EF4444] text-white shadow-sm"
                  : "border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() =>
            currentPage < totalPages && handleGetRides(currentPage + 1, filters)
          }
          disabled={currentPage === totalPages}
          className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:hover:bg-transparent transition-all"
        >
          Next
        </button>
      </div>
    );
  };

  // Loading State
  if (loading && rides.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-20 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]/80 shadow-sm">
            <Loader2 className="w-10 h-10 text-[#EF4444] animate-spin mx-auto" />
            <h2 className="mt-4 text-base font-bold text-[#0F172A]">
              Loading rides data...
            </h2>
            <p className="text-xs text-[#64748B] mt-1">Retrieving scheduled carpooling trips</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && rides.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]/80 shadow-sm">
            <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto mb-3" />
            <h2 className="text-lg font-bold text-[#0F172A] mb-1">
              Unable to load rides
            </h2>
            <p className="text-xs text-[#64748B] mb-4">{error}</p>
            <button
              onClick={() => handleGetRides()}
              className="px-4 py-2 bg-[#EF4444] hover:bg-[#C10500] text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="pt-4 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]">
                  <Car className="w-5 h-5" />
                </span>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
                    Rides Management
                  </h1>
                  <p className="text-[#64748B] text-xs">
                    Monitor, inspect, and manage carpooling trips across all routes
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 shadow-sm ${
                  showFilters
                    ? "bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]"
                    : "bg-[#FFFFFF] text-[#0F172A] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {showFilters ? "Hide Filters" : "Filter Rides"}
              </button>
              {savedRides.length > 0 && (
                <div className="relative">
                  <Heart className="w-5 h-5 text-[#EF4444] fill-red-500" />
                  <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {savedRides.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#FFFFFF] p-4 rounded-2xl shadow-sm border border-[#E2E8F0]/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Total Rides</p>
              <p className="text-2xl font-black text-[#0F172A] mt-0.5">
                {statsData?.upcomingRidesCount || totalRides || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-2xl shadow-sm border border-[#E2E8F0]/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Today's Rides</p>
              <p className="text-2xl font-black text-[#0F172A] mt-0.5">
                {statsData?.todayRidesCount || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-2xl shadow-sm border border-[#E2E8F0]/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Total Capacity</p>
              <p className="text-2xl font-black text-[#0F172A] mt-0.5">{statsData?.totalSeats || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-2xl shadow-sm border border-[#E2E8F0]/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Today's Seats</p>
              <p className="text-2xl font-black text-[#0F172A] mt-0.5">
                {statsData?.totalSeatsForToday || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && <FilterPanel />}

        {/* Sort Options */}
        <SortOptions />

        {/* Rides Grid */}
        {rides.length === 0 ? (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0]/80">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mx-auto mb-4 border border-[#FCA5A5]">
              <Car className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              No rides found
            </h3>
            <p className="text-[#64748B] text-xs mb-4">
              Try adjusting your search criteria or resetting filters
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#EF4444] hover:bg-[#C10500] text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4.5">
              {rides.map((ride) => (
                <RideCard key={ride._id} ride={ride} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pagination />}
          </>
        )}
      </div>

      {/* Ride Detail Modal */}
      {selectedRide && (
        <RideDetailModal
          ride={selectedRide}
          onClose={() => setSelectedRide(null)}
        />
      )}
    </div>
  );
};

export default Rides;
