import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Car,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Users,
  Fuel,
  Calendar,
  Settings,
  DollarSign,
  Ban,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import Axios from "../../services/axios";
import { api } from "../../services/api";
import Loader from "../../components/loader/Loader";

export const getCarImageUrl = (carOrPhoto) => {
  if (!carOrPhoto) return "/default-car.svg";

  let photoUrl = "";
  if (typeof carOrPhoto === "string") {
    photoUrl = carOrPhoto;
  } else if (Array.isArray(carOrPhoto?.images) && carOrPhoto.images.length > 0) {
    const first = carOrPhoto.images[0];
    photoUrl = typeof first === "string" ? first : (first?.url || first?.path || "");
  } else if (typeof carOrPhoto?.image === "string") {
    photoUrl = carOrPhoto.image;
  } else if (typeof carOrPhoto?.plateImage === "string") {
    photoUrl = carOrPhoto.plateImage;
  } else if (carOrPhoto?.url) {
    photoUrl = carOrPhoto.url;
  }

  if (!photoUrl || typeof photoUrl !== "string" || !photoUrl.trim()) {
    if (carOrPhoto?.plateImage && typeof carOrPhoto.plateImage === "string") {
      photoUrl = carOrPhoto.plateImage.trim();
    } else {
      return "/default-car.svg";
    }
  }

  const clean = photoUrl.trim();
  if (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("data:") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }

  if (clean.startsWith("/vehicles/")) {
    return clean;
  }

  const rawBase = (import.meta.env.VITE_ASSETS_URL || "http://localhost:9898").trim().replace(/\/$/, "");
  let baseUrl = rawBase;
  if (typeof window !== "undefined" && window.location.protocol === "https:" && baseUrl.startsWith("http://localhost")) {
    baseUrl = "https://server.humrahii.com";
  }

  const normalized = clean.startsWith("/") ? clean : `/${clean}`;
  return `${baseUrl}${normalized}`;
};


const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCarForReject, setSelectedCarForReject] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    bodyType: "",
    financed: "",
    status: "",
    seat: "",
  });

  // Available options for filters (you can fetch these from API)
  const filterOptions = {
    bodyTypes: [
      "SUV",
      "Sedan",
      "Hatchback",
      "Coupe",
      "Convertible",
      "Truck",
      "Van",
      "Minivan",
    ],
    financedOptions: ["true", "false"],
    statusOptions: ["pending", "approved", "rejected"],
    seats: [2, 4, 5, 6, 7, 8],
  };

  useEffect(() => {
    if (!filters.search) fetchCars();
    if (filters.search?.length > 0) {
    } else {
      fetchCars();
    }
  }, [currentPage, filters.status, filters.seat, filters.search]);

  useEffect(() => {
    if (!filters.search) return;

    const timer = setTimeout(() => {
      fetchCars();
    }, 800);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const adminId =
        localStorage.getItem("adminId") || sessionStorage.getItem("adminId");

      // Prepare request payload
      const payload = {
        adminId,
        page: currentPage,
        limit,
      };

      // Add filters if they exist
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          payload[key] = filters[key];
        }
      });

      // Special handling for financed filter
      if (filters.financed) {
        payload.financed = filters.financed === "true";
      }

      // console.log("Fetching cars with payload:", payload);

      const response = await Axios.post(api.car.getAllCars, payload);

      // console.log("Cars API Response:", response);

      if (response?.data?.success) {
        setCars(response.data.data || []);
        setTotalRecords(response.data.pagination?.totalRecords || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        toast.error(response?.data?.message || "Failed to fetch cars");
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error(error.response?.data?.message || "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (carId, newStatus, reason = "") => {
    try {
      const adminId =
        localStorage.getItem("adminId") || sessionStorage.getItem("adminId");

      const payload = {
        adminId,
        carId,
        status: newStatus,
      };

      // Add rejection reason if provided
      if (newStatus === "rejected" && reason) {
        payload.rejectionReason = reason;
      }

      // console.log("Updating car status with payload:", payload);

      const response = await Axios.post(api.car.updateCarStatus, payload);

      // console.log("Status update response:", response);

      if (response?.data?.success) {
        const actionText = newStatus === "approved" ? "approved" : "rejected";
        toast.success(`Car ${actionText} successfully`);

        // Update local state
        setCars((prevCars) =>
          prevCars.map((car) =>
            car._id === carId
              ? {
                  ...car,
                  status: newStatus,
                  ...(newStatus === "rejected" && { rejectionReason: reason }),
                }
              : car,
          ),
        );

        if (selectedCar && selectedCar._id === carId) {
          setSelectedCar((prev) => ({
            ...prev,
            status: newStatus,
            ...(newStatus === "rejected" && { rejectionReason: reason }),
          }));
        }

        // Close modals if open
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedCarForReject(null);
      } else {
        toast.error(response?.data?.message || "Failed to update car status");
      }
    } catch (error) {
      // console.error("Error updating car status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update car status",
      );
    }
  };

  const handleApproveCar = async (carId) => {
    if (!window.confirm("Are you sure you want to approve this car?")) return;
    await handleStatusChange(carId, "approved");
  };

  const handleRejectCar = (car) => {
    setSelectedCarForReject(car);
    setShowRejectModal(true);
  };

  const handleRejectWithReason = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    if (!window.confirm("Are you sure you want to reject this car?")) return;

    await handleStatusChange(
      selectedCarForReject._id,
      "rejected",
      rejectionReason.trim(),
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      bodyType: "",
      financed: "",
      status: "",
      seat: "",
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "approved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
        Pending Review
      </span>
    );
  };

  const handleExportData = () => {
    // Implement export functionality
    toast.info("Export feature coming soon!");
  };

  const handleViewCarDetails = (car) => {
    setSelectedCar(car);
  };

  const handleCloseModal = () => {
    setSelectedCar(null);
  };

  const handleRefresh = () => {
    fetchCars();
    toast.info("Refreshing car list...");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse"></span>
                  FLEET DIRECTORY
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
                Vehicles Management
              </h1>
              <p className="text-[#64748B] text-xs sm:text-sm font-medium mt-1">
                Manage, verify, and review all driver-registered vehicle applications and documents
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E2E8F0]/90 bg-[#FFFFFF] rounded-xl hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] transition-all shadow-card-subtle hover:text-[#EF4444] cursor-pointer"
                title="Refresh"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-3.5 py-2.5 border border-[#E2E8F0]/90 bg-[#FFFFFF] rounded-xl hover:bg-[#F8FAFC] text-xs font-bold text-[#0F172A] transition-all shadow-card-subtle hover:text-[#EF4444] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-card-subtle border cursor-pointer ${
                  showFilters
                    ? "bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]"
                    : "bg-[#FFFFFF] text-[#0F172A] border-[#E2E8F0]/90 hover:bg-[#F8FAFC]"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{showFilters ? "Hide Filters" : "Filters"}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total Vehicles",
                value: totalRecords,
                icon: <Car className="w-6 h-6" />,
                bg: "bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]",
              },
              {
                label: "Pending Review",
                value: cars.filter((c) => c.status === "pending").length,
                icon: <Clock className="w-6 h-6" />,
                bg: "bg-[#FFFBEB] text-[#F59E0B] border border-amber-100",
              },
              {
                label: "Approved",
                value: cars.filter((c) => c.status === "approved").length,
                icon: <CheckCircle className="w-6 h-6" />,
                bg: "bg-[#ECFDF5] text-emerald-600 border border-emerald-100",
              },
              {
                label: "Rejected",
                value: cars.filter((c) => c.status === "rejected").length,
                icon: <XCircle className="w-6 h-6" />,
                bg: "bg-rose-50 text-rose-600 border border-rose-100",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-[#FFFFFF] rounded-3xl p-6 shadow-card-subtle hover:shadow-card-hover border border-[#E2E8F0] transition-all flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  {stat.icon}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-[#FFFFFF] rounded-3xl p-6 mb-6 shadow-card-subtle border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#EF4444]" />
                Filter Vehicles
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#EF4444] hover:text-[#C10500] cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-[#94A3B8] hover:text-[#475569] rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search model or plate..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  {filterOptions.statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seats Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Seats
                </label>
                <select
                  value={filters.seat}
                  onChange={(e) => handleFilterChange("seat", e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all cursor-pointer"
                >
                  <option value="">All Seats</option>
                  {filterOptions.seats.map((seat) => (
                    <option key={seat} value={seat}>
                      {seat} Seats
                    </option>
                  ))}
                </select>
              </div>

              {/* Body Type Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Body Type
                </label>
                <select
                  value={filters.bodyType}
                  onChange={(e) =>
                    handleFilterChange("bodyType", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all cursor-pointer"
                >
                  <option value="">All Types</option>
                  {filterOptions.bodyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Cars Table */}
        <div className="bg-[#FFFFFF] rounded-3xl shadow-card-subtle border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/80">
              <thead className="bg-[#F8FAFC]/75">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider"
                  >
                    Vehicle Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider"
                  >
                    Specifications
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-bold text-[#64748B] uppercase tracking-wider"
                  >
                    Owner Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3.5 text-right text-xs font-bold text-[#64748B] uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#FFFFFF] divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader />
                        <p className="text-xs text-[#64748B] mt-2">Loading vehicles catalog...</p>
                      </div>
                    </td>
                  </tr>
                ) : cars.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mb-3 border border-[#FCA5A5]">
                          <Car className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-[#0F172A]">No vehicles found</p>
                        <p className="text-xs text-[#64748B] mt-1">
                          Try adjusting search keywords or resetting filters
                        </p>
                        <button
                          onClick={clearFilters}
                          className="mt-4 px-4 py-2 bg-[#EF4444] hover:bg-[#C10500] text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cars.map((car) => (
                    <tr key={car._id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Car Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-14 w-20 flex-shrink-0 bg-[#F8FAFC] rounded-xl p-0.5 border border-[#E2E8F0]/80 overflow-hidden flex items-center justify-center">
                            <img
                              className="h-full w-full rounded-lg object-cover"
                              src={getCarImageUrl(car.images?.[0])}
                              alt={`${car.brand} ${car.model}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-car.svg";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-[#0F172A]">
                              {car.brand} {car.model}
                              {car.year && <span className="ml-1.5 text-xs font-normal text-[#64748B]">({car.year})</span>}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="font-mono text-xs px-2 py-0.5 bg-[#F8FAFC] text-[#0F172A] rounded-md font-semibold border border-[#E2E8F0]">
                                {car.plateNumber || "NO-PLATE"}
                              </span>
                              {car.bodyType && (
                                <span className="text-[11px] text-[#64748B]">
                                  {car.bodyType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specifications */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-[#F8FAFC] text-[#0F172A] rounded-md">
                            <Users className="w-3 h-3 text-[#94A3B8]" />
                            {car.seats || 4} seats
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-[#F8FAFC] text-[#0F172A] rounded-md capitalize">
                            <Fuel className="w-3 h-3 text-[#94A3B8]" />
                            {car.fuelType || "Petrol"}
                          </span>
                          {car.transmission && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 bg-[#F8FAFC] text-[#0F172A] rounded-md capitalize">
                              <Settings className="w-3 h-3 text-[#94A3B8]" />
                              {car.transmission}
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                            car.financed ? "bg-[#FFFBEB] text-amber-700 border border-amber-200" : "bg-[#F8FAFC] text-[#475569]"
                          }`}>
                            <DollarSign className="w-3 h-3" />
                            {car.financed ? "Financed" : "Owned"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(car.status)}
                          {car.status === "rejected" && car.rejectionReason && (
                            <span className="text-[11px] text-rose-600 font-medium max-w-xs truncate" title={car.rejectionReason}>
                              Reason: {car.rejectionReason}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-[#0F172A]">
                          {[car.owner?.firstName, car.owner?.lastName].filter(Boolean).join(" ") ||
                            car.owner?.name ||
                            "N/A"}
                        </div>
                        <div className="text-[11px] text-[#64748B] truncate max-w-[160px]">
                          {car.owner?.email || "N/A"}
                        </div>
                        {car.owner?.phone && (
                          <div className="text-[11px] text-[#64748B] font-mono">
                            {car.owner?.phone}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewCarDetails(car)}
                            className="p-1.5 text-[#475569] hover:text-[#EF4444] hover:bg-[#FEF2F2] border border-[#E2E8F0] rounded-xl transition-all shadow-sm"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Status Actions */}
                          {car.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApproveCar(car._id)}
                                className="p-1.5 text-[#10B981] hover:bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl transition-all shadow-sm"
                                title="Approve Vehicle"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectCar(car)}
                                className="p-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all shadow-sm"
                                title="Reject Vehicle"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : car.status === "approved" ? (
                            <button
                              onClick={() => handleRejectCar(car)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all shadow-sm"
                              title="Revoke / Reject Vehicle"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveCar(car._id)}
                              className="p-1.5 text-emerald-600 hover:bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl transition-all shadow-sm"
                              title="Re-approve Vehicle"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {cars.length > 0 && (
            <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-[#64748B]">
                  Showing{" "}
                  <span className="font-bold text-[#0F172A]">
                    {(currentPage - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-[#0F172A]">
                    {Math.min(currentPage * limit, totalRecords)}
                  </span>{" "}
                  of <span className="font-bold text-[#0F172A]">{totalRecords}</span> vehicles
                </div>

                <div className="flex items-center gap-1.5 justify-center">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFC] transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentPage === pageNum
                            ? "bg-[#EF4444] text-white shadow-sm"
                            : "border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-1 text-xs text-[#94A3B8]">...</span>
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFC] transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && selectedCarForReject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FFFFFF] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Reject Car: {selectedCarForReject.brand}{" "}
                {selectedCarForReject.model}
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedCarForReject(null);
                }}
                className="text-[#94A3B8] hover:text-[#475569] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-xs text-[#64748B] mb-4 font-medium">
                Please provide a reason for rejecting this car. This will be
                visible to the car owner.
              </p>

              <label className="block text-xs font-bold text-[#0F172A] mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
                rows="4"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedCarForReject(null);
                }}
                className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A] rounded-xl text-xs font-bold hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectWithReason}
                disabled={!rejectionReason.trim()}
                className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  rejectionReason.trim()
                    ? "bg-gradient-to-r from-[#E10600] to-[#FF3B30] hover:from-[#c50500] hover:to-[#e6352b] text-white"
                    : "bg-red-200 text-white cursor-not-allowed"
                }`}
              >
                Confirm Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Car Details Modal */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FFFFFF] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[#E2E8F0]"
          >
            <div className="p-6 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0F172A]">
                  {selectedCar.brand} {selectedCar.model} ({selectedCar.year})
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-[#94A3B8] hover:text-[#475569]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[70vh] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Car Images */}
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                    Car Images
                  </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedCar.images?.length > 0 ? (
                      selectedCar.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-lg overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center"
                        >
                          <img
                            src={getCarImageUrl(img)}
                            alt={`Car view ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-car.svg";
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8">
                        <img
                          src="/default-car.svg"
                          alt="No images"
                          className="w-16 h-16 mx-auto mb-3 opacity-60"
                        />
                        <p className="text-[#64748B]">No images available for this car</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                    Verification Actions
                  </h3>
                  <div className="space-y-3">
                    {selectedCar.status !== "approved" && (
                      <button
                        onClick={() => handleApproveCar(selectedCar._id)}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        Approve Car
                      </button>
                    )}

                    {selectedCar.status !== "rejected" && (
                      <button
                        onClick={() => {
                          handleCloseModal();
                          handleRejectCar(selectedCar);
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-[#DC2626] hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                      >
                        <ShieldAlert className="w-5 h-5" />
                        Reject Car
                      </button>
                    )}

                    <button
                      onClick={handleCloseModal}
                      className="w-full flex items-center justify-center gap-2 border border-[#CBD5E1] hover:border-gray-400 text-[#0F172A] px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Car Details */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Vehicle Info */}
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <h4 className="font-semibold text-[#0F172A] mb-3">
                    Vehicle Information
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Brand", value: selectedCar.brand },
                      { label: "Model", value: selectedCar.model },
                      { label: "Year", value: selectedCar.year },
                      { label: "Color", value: selectedCar.color || "N/A" },
                      {
                        label: "Body Type",
                        value: selectedCar.body_type || "N/A",
                      },
                      {
                        label: "Plate Number",
                        value: selectedCar.plateNumber || "N/A",
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-[#475569]">{item.label}:</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <h4 className="font-semibold text-[#0F172A] mb-3">
                    Technical Specifications
                  </h4>
                  <div className="space-y-2">
                    {[
                      { label: "Seats", value: selectedCar.seats || "N/A" },
                      {
                        label: "Fuel Type",
                        value: selectedCar.fuelType || "N/A",
                      },
                      {
                        label: "Transmission",
                        value: selectedCar.transmission || "N/A",
                      },
                      {
                        label: "Financed",
                        value: selectedCar.financed ? "Yes" : "No",
                      },
                      {
                        label: "Created",
                        value: new Date(
                          selectedCar.createdAt,
                        ).toLocaleDateString(),
                      },
                      {
                        label: "Updated",
                        value: new Date(
                          selectedCar.updatedAt,
                        ).toLocaleDateString(),
                      },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-[#475569]">{item.label}:</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status & Owner Info */}
                <div className="bg-[#F8FAFC] rounded-lg p-4">
                  <h4 className="font-semibold text-[#0F172A] mb-3">
                    Status & Owner Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#475569]">Status:</span>
                      {getStatusBadge(selectedCar.status)}
                    </div>
                    {selectedCar.rejectionReason && (
                      <div className="pt-2">
                        <span className="text-[#475569] block mb-1">
                          Rejection Reason:
                        </span>
                        <span className="text-[#DC2626] font-medium">
                          {selectedCar.rejectionReason}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[#E2E8F0]">
                      <div className="text-[#475569] mb-1">Owner:</div>
                      <div className="font-medium">
                        {[selectedCar.owner?.firstName, selectedCar.owner?.lastName].filter(Boolean).join(" ") ||
                          selectedCar.owner?.name ||
                          "N/A"}
                      </div>
                      <div className="text-sm text-[#64748B]">
                        {selectedCar.owner?.email || "N/A"}
                      </div>
                      <div className="text-sm text-[#64748B]">
                        {selectedCar.owner?.phone || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cars;
