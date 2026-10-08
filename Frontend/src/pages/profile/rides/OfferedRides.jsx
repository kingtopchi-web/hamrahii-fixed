import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Users,
  DollarSign,
  Navigation2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Target,
  Calendar,
  Clock,
  MapPin,
  Filter,
  IndianRupee,
} from "lucide-react";
import { api } from "../../../services/endpoints";
import Axios from "../../../services/axios";
import { useNavigate } from "react-router-dom";

// RideCard Component
const OfferedRideCard = ({ ride, index, onViewDetails }) => {
  const getRideStatus = () => {
    const now = new Date();
    const departure = new Date(ride.departureTime);
    const diffMs = departure - now;

    if (diffMs > 0) {
      const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
      if (hoursLeft < 24) {
        return {
          color: "bg-[#E10600]",
          bgColor: "bg-gradient-to-r from-red-50 to-orange-50",
          borderColor: "border-[var(--border-subtle)]",
          text: "DEPARTING SOON",
          hours: hoursLeft,
          textColor: "text-[#E10600]",
        };
      }
      return {
        color: "bg-blue-600",
        bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
        borderColor: "border-[var(--border-subtle)]",
        text: "UPCOMING",
        hours: hoursLeft,
        textColor: "text-blue-600",
      };
    }
    return {
      color: "bg-[#B8B8B8]",
      bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
      borderColor: "border-[var(--border-subtle)]",
      text: "COMPLETED",
      hours: 0,
      textColor: "text-[#555555]",
    };
  };

  const getFormattedTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateOccupancy = () => {
    return ((ride.totalSeats - ride.availableSeats) / ride.totalSeats) * 100;
  };

  const getOccupancyColor = (percentage) => {
    if (percentage >= 75) return "bg-[#E10600]";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const status = getRideStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      whileHover={{
        y: -4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
      className="relative group"
    >
      {/* Main Card */}
      <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-subtle)] overflow-hidden transition-all duration-300 group-hover:shadow-md">
        {/* Status Indicator */}
        <div className={`h-1 w-full ${status.color}`} />

        {/* Card Content */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
            {/* Left Section - Route Info */}
            <div className="flex-1">
              {/* Route Header */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3 sm:mb-4">
                {/* Car Image */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg ${status.bgColor} border border-[var(--border-subtle)] overflow-hidden`}
                >
                  {ride?.carDetails?.images?.[0] ? (
                    <img
                      src={
                        import.meta.env.VITE_ASSETS_URL +
                        ride.carDetails.images[0]
                      }
                      className="w-full h-full object-cover"
                      alt="Car"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Car className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {/* Status and Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <div className="flex items-center flex-wrap gap-2">
                      <span
                        className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full ${status.bgColor} ${status.textColor} whitespace-nowrap`}
                      >
                        {status.text}
                      </span>
                      {status.hours < 24 && status.hours > 0 && (
                        <span className="text-xs text-[#555555]">
                          • Departs in {status.hours}h
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Route Title */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#111111] mb-2 sm:mb-3">
                    {ride.from?.city || "Unknown"} →{" "}
                    {ride.to?.city || "Unknown"}
                  </h3>

                  {/* Time and Date - Responsive Layout */}
                  <div className="flex flex-col xs:flex-row xs:flex-wrap gap-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#555555]">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {getFormattedDate(ride.departureTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#555555]">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {getFormattedTime(ride.departureTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#555555]">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {ride.distance?.toFixed(0) || "0"} km
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid - Responsive Layout */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {/* Seats with Progress Bar */}
                <div className="bg-[#F7F7F7] p-2 sm:p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[#B8B8B8] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 sm:p-1.5 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#111111]" />
                      </div>
                      {ride?.isFullSharing ? (
                        "full Vehicle"
                      ) : (
                        <span className="text-xs font-medium text-[#555555]">
                          Seats
                        </span>
                      )}
                    </div>
                    {ride?.isFullSharing ? null : (
                      <span className="text-sm sm:text-base font-bold text-[#111111]">
                        {ride.availableSeats}/{ride.totalSeats}
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getOccupancyColor(calculateOccupancy())}`}
                      style={{ width: `${calculateOccupancy()}%` }}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="bg-[#F7F7F7] p-2 sm:p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[#B8B8B8] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 sm:p-1.5 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
                        <IndianRupee className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#111111]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#555555]">
                          Price
                        </p>
                        <p className="text-[10px] text-[#B8B8B8] hidden xs:block">
                          per seat
                        </p>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#111111]">
                      ₹{ride.pricePerSeat}
                    </span>
                  </div>
                </div>

                {/* Distance */}
                <div className="bg-[#F7F7F7] p-2 sm:p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[#B8B8B8] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 sm:p-1.5 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
                        <Navigation2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#111111]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#555555]">
                          Distance
                        </p>
                        <p className="text-[10px] text-[#B8B8B8] hidden xs:block">
                          kilometers
                        </p>
                      </div>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#111111]">
                      {ride.distance?.toFixed(0) || "0"}
                    </span>
                  </div>
                </div>

                {/* Occupancy Rate */}
                <div className="bg-[#F7F7F7] p-2 sm:p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[#B8B8B8] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 sm:p-1.5 bg-[var(--bg-surface)] rounded-md border border-[var(--border-subtle)]">
                        <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#111111]" />
                      </div>
                      <div>
                        Filled
                        <p className="text-[10px] text-[#B8B8B8] hidden xs:block">
                          rate
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-bold text-[#111111] block">
                        {calculateOccupancy().toFixed(0)}%
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          calculateOccupancy() >= 75
                            ? "text-[#E10600]"
                            : calculateOccupancy() >= 50
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {calculateOccupancy() >= 75
                          ? "High"
                          : calculateOccupancy() >= 50
                            ? "Medium"
                            : "Low"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Action Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0 mt-4 lg:mt-0"
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#d00500" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewDetails?.(ride)}
                className="w-full lg:w-auto bg-[#E10600] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300 justify-center cursor-pointer text-sm sm:text-base"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                View Details
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const OfferedRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    tripType: "",
    search: "",
  });

  const fetchRides = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await Axios.post(api.ride.getOffered, {
          ...filters,
          page,
          limit: pagination.limit,
          userId: localStorage.getItem("userId"),
        });

        setRides(response.data.rides || []);
        setPagination({
          page: response.data.page || 1,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
          limit: pagination.limit,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch rides");
        // console.error("Error fetching rides:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.limit],
  );

  useEffect(() => {
    fetchRides(1);
  }, [fetchRides, filters]);

  const handleSearch = () => {
    fetchRides(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchRides(newPage);
    }
  };

  const handleViewDetails = (ride) => {
    navigate(
      `/my-profile/show-offered-rides-details/${ride?._id}$$$${ride.from?.city}-to-${ride.to.city}`,
    );
  };

  // Loading State
  if (loading && rides.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F7F7F7] rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-[var(--border-subtle)]"
          >
            <Car className="w-8 h-8 sm:w-10 sm:h-10 text-[#E10600]" />
          </motion.div>
          <p className="text-[#555555] font-medium text-sm sm:text-base">
            Loading your rides...
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats for display
  const totalRides = pagination.total || 0;
  const showingFrom = (pagination.page - 1) * pagination.limit + 1;
  const showingTo = Math.min(pagination.page * pagination.limit, totalRides);

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* Header */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8"
          >
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] mb-1 sm:mb-2">
                Offered Rides
              </h1>
              <p className="text-sm sm:text-base text-[#555555]">
                Manage all rides you've offered as a driver
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#d00500" }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => navigate("/offer-ride")}
              className="w-full md:w-auto bg-[#E10600] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer text-sm sm:text-base justify-center"
            >
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
              Offer New Ride
            </motion.button>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Mobile Filter Toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#555555] w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search by city name..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 bg-[#F7F7F7] border border-[var(--border-subtle)] rounded-lg focus:border-[#E10600] focus:outline-none focus:ring-2 focus:ring-red-100 text-sm sm:text-base text-[#111111] placeholder-[#B8B8B8]"
                />
                {filters.search && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, search: "" }))
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#E5E5E5] rounded"
                  >
                    <X className="w-4 h-4 text-[#555555]" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Filters - Responsive */}
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 768) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">
                    <select
                      value={filters.tripType}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          tripType: e.target.value,
                        }))
                      }
                      className="px-3 sm:px-4 py-2 border border-[var(--border-subtle)] rounded-lg text-sm sm:text-base text-[#111111] bg-[var(--bg-surface)] focus:border-[#E10600] focus:outline-none"
                    >
                      <option value="">All Trip Types</option>
                      <option value="one-way">One Way</option>
                      <option value="round-trip">Round Trip</option>
                    </select>

                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-[#F7F7F7] text-[#111111] rounded-lg hover:bg-[#E5E5E5] transition-colors text-sm sm:text-base"
                    >
                      Apply Filters
                    </button>

                    <button
                      onClick={() => {
                        setFilters({ tripType: "", search: "" });
                        setShowFilters(false);
                      }}
                      className="px-4 py-2 text-[#555555] hover:text-[#111111] transition-colors text-sm sm:text-base"
                    >
                      Clear All
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 sm:mb-6"
        >
          <p className="text-sm sm:text-base text-[#555555]">
            {totalRides === 0
              ? "No rides found"
              : `Showing ${showingFrom}-${showingTo} of ${totalRides} rides`}
          </p>
        </motion.div>

        {/* Error State */}
        {error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 sm:py-12 px-4"
          >
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-[#B8B8B8] mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-[#111111] mb-1 sm:mb-2">
              Error Loading Rides
            </h3>
            <p className="text-sm sm:text-base text-[#555555] mb-4 sm:mb-6 max-w-md mx-auto">
              {error}
            </p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#d00500" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchRides(1)}
              className="bg-[#E10600] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium hover:shadow-md transition-shadow text-sm sm:text-base"
            >
              Try Again
            </motion.button>
          </motion.div>
        ) : rides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-16 px-4"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-[#F7F7F7] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-[var(--border-subtle)]">
              <Car className="w-8 h-8 sm:w-12 sm:h-12 text-[#B8B8B8]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#111111] mb-2 sm:mb-3">
              No Rides Offered Yet
            </h3>
            <p className="text-sm sm:text-base text-[#555555] mb-4 sm:mb-6 max-w-md mx-auto">
              {filters.search
                ? "No rides match your search criteria"
                : "Start offering rides to begin your journey"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#d00500" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/offer-ride")}
              className="bg-[#E10600] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 text-sm sm:text-base"
            >
              Offer Your First Ride
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Rides List */}
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence>
                {rides.map((ride, index) => (
                  <OfferedRideCard
                    key={ride._id}
                    ride={ride}
                    index={index}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[var(--border-subtle)]"
              >
                {/* Page Info */}
                <div className="text-sm text-[#555555]">
                  Page {pagination.page} of {pagination.totalPages}
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Previous Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#F7F7F7" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`p-2 rounded-lg border ${
                      pagination.page === 1
                        ? "border-[var(--border-subtle)] text-[#B8B8B8] cursor-not-allowed"
                        : "border-[var(--border-subtle)] text-[#555555] hover:border-[#E10600] hover:text-[#E10600]"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (
                          pagination.page >=
                          pagination.totalPages - 2
                        ) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                              pagination.page === pageNum
                                ? "bg-[#E10600] text-white shadow-sm"
                                : "text-[#555555] hover:bg-[#F7F7F7]"
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      },
                    )}
                  </div>

                  {/* Next Button */}
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "#F7F7F7" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className={`p-2 rounded-lg border ${
                      pagination.page === pagination.totalPages
                        ? "border-[var(--border-subtle)] text-[#B8B8B8] cursor-not-allowed"
                        : "border-[var(--border-subtle)] text-[#555555] hover:border-[#E10600] hover:text-[#E10600]"
                    }`}
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OfferedRides;
