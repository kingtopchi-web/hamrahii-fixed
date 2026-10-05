import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  AlertCircle,
  Loader2,
  Eye,
  MoreVertical,
  ChevronsUpDown,
} from "lucide-react";
import Axios from "../../services/axios";
import { api } from "../../services/api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const getVehicleTypeImageUrl = (img) => {
  if (!img || typeof img !== "string" || !img.trim()) return "/default-car.svg";
  const clean = img.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
    return clean;
  }
  // Try local first if clean starts with /vehicles/
  if (clean.startsWith("/vehicles/")) {
    return clean;
  }
  const baseUrl = (import.meta.env.VITE_ASSETS_URL || "http://localhost:9898").trim().replace(/\/$/, "");
  const normalized = clean.startsWith("/") ? clean : `/${clean}`;
  return `${baseUrl}${normalized}`;
};


const ShowVehicleType = () => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedType, setSelectedType] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'name'
  const navigate = useNavigate();

  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await Axios.post(api.vehicleType.getVehicleType);
      // console.log("API Response:", res.data)

      // Try different possible response structures
      let vehicleData = [];

      if (Array.isArray(res.data)) {
        vehicleData = res.data;
      } else if (res.data?.vehicleTypes) {
        vehicleData = res.data.vehicleTypes;
      } else if (res.data?.vehicleType) {
        vehicleData = res.data.vehicleType;
      } else if (res.data?.data) {
        vehicleData = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
      } else if (res.data?.vehicle) {
        vehicleData = res.data.vehicle;
      }

      // console.log("Processed vehicle data:", vehicleData)
      setVehicleTypes(vehicleData || []);
    } catch (error) {
      // console.error("Fetch error:", error)
      setError(
        "Failed to fetch vehicle types: " +
          (error.response?.data?.message || error.message),
      );
      setVehicleTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await Axios.post(api.vehicleType.deleteVehicleRide, {
        vehicleTypeId: id,
      });
      setVehicleTypes((prev) => prev.filter((item) => item._id !== id));
      setShowDeleteModal(false);
    } catch (error) {
      // console.error('Delete error:', error)
      setError(
        "Failed to delete vehicle type: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Filter and sort vehicle types
  const filteredVehicleTypes = vehicleTypes
    .filter((vehicle) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        vehicle.type?.toLowerCase().includes(searchLower) ||
        vehicle.description?.toLowerCase().includes(searchLower) ||
        vehicle._id?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "name":
          return (a.type || "").localeCompare(b.type || "");
        default:
          return 0;
      }
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    hover: {
      scale: 1.02,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    tap: { scale: 0.98 },
  };

  const handleRefresh = () => {
    fetchVehicleTypes();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#3B82F6] animate-spin mx-auto mb-4" />
          <p className="text-[#475569]">Loading vehicle types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="w-8 h-8 text-[#3B82F6]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#0F172A]">
                    Vehicle Types
                  </h1>
                  <p className="text-[#475569] mt-1">
                    Manage your vehicle categories and types
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#64748B]">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {vehicleTypes.length} types
                </span>
                <span>•</span>
                <span>Showing: {filteredVehicleTypes.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="px-4 py-2 bg-[#F8FAFC] text-[#0F172A] rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4" />
                Refresh
              </motion.button>
              <Link to="/admin/create-vehicle-type">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Create Vehicle Type
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-[#DC2626] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-red-700 font-medium">Error</span>
                  <p className="text-[#DC2626] text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-[#DC2626]"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search and Controls */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="bg-[#FFFFFF] rounded-2xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search by type, description, or ID..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-[#FFFFFF] shadow"
                      : "hover:bg-gray-200"
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
                {/* <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                        viewMode === 'list' 
                                            ? 'bg-[#FFFFFF] shadow' 
                                            : 'hover:bg-gray-200'
                                    }`}
                                    title="List View"
                                >
                                    <List className="w-5 h-5" />
                                </button> */}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {filteredVehicleTypes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
                {vehicleTypes.length === 0
                  ? "No vehicle types yet"
                  : "No matches found"}
              </h3>
              <p className="text-[#64748B] mb-6">
                {searchTerm
                  ? `No results for "${searchTerm}". Try a different search term.`
                  : "Get started by creating your first vehicle type."}
              </p>
              {!searchTerm && (
                <Link to="/admin/create-vehicle-type">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200">
                    Create Vehicle Type
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : viewMode === "grid" ? (
          // Grid View
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVehicleTypes.map((vehicleType) => (
              <motion.div
                key={vehicleType._id || vehicleType.id}
                onClick={(e) =>
                  navigate("/admin/add-pricing-slabs-vehicly-type", {
                    state: {
                      vehicleType,
                    },
                  })
                }
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                className="bg-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0]"
              >
                {/* Image Section */}
                <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                  {vehicleType.image ? (
                    <img
                      src={getVehicleTypeImageUrl(vehicleType.image)}
                      alt={vehicleType.type}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        const cur = e.target.src;
                        if (!cur.includes("/default-car.svg")) {
                          e.target.src = "/default-car.svg";
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#0F172A] mb-1">
                        {vehicleType.type || "Unnamed Type"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Active
                        </span>
                        {vehicleType._id && (
                          <span className="text-xs text-[#64748B]">
                            ID: {vehicleType._id.slice(-6)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="text-[#94A3B8] hover:text-[#475569]">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {vehicleType.description && (
                    <p className="text-[#475569] text-sm mb-4 line-clamp-2">
                      {vehicleType.description}
                    </p>
                  )}

                  <div className="text-sm font-semibold text-[#E10600] bg-red-50 inline-block px-2 py-1 rounded-md mb-4">
                    Max Weight: {vehicleType.maxParcelWeight || 5} KG
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                    <div className="text-sm text-[#64748B]">
                      {vehicleType.createdAt ? (
                        <>
                          Created:{" "}
                          {new Date(vehicleType.createdAt).toLocaleDateString()}
                        </>
                      ) : (
                        <>No date</>
                      )}
                    </div>
                    {/* <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedType(vehicleType)
                                                    setShowDeleteModal(true)
                                                }}
                                                className="p-2 bg-[#DC2626] text-white  rounded-lg transition-colors duration-200"
                                            >
                                                Delete
                                            </button>
                                        </div> */}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // List View
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                      Type
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                      Description
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                      Max Weight
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                      Created
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredVehicleTypes.map((vehicleType) => {
                    // console.log(vehicleType , "this si vehicle type")
                    return (
                      <motion.tr
                        key={vehicleType._id || vehicleType.id}
                        variants={itemVariants}
                        className="hover:bg-[#F8FAFC] transition-colors duration-200"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                              {vehicleType.image ? (
                                <img
                                  src={getVehicleTypeImageUrl(vehicleType.image)}
                                  alt={vehicleType.type}
                                  className="w-8 h-8 object-contain rounded"
                                  onError={(e) => {
                                    const cur = e.target.src;
                                    if (!cur.includes("/default-car.svg")) {
                                      e.target.src = "/default-car.svg";
                                    }
                                  }}
                                />
                              ) : (
                                <Car className="w-5 h-5 text-[#3B82F6]" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-[#0F172A]">
                                {vehicleType.type || "Unnamed Type"}
                              </div>
                              {vehicleType._id && (
                                <div className="text-xs text-[#64748B]">
                                  ID: {vehicleType._id.slice(-6)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-[#475569] max-w-xs truncate">
                            {vehicleType.description || "No description"}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-semibold text-[#E10600] bg-red-50 inline-block px-2 py-1 rounded-md">
                            {vehicleType.maxParcelWeight || 5} KG
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-[#475569]">
                          {vehicleType.createdAt
                            ? new Date(
                                vehicleType.createdAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/vehicle-types/edit/${vehicleType._id || vehicleType.id}`}
                            >
                              <button className="p-2 text-[#3B82F6] hover:bg-[#EFF6FF] rounded-lg transition-colors duration-200">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedType(vehicleType);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/vehicle-types/${vehicleType._id || vehicleType.id}`}
                            >
                              <button className="p-2 text-[#475569] hover:bg-[#F8FAFC] rounded-lg transition-colors duration-200">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-[#E2E8F0]"
        >
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-[#64748B]">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <span>
                Showing {filteredVehicleTypes.length} of {vehicleTypes.length}{" "}
                types
              </span>
              <span>•</span>
              <span>
                Sort:{" "}
                {sortBy === "newest"
                  ? "Newest"
                  : sortBy === "oldest"
                    ? "Oldest"
                    : "Name"}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>View: {viewMode === "grid" ? "Grid" : "List"}</span>
              <Link
                to="/admin/create-vehicle-type"
                className="text-[#3B82F6] hover:text-blue-700 font-medium"
              >
                + Add another type
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFFFFF] rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-6 h-6 text-[#DC2626]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Delete Vehicle Type
                  </h3>
                  <p className="text-[#475569] text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-[#0F172A] mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  "{selectedType?.type || "this vehicle type"}"
                </span>
                ? This will remove all associated data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-[#CBD5E1] text-[#0F172A] rounded-xl font-medium hover:bg-[#F8FAFC] transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleDelete(selectedType._id || selectedType.id)
                  }
                  className="flex-1 px-4 py-3 bg-[#DC2626] text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShowVehicleType;
