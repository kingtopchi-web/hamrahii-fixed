import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Car,
  Fuel,
  Users,
  Settings,
  Calendar,
  Shield,
  Trash2,
  Eye,
  Star,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { toast } from "react-toastify";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCarImageUrl, getPlateImageUrl } from "../../utils/profileImageHelper";

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const user = useSelector(state => state.user)

  const carsPerPage = 6;

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await Axios.get(api.car.getByUser);
      if (res?.data?.success) {
        setCars(res?.data?.cars);
      }
    } catch (error) {
      // console.error("Fetch cars error:", error);
      // toast.error("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    
    try {
      const res = await Axios.post(api.car.deactivate, { carId });
      if (res?.data?.success) {
        toast.success("vehicle deleted successfully");
        setCars(prev => prev.filter(car => car._id !== carId));
      }
    } catch (error) {
      toast.error("Failed to delete vehicle");
    }
  };

  const getFuelIcon = (fuelType) => {
    const fuelIcons = {
      petrol: "⛽",
      diesel: "⛽",
      electric: "🔋",
      hybrid: "⚡",
      cng: "♻️",
    };
    return fuelIcons[fuelType] || "⛽";
  };

  const getStatusBadge = (car) => {
    if (car.isDeleted) {
      return {
        text: "Deleted",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
      };
    }
    return {
      text: "Active",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
    };
  };

  // Pagination calculations
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = cars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(cars.length / carsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#F7F7F7] rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-pulse">
                <div className="h-40 sm:h-48 bg-gray-300 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-300 rounded flex-1"></div>
                  <div className="h-8 bg-gray-300 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#E10600]/10 rounded-lg">
                <Car className="w-6 h-6 sm:w-8 sm:h-8 text-[#E10600]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111111]">My vehicle</h1>
                <p className="text-xs sm:text-sm text-[#555555] mt-0.5 sm:mt-1">
                  Manage your vehicle fleet ({cars.length} {cars.length === 1 ? 'vehicle' : 'vehicles'})
                </p>
              </div>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3">
              {/* View Toggle for Desktop */}
              <div className="hidden sm:flex bg-[#F7F7F7] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-[var(--bg-surface)] shadow-sm text-[#E10600]' 
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-[var(--bg-surface)] shadow-sm text-[#E10600]' 
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  List
                </button>
              </div>

              <Link
                to={user?.dlVerified || sessionStorage.getItem("dlSkipped") === "true" ? "/my-profile/add-car": "/my-profile/verify-driving-license"}
                className="bg-[#E10600] hover:bg-[#C10500] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                <Car className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add New vehicle</span>
              </Link>
            </div>
          </div>

          {/* View Toggle for Mobile */}
          <div className="sm:hidden flex bg-[#F7F7F7] rounded-lg p-1 w-fit mb-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[var(--bg-surface)] shadow-sm text-[#E10600]' 
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[var(--bg-surface)] shadow-sm text-[#E10600]' 
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              List View
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: "Total vehicle", value: cars.length },
            { label: "Active vehicle", value: cars.filter(c => !c.isDeleted).length },
            { 
              label: "Avg. Year", 
              value: cars.length > 0 
                ? Math.round(cars.reduce((sum, car) => sum + car.year, 0) / cars.length)
                : '-'
            },
            { label: "Total Seats", value: cars.reduce((sum, car) => sum + car.seats, 0) }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-[#F7F7F7] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[var(--border-subtle)]"
            >
              <p className="text-xs sm:text-sm text-[#555555] mb-1 truncate">{stat.label}</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#111111]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Cars Display */}
        {cars.length === 0 ? (
          <div className="text-center py-8 sm:py-16">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-[#F7F7F7] rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <Car className="w-8 h-8 sm:w-12 sm:h-12 text-[#B8B8B8]" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#111111] mb-2">
              No vehicle yet
            </h3>
            <p className="text-sm sm:text-base text-[#555555] mb-6 max-w-md mx-auto px-4">
              You haven't added any vehicle to your fleet yet. Add your first vehicle to get started.
            </p>
            <Link
               to={user?.dlVerified || sessionStorage.getItem("dlSkipped") === "true" ? "/my-profile/add-car": "/my-profile/verify-driving-license"}
              className="inline-flex bg-[#E10600] hover:bg-[#C10500] text-white px-6 py-3 rounded-xl font-medium items-center gap-2 transition-colors text-sm sm:text-base"
            >
              <Car className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Your First vehicle
            </Link>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentCars.map((car, index) => {
                  const status = getStatusBadge(car);
                  
                  return (
                    <motion.div
                      key={car._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#F7F7F7] rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--border-subtle)] hover:shadow-lg transition-shadow group"
                    >
                      {/* Status Badge */}
                      <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 ${status.color} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 z-10`}>
                        {status.icon}
                        <span className="hidden xs:inline">{status.text}</span>
                      </div>

                      {/* Car Image */}
                      <div className="relative h-36 sm:h-40 md:h-48 overflow-hidden">
                        <img
                          src={getCarImageUrl(car.images?.[0])}
                          alt={`${car.brand || "Vehicle"} ${car.model || ""}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-car.svg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        
                        {/* Image Count */}
                        {car.images?.length > 0 && (
                          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/60 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                            {car.images.length} {window.innerWidth < 640 ? '📷' : 'photos'}
                          </div>
                        )}
                      </div>

                      {/* Car Details */}
                      <div className="p-3 sm:p-4 md:p-5">
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-[#111111] truncate">
                              {car.brand} {car.model}
                            </h3>
                            <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#555555]" />
                              <span className="text-xs sm:text-sm text-[#555555]">
                                {car.year} • {car.transmission}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right ml-2">
                            <div className="flex items-center gap-1 text-[#555555] justify-end">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs">{car.seats} seats</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#555555] mt-0.5 sm:mt-1 justify-end">
                              <span className="text-sm">{getFuelIcon(car.fuelType)}</span>
                              <span className="text-xs capitalize truncate">{car.fuelType}</span>
                            </div>
                          </div>
                        </div>

                        {/* Plate Number */}
                        <div className="bg-[var(--bg-surface)] rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 border border-[var(--border-subtle)]">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-xs text-[#555555]">RC Number</p>
                              <p className="font-mono font-bold text-sm sm:text-base text-[#111111] truncate">
                                {car.plateNumber}
                              </p>
                            </div>
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#E10600] flex-shrink-0" />
                          </div>
                        </div>

                        {/* Car Specs - Hidden on very small screens */}
                        <div className="hidden xs:grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                          <div className="bg-[var(--bg-surface)] rounded-lg p-2 sm:p-3 border border-[var(--border-subtle)]">
                            <p className="text-xs text-[#555555] mb-1">Transmission</p>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-[#555555]" />
                              <span className="text-xs sm:text-sm font-medium capitalize truncate">
                                {car.transmission}
                              </span>
                            </div>
                          </div>
                          <div className="bg-[var(--bg-surface)] rounded-lg p-2 sm:p-3 border border-[var(--border-subtle)]">
                            <p className="text-xs text-[#555555] mb-1">Fuel Type</p>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-sm sm:text-lg">{getFuelIcon(car.fuelType)}</span>
                              <span className="text-xs sm:text-sm font-medium capitalize truncate">
                                {car.fuelType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedCar(car)}
                            className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#E10600] hover:bg-[#E10600]/5 text-[#111111] py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car._id)}
                            disabled={car.isDeleted}
                            className={`flex-1 border py-1.5 sm:py-2 rounded-lg font-medium flex items-center justify-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm ${
                              car.isDeleted
                                ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                                : "border-red-300 hover:border-red-500 hover:bg-red-50 text-red-600"
                            }`}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3 sm:space-y-4">
                {currentCars.map((car, index) => {
                  const status = getStatusBadge(car);
                  
                  return (
                    <motion.div
                      key={car._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#F7F7F7] rounded-xl overflow-hidden border border-[var(--border-subtle)] hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Car Image */}
                        <div className="relative h-40 sm:h-48 sm:w-48 md:w-56 flex-shrink-0">
                          <img
                            src={getCarImageUrl(car.images?.[0])}
                            alt={`${car.brand || "Vehicle"} ${car.model || ""}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/default-car.svg";
                            }}
                          />
                          <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 ${status.color} px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 z-10`}>
                            {status.icon}
                            <span>{status.text}</span>
                          </div>
                        </div>

                        {/* Car Details */}
                        <div className="flex-1 p-3 sm:p-4 md:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4">
                            <div className="mb-3 sm:mb-0">
                              <h3 className="text-lg sm:text-xl font-bold text-[#111111] mb-1">
                                {car.brand} {car.model}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-[#555555] mb-2">
                                <Calendar className="w-4 h-4" />
                                <span>{car.year} • {car.transmission}</span>
                              </div>
                              <div className="bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border-subtle)] inline-block">
                                <p className="text-xs text-[#555555]">RC Number</p>
                                <p className="font-mono font-bold text-[#111111]">{car.plateNumber}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:items-end gap-2">
                              <div className="flex items-center gap-4 text-sm text-[#555555]">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{car.seats} seats</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-lg">{getFuelIcon(car.fuelType)}</span>
                                  <span className="capitalize">{car.fuelType}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Specifications */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 sm:mb-5">
                            <div className="bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border-subtle)]">
                              <p className="text-xs text-[#555555] mb-1">Transmission</p>
                              <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 text-[#555555]" />
                                <span className="font-medium capitalize">{car.transmission}</span>
                              </div>
                            </div>
                            <div className="bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border-subtle)]">
                              <p className="text-xs text-[#555555] mb-1">Fuel Type</p>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getFuelIcon(car.fuelType)}</span>
                                <span className="font-medium capitalize">{car.fuelType}</span>
                              </div>
                            </div>
                            <div className="col-span-2 sm:col-span-1 bg-[var(--bg-surface)] rounded-lg p-3 border border-[var(--border-subtle)]">
                              <p className="text-xs text-[#555555] mb-1">Status</p>
                              <div className="flex items-center gap-2">
                                {status.icon}
                                <span className="font-medium capitalize">{status.text}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 sm:gap-3">
                            <button
                              onClick={() => setSelectedCar(car)}
                              className="flex-1 sm:flex-none sm:w-32 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#E10600] hover:bg-[#E10600]/5 text-[#111111] py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car._id)}
                              disabled={car.isDeleted}
                              className={`flex-1 sm:flex-none sm:w-32 border py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm ${
                                car.isDeleted
                                  ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                                  : "border-red-300 hover:border-red-500 hover:bg-red-50 text-red-600"
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete vehicle
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[var(--border-subtle)]">
                <div className="text-sm text-[#555555]">
                  Showing {indexOfFirstCar + 1}-{Math.min(indexOfLastCar, cars.length)} of {cars.length} vehicles
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
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
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-sm sm:text-base ${
                          currentPage === pageNum
                            ? 'bg-[#E10600] text-white'
                            : 'text-[#555555] hover:bg-[#F7F7F7]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-lg border border-[var(--border-subtle)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F7F7F7] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Car Details Modal - Responsive */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#FFFFFF] rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden hide-scrollbar"
          >
            <div className="p-4 sm:p-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#111111] truncate">
                  {selectedCar.brand} {selectedCar.model}
                </h2>
                <button
                  onClick={() => setSelectedCar(null)}
                  className="p-1 sm:p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#555555]" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] sm:max-h-[70vh] p-3 sm:p-4 md:p-6 hide-scrollbar">
              {/* Car Images Gallery */}
              {selectedCar.images && selectedCar.images.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-[#111111] mb-3 sm:mb-4">
                   vehicle Images
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {selectedCar.images.slice(0, 6).map((img, idx) => (
                      <div key={idx} className="aspect-square rounded-lg sm:rounded-xl overflow-hidden">
                        <img
                          src={getCarImageUrl(img)}
                          alt={`Car view ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-car.svg";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plate Image */}
              {selectedCar.plateImage && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-[#111111] mb-3 sm:mb-4">
                    License Plate
                  </h3>
                  <div className="bg-[#F7F7F7] rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
                      <div className="flex-1">
                        <img
                          src={getPlateImageUrl(selectedCar.plateImage)}
                          alt="License plate"
                          className="w-full max-w-xs mx-auto h-32 sm:h-48 object-contain"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-car.svg";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="bg-[var(--bg-surface)] rounded-lg p-3 sm:p-4 border border-[var(--border-subtle)]">
                          <p className="text-xs sm:text-sm text-[#555555] mb-1 sm:mb-2">
                            Registered RC Number
                          </p>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-[#111111]">
                            {selectedCar.plateNumber}
                          </p>
                        </div>
                        <div className="mt-3 sm:mt-4">
                          <p className="text-xs sm:text-sm text-[#555555]">
                            This plate has been verified and registered in our system.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Car Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-[#F7F7F7] rounded-lg sm:rounded-xl p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-[#111111] mb-3 sm:mb-4">
                    Vehicle Information
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Brand</span>
                      <span className="font-medium">{selectedCar.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Model</span>
                      <span className="font-medium">{selectedCar.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Year</span>
                      <span className="font-medium">{selectedCar.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Seats</span>
                      <span className="font-medium">{selectedCar.seats} seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Verifed</span>
                      <span className="font-medium">{selectedCar.status}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-lg sm:rounded-xl p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold text-[#111111] mb-3 sm:mb-4">
                    Technical Specifications
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Fuel Type</span>
                      <span className="font-medium capitalize">{selectedCar.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Transmission</span>
                      <span className="font-medium capitalize">{selectedCar.transmission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        selectedCar.isDeleted 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {selectedCar.isDeleted ? "Deleted" : "Active"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#555555]">Added On</span>
                      <span className="font-medium">
                        {new Date(selectedCar.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-1   border-t border-[var(--border-subtle)] bg-[#F7F7F7] flex justify-end">
              <div className=" ">
                <button
                  onClick={() => setSelectedCar(null)}
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#111111] text-[#111111] py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base px-10 mb-10 items-center"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cars;