import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Loader2,
  Shield,
  TrendingUp,
  Calculator,
  Info,
  Edit,
  ChevronRight,
  X,
  MapPin,
  Navigation,
} from "lucide-react";
import Axios from "../../services/axios";
import { api } from "../../services/api";
import { getVehicleTypeImageUrl } from "./ShowVehicleType";


const PricingSlabsVehicleType = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slabs, setSlabs] = useState([]);
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({
    minKm: "",
    maxKm: "",
    baseFare: "",
    perKm: "",
    fullSharing: false,
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const vehicleData = location?.state?.vehicleType;
    if (vehicleData) {
      setVehicleType(vehicleData);

      // Load existing slabs or initialize with one empty slab
      if (vehicleData.pricing?.slabs && vehicleData.pricing.slabs.length > 0) {
        setSlabs(
          vehicleData.pricing.slabs.map((slab) => ({
            minKm: parseFloat(slab.minKm),
            maxKm: parseFloat(slab.maxKm),
            baseFare: parseFloat(slab.baseFare),
            perKm: parseFloat(slab.perKm),
            fullSharing : slab.fullSharing
          })),
        );
      } else {
        // Initialize with a default slab
        setSlabs([
          {
            minKm: 0,
            maxKm: 10,
            baseFare: 50,
            perKm: 15,
            fullSharing : false
          },
        ]);
      }
    } else {
      toast.error("No vehicle type selected");
      navigate("/admin/vehicle-types");
    }
  }, [location.state, navigate]);



  // Validation functions
  const validateDistance = useCallback((value) => {
    if (value === "" || value === null || value === undefined) return false;
    const num = parseFloat(value);
    return (
      !isNaN(num) && num >= 0 && /^\d+(\.\d{0,2})?$/.test(value.toString())
    );
  }, []);

  const validatePrice = useCallback((value) => {
    if (value === "" || value === null || value === undefined) return false;
    const num = parseFloat(value);
    return (
      !isNaN(num) && num >= 0 && /^\d+(\.\d{0,2})?$/.test(value.toString())
    );
  }, []);

  // Validate all slabs
  const validateAllSlabs = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    for (let i = 0; i < slabs.length; i++) {
      const slab = slabs[i];

      // Validate minKm (first slab must start from 0)
      if (i === 0 && slab.minKm !== 0) {
        newErrors[i] = {
          ...newErrors[i],
          minKm: "First slab must start from 0 km",
        };
        isValid = false;
      }

      if (!validateDistance(slab.minKm)) {
        newErrors[i] = {
          ...newErrors[i],
          minKm: "Enter valid minimum distance",
        };
        isValid = false;
      }

      // Validate maxKm
      if (!validateDistance(slab.maxKm)) {
        newErrors[i] = {
          ...newErrors[i],
          maxKm: "Enter valid maximum distance",
        };
        isValid = false;
      }

      if (parseFloat(slab.minKm) >= parseFloat(slab.maxKm)) {
        newErrors[i] = {
          ...newErrors[i],
          maxKm: "Maximum distance must be greater than minimum distance",
        };
        isValid = false;
      }

      // Validate baseFare
      if (!validatePrice(slab.baseFare)) {
        newErrors[i] = {
          ...newErrors[i],
          baseFare: "Enter valid base fare (greater than 0)",
        };
        isValid = false;
      }

      // Validate perKm
      if (!validatePrice(slab.perKm)) {
        newErrors[i] = {
          ...newErrors[i],
          perKm: "Enter valid price per km (greater than 0)",
        };
        isValid = false;
      }

      // Check continuity with previous slab
      if (i > 0) {
        const prevSlab = slabs[i - 1];
        if (parseFloat(slab.minKm) !== parseFloat(prevSlab.maxKm)) {
          newErrors[i] = {
            ...newErrors[i],
            minKm: `Must start from ${prevSlab.maxKm} km (end of previous slab)`,
          };
          isValid = false;
        }
      }

      // Check for overlapping slabs
      for (let j = 0; j < slabs.length; j++) {
        if (i !== j) {
          const otherSlab = slabs[j];
          if (
            (parseFloat(slab.minKm) >= parseFloat(otherSlab.minKm) &&
              parseFloat(slab.minKm) < parseFloat(otherSlab.maxKm)) ||
            (parseFloat(slab.maxKm) > parseFloat(otherSlab.minKm) &&
              parseFloat(slab.maxKm) <= parseFloat(otherSlab.maxKm))
          ) {
            newErrors[i] = {
              ...newErrors[i],
              _general: "Slab overlaps with another slab",
            };
            isValid = false;
          }
        }
      }
    }

    return { isValid, errors: newErrors };
  }, [slabs, validateDistance, validatePrice]);

  // Memoize validation results
  const validationResults = useMemo(() => {
    return validateAllSlabs();
  }, [validateAllSlabs]);

  // Function to run validation and set errors
  const runValidation = useCallback(() => {
    const { errors: validationErrors } = validateAllSlabs();
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [validateAllSlabs]);

  // Add new slab
  const handleAddSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    const newMinKm = lastSlab ? parseFloat(lastSlab.maxKm) : 0;

    const newSlab = {
      minKm: newMinKm,
      maxKm: newMinKm + 10,
      baseFare: lastSlab ? lastSlab.baseFare + 20 : 50,
      perKm: lastSlab ? lastSlab.perKm + 2 : 15,
    };

    setSlabs([...slabs, newSlab]);
  };

  // Delete slab
  const handleDeleteSlab = (index) => {
    if (slabs.length === 1) {
      return;
    }

    const newSlabs = slabs.filter((_, i) => i !== index);

    // If deleting first slab, update next slab's minKm to 0
    if (index === 0 && newSlabs.length > 0) {
      newSlabs[0] = { ...newSlabs[0], minKm: 0 };
    }

    // Ensure continuity between slabs
    const updatedSlabs = newSlabs.map((slab, i) => {
      if (i === 0) return slab;
      const prevSlab = newSlabs[i - 1];
      return { ...slab, minKm: prevSlab.maxKm };
    });

    setSlabs(updatedSlabs);
    setErrors({});
  };

  // Open edit modal
  const handleEditSlab = (index) => {
    setEditingIndex(index);
    setEditForm({
      minKm: slabs[index].minKm,
      maxKm: slabs[index].maxKm,
      baseFare: slabs[index].baseFare,
      perKm: slabs[index].perKm,
      fullSharing: slabs[index].fullSharing,
    });
    setShowEditModal(true);
  };

  // Update edit form
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate edit form
  const validateEditForm = useCallback(() => {
    const newErrors = {};

    // Validate minKm
    if (!validateDistance(editForm.minKm)) {
      newErrors.minKm = "Enter valid minimum distance";
    } else if (
      editingIndex > 0 &&
      parseFloat(editForm.minKm) !== parseFloat(slabs[editingIndex - 1].maxKm)
    ) {
      newErrors.minKm = `Must start from ${slabs[editingIndex - 1].maxKm} km (end of previous slab)`;
    } else if (editingIndex === 0 && parseFloat(editForm.minKm) !== 0) {
      newErrors.minKm = "First slab must start from 0 km";
    }

    // Validate maxKm
    if (!validateDistance(editForm.maxKm)) {
      newErrors.maxKm = "Enter valid maximum distance";
    } else if (parseFloat(editForm.maxKm) <= parseFloat(editForm.minKm)) {
      newErrors.maxKm =
        "Maximum distance must be greater than minimum distance";
    }

    // Validate baseFare
    if (!validatePrice(editForm.baseFare)) {
      newErrors.baseFare = "Enter valid base fare (greater than 0)";
    }

    // Validate perKm
    if (!validatePrice(editForm.perKm)) {
      newErrors.perKm = "Enter valid price per km (greater than 0)";
    }

    // Check for overlap with other slabs
    slabs.forEach((slab, index) => {
      if (index !== editingIndex) {
        if (
          (parseFloat(editForm.minKm) >= parseFloat(slab.minKm) &&
            parseFloat(editForm.minKm) < parseFloat(slab.maxKm)) ||
          (parseFloat(editForm.maxKm) > parseFloat(slab.minKm) &&
            parseFloat(editForm.maxKm) <= parseFloat(slab.maxKm))
        ) {
          newErrors._general = "Slab overlaps with another slab";
        }
      }
    });

    return newErrors;
  }, [editForm, editingIndex, slabs, validateDistance, validatePrice]);

  // Save edited slab
  const handleSaveEdit = () => {
    const formErrors = validateEditForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const updatedSlabs = [...slabs];
    updatedSlabs[editingIndex] = {
      minKm: parseFloat(editForm.minKm),
      maxKm: parseFloat(editForm.maxKm),
      baseFare: parseFloat(editForm.baseFare),
      perKm: parseFloat(editForm.perKm),
      fullSharing : editForm.fullSharing
    };

    // Update subsequent slabs to maintain continuity
    for (let i = editingIndex + 1; i < updatedSlabs.length; i++) {
      updatedSlabs[i] = {
        ...updatedSlabs[i],
        minKm: updatedSlabs[i - 1].maxKm,
      };
    }

    setSlabs(updatedSlabs);
    setShowEditModal(false);
    setEditForm({ minKm: "", maxKm: "", baseFare: "", perKm: "" });
    setErrors({});
  };

  // Save all slabs to backend
  const handleSaveSlabs = async () => {
    if (!runValidation()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vehicleTypeId: vehicleType._id,
        adminId: vehicleType.createdBy,
        slabs: slabs.map((slab) => ({
          minKm: parseFloat(slab.minKm),
          maxKm: parseFloat(slab.maxKm),
          baseFare: parseFloat(slab.baseFare),
          perKm: parseFloat(slab.perKm),
          fullSharing : slab?.fullSharing ? true : false
        })),
      };

      //   console.log("Sending payload:", payload); // For debugging

      // console.log(payload , "these are payloasd")
      const res = await Axios.post(api.vehicleType.addPricingSlabs, payload);

      if (res?.data?.success) {
        toast.success(res.data.message || "Pricing slabs saved successfully");
        setVehicleType(res.data.vehicleType);
        navigate(-1);
      }
    } catch (error) {
      //   console.error("Save error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save pricing slabs",
      );
    } finally {
      setSaving(false);
    }
  };

  // Calculate total fare for a given distance
  const calculatePriceForDistance = useCallback(
    (distance) => {
      if (!slabs?.length) return "0.00";

      // Sort slabs safety
      const sorted = [...slabs].sort((a, b) => a.minKm - b.minKm);

      // 1. Find matching slab
      let slab = sorted.find((s) => distance >= s.minKm && distance <= s.maxKm);

      // 2. If distance above last range → use LAST slab
      if (!slab) {
        slab = sorted[sorted.length - 1];
      }

      const extraDistance = Math.max(0, distance - slab.minKm);

      const total = slab.baseFare + extraDistance * slab.perKm;

      return total.toFixed(2);
    },
    [slabs],
  );

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  }, []);

  // Check validation status (memoized)
  const validationStatus = useMemo(
    () => ({
      hasAtLeastOneSlab: slabs.length > 0,
      allSlabsValid: validationResults.isValid,
      firstSlabStartsAtZero: slabs[0]?.minKm === 0,
      noOverlappingSlabs: Object.keys(validationResults.errors).length === 0,
    }),
    [slabs, validationResults],
  );

  if (!vehicleType) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#475569] hover:text-[#0F172A] mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                  <Calculator className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                    Pricing Slabs for {vehicleType.type}
                  </h1>
                  <p className="text-[#475569]">
                    Define distance-based pricing slabs with base fare + per km
                    rate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Info Card */}
          <div className="bg-linear-to-r from-purple-600 to-blue-500 rounded-2xl shadow-xl p-6 text-white mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-[#FFFFFF]/20">
                  <img
                    src={getVehicleTypeImageUrl(vehicleType.image)}
                    alt={vehicleType.type}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const cur = e.target.src;
                      if (!cur.includes("/default-car.svg")) {
                        e.target.src = "/default-car.svg";
                      }
                    }}
                  />

                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    {vehicleType.type}
                  </h2>
                  <p className="text-purple-100">{vehicleType.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-purple-100">Currency</div>
                <div className="flex items-center gap-2 text-lg font-bold">
                  <IndianRupee className="w-5 h-5" />
                  {vehicleType.pricing?.currency || "INR"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Slabs List */}
          <div className="lg:col-span-2">
            <div className="bg-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0]">
              {/* Header */}
              <div className="p-6 border-b border-[#E2E8F0] bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#0F172A]">
                      Pricing Slabs
                    </h2>
                    <p className="text-[#475569] text-sm">
                      Base fare + per km rate for distance ranges
                    </p>
                  </div>
                  <button
                    onClick={handleAddSlab}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Slab
                  </button>
                </div>
              </div>

              {/* Slabs Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC]">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                        #
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                        Distance Range (km)
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                        Base Fare
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                        Per Km Rate
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-[#0F172A]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {slabs.map((slab, index) => {
                      const distanceRange = slab.maxKm - slab.minKm;
                      const maxPriceInRange =
                        slab.baseFare + distanceRange * slab.perKm;

                      return (
                        <tr
                          key={index}
                          className={`hover:bg-[#F8FAFC] transition-colors ${
                            errors[index] ? "bg-[#FEF2F2]" : ""
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-blue-100 text-[#3B82F6]"
                                }`}
                              >
                                {index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#94A3B8]" />
                                <span className="font-medium">
                                  {slab.minKm} km - {slab.maxKm} km
                                </span>
                              </div>
                              <div className="text-sm text-[#64748B]">
                                Range: {distanceRange.toFixed(2)} km
                              </div>
                              {errors[index]?.minKm && (
                                <div className="text-xs text-[#DC2626] mt-1">
                                  {errors[index].minKm}
                                </div>
                              )}
                              {errors[index]?.maxKm && (
                                <div className="text-xs text-[#DC2626] mt-1">
                                  {errors[index].maxKm}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Navigation className="w-4 h-4 text-[#3B82F6]" />
                              </div>
                              <div>
                                <div className="font-semibold text-blue-700">
                                  {formatCurrency(slab.baseFare)}
                                </div>
                                <div className="text-sm text-[#64748B]">
                                  starting fare
                                </div>
                                {errors[index]?.baseFare && (
                                  <div className="text-xs text-[#DC2626] mt-1">
                                    {errors[index].baseFare}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <IndianRupee className="w-4 h-4 text-[#10B981]" />
                              </div>
                              <div>
                                <div className="font-semibold text-green-700">
                                  {formatCurrency(slab.perKm)}
                                </div>
                                <div className="text-sm text-[#64748B]">
                                  per km
                                </div>
                                <div className="text-xs text-[#64748B]">
                                  Max: {formatCurrency(maxPriceInRange)}
                                </div>
                                {errors[index]?.perKm && (
                                  <div className="text-xs text-[#DC2626] mt-1">
                                    {errors[index].perKm}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditSlab(index)}
                                className="p-2 text-[#3B82F6] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                                title="Edit slab"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSlab(index)}
                                className="p-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                                title="Delete slab"
                                disabled={slabs.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {errors[index]?._general && (
                              <div className="text-xs text-[#DC2626] mt-2">
                                {errors[index]._general}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {slabs.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="w-10 h-10 text-[#94A3B8]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#0F172A] mb-2">
                      No pricing slabs
                    </h3>
                    <p className="text-[#475569] mb-6">
                      Add your first pricing slab to get started
                    </p>
                    <button
                      onClick={handleAddSlab}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-2.5 px-6 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Slab
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#E2E8F0]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm text-[#475569]">
                    <span className="font-semibold">{slabs.length}</span> slab
                    {slabs.length !== 1 ? "s" : ""} defined
                  </div>
                  <button
                    onClick={handleSaveSlabs}
                    disabled={saving || !validationStatus.allSlabsValid}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Pricing
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Calculator */}
          <div className="space-y-6">
            {/* Pricing Preview */}
            <div className="bg-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0]">
              <div className="p-6 border-b border-[#E2E8F0] bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">
                      Fare Calculator
                    </h3>
                    <p className="text-sm text-[#475569]">
                      Example calculations
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[3, 5, 10, 15, 20, 50].map((distance) => (
                    <div
                      key={distance}
                      className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-[#3B82F6]">
                            {distance}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#0F172A]">
                            {distance} km ride
                          </div>
                          <div className="text-xs text-[#64748B]">
                            Total distance
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#10B981]">
                          {formatCurrency(calculatePriceForDistance(distance))}
                        </div>
                        <div className="text-xs text-[#64748B]">Total fare</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Status */}
            <div className="bg-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0]">
              <div className="p-6 border-b border-[#E2E8F0] bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-5 h-5 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">
                      Validation Status
                    </h3>
                    <p className="text-sm text-[#475569]">
                      Pricing configuration
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${validationStatus.hasAtLeastOneSlab ? "text-[#10B981]" : "text-gray-300"}`}
                      />
                      <span className="text-sm">At least one slab</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${validationStatus.hasAtLeastOneSlab ? "text-[#10B981]" : "text-[#64748B]"}`}
                    >
                      {validationStatus.hasAtLeastOneSlab ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${validationStatus.allSlabsValid ? "text-[#10B981]" : "text-gray-300"}`}
                      />
                      <span className="text-sm">All slabs valid</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${validationStatus.allSlabsValid ? "text-[#10B981]" : "text-[#64748B]"}`}
                    >
                      {validationStatus.allSlabsValid ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${validationStatus.firstSlabStartsAtZero ? "text-[#10B981]" : "text-gray-300"}`}
                      />
                      <span className="text-sm">First slab starts at 0</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${validationStatus.firstSlabStartsAtZero ? "text-[#10B981]" : "text-[#64748B]"}`}
                    >
                      {validationStatus.firstSlabStartsAtZero ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-4 h-4 ${validationStatus.noOverlappingSlabs ? "text-[#10B981]" : "text-gray-300"}`}
                      />
                      <span className="text-sm">No overlapping slabs</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${validationStatus.noOverlappingSlabs ? "text-[#10B981]" : "text-[#64748B]"}`}
                    >
                      {validationStatus.noOverlappingSlabs ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-[#FFFFFF] rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0]">
              <div className="p-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Info className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">
                      How it works
                    </h3>
                    <p className="text-sm text-[#475569]">
                      Pricing slab guidelines
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 text-sm text-[#475569]">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>
                      First slab must start from <strong>0 km</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Slabs should be continuous without gaps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Base fare</strong> is charged for the first km
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Per km rate</strong> is charged for additional
                      distance
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Slab Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#FFFFFF] rounded-2xl shadow-2xl w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#0F172A]">
                      Edit Pricing Slab
                    </h3>
                    <p className="text-[#475569] text-sm">
                      Update distance range and pricing
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-[#F8FAFC] rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-[#64748B]" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Min Distance */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Minimum Distance (km)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.minKm}
                        onChange={(e) =>
                          handleEditChange("minKm", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all disabled:bg-[#F8FAFC]"
                        placeholder="0.00"
                        disabled={editingIndex === 0}
                      />
                      <div className="absolute right-3 top-3 text-[#64748B]">
                        km
                      </div>
                    </div>
                    {errors.minKm && (
                      <p className="text-sm text-[#DC2626] mt-1">
                        {errors.minKm}
                      </p>
                    )}
                  </div>

                  {/* Max Distance */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Maximum Distance (km)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min={editForm.minKm || 0}
                        value={editForm.maxKm}
                        onChange={(e) =>
                          handleEditChange("maxKm", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-[#CBD5E1] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        placeholder="10.00"
                      />
                      <div className="absolute right-3 top-3 text-[#64748B]">
                        km
                      </div>
                    </div>
                    {errors.maxKm && (
                      <p className="text-sm text-[#DC2626] mt-1">
                        {errors.maxKm}
                      </p>
                    )}
                  </div>

                  {/* Base Fare */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Base Fare (INR)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-[#64748B]">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editForm.baseFare}
                        onChange={(e) =>
                          handleEditChange("baseFare", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-[#CBD5E1] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        placeholder="50.00"
                      />
                    </div>
                    {errors.baseFare && (
                      <p className="text-sm text-[#DC2626] mt-1">
                        {errors.baseFare}
                      </p>
                    )}
                    <p className="text-xs text-[#64748B] mt-1">
                      Charged for the first km
                    </p>
                  </div>

                  {/* Per Km Rate */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Price per km (INR)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-[#64748B]">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editForm.perKm}
                        onChange={(e) =>
                          handleEditChange("perKm", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-[#CBD5E1] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        placeholder="15.00"
                      />
                    </div>
                    {errors.perKm && (
                      <p className="text-sm text-[#DC2626] mt-1">
                        {errors.perKm}
                      </p>
                    )}
                    <p className="text-xs text-[#64748B] mt-1">
                      Charged for each additional km
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <div className="flex items-center gap-3">
                        <label className="block text-sm font-medium text-[#0F172A] mb-2">
                          Allow full sharing
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleEditChange("fullSharing", !editForm.fullSharing)
                        }
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${editForm.fullSharing ? "bg-[#ECFDF5]0" : "bg-gray-300"}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-[#FFFFFF] transition-transform ${editForm.fullSharing ? "translate-x-8" : "translate-x-1"}`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Range Info
                  <div className="p-4 bg-[#EFF6FF] rounded-xl border border-blue-100">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <div className="text-xs text-blue-700">
                          Distance Range
                        </div>
                        <div className="text-sm font-bold text-blue-900">
                          {editForm.maxKm && editForm.minKm
                            ? (editForm.maxKm - editForm.minKm).toFixed(2)
                            : "0.00"}{" "}
                          km
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-700">
                          Max Fare in Range
                        </div>
                        <div className="text-sm font-bold text-blue-900">
                          {formatCurrency(
                            editForm.baseFare &&
                              editForm.perKm &&
                              editForm.maxKm &&
                              editForm.minKm
                              ? parseFloat(editForm.baseFare) +
                                  (editForm.maxKm - editForm.minKm) *
                                    editForm.perKm
                              : 0,
                          )}
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {errors._general && (
                    <div className="p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors._general}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#E2E8F0]">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 text-[#0F172A] bg-[#F8FAFC] hover:bg-gray-200 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-600 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingSlabsVehicleType;
