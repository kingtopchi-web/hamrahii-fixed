import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Pin,
  Route,
  CheckCircle,
  AlertCircle,
  Edit2,
  Check,
  X,
  ListOrdered
} from "lucide-react";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";

// StopsForm.jsx
export const StopsForm = ({ data, updateData, prevStep, onSubmit, formData, setFormData, loading, setLoading }) => {
  // Get routeCities from formData
  const routeCities = data.routeCities || [];
  const maxStops = 10;




  const [stops, setStops] = useState(data.stops || []);
  const [selectedCities, setSelectedCities] = useState([]);
  const [error, setError] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCity, setCustomCity] = useState("");
  const distance = formData?.distance || formData?.routeDetails?.distanceInKm
  const inputRef = useRef(null);

  // Add selected cities as stops
  const addSelectedCities = () => {
    if (selectedCities.length === 0) {
      setError("Please select at least one city");
      return;
    }

    if (stops.length + selectedCities.length > maxStops) {
      setError(`You can only add ${maxStops - stops.length} more stops`);
      return;
    }

    const newStops = selectedCities.map((city, index) => ({
      city: city,
      address: `${city}`, // Could add more details if available
      coordinates: [],
      order: stops.length + index + 1
    }));

    setStops(prev => [...prev, ...newStops]);
    setSelectedCities([]);
    setError("");
  };

  useEffect(() => {
    updateData(stops)
  }, [stops])

  // Add custom city
  const addCustomCity = () => {
    if (!customCity.trim()) {
      setError("Please enter a city name");
      return;
    }

    if (stops.length >= maxStops) {
      setError("Maximum 10 stops allowed");
      return;
    }

    // Check if city already exists
    if (stops.some(stop => stop.city.toLowerCase() === customCity.toLowerCase())) {
      setError("This city is already added as a stop");
      return;
    }

    const stopData = {
      city: customCity.trim(),
      address: customCity.trim(),
      coordinates: [],
      order: stops.length + 1
    };

    if (editingIndex !== null) {
      const updatedStops = [...stops];
      updatedStops[editingIndex] = stopData;
      setStops(updatedStops);
      setEditingIndex(null);
    } else {
      setStops(prev => [...prev, stopData]);
    }

    setCustomCity("");
    setError("");
  };

  // Toggle city selection
  const toggleCitySelection = (city) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(prev => prev.filter(c => c !== city));
    } else {
      if (selectedCities.length >= (maxStops - stops.length)) {
        setError(`You can only select ${maxStops - stops.length} more cities`);
        return;
      }
      setSelectedCities(prev => [...prev, city]);
      setError("");
    }
  };

  // Remove selected city
  const removeSelectedCity = (city) => {
    setSelectedCities(prev => prev.filter(c => c !== city));
  };

  // Remove stop
  const removeStop = (index) => {
    const updatedStops = stops.filter((_, i) => i !== index);
    const reorderedStops = updatedStops.map((stop, idx) => ({
      ...stop,
      order: idx + 1
    }));
    setStops(reorderedStops);
  };

  // Edit stop
  const editStop = (index) => {
    const stop = stops[index];
    setCustomCity(stop.city);
    setEditingIndex(index);
    setSelectedCities([]); // Clear selections when editing
    inputRef.current?.focus();
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      updateData(stops);
      await onSubmit();
    } catch (error) {
      // console.error("Error submitting:", error);
      setError("Failed to create ride. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move stop up
  const moveStopUp = (index) => {
    if (index === 0) return;

    const updatedStops = [...stops];
    [updatedStops[index], updatedStops[index - 1]] = [updatedStops[index - 1], updatedStops[index]];

    const reorderedStops = updatedStops.map((stop, idx) => ({
      ...stop,
      order: idx + 1
    }));

    setStops(reorderedStops);
  };

  // Move stop down
  const moveStopDown = (index) => {
    if (index === stops.length - 1) return;

    const updatedStops = [...stops];
    [updatedStops[index], updatedStops[index + 1]] = [updatedStops[index + 1], updatedStops[index]];

    const reorderedStops = updatedStops.map((stop, idx) => ({
      ...stop,
      order: idx + 1
    }));

    setStops(reorderedStops);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (customCity.trim()) {
        addCustomCity();
      } else if (selectedCities.length > 0) {
        addSelectedCities();
      }
    }
  };



  useEffect(() => {
    handleGetCommisionDetails()
  }, [])

  const handleGetCommisionDetails = async () => {
    try {
      const res = await Axios.get(api.commision.get)
      console.log(res, "thisis response")
      if (res?.data?.success) {
        const commision = res?.data?.commision
        if (commision?.isCommision) {
          const commisionValue =
            commision?.type === "Percentage"
              ? (Number(formData.pricePerSeat * formData.totalSeats) * Number(commision?.value || 0)) / 100
              : Number(commision?.value || 0);

          console.log(commisionValue, "this is value ")
          setFormData((prev) => ({ ...prev, commisionValue }))
        } else {

          setFormData((prev) => ({ ...prev, commisionValue: 0 }))
        }
      } else {
        setFormData((prev) => ({ ...prev, commisionValue: 0 }))
      }
    } catch (error) {
      console.log(error)
    }
  }



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="stops-form"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#E10600]/10 to-[#E10600]/5 mb-4"
        >
          <Route className="text-[#E10600]" size={28} />
        </motion.div>
        <h2 className="text-2xl font-bold text-[#111111] mb-2">Intermediate Stops</h2>
        <p className="text-[#555555]">Select cities along your route for pickup/drop-off points</p>
        <div className="inline-flex items-center gap-1 px-3 py-1 mt-2 bg-[#F7F7F7] rounded-full text-sm text-[#555555]">
          <span>Optional</span>
          <span className="text-xs">•</span>
          <span>Maximum {maxStops} stops</span>
          <span className="text-xs">•</span>
          <span>{stops.length}/{maxStops} used</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* City Selection Card */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E10600] to-[#C10500] flex items-center justify-center">
              <MapPin className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#111111]">
                Select Cities Along Your Route
              </h3>
              <p className="text-sm text-[#555555]">
                Choose from {routeCities.length} cities on your route
              </p>
            </div>
          </div>

          {/* Route Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-[#F7F7F7] to-white rounded-lg border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="text-[#E10600]" size={16} />
              <div className="text-sm font-semibold text-[#111111]">Route Info</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">
                <div className="text-[#555555] mb-1">From</div>
                <div className="font-medium text-[#111111]">{data.from.city || "Not set"}</div>
              </div>
              <div className="text-sm">
                <div className="text-[#555555] mb-1">To</div>
                <div className="font-medium text-[#111111]">{data.to.city || "Not set"}</div>
              </div>
            </div>
          </div>

          {/* Selected Cities Preview */}
          {selectedCities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6"
            >
              <div className="text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wide">
                Selected Cities ({selectedCities.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCities.map((city, index) => (
                  <motion.div
                    key={`${city}-${index}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 rounded-full border border-[#E10600]/20"
                  >
                    <MapPin size={12} className="text-[#E10600]" />
                    <span className="text-xs font-medium text-[#111111]">{city}</span>
                    <button
                      onClick={() => removeSelectedCity(city)}
                      className="ml-1 p-0.5 hover:bg-[var(--bg-surface)]/50 rounded-full"
                    >
                      <X size={10} className="text-[#555555]" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cities Checkbox Grid */}
          {routeCities.length > 0 ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-[#111111]">
                  Cities on Route ({routeCities.length})
                </div>
                <div className="text-xs text-[#555555]">
                  Select up to {maxStops - stops.length} more
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {routeCities.map((city, index) => {
                    const isSelected = selectedCities.includes(city);
                    const isDisabled = selectedCities.length >= (maxStops - stops.length) && !isSelected;
                    const isInStops = stops.some(stop => stop.city === city);

                    return (
                      <motion.div
                        key={`${city}-${index}`}
                        whileHover={{ scale: isDisabled || isInStops ? 1 : 1.02 }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
                          ? 'border-[#E10600] bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5'
                          : isInStops
                            ? 'border-[var(--border-subtle)] bg-[#F7F7F7] opacity-50 cursor-not-allowed'
                            : isDisabled
                              ? 'border-[var(--border-subtle)] bg-[#F7F7F7] opacity-50 cursor-not-allowed'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[#B8B8B8]'
                          }`}
                        onClick={() => !isDisabled && !isInStops && toggleCitySelection(city)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected || isInStops
                              ? 'border-[#E10600] bg-[#E10600]'
                              : 'border-[var(--border-subtle)]'
                              }`}>
                              {(isSelected || isInStops) && (
                                <Check className="text-white" size={12} />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#111111]">{city}</div>
                              <div className="text-xs text-[#555555]">Stop #{index + 1}</div>
                            </div>
                          </div>
                          {isInStops && (
                            <div className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                              Added
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-[#F7F7F7] rounded-lg text-center">
              <p className="text-[#555555]">No cities data available for this route</p>
            </div>
          )}

          {/* Custom City Input */}
          <div className="mb-6">
            <div className="text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wide">
              Add Custom City (Optional)
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter city name..."
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[#F7F7F7] text-[#111111] placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#E10600]/20 focus:border-[#E10600] transition-all duration-200"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addCustomCity}
                disabled={!customCity.trim()}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${customCity.trim()
                  ? 'bg-[#E10600] text-white hover:bg-[#C10500] hover:shadow-md'
                  : 'bg-[#F7F7F7] text-[#B8B8B8] cursor-not-allowed'
                  }`}
              >
                {editingIndex !== null ? 'Update' : 'Add'}
              </motion.button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {selectedCities.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addSelectedCities}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#E10600] text-white hover:bg-[#C10500] hover:shadow-md transition-all duration-200 font-medium text-sm"
              >
                <Plus size={16} />
                Add Selected ({selectedCities.length})
              </motion.button>
            )}

            {editingIndex !== null && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingIndex(null);
                  setCustomCity("");
                  setError("");
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[#555555] hover:bg-[#F7F7F7] transition-all duration-200 font-medium text-sm"
              >
                <X size={16} />
                Cancel Edit
              </motion.button>
            )}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-lg bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 border border-[#E10600]/20 p-3"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-[#E10600] flex-shrink-0" size={16} />
                  <p className="text-[#E10600] font-medium text-xs">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection Stats */}
          <div className="mt-4 text-xs text-[#555555]">
            {stops.length === maxStops ? (
              <div className="text-[#E10600] font-medium">
                ✓ Maximum {maxStops} stops reached
              </div>
            ) : (
              <div>
                <span className="font-medium">{stops.length}/{maxStops} stops used.</span>
                {" "}You can add {maxStops - stops.length} more stops.
              </div>
            )}
          </div>
        </motion.div>

        {/* Stops List */}
        <AnimatePresence>
          {stops.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E10600] to-[#C10500] flex items-center justify-center">
                    <Pin className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#111111]">Your Stops</h3>
                    <p className="text-sm text-[#555555]">
                      {stops.length} stop{stops.length !== 1 ? 's' : ''} • Order: 1 → {stops.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F7F7] rounded-lg">
                  <ListOrdered className="text-[#555555]" size={14} />
                  <span className="text-sm font-medium text-[#111111]">
                    {stops.length}/{maxStops}
                  </span>
                </div>
              </div>

              {/* Stops List */}
              <div className="space-y-4">
                {stops.map((stop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative"
                  >
                    {/* Route Line */}
                    {index < stops.length - 1 && (
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-[#E5E5E5] to-transparent"></div>
                    )}

                    <div className="bg-gradient-to-r from-[#F7F7F7] to-white rounded-lg border border-[var(--border-subtle)] p-4 hover:border-[#B8B8B8] transition-all duration-200">
                      <div className="flex items-start gap-4">
                        {/* Stop Number */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E10600] to-[#C10500] flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>

                        {/* Stop Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold text-[#111111] text-lg mb-1">
                                {stop.city}
                              </div>
                              {stop.address && stop.address !== stop.city && (
                                <div className="text-sm text-[#555555] mb-2">
                                  {stop.address}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Move Buttons */}
                              {index > 0 && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => moveStopUp(index)}
                                  className="p-1.5 rounded hover:bg-[#E5E5E5] transition-colors duration-200"
                                  title="Move up"
                                >
                                  <ChevronLeft className="rotate-90" size={14} />
                                </motion.button>
                              )}
                              {index < stops.length - 1 && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => moveStopDown(index)}
                                  className="p-1.5 rounded hover:bg-[#E5E5E5] transition-colors duration-200"
                                  title="Move down"
                                >
                                  <ChevronRight className="rotate-90" size={14} />
                                </motion.button>
                              )}
                              {/* Edit Button */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => editStop(index)}
                                className="p-1.5 rounded hover:bg-[#E5E5E5] transition-colors duration-200"
                                title="Edit stop"
                              >
                                <Edit2 size={14} className="text-[#555555]" />
                              </motion.button>
                              {/* Delete Button */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeStop(index)}
                                className="p-1.5 rounded hover:bg-red-50 hover:text-[#E10600] transition-colors duration-200"
                                title="Remove stop"
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-8 text-center shadow-sm"
            >
              <div className="w-16 h-16 rounded-full bg-[#F7F7F7] flex items-center justify-center mx-auto mb-4">
                <Route className="w-8 h-8 text-[#B8B8B8]" />
              </div>
              <h3 className="text-lg font-semibold text-[#111111] mb-2">No Stops Added</h3>
              <p className="text-[#555555] text-sm mb-4 max-w-md mx-auto">
                Select cities from your route above or add custom cities.
                This is optional - you can proceed without stops for a direct ride.
              </p>
              <div className="p-4 bg-gradient-to-r from-[#F7F7F7] to-white rounded-lg border border-[var(--border-subtle)] inline-block">
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <MapPin size={14} />
                  <span>{routeCities.length} cities available on your route</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-neutral-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Back Button */}

          {/* Summary Section */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">

            {/* Price */}
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg">
              <span className="text-sm text-neutral-500">You need to pay</span>
              <span className="text-sm font-semibold text-neutral-900">
                ₹{Math.round(formData?.commisionValue || 0)}
              </span>
            </div>

            {/* Stops */}
            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg">
              <Pin size={14} className="text-neutral-600" />
              <span className="text-sm font-medium text-neutral-900">
                {stops.length} stop{stops.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};