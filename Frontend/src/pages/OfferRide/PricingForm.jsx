import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Users,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Shield,
  Timer,
  TrendingUp,
  User,
  Sun,
  Moon,
  Sunset,
  Sunrise,
} from "lucide-react";
import { toast } from "react-toastify";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";

// PricingForm.jsx
export const PricingForm = ({
  data,
  formData,
  updateData,
  nextStep,
  prevStep,
  setFormData,
}) => {
  const [pricingData, setPricingData] = useState({
    departureDate: data.departureDate || "",
    departureTime: data.departureTime || "",
    departureTime24h: data.departureTime24h || "",
    departureTime12h: data.departureTime12h || "",
    timePeriod: data.timePeriod || "",
    totalSeats: 1,
    pricePerSeat: data.pricePerSeat || 0,
  });

  const [errors, setErrors] = useState({});
  const [carSeats, setCarSeats] = useState(formData?.carDetails?.seats);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("");
  const [activeTimeTab, setActiveTimeTab] = useState("all"); // all, morning, afternoon, evening, night
  const [minCharge, setMinCharge] = useState(0);
  const [maxCharge, setMaxCharege] = useState(0);

  const calculatePlusMinusFivePercent = (amount) => {
    const percent = amount * 0.05;

    return {
      min: Number((amount - percent).toFixed(2)),
      max: Number((amount + percent).toFixed(2)),
    };
  };

  const getStepByAmount = (amount) => {
    if (amount <= 100) return 5;
    if (amount <= 500) return 10;
    if (amount <= 1000) return 25;
    if (amount <= 5000) return 50;
    return 100;
  };


  const calculatePriceForDistance = (distance, slabs) => {
    const sorted = [...slabs].sort((a, b) => a.minKm - b.minKm);

    let slab = sorted.find((s) => distance >= s.minKm && distance <= s.maxKm);

    if (!slab) {
      slab = sorted[sorted.length - 1];
    }

    // console.log(slab, "this is slab ");

    setFormData((prev) => ({ ...prev, fullSharing: slab?.fullSharing }));

    // 🔥 YOUR LOGIC
    const total = slab.baseFare + distance * slab.perKm;

    return total.toFixed(2);
  };

  const handlePriceInputBlur = (e) => {
    if (pricingData.pricePerSeat > maxCharge) {
      setPricingData((prev) => ({
        ...prev,
        pricePerSeat: Math.round(maxCharge),
      }));
    }

    if (pricingData.pricePerSeat < minCharge) {
      setPricingData((prev) => ({
        ...prev,
        pricePerSeat: Math.round(minCharge),
      }));
    }
  };

  useEffect(() => {
    const loadPricing = async () => {
      // console.log(formData, "this is formData");

      const price = await handleGetPricingSlabs(
        formData?.carDetails?.vehicleTypeId,
        Number(formData?.distance || formData?.routeDetails?.distanceInKm),
      );

      setPricingData((prev) => ({
        ...prev,
        pricePerSeat: Math.round(price || 0),
      }));

      const { min, max } = calculatePlusMinusFivePercent(Number(price || 0));

      setMinCharge(min);
      setMaxCharege(max);
    };

    if (formData?.distance || formData?.routeDetails?.distanceInKm) {
      loadPricing();
    }
  }, [formData?.distance || formData?.routeDetails?.distanceInKm]);



  const handleGetPricingSlabs = async (vehicleTypeId, distance) => {
    try {
    

      const res = await Axios.post(api.vehicleType.getPricingSlabs, {
        vehicleTypeId,
      });

      // console.log(res , "this is response ")
      return calculatePriceForDistance(distance, res?.data?.slabs);
    } catch (error) {
      toast.info(error?.response?.data?.message);
      // console.log(error , "this si error")
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      pricePerSeat: pricingData.pricePerSeat,
      totalSeats: pricingData.totalSeats || 1,
    }));
  }, [pricingData]);
  // Initialize with actual car seats from props










  useEffect(() => {
    if (data.carSeats) {
      setCarSeats(data.carSeats);
      const maxSeats = Math.max(1, data.carSeats - 1);
      if (pricingData.totalSeats > maxSeats) {
        setPricingData((prev) => ({ ...prev, totalSeats: maxSeats }));
      }
    }

    // Initialize date and time from existing data
    if (data.departureDate) {
      setPricingData((prev) => ({
        ...prev,
        departureDate: data.departureDate,
      }));
    }

    // Initialize time from existing data
    if (data.departureTime24h) {
      setSelectedTimeSlot(data.departureTime24h);
      setSelectedTimePeriod(data.timePeriod);
      setPricingData((prev) => ({
        ...prev,
        departureTime24h: data.departureTime24h,
        departureTime12h: data.departureTime12h,
        timePeriod: data.timePeriod,
      }));

      // Set active tab based on time
      const hour = parseInt(data.departureTime24h.split(":")[0]);
      if (hour >= 6 && hour < 12) setActiveTimeTab("morning");
      else if (hour >= 12 && hour < 17) setActiveTimeTab("afternoon");
      else if (hour >= 17 && hour < 22) setActiveTimeTab("evening");
      else setActiveTimeTab("night");
    } else if (data.departureTime) {
      // Extract time from existing departureTime
      const dateObj = new Date(data.departureTime);
      if (!isNaN(dateObj.getTime())) {
        const hours24 = dateObj.getHours().toString().padStart(2, "0");
        const minutes = dateObj.getMinutes().toString().padStart(2, "0");
        const time24h = `${hours24}:${minutes}`;

        // Convert to 12-hour format
        const hours12 = dateObj.getHours() % 12 || 12;
        const period = dateObj.getHours() >= 12 ? "PM" : "AM";
        const time12h = `${hours12}:${minutes} ${period}`;

        setSelectedTimeSlot(time24h);
        setSelectedTimePeriod(period);
        setPricingData((prev) => ({
          ...prev,
          departureTime24h: time24h,
          departureTime12h: time12h,
          timePeriod: period,
        }));

        // Set active tab based on time
        const hour = parseInt(hours24);
        if (hour >= 6 && hour < 12) setActiveTimeTab("morning");
        else if (hour >= 12 && hour < 17) setActiveTimeTab("afternoon");
        else if (hour >= 17 && hour < 22) setActiveTimeTab("evening");
        else setActiveTimeTab("night");
      }
    }
  }, [
    data.carSeats,
    data.departureTime,
    data.departureTime24h,
    data.departureTime12h,
    data.timePeriod,
  ]);

  // Generate ALL time slots (00:00 to 23:30)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hour24 = hour;
        const hour12 = hour % 12 || 12;
        const period = hour >= 12 ? "PM" : "AM";
        const minuteStr = minute.toString().padStart(2, "0");

        slots.push({
          value24h: `${hour24.toString().padStart(2, "0")}:${minuteStr}`,
          value12h: `${hour12}:${minuteStr} ${period}`,
          hour24: hour24,
          hour12: hour12,
          minute: minuteStr,
          period: period,
          display: `${hour12}:${minuteStr} ${period}`,
        });
      }
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  // Filter slots by time of day
  const timeSlotsByCategory = {
    all: allTimeSlots,
    morning: allTimeSlots.filter(
      (slot) => slot.hour24 >= 6 && slot.hour24 < 12,
    ),
    afternoon: allTimeSlots.filter(
      (slot) => slot.hour24 >= 12 && slot.hour24 < 17,
    ),
    evening: allTimeSlots.filter(
      (slot) => slot.hour24 >= 17 && slot.hour24 < 22,
    ),
    night: allTimeSlots.filter((slot) => slot.hour24 >= 22 || slot.hour24 < 6),
  };

  // Get currently visible slots
  const visibleSlots = timeSlotsByCategory[activeTimeTab] || allTimeSlots;

  const handleChange = (field, value) => {
    let processedValue = Number(value);

    if (field === "totalSeats") {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      if (!arr.includes(processedValue)) {
        processedValue = 1;
      }

      const minValue = 1;
      const maxSeats = Math.max(1, carSeats - 1);
      console.log(processedValue, minValue, maxSeats);
      if (processedValue < minValue) {
        processedValue = minValue;
      }
      if (processedValue > maxSeats) {
        processedValue = maxSeats;
      }
      console.log(processedValue, "this is processed value");
      updateData({ totalSeats: processedValue });
      setPricingData({ totalSeats: processedValue });
    } else if (field === "pricePerSeat") {
      updateData({ pricePerSeat: Number(processedValue) });
    }

    const newData = {
      ...pricingData,
      [field]: processedValue,
    };

    setPricingData(newData);

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (!selectedDate) return;

    // Store date separately
    const newData = {
      ...pricingData,
      departureDate: selectedDate,
    };

    setPricingData(newData);
    updateData({ departureDate: selectedDate });

    // If we have a time selected, combine them
    if (selectedTimeSlot) {
      const combinedDateTime = combineDateTime(selectedDate, selectedTimeSlot);
      newData.departureTime = combinedDateTime;
      updateData({ departureTime: combinedDateTime });
    }

    // Clear error
    if (errors.departureDate || errors.departureTime) {
      setErrors((prev) => ({
        ...prev,
        departureDate: "",
        departureTime: "",
      }));
    }
  };

  const handleTimeSelect = (slot) => {
    setSelectedTimeSlot(slot.value24h);
    setSelectedTimePeriod(slot.period);

    // Update pricing data with both formats
    const newData = {
      ...pricingData,
      departureTime24h: slot.value24h,
      departureTime12h: slot.value12h,
      timePeriod: slot.period,
      departureTime: combineDateTime(pricingData.departureDate, slot.value24h),
    };

    setPricingData(newData);

    // Update parent data
    updateData({
      departureTime24h: slot.value24h,
      departureTime12h: slot.value12h,
      timePeriod: slot.period,
      departureTime: combineDateTime(pricingData.departureDate, slot.value24h),
    });

    // Clear error
    if (errors.departureTime) {
      setErrors((prev) => ({ ...prev, departureTime: "" }));
    }
  };

  const combineDateTime = (dateString, timeString24h) => {
    if (!dateString || !timeString24h) return null;

    // Parse date and time
    const [year, month, day] = dateString.split("-").map(Number);
    const [hours, minutes] = timeString24h.split(":").map(Number);

    // Create date object
    const combinedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    // Check if time is in past, if so, move to next day
    const now = new Date();
    if (combinedDate <= now) {
      combinedDate.setDate(combinedDate.getDate() + 1);
    }

    return combinedDate.toISOString();
  };

  // Format date for display
  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    return {
      date: date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      full: date.toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Get current time for default selection
  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hour24 = now.getHours();
    const minute = now.getMinutes();
    const roundedMinute = minute < 30 ? "00" : "30";
    const adjustedHour = minute < 30 ? hour24 : (hour24 + 1) % 24;

    // Find matching time slot
    return (
      allTimeSlots.find(
        (slot) => slot.hour24 === adjustedHour && slot.minute === roundedMinute,
      ) || allTimeSlots[0]
    );
  };

  // Get peak time indicator
  const getPeakTimeInfo = () => {
    if (!pricingData.departureTime24h) return null;

    const [hours] = pricingData.departureTime24h.split(":").map(Number);
    const isPeak = (hours >= 8 && hours <= 10) || (hours >= 17 && hours <= 20);

    return {
      isPeak,
      label: isPeak ? "Peak Hours" : "Normal Hours",
      description: isPeak
        ? "Higher demand • Consider higher fare"
        : "Normal travel time",
    };
  };

  const peakTimeInfo = getPeakTimeInfo();
  const formattedDateTime = formatDateTime(pricingData.departureTime);
  const maxSeats = Math.max(1, carSeats - 1);
  const currentTimeSlot =
    allTimeSlots.find((slot) => slot.value24h === selectedTimeSlot) ||
    getCurrentTimeSlot();

  // Get tomorrow's date for min date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };
  const getTodayDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    return tomorrow.toISOString().split("T")[0];
  };

  // Time tab configuration
  const timeTabs = [
    { id: "all", label: "All Hours", icon: Clock, range: "00:00 - 23:30" },
    {
      id: "morning",
      label: "Morning",
      icon: Sunrise,
      range: "6:00 AM - 11:30 AM",
    },
    {
      id: "afternoon",
      label: "Afternoon",
      icon: Sun,
      range: "12:00 PM - 4:30 PM",
    },
    {
      id: "evening",
      label: "Evening",
      icon: Sunset,
      range: "5:00 PM - 9:30 PM",
    },
    { id: "night", label: "Night", icon: Moon, range: "10:00 PM - 5:30 AM" },
  ];

  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pricing-form"
    >
      <div className="">
        {/* Date & Time Selection */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E10600] to-[#C10500] flex items-center justify-center">
              <CalendarDays className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#111111]">
                Departure Time
              </h3>
              <p className="text-sm text-[#555555]">
                When will you start your journey?
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wide">
                Select Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={getTodayDate()}
                  value={pricingData.departureDate || ""}
                  onChange={handleDateChange}
                  className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                    errors.departureDate
                      ? "border-[#E10600]"
                      : "border-[#E5E5E5]"
                  } bg-[#F7F7F7] text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E10600]/20 focus:border-[#E10600] transition-all duration-200`}
                />
              </div>
              {errors.departureDate && (
                <p className="text-[#E10600] text-xs mt-1">
                  {errors.departureDate}
                </p>
              )}
            </div>

            {/* Time Selection with Tabs */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wide">
                Select Time *
              </label>

              {/* Time Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {timeTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setActiveTimeTab(tab.id)}
                      className={`flex-1 w-[40%] md:min-w-[120px] px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                        activeTimeTab === tab.id
                          ? "bg-[#E10600] text-white"
                          : "bg-[#F7F7F7] text-[#111111] hover:bg-[#E5E5E5]"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                      <span className="text-[10px] opacity-75">
                        {tab.range}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Time Slots Grid - Now shows ALL slots for selected category */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[200px] overflow-y-auto p-1">
                {visibleSlots.map((slot, index) => {
                  const isSelected = selectedTimeSlot === slot.value24h;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleTimeSelect(slot)}
                      disabled={!pricingData.departureDate}
                      className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isSelected
                          ? "bg-[#E10600] text-white shadow-sm"
                          : slot.period === "AM"
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {slot.display}
                    </motion.button>
                  );
                })}
              </div>

              {!pricingData.departureDate && (
                <p className="text-[#555555] text-xs mt-1">
                  Please select a date first
                </p>
              )}

              {/* Selected Time Details */}
              {selectedTimeSlot && (
                <div className="mt-3 text-xs text-[#555555]">
                  Selected:{" "}
                  <span className="font-semibold text-[#111111]">
                    {pricingData.departureTime12h} ({selectedTimePeriod})
                  </span>
                </div>
              )}
            </div>

            {/* Selected Time Display */}
            {pricingData.departureDate && selectedTimeSlot && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5] p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-[#E10600]" size={16} />
                    <div>
                      <div className="text-sm font-semibold text-[#111111]">
                        {formattedDateTime
                          ? formattedDateTime.full
                          : "Invalid date"}
                      </div>
                      <div className="text-xs text-[#555555]">
                        24h: {selectedTimeSlot} • 12h:{" "}
                        {pricingData.departureTime12h}
                      </div>
                    </div>
                  </div>
                  {peakTimeInfo && (
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
                        peakTimeInfo.isPeak
                          ? "bg-[#E10600]/10 text-[#E10600]"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      <Timer size={12} />
                      <span>{peakTimeInfo.label}</span>
                    </div>
                  )}
                </div>

                {peakTimeInfo && (
                  <div className="mt-2 text-xs text-[#555555]">
                    {peakTimeInfo.description}
                  </div>
                )}
              </motion.div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {errors.departureTime && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 border border-[#E10600]/20 p-3"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      className="text-[#E10600] flex-shrink-0"
                      size={16}
                    />
                    <p className="text-[#E10600] font-medium text-xs">
                      {errors.departureTime}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Seats & Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seats Selection */}

          {formData?.fullSharing ? (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      Full Vehicle Booking
                    </h4>
                    <p className="text-sm text-blue-700">
                      Your entire vehicle will be booked
                    </p>
                  </div>
                </div>
                <div className="w-10 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">ON</span>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E10600] to-[#C10500] flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#111111]">
                    Passenger Seats
                  </h3>
                  <p className="text-sm text-[#555555]">
                    Available for booking
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Seat Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#555555]">Vehicle Capacity:</span>
                    <span className="font-semibold text-[#111111]">
                      {carSeats} seats total
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#555555]">Driver's seat:</span>
                    <span className="font-semibold text-[#111111]">
                      1 seat (You)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-[#555555]">
                      Available for passengers:
                    </span>
                    <span className="font-semibold text-[#111111]">
                      Max {maxSeats} seats
                    </span>
                  </div>
                </div>

                {/* Seat Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wide">
                    Available Seats *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pricingData.totalSeats}
                      onKeyUp={(e) => handleChange("totalSeats", e.key)}
                      onKeyDown={(e) =>
                        setPricingData((prev) => ({ ...prev, totalSeats: 0 }))
                      }
                      className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                        errors.totalSeats
                          ? "border-[#E10600]"
                          : "border-[#E5E5E5]"
                      } bg-[#F7F7F7] text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E10600]/20 focus:border-[#E10600] transition-all duration-200`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                      <User className="text-[#555555]" size={14} />
                      <span className="text-sm text-[#555555] font-medium">
                        {pricingData.totalSeats} seat
                        {pricingData.totalSeats !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Seat Selection */}
                <div>
                  <div className="text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wide">
                    Quick Select
                  </div>

                  <div className="flex gap-2 flex-wrap w-full h-auto  justify-evenly">
                    {Array.from({ length: maxSeats }, (_, index) => {
                      const seatCount = index + 1;

                      return (
                        <motion.button
                          key={seatCount}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleChange("totalSeats", seatCount)}
                          className={`flex  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            pricingData.totalSeats === seatCount
                              ? "bg-[#E10600] text-white"
                              : "bg-[#F7F7F7] text-[#111111] hover:bg-[#E5E5E5]"
                          }`}
                        >
                          {seatCount} {seatCount === 1 ? "Solo" : "Seats"}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {errors.totalSeats && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-lg bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 border border-[#E10600]/20 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          className="text-[#E10600] flex-shrink-0"
                          size={16}
                        />
                        <p className="text-[#E10600] font-medium text-xs">
                          {errors.totalSeats}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Pricing */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E10600] to-[#C10500] flex items-center justify-center">
                <IndianRupee className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#111111]">
                  Set Your Fare for{" "}
                  {formData.distance || formData?.routeDetails?.distanceInKm}{" "}
                  Km.
                </h3>
                <p className="text-sm text-[#555555]">
                  Price per passenger seat
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Price Input */}
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-2 uppercase tracking-wide">
                  Price per Seat (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#111111] font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={minCharge}
                    max={maxCharge}
                    required
                    onBlur={(e) => handlePriceInputBlur(e)}
                    placeholder="Enter amount"
                    value={pricingData.pricePerSeat || ""}
                    onChange={(e) =>
                      handleChange("pricePerSeat", e.target.value)
                    }
                    className={`w-full pl-8 pr-3 py-2.5 text-sm rounded-lg border ${
                      errors.pricePerSeat
                        ? "border-[#E10600]"
                        : "border-[#E5E5E5]"
                    } bg-[#F7F7F7] text-[#111111] placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#E10600]/20 focus:border-[#E10600] transition-all duration-200`}
                  />
                </div>

                {/* Price Suggestions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {[minCharge, maxCharge]
                    .filter((price) => Number(price) > 0)
                    .map((price) => (
                      <motion.button
                        key={price}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() =>
                          handleChange("pricePerSeat", Math.round(price))
                        }
                        className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-200 ${
                          pricingData.pricePerSeat === price
                            ? "bg-[#E10600] text-white"
                            : "bg-[#F7F7F7] text-[#111111] hover:bg-[#E5E5E5]"
                        }`}
                      >
                        ₹{Math.round(price)}
                      </motion.button>
                    ))}
                </div>
              </div>

              {/* Total Earnings Preview */}
              {pricingData.pricePerSeat > 0 && pricingData.totalSeats > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5] p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="text-[#E10600]" size={16} />
                      <div>
                        <div className="text-sm font-semibold text-[#111111]">
                          Potential Earnings
                        </div>
                        <div className="text-xs text-[#555555]">
                          If all seats are booked
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-[#111111]">
                      ₹
                      {(
                        pricingData.pricePerSeat * pricingData.totalSeats
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#555555]">Per seat:</span>
                    <span className="font-semibold text-[#111111]">
                      ₹{pricingData.pricePerSeat.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-[#555555]">Seats available:</span>
                    <span className="font-semibold text-[#111111]">
                      {pricingData.totalSeats}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              <AnimatePresence>
                {errors.pricePerSeat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 border border-[#E10600]/20 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle
                        className="text-[#E10600] flex-shrink-0"
                        size={16}
                      />
                      <p className="text-[#E10600] font-medium text-xs">
                        {errors.pricePerSeat}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
