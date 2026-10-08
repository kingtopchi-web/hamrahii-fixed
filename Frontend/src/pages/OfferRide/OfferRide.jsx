// RideCreationForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AddressForm } from "./AddressForm";
import { CarDetailsForm } from "./CarDetailsForm";
import { PricingForm } from "./PricingForm";
import { PreferencesForm } from "./PreferencesForm";
import { StopsForm } from "./StopsForm";
import {
  MapPin,
  Car,
  Settings,
  Map,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  IndianRupee,
  Save,
  X,
  Trash2,
  Star,
  Clock,
  Navigation,
  Zap,
  Rocket,
  Loader,
  AlertTriangle,
  Route as RouteIcon,
} from "lucide-react";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PaymentPopup from "./PaymentPopp";
import { clearUserSessionDrafts } from "../../utils/sessionCleaner";
import { setUserDetails } from "../../store/userReducer";

export const initialOfferRideFormState = {
  userId: "",
  car: "",
  from: {
    city: "",
    address: "",
    coordinates: [],
    lat: null,
    lng: null,
    placeId: "",
  },
  to: {
    city: "",
    address: "",
    coordinates: [],
    lat: null,
    lng: null,
    placeId: "",
  },
  routeDetails: {
    distance: "",
    duration: "",
    polyline: "",
    bounds: null,
    selectedRouteIndex: 0,
    alternativeRoutes: [],
    summary: "",
    warnings: [],
  },
  isFullSharing: false,
  routeCities: [],
  carDetails: {},
  departureTime: "",
  departureDate: "",
  totalSeats: 0,
  pricePerSeat: 0,
  commisionValue: 0,
  preferences: {},
  stops: [],
  isVirtualMoneyUsed: false,
};

const OfferRide = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const prevUserIdRef = useRef(user?._id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ...initialOfferRideFormState,
    userId: user?._id || "",
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [showSavedRoutes, setShowSavedRoutes] = useState(false);
  const [showSaveRouteModal, setShowSaveRouteModal] = useState(false);
  const [routeName, setRouteName] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isRouteCalculated, setIsRouteCalculated] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync user details to ensure wallet balance is always current
  useEffect(() => {
    const syncUserDetails = async () => {
      try {
        const res = await Axios.post(api.user.getFullDetails);
        if (res?.data?.success && res?.data?.user) {
          dispatch(setUserDetails(res.data.user));
        }
      } catch (err) {
        // Silently continue
      }
    };
    syncUserDetails();
  }, [dispatch]);

  const resetOfferRideForm = () => {
    setFormData({
      ...initialOfferRideFormState,
      userId: user?._id || "",
    });
    setStep(1);
    setValidationErrors({});
    setIsRouteCalculated(false);
    setShowSubmit(false);
    clearUserSessionDrafts();
  };

  // Reset form whenever authenticated user changes or logs out
  useEffect(() => {
    if (prevUserIdRef.current !== user?._id) {
      prevUserIdRef.current = user?._id;
      resetOfferRideForm();
    }
  }, [user?._id]);

  // Initial load effect: starts clean unless returning from in-session wallet top-up
  useEffect(() => {
    document.title = "Offer a ride for passengers";

    if (location.state?.redirect === "prefrences") {
      try {
        const stored = localStorage.getItem("rideData");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (user?._id && parsed?.userId === user._id) {
            setFormData(parsed);
            setStep(4);
            return;
          }
        }
      } catch (err) {
        clearUserSessionDrafts();
      }
    }

    // Default: fresh start on new login, after logout, or normal navigation
    resetOfferRideForm();
  }, []);

  // Debounced auto-save ONLY for active in-session draft belonging to current user
  useEffect(() => {
    const hasData = Boolean(
      formData.from?.city ||
      formData.from?.address ||
      formData.to?.city ||
      formData.to?.address ||
      formData.carDetails?._id ||
      formData.pricePerSeat > 0
    );

    if (!hasData || !user?._id) {
      return;
    }

    const timeout = setTimeout(() => {
      const dataToStore = {
        ...formData,
        userId: user._id,
      };
      localStorage.setItem("rideData", JSON.stringify(dataToStore));
    }, 500);

    return () => clearTimeout(timeout);
  }, [formData, user?._id]);

  const colors = {
    primary: "#E10600",
    secondary: "#FF6B35",
    accent: "#FFD166",
    success: "#06D6A0",
    info: "#118AB2",
    dark: "#073B4C",
    light: "#F8F9FA",
    gray: "#6C757D",
    warning: "#FFD166",
  };

  const stepConfig = [
    {
      label: "Route",
      icon: MapPin,
      color: colors.primary,
      gradient: "from-red-500 to-orange-500",
      validate: () => validateStep1(),
    },
    {
      label: "Vehicle",
      icon: Car,
      color: colors.info,
      gradient: "from-blue-500 to-cyan-500",
      validate: () => validateStep2(),
    },
    {
      label: "Pricing",
      icon: IndianRupee,
      color: colors.success,
      gradient: "from-emerald-500 to-green-500",
      validate: () => validateStep3(),
    },
    {
      label: "Preferences",
      icon: Settings,
      color: colors.secondary,
      gradient: "from-purple-500 to-pink-500",
      validate: () => validateStep4(),
    },
    {
      label: "Stops",
      icon: Map,
      color: colors.warning,
      gradient: "from-amber-500 to-orange-500",
      validate: () => validateStep5(),
    },
  ];

  // Validation functions for each step
  const validateStep1 = () => {
    const errors = {};

    if (!formData.from.city || !formData.from.address) {
      errors.from = "Please select a valid starting location";
    }

    if (!formData.to.city || !formData.to.address) {
      errors.to = "Please select a valid destination";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};

    if (!formData.carDetails?.brand || !formData.carDetails?.model) {
      errors.carDetails = "Please select a vehicle";
    }

    if (!formData.carDetails?.plateNumber) {
      errors.licensePlate = "License plate is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};

    if (!formData.departureDate || !formData.departureTime) {
      errors.datetime = "Please select departure date and time";
    }

    if (formData.totalSeats < 1 || formData.totalSeats > 10) {
      errors.seats = "Please enter valid number of seats (1-10)";
    }

    if (formData.pricePerSeat <= 0 || formData.pricePerSeat > 10000) {
      errors.price = "Please enter a valid price (₹1 - ₹10,000)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    return true;
  };

  const validateStep5 = () => {
    return true;
  };

  const nextStep = () => {
    const currentStepValidator = stepConfig[step - 1].validate;

    if (currentStepValidator && !currentStepValidator()) {
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        toast.info(firstError);
      }
      return;
    }

    setValidationErrors({});

    if (step < stepConfig.length) {
      setStep(step + 1);
      // Add smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setValidationErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep = (stepNumber) => {
    if (stepNumber < step) {
      setStep(stepNumber);
      setValidationErrors({});
    } else if (stepNumber > step) {
      let canProceed = true;

      for (let i = step; i < stepNumber; i++) {
        const validator = stepConfig[i].validate;
        if (validator && !validator()) {
          canProceed = false;
          break;
        }
      }

      if (canProceed) {
        setStep(stepNumber);
        setValidationErrors({});
      } else {
        toast.info("Please complete current steps first");
      }
    }
  };

  useEffect(() => {
    if (!user?._id) {
      setSavedRoutes([]);
      return;
    }
    const saved = localStorage.getItem(`frequentRoutes_${user._id}`);
    if (saved) {
      try {
        const parsedRoutes = JSON.parse(saved);
        const sortedRoutes = parsedRoutes.sort(
          (a, b) => new Date(b.lastUsed) - new Date(a.lastUsed),
        );
        setSavedRoutes(sortedRoutes);
      } catch (error) {
        // console.error("Error loading saved routes:", error);
      }
    } else {
      setSavedRoutes([]);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id && savedRoutes.length > 0) {
      localStorage.setItem(`frequentRoutes_${user._id}`, JSON.stringify(savedRoutes));
    }
  }, [savedRoutes, user?._id]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const updateFormData = (section, data) => {
    if (section === "from" || section === "to") {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          ...data,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: data,
      }));
    }

    if (validationErrors[section]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[section];
        return newErrors;
      });
    }
  };

  const handleRouteCalculated = (routeData) => {
    setFormData((prev) => ({
      ...prev,
      routeDetails: routeData,
    }));
    setIsRouteCalculated(true);

    if (validationErrors.route) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.route;
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    let allValid = true;
    const allErrors = {};

    stepConfig.forEach((stepConfig, index) => {
      const validator = stepConfig.validate;
      if (validator && !validator()) {
        allValid = false;
        Object.assign(allErrors, validationErrors);
      }
    });

    if (!allValid) {
      setValidationErrors(allErrors);
      toast.info("Please complete all required fields");
      const firstErrorStep = stepConfig.findIndex((step) => {
        const validator = step.validate;
        return validator && !validator();
      });
      if (firstErrorStep >= 0) {
        setStep(firstErrorStep + 1);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        userId: user?._id || formData.userId,
        pricePerSeat: Number(formData?.pricePerSeat) || 0,
        totalSeats: Number(formData?.totalSeats) || 1,
      };
      const res = await Axios.post(api.ride.create, payload);

      if (res?.data?.success) {
        toast.success(res?.data?.message);
        resetOfferRideForm();
        navigate("/my-profile/offered-rides");
      }
    } catch (error) {
      console.log(error?.response?.data, "this is data....");
      if (
        error?.response?.data?.amountRequired ||
        error?.response?.data?.message?.includes("250") ||
        error?.response?.data?.message?.includes("balance") ||
        error?.response?.data?.message === "Insufficient wallet balance"
      ) {
        toast.info(error?.response?.data?.message || "Insufficient wallet balance");
        navigate("/my-profile/wallet", {
          state: {
            redirect: "prefrences",
            amount: error?.response?.data?.amountRequired || 250,
            type: "first-ride",
          },
        });
        return;
      }
      toast.info(error?.response?.data?.message || "Failed to create ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/20 py-6  sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-br from-red-200/20 to-orange-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl" />
      </div>

      {/* Notification */}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 hidden rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 md:flex items-center justify-center shadow-lg"
            >
              <Rocket className="text-white" size={28} />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                Create Your Ride
              </h1>
              <p className="text-gray-600 mt-2">
                Share your journey, earn while you travel
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar Container */}
        <div className="relative py-4 md:py-6">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5 blur-3xl rounded-3xl -z-30"></div>

          <div className="relative">
            {/* Glass progress track */}
            <div className="absolute top-6 left-4 right-4 h-2 bg-[var(--bg-surface)]/80 backdrop-blur-sm rounded-full shadow-inner border border-white/50 -z-10"></div>

            {/* Animated progress fill */}
            <motion.div
              className="absolute top-6 left-4 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-full shadow-lg shadow-red-500/30 -z-10"
              initial={{ width: 0 }}
              animate={{
                width: `calc(${((step - 1) / (stepConfig.length - 1)) * 100}% - 2rem)`,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Step indicators */}
            <div className="flex justify-between px-4">
              {stepConfig.map((config, index) => {
                const isActive = step === index + 1;
                const isCompleted = step > index + 1;
                const Icon = config.icon;

                return (
                  <motion.button
                    key={config.label}
                    whileHover={{ y: -4 }}
                    className="flex flex-col items-center cursor-pointer relative group focus:outline-none"
                    onClick={() => goToStep(index + 1)}
                  >
                    {/* Glass step container */}
                    <motion.div
                      animate={
                        isActive
                          ? {
                            scale: [1, 1.05, 1],
                            boxShadow: [
                              "0 10px 30px rgba(239, 68, 68, 0.2)",
                              "0 15px 40px rgba(239, 68, 68, 0.3)",
                              "0 10px 30px rgba(239, 68, 68, 0.2)",
                            ],
                          }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`
                relative
                w-12 h-12 
                sm:w-14 sm:h-14
                md:w-16 md:h-16
                rounded-2xl
                flex items-center justify-center
                backdrop-blur-sm
                border border-white/60
                shadow-lg
                transition-all duration-500
                ${isActive
                          ? `bg-gradient-to-br ${config.gradient} bg-opacity-90`
                          : isCompleted
                            ? `bg-gradient-to-br ${config.gradient} bg-opacity-80`
                            : "bg-[var(--bg-surface)]/60"
                        }
              `}
                    >
                      {/* Inner glow */}
                      <div
                        className={`absolute inset-2 rounded-xl ${isActive
                          ? "bg-[var(--bg-surface)]/20"
                          : isCompleted
                            ? "bg-[var(--bg-surface)]/10"
                            : "bg-transparent"
                          }`}
                      />

                      {/* Icon */}
                      <div className="relative z-10">
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white drop-shadow" />
                        ) : (
                          <Icon
                            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${isActive
                              ? "text-white drop-shadow"
                              : "text-gray-600"
                              }`}
                          />
                        )}
                      </div>

                      {/* Pulse ring for active */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-red-400/50"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                      )}
                    </motion.div>

                    {/* Label with subtle animation */}
                    <motion.div
                      className="mt-3 text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span
                        className={`
                  block
                  text-xs sm:text-sm md:text-base
                  font-medium
                  px-2 py-1
                  rounded-full
                  transition-all duration-300
                  ${isActive
                            ? "text-gray-900 bg-gradient-to-r from-red-50 to-orange-50"
                            : isCompleted
                              ? "text-gray-700"
                              : "text-gray-500"
                          }
                `}
                      >
                        {config.label}
                      </span>
                    </motion.div>

                    {/* Subtle indicator line */}
                    {index < stepConfig.length - 1 && (
                      <div
                        className={`absolute top-6 left-full w-full h-0.5 ${isCompleted
                          ? "bg-gradient-to-r from-green-400 to-emerald-400"
                          : "bg-gray-300/50"
                          }`}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Current step indicator */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-[var(--bg-surface)]/80 backdrop-blur-sm rounded-full shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
                  <span className="text-sm font-semibold text-gray-700">
                    Step {step}
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <span className="text-sm text-gray-600">
                  {stepConfig[step - 1]?.description ||
                    stepConfig[step - 1]?.label}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Form Container */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-[var(--bg-surface)] rounded-2xl shadow-2xl border border-[var(--border-subtle)]/50 overflow-hidden mb-8"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  {React.createElement(stepConfig[step - 1].icon, {
                    size: 24,
                    className: "text-white",
                  })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {stepConfig[step - 1].label}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    {step === 1 && "Set your pickup and drop locations"}
                    {step === 2 && "Only Approved Vehicle are showing"}
                    {step === 3 && "Set pricing and schedule"}
                    {step === 4 && "Customize ride preferences"}
                    {step === 5 && "Add intermediate stops (optional)"}
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-lg">
                <span className="text-white font-semibold">
                  Step {step}/{stepConfig.length}
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className=" md:p-8">
            {step === 1 && (
              <AddressForm
                data={formData}
                updateData={(fromData, toData) => {
                  updateFormData("from", fromData);
                  updateFormData("to", toData);
                }}
                setFormData={setFormData}
                onRouteCalculated={handleRouteCalculated}
                onNext={nextStep}
                onPrev={prevStep}
                currentStep={step}
                totalSteps={stepConfig.length}
                validationErrors={validationErrors}
                showSaveRouteModal={() => setShowSaveRouteModal(true)}
                showSavedRoutes={() => setShowSavedRoutes(true)}
              />
            )}

            {step === 2 && (
              <CarDetailsForm
                data={formData.carDetails}
                updateData={(data) => {
                  updateFormData("carDetails", data);
                  updateFormData("car", data?._id || "");
                }}
                onNext={nextStep}
                onPrev={prevStep}
                currentStep={step}
                totalSteps={stepConfig.length}
                validationErrors={validationErrors}
              />
            )}

            {step === 3 && (
              <PricingForm
                data={{
                  departureTime: formData.departureTime,
                  departureDate: formData.departureDate,
                  totalSeats: formData.totalSeats,
                  pricePerSeat: formData.pricePerSeat,
                }}
                formData={formData}
                updateData={(data) => {
                  setFormData((prev) => ({
                    ...prev,
                    ...data,
                  }));
                }}
                onNext={nextStep}
                onPrev={prevStep}
                setFormData={setFormData}
                currentStep={step}
                totalSteps={stepConfig.length}
                validationErrors={validationErrors}
              />
            )}

            {step === 4 && (
              <PreferencesForm
                data={formData.preferences}
                updateData={(data) => updateFormData("preferences", data)}
                onNext={nextStep}
                onPrev={prevStep}
                setFormData={setFormData}
                currentStep={step}
                totalSteps={stepConfig.length}
                validationErrors={validationErrors}
              />
            )}

            {step === 5 && (
              <StopsForm
                data={formData}
                updateData={(data) => updateFormData("stops", data)}
                onPrev={prevStep}
                onSubmit={handleSubmit}
                currentStep={step}
                totalSteps={stepConfig.length}
                formData={formData}
                setFormData={setFormData}
                loading={isSubmitting}
                setLoading={setIsSubmitting}
                validationErrors={validationErrors}
              />
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-3">
            {step > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-3 text-sm border border-gray-300 rounded-xl bg-[var(--bg-surface)] text-gray-700 hover:bg-gray-50 font-medium shadow-sm"
              >
                <ChevronLeft size={18} />
                Previous
              </motion.button>
            )}
          </div>

          <div className="flex gap-3">
            {step < 5 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-8 py-3 text-sm bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg font-semibold shadow-md"
                onClick={nextStep}
              >
                Continue
                <ChevronRight size={18} />
              </motion.button>
            )}

            {step === 5 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:shadow-xl font-semibold shadow-lg flex items-center justify-center gap-3"
                onClick={(e) => setShowSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Creating Ride...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Publish Ride Now
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Quick Summary Card */}

        {showSubmit ? (
          <PaymentPopup
            onClose={() => setShowSubmit(false)}
            onConfirm={() => handleSubmit()}
            amount={Math.round(formData?.commisionValue || 0)}
            isSubmitting={isSubmitting}
            isVirtualMoneyUsed={formData?.isVirtualMoneyUsed}
            setIsVirtualMoneyUsed={() =>
              setFormData((prev) => ({
                ...prev,
                isVirtualMoneyUsed: !prev.isVirtualMoneyUsed,
              }))
            }
          />
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default OfferRide;
