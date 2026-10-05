import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  Upload,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Search,
  X,
  Plus,
  FileText,
  Edit2,
  Settings,
  Menu,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { uploadImage } from "../../services/uploadImage";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "../../store/userReducer";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AddCar = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImageUrls, setUploadedImageUrls] = useState({
    carImages: [],
    plateImageUrl: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState({
    carImages: false,
    plateImage: false,
  });
  const [isFetchingData, setIsFetchingData] = useState(false);

  const isSkippedDl = () => {
    return (
      location.state?.skippedDl === true ||
      sessionStorage.getItem("dlSkipped") === "true"
    );
  };

  const [rcNumber, setRcNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [manualMode, setManualMode] = useState(() => isSkippedDl());
  const [showManualForm, setShowManualForm] = useState(() => isSkippedDl());
  const [verificationStatus, setVerificationStatus] = useState({
    chassis: null,
    engine: null,
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShowSelectType, setIsShowSelectType] = useState(false);

  // Form data structure
  const [formData, setFormData] = useState({
    images: [],
    plateImage: null,
    owner: "",
    brand: "",
    model: "",
    year: "",
    fuelType: "",
    transmission: "",
    seats: "",
    plateNumber: "",
    status: "pending",
    surepass: null,
    vehicleType: "",
    vehicleTypeId: "",
  });

  const STORAGE_KEY = "vehicle_form_draft";

  useEffect(() => {
    try {
      const isSkipped = isSkippedDl();
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        if (isSkipped) {
          setShowManualForm(true);
          setManualMode(true);
        }
        return;
      }

      const parsed = JSON.parse(saved);

      setFormData(parsed.formData || {});
      setRcNumber(parsed.rcNumber || "");
      setChassisNumber(parsed.chassisNumber || "");
      setEngineNumber(parsed.engineNumber || "");
      setVehicleData(parsed.vehicleData || null);
      setManualMode(isSkipped ? true : (parsed.manualMode || false));
      setShowManualForm(isSkipped ? true : (parsed.showManualForm || false));
      setVerificationStatus(
        parsed.verificationStatus || { chassis: null, engine: null },
      );
      setIsShowSelectType(parsed.isShowSelectType || false);

      if (parsed.currentStep) {
        setCurrentStep(parsed.currentStep);
      }

      if (parsed.formData?.images?.length || parsed.formData?.plateImage) {
        setUploadedImageUrls({
          carImages: parsed.formData.images || [],
          plateImageUrl: parsed.formData.plateImage || "",
        });
      }
    } catch (err) {
      console.error("Load failed:", err);
    }
  }, [location.state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draft = {
          currentStep,
          formData,
          rcNumber,
          chassisNumber,
          engineNumber,
          vehicleData,
          manualMode,
          showManualForm,
          verificationStatus,
          isShowSelectType,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch (err) {
        console.error("Save failed:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    currentStep,
    formData,
    rcNumber,
    chassisNumber,
    engineNumber,
    vehicleData,
    manualMode,
    showManualForm,
    verificationStatus,
    isShowSelectType,
  ]);

  useEffect(() => {
    if (user?._id) {
      setFormData((prev) => ({ ...prev, owner: user._id }));
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.skippedDl) {
      setShowManualForm(true);
      setManualMode(true);
      toast.info("Driving license skipped. You can enter your vehicle details below.");
    }
  }, [location.state?.skippedDl]);

  // Reset verification status when vehicle data changes
  useEffect(() => {
    if (vehicleData && !vehicleData.error) {
      setVerificationStatus({
        chassis: null,
        engine: null,
      });
    }
  }, [vehicleData]);

  const handleImageUpload = async (e, isPlateImage = false) => {
    const files = isPlateImage
      ? [e.target.files[0]]
      : Array.from(e.target.files);

    if (!files.length || !files[0]) {
      toast.info("No image selected");
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error("Some files exceed 5MB limit");
      return;
    }

    setIsUploading((prev) => ({
      ...prev,
      [isPlateImage ? "plateImage" : "carImages"]: true,
    }));

    try {
      for (const file of files) {
        const url = await uploadImage(file, isPlateImage ? "plate" : "car");

        if (isPlateImage) {
          setFormData((prev) => ({ ...prev, plateImage: url }));
          setUploadedImageUrls((prev) => ({
            ...prev,
            plateImageUrl: URL.createObjectURL(file),
          }));
          setErrors((prev) => {
            const next = { ...prev };
            delete next.plateImage;
            return next;
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            images: [url],
          }));

          setUploadedImageUrls((prev) => ({
            ...prev,
            carImages: [URL.createObjectURL(file)],
          }));
          setErrors((prev) => {
            const next = { ...prev };
            delete next.images;
            return next;
          });
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(
        `Failed to upload ${isPlateImage ? "plate image" : "images"}`,
      );
    } finally {
      setIsUploading((prev) => ({
        ...prev,
        [isPlateImage ? "plateImage" : "carImages"]: false,
      }));
      e.target.value = ""; // Reset file input
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    setUploadedImageUrls((prev) => ({
      ...prev,
      carImages: prev.carImages.filter((_, i) => i !== index),
    }));
  };

  const removePlateImage = () => {
    setFormData((prev) => ({ ...prev, plateImage: null }));
    setUploadedImageUrls((prev) => ({ ...prev, plateImageUrl: "" }));
  };

  const handleGetDataUsingApi = async () => {
    if (!rcNumber.trim()) {
      toast.error("Please enter RC Number");
      return;
    }

    setIsFetchingData(true);
    setVehicleData(null);
    setManualMode(false);
    setShowManualForm(false);
    setVerificationStatus({ chassis: null, engine: null });

    try {
      const res = await Axios.post(api.car.getDataBySurePassApi, {
        rcNumber: rcNumber.trim(),
      });

      if (res?.data?.success) {
        const data = res.data.data?.data || res.data?.data || res.data;
        setVehicleData(data);
        setManualMode(false);

        // Auto-fill form with fetched data
        setFormData((prev) => ({
          ...prev,
          brand: data?.maker_description || "",
          model: data?.maker_model || "",
          year: data?.manufacturing_date?.split("/")[1]
            ? parseInt(data.manufacturing_date.split("/")[1])
            : data?.manufacturing_date_formatted?.split("-")[0] || "",
          fuelType: data?.fuel_type?.toLowerCase() || "",
          seats: data?.seat_capacity ? parseInt(data.seat_capacity) : "",
          plateNumber: data?.rc_number || rcNumber.trim(),
          surepass: data,
        }));

        toast.success(
          "Vehicle data fetched successfully! Please verify chassis and engine numbers.",
        );
      } else {
        setVehicleData({ error: "No data found for this RC Number" });
        setManualMode(true);
        setShowManualForm(true);
        if (rcNumber && !formData.plateNumber) {
          setFormData((prev) => ({ ...prev, plateNumber: rcNumber.trim() }));
        }
        toast.warning("No vehicle data found. Please enter details manually.");
      }
    } catch (error) {
      setVehicleData({ error: "Failed to fetch vehicle data" });
      setManualMode(true);
      setShowManualForm(true);
      if (rcNumber && !formData.plateNumber) {
        setFormData((prev) => ({ ...prev, plateNumber: rcNumber.trim() }));
      }

      if (error.response) {
        toast.error("Vehicle Details are not available, please fill manually");
      } else if (error.request) {
        toast.error("Network error. Please check your connection or fill manually.");
      } else {
        toast.error("Failed to fetch vehicle data. Please enter manually.");
      }
    } finally {
      setIsFetchingData(false);
    }
  };

  const verifyChassisNumber = () => {
    if (!chassisNumber.trim()) {
      toast.error("Please enter chassis number");
      return;
    }

    if (!vehicleData) {
      toast.error("Please fetch vehicle data first");
      return;
    }

    const apiChassis =
      vehicleData?.vehicle_chasi_number?.split("*")[0].toUpperCase() || "";
    const userChassis = chassisNumber
      .trim()
      .slice(0, apiChassis.length)
      .toUpperCase();

    const isMatch = apiChassis === userChassis;

    setVerificationStatus((prev) => ({
      ...prev,
      chassis: isMatch,
    }));

    if (isMatch) {
      toast.success("Chassis number verified successfully!");
    } else {
      toast.error("Chassis number does not match. Please check and try again.");
    }
  };

  const verifyEngineNumber = () => {
    if (!engineNumber.trim()) {
      toast.error("Please enter engine number");
      return;
    }

    if (!vehicleData) {
      toast.error("Please fetch vehicle data first");
      return;
    }

    const apiEngine =
      vehicleData?.vehicle_engine_number?.split("*")[0]?.toUpperCase() || "";
    const userEngine = engineNumber
      .trim()
      .slice(0, apiEngine.length)
      .toUpperCase();

    const isMatch = apiEngine === userEngine;

    setVerificationStatus((prev) => ({
      ...prev,
      engine: isMatch,
    }));

    if (isMatch) {
      toast.success("Engine number verified successfully!");
    } else {
      toast.error("Engine number does not match. Please check and try again.");
    }
  };

  const handleManualInputToggle = () => {
    const nextState = !showManualForm;
    setShowManualForm(nextState);
    setManualMode(nextState);
    if (nextState) {
      if (rcNumber && !formData.plateNumber) {
        setFormData((prev) => ({ ...prev, plateNumber: rcNumber.trim() }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === "plateNumber" ? value.toUpperCase() : value;
    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
    if (name === "plateNumber") {
      setRcNumber(formattedValue);
    }
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validate Step 1 (Vehicle Data)
  const validateStep1 = () => {
    const newErrors = {};
    let isValid = true;

    if (!vehicleData && !showManualForm) {
      toast.error("Please fetch vehicle details using RC Number or enter manually.");
      return false;
    }

    // Validate required fields
    if (!formData.brand?.trim()) {
      newErrors.brand = "Brand is required";
      isValid = false;
    }

    if (!formData.model?.trim()) {
      newErrors.model = "Model is required";
      isValid = false;
    }

    if (!formData.year) {
      newErrors.year = "Year is required";
      isValid = false;
    } else if (
      formData.year < 1900 ||
      formData.year > new Date().getFullYear() + 1
    ) {
      newErrors.year = "Please enter a valid year";
      isValid = false;
    }

    if (!formData.fuelType) {
      newErrors.fuelType = "Fuel type is required";
      isValid = false;
    }

    if (!formData.transmission) {
      newErrors.transmission = "Transmission is required";
      isValid = false;
    }

    if (!formData.seats) {
      newErrors.seats = "Number of seats is required";
      isValid = false;
    } else if (formData.seats < 1 || formData.seats > 20) {
      newErrors.seats = "Please enter a valid number of seats (1-20)";
      isValid = false;
    }

    if (!formData.plateNumber?.trim()) {
      newErrors.plateNumber = "RC number is required";
      isValid = false;
    }

    // Validate chassis and engine numbers
    if (!chassisNumber.trim()) {
      newErrors.chassisNumber = "Chassis number is required";
      isValid = false;
    }

    if (!engineNumber.trim()) {
      newErrors.engineNumber = "Engine number is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Validate Step 2 (Mandatory Vehicle & Plate Images)
  const validateStep2 = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.images || formData.images.length === 0) {
      newErrors.images = "Vehicle image is mandatory. Please upload at least 1 photo.";
      isValid = false;
    }

    if (!formData.plateImage) {
      newErrors.plateImage = "License plate image is mandatory. Please upload the plate photo.";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const validateForm = () => {
    const isStep1Valid = validateStep1();
    if (!isStep1Valid) {
      setCurrentStep(1);
      return false;
    }

    const isStep2Valid = validateStep2();
    if (!isStep2Valid) {
      setCurrentStep(2);
      return false;
    }

    return true;
  };

  const handleProceedToStep2 = () => {
    if (!vehicleData && !showManualForm) {
      setShowManualForm(true);
      setManualMode(true);
      if (rcNumber && !formData.plateNumber) {
        setFormData((prev) => ({ ...prev, plateNumber: rcNumber.trim() }));
      }
      toast.info("Please fill in your vehicle details below to proceed.");
      return;
    }

    if (!validateStep1()) {
      const errorArray = Object.values(errors);
      toast.error(errorArray[0] || "Please fill all required vehicle details");
      return;
    }
    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedFromStep2 = () => {
    if (isUploading.carImages || isUploading.plateImage) {
      toast.info("Please wait for images to finish uploading");
      return;
    }
    if (!validateStep2()) {
      toast.error("Both Vehicle Photo and License Plate Photo are mandatory");
      return;
    }
    setIsShowSelectType(true);
  };

  const handleHeaderBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (selectedVehicleType = null) => {
    if (!validateForm()) {
      const errorArray = Object.values(errors);
      toast.error(errorArray[0] || "Please fix the errors in the form");
      return;
    }

    const vType = selectedVehicleType?.type || formData?.vehicleType;
    const vTypeId = selectedVehicleType?._id || formData?.vehicleTypeId;

    if (!vType || !vTypeId) {
      toast.info("Please select a vehicle type");
      setIsShowSelectType(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare car data for submission
      const carData = {
        userId: user?._id,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        fuelType: formData.fuelType.toLowerCase(),
        transmission: formData.transmission.toLowerCase(),
        seats: parseInt(formData.seats),
        images: formData.images,
        plateNumber: formData.plateNumber.trim(),
        plateImage: formData.plateImage,
        surepass: vehicleData && !vehicleData.error ? vehicleData : null,
        chassisNumber: chassisNumber.trim(),
        engineNumber: engineNumber.trim(),
        vehicleType: vType,
        vehicleTypeId: vTypeId,
      };

      const res = await Axios.post(api.car.add, carData);

      if (res?.data?.success) {
        setIsShowSelectType(false);
        setSuccessMessage(res?.data?.message || "Vehicle Created Successfully");
        if (res?.data?.user) {
          dispatch(setUserDetails(res?.data?.user));
        }
        toast.success("Vehicle added successfully!");
        localStorage.removeItem(STORAGE_KEY);

        // Reset form after success
        setFormData({
          images: [],
          plateImage: null,
          owner: user?._id || "",
          brand: "",
          model: "",
          year: "",
          fuelType: "",
          transmission: "",
          seats: "",
          plateNumber: "",
          status: "pending",
          surepass: null,
          vehicleType: "",
          vehicleTypeId: "",
        });
        setUploadedImageUrls({
          carImages: [],
          plateImageUrl: "",
        });
        setRcNumber("");
        setChassisNumber("");
        setEngineNumber("");
        setVehicleData(null);
        setManualMode(false);
        setShowManualForm(false);
        setVerificationStatus({ chassis: null, engine: null });
        setSuccessMessage("");
        navigate("/my-profile/cars");
      } else {
        throw new Error(res?.data?.message || "Failed to create car");
      }
    } catch (error) {
      console.log(error, "this is error");

      if (error.response?.data?.message?.includes("RC number")) {
        setErrors((prev) => ({
          ...prev,
          plateNumber: "RC number already exists",
        }));
        toast.error("This RC number is already registered");
      } else {
        setErrors((prev) => ({
          ...prev,
          submit:
            error.response?.data?.message ||
            "Failed to create car. Please try again.",
        }));
        toast.error(error.response?.data?.message || "Failed to create car");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.02, boxShadow: "0 4px 20px rgba(225, 6, 0, 0.2)" },
    tap: { scale: 0.98 },
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleHeaderBack}
              className="flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors p-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                {currentStep === 2 ? "Vehicle Data" : "Back"}
              </span>
            </button>
            <h1 className="text-xl font-bold text-[#111111]">
              Add New Vehicle
            </h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <Menu className="w-5 h-5 text-[#555555]" />
            </button>
          </div>

          <div className="bg-[#F7F7F7] rounded-xl p-3 border border-[#E5E5E5] mb-4">
            <p className="text-[#555555] text-xs sm:text-sm text-center">
              {currentStep === 1
                ? "Step 1: Enter RC Number to auto-fill vehicle details or enter manually."
                : "Step 2: Upload vehicle photo and license plate image (Both Mandatory *)."}
            </p>
          </div>
        </div>

        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden lg:block mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleHeaderBack}
              className="flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
              {currentStep === 2 ? "Back to Vehicle Data" : "Back"}
            </button>
            <Link
              to="/my-profile/add-car"
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="p-2 bg-[#E10600]/10 rounded-lg">
                <Car className="w-8 h-8 text-[#E10600]" />
              </div>
              <h1 className="text-3xl font-bold text-[#111111]">
                Add New Vehicle
              </h1>
            </Link>
            <div className="w-20"></div>
          </div>

          <div className="bg-[#F7F7F7] rounded-xl p-4 border border-[#E5E5E5]">
            <p className="text-[#555555] text-center">
              {currentStep === 1
                ? "Step 1: Enter RC Number to auto-fill vehicle details or enter manually."
                : "Step 2: Vehicle photo and license plate photo are strictly mandatory before adding."}
            </p>
          </div>
        </motion.div>

        {/* Stepper Progress Bar */}
        <div className="mb-6 md:mb-8">
          {/* Desktop Stepper */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 bg-[#F7F7F7] rounded-2xl border border-[#E5E5E5]">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`flex items-center gap-3 text-left ${
                currentStep > 1 ? "cursor-pointer" : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep > 1
                    ? "bg-green-600 text-white"
                    : currentStep === 1
                      ? "bg-[#E10600] text-white ring-4 ring-[#E10600]/20"
                      : "bg-[#E5E5E5] text-[#555555]"
                }`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <div>
                <p className="text-xs text-[#555555]">Step 1</p>
                <p className="text-sm font-semibold text-[#111111]">
                  Vehicle Details
                </p>
              </div>
            </button>

            <div
              className={`h-0.5 flex-1 mx-6 transition-colors ${
                currentStep > 1 ? "bg-green-600" : "bg-[#E5E5E5]"
              }`}
            ></div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep === 2
                    ? "bg-[#E10600] text-white ring-4 ring-[#E10600]/20"
                    : formData.images?.length > 0 && formData.plateImage
                      ? "bg-green-600 text-white"
                      : "bg-[#E5E5E5] text-[#555555]"
                }`}
              >
                {formData.images?.length > 0 &&
                formData.plateImage &&
                currentStep !== 2 ? (
                  <Check className="w-5 h-5" />
                ) : (
                  "2"
                )}
              </div>
              <div>
                <p className="text-xs text-[#E10600] font-semibold">
                  Step 2 • Mandatory
                </p>
                <p className="text-sm font-semibold text-[#111111]">
                  Images & Number Plate
                </p>
              </div>
            </div>

            <div
              className={`h-0.5 flex-1 mx-6 transition-colors ${
                formData.images?.length > 0 && formData.plateImage
                  ? "bg-green-600"
                  : "bg-[#E5E5E5]"
              }`}
            ></div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-[#E5E5E5] text-[#555555]">
                3
              </div>
              <div>
                <p className="text-xs text-[#555555]">Step 3</p>
                <p className="text-sm font-semibold text-[#111111]">
                  Type & Add Vehicle
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Stepper */}
          <div className="md:hidden bg-[#F7F7F7] p-4 rounded-xl border border-[#E5E5E5] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span
                className={
                  currentStep === 1
                    ? "text-[#E10600]"
                    : "text-green-600 cursor-pointer"
                }
                onClick={() => {
                  if (currentStep > 1) setCurrentStep(1);
                }}
              >
                {currentStep > 1 ? "✓ 1. Vehicle Data" : "1. Vehicle Data"}
              </span>
              <span
                className={
                  currentStep === 2
                    ? "text-[#E10600] font-bold"
                    : "text-[#555555]"
                }
              >
                2. Images & Plate *
              </span>
              <span className="text-[#555555]">3. Vehicle Type</span>
            </div>
            <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#E10600] h-full transition-all duration-300"
                style={{ width: currentStep === 1 ? "50%" : "100%" }}
              ></div>
            </div>
          </div>
        </div>

        {/* STEP 1: Vehicle Data Form */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-[#F7F7F7] rounded-2xl p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 border border-[#E5E5E5] shadow-sm"
          >
            {/* Entry Mode Switcher Tabs */}
            <div className="bg-white p-1.5 rounded-2xl border border-[#E5E5E5] shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualForm(false);
                    setManualMode(false);
                  }}
                  className={`py-3 px-3 sm:px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !showManualForm
                      ? "bg-[#E10600] text-white shadow-sm font-semibold"
                      : "text-[#555555] hover:text-[#111111] hover:bg-gray-100"
                  }`}
                >
                  <Search className="w-4 h-4 shrink-0" />
                  <span>Auto-fill with RC</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualForm(true);
                    setManualMode(true);
                    if (rcNumber && !formData.plateNumber) {
                      setFormData((prev) => ({ ...prev, plateNumber: rcNumber.trim() }));
                    }
                  }}
                  className={`py-3 px-3 sm:px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    showManualForm
                      ? "bg-[#E10600] text-white shadow-sm font-semibold"
                      : "text-[#555555] hover:text-[#111111] hover:bg-gray-100"
                  }`}
                >
                  <Edit2 className="w-4 h-4 shrink-0" />
                  <span>Enter Manually</span>
                </button>
              </div>
            </div>

            {/* RC Number Lookup Section */}
            {!showManualForm && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-[#111111] flex items-center gap-2">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#E10600]" />
                      Auto-fill via RC Number
                    </h3>
                    <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
                      Fetch vehicle model, make, year and specifications automatically
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualForm(true);
                      setManualMode(true);
                      if (rcNumber && !formData.plateNumber) {
                        setFormData((prev) => ({ ...prev, plateNumber: rcNumber.trim() }));
                      }
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 text-[#E10600] hover:bg-[#E10600]/10 border border-[#E10600]/30 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Enter Manually Instead</span>
                  </button>
                </div>

                {errors.rcNumber && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {errors.rcNumber}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={rcNumber}
                      onChange={(e) =>
                        setRcNumber(e.target.value.toUpperCase())
                      }
                      placeholder="Enter your RC Number (e.g., DL01AB1234)"
                      className="w-full px-4 py-3 text-sm sm:text-base border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#E10600] bg-white font-mono uppercase"
                      disabled={isFetchingData}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetDataUsingApi}
                    disabled={isFetchingData || !rcNumber.trim()}
                    className="px-4 sm:px-6 py-3 bg-[#E10600] hover:bg-[#C10500] disabled:bg-[#B8B8B8] disabled:cursor-not-allowed text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
                  >
                    {isFetchingData ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Fetching Data...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Fetch Vehicle Data</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-[#777777] px-1">
                  <span>Don't have RC or lookup failed?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualForm(true);
                      setManualMode(true);
                      if (rcNumber && !formData.plateNumber) {
                        setFormData((prev) => ({ ...prev, plateNumber: rcNumber.trim() }));
                      }
                    }}
                    className="text-[#E10600] font-semibold hover:underline cursor-pointer"
                  >
                    Enter details manually →
                  </button>
                </div>
              </div>
            )}

              {/* Manual Input Form */}
              {showManualForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 sm:p-6 rounded-xl border bg-white space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h4 className="font-semibold text-[#111111] flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-[#E10600]" />
                      Manual Vehicle Details
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium w-fit">
                      Manual Entry
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        Brand *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600]"
                        placeholder="e.g., Toyota, Honda"
                      />
                      {errors.brand && (
                        <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600]"
                        placeholder="e.g., Camry, Civic"
                      />
                      {errors.model && (
                        <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600]"
                        placeholder="e.g., 2023"
                      />
                      {errors.year && (
                        <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        Fuel Type *
                      </label>
                      <select
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600]"
                      >
                        <option value="">Select Fuel Type</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="cng">CNG</option>
                        <option value="electric">Electric</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                      {errors.fuelType && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.fuelType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        Transmission *
                      </label>
                      <select
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600]"
                      >
                        <option value="">Select Transmission</option>
                        <option value="manual">Manual</option>
                        <option value="automatic">Automatic</option>
                      </select>
                      {errors.transmission && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.transmission}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        Number of Seats *
                      </label>
                      <input
                        type="number"
                        name="seats"
                        value={formData.seats}
                        onChange={handleInputChange}
                        min="1"
                        max="20"
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600]"
                        placeholder="e.g., 5"
                      />
                      {errors.seats && (
                        <p className="mt-1 text-sm text-red-600">{errors.seats}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        RC Number *
                      </label>
                      <input
                        type="text"
                        name="plateNumber"
                        value={formData.plateNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600] font-mono uppercase"
                        placeholder="e.g., DL01AB1234"
                      />
                      {errors.plateNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.plateNumber}
                        </p>
                      )}
                    </div>

                    {/* Chassis Number for Manual Mode */}
                    <div>
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        Chassis Number *
                      </label>
                      <input
                        type="text"
                        value={chassisNumber}
                        onChange={(e) => setChassisNumber(e.target.value)}
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600] font-mono uppercase"
                        placeholder="Enter chassis number"
                      />
                      {errors.chassisNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.chassisNumber}
                        </p>
                      )}
                    </div>

                    {/* Engine Number for Manual Mode */}
                    <div>
                      <label className="block text-sm font-medium text-[#555555] mb-2">
                        Engine Number *
                      </label>
                      <input
                        type="text"
                        value={engineNumber}
                        onChange={(e) => setEngineNumber(e.target.value)}
                        className="w-full px-4 py-2 text-sm sm:text-base border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#E10600] font-mono uppercase"
                        placeholder="Enter engine number"
                      />
                      {errors.engineNumber && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.engineNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Vehicle Data Display (from API) */}
              {vehicleData && !showManualForm && !vehicleData.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Vehicle Details from RC */}
                  <div className="p-4 sm:p-6 rounded-xl border bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <h4 className="font-semibold text-[#111111] flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Vehicle Details from RC
                      </h4>
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium w-fit">
                        ✓ Auto-filled
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-[#555555]">Brand</p>
                        <p className="font-semibold text-sm sm:text-base text-[#111111]">
                          {formData.brand || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-[#555555]">Model</p>
                        <p className="font-semibold text-sm sm:text-base text-[#111111]">
                          {formData.model || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-[#555555]">Year</p>
                        <p className="font-semibold text-sm sm:text-base text-[#111111]">
                          {formData.year || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-[#555555]">Fuel Type</p>
                        <p className="font-semibold text-sm sm:text-base capitalize text-[#111111]">
                          {formData.fuelType || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-[#555555]">Seats</p>
                        <p className="font-semibold text-sm sm:text-base text-[#111111]">
                          {formData.seats || "N/A"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-[#555555]">RC Number</p>
                        <p className="font-semibold text-sm sm:text-base font-mono text-[#111111]">
                          {formData.plateNumber || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Chassis and Engine Verification */}
                    <div className="mt-4 space-y-4">
                      {/* Chassis Number Verification */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#555555]">
                          Chassis Number *
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={chassisNumber}
                            onChange={(e) => setChassisNumber(e.target.value)}
                            placeholder="Enter chassis number"
                            className={`flex-1 px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none font-mono uppercase ${
                              verificationStatus.chassis === true
                                ? "border-green-500 bg-green-50"
                                : verificationStatus.chassis === false
                                  ? "border-red-500 bg-red-50"
                                  : "border-[#E5E5E5]"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={verifyChassisNumber}
                            disabled={!chassisNumber.trim() || !vehicleData}
                            className="px-4 py-2 bg-[#E10600] hover:bg-[#C10500] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm sm:w-auto w-full transition-colors"
                          >
                            Verify Chassis
                          </button>
                        </div>
                        {errors.chassisNumber && (
                          <p className="text-sm text-red-600">
                            {errors.chassisNumber}
                          </p>
                        )}
                        {verificationStatus.chassis === true && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Chassis number verified
                          </p>
                        )}
                        {verificationStatus.chassis === false && (
                          <p className="text-sm text-red-600">
                            Does not match with RC data
                          </p>
                        )}
                      </div>

                      {/* Engine Number Verification */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-[#555555]">
                          Engine Number *
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={engineNumber}
                            onChange={(e) => setEngineNumber(e.target.value)}
                            placeholder="Enter engine number"
                            className={`flex-1 px-4 py-2 text-sm sm:text-base border rounded-lg focus:outline-none font-mono uppercase ${
                              verificationStatus.engine === true
                                ? "border-green-500 bg-green-50"
                                : verificationStatus.engine === false
                                  ? "border-red-500 bg-red-50"
                                  : "border-[#E5E5E5]"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={verifyEngineNumber}
                            disabled={!engineNumber.trim() || !vehicleData}
                            className="px-4 py-2 bg-[#E10600] hover:bg-[#C10500] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm sm:w-auto w-full transition-colors"
                          >
                            Verify Engine
                          </button>
                        </div>
                        {errors.engineNumber && (
                          <p className="text-sm text-red-600">
                            {errors.engineNumber}
                          </p>
                        )}
                        {verificationStatus.engine === true && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Engine number verified
                          </p>
                        )}
                        {verificationStatus.engine === false && (
                          <p className="text-sm text-red-600">
                            Does not match with RC data
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transmission Selection (Required for API data) */}
                  <div className="p-4 sm:p-6 rounded-xl border bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <h4 className="font-semibold text-[#111111] flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#E10600]" />
                        Select Transmission *
                      </h4>
                      <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium w-fit">
                        Required
                      </span>
                    </div>

                    {errors.transmission && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.transmission}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <label
                        className={`cursor-pointer ${
                          formData.transmission === "manual"
                            ? "ring-2 ring-[#E10600] rounded-xl"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="transmission"
                          value="manual"
                          checked={formData.transmission === "manual"}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            formData.transmission === "manual"
                              ? "border-[#E10600] bg-[#E10600]/5"
                              : "border-[#E5E5E5] hover:border-[#E10600]/50"
                          }`}
                        >
                          <div className="text-base sm:text-lg font-bold mb-1 text-[#111111]">
                            Manual
                          </div>
                          <div className="text-xs sm:text-sm text-[#555555]">
                            Traditional gear shifting
                          </div>
                        </div>
                      </label>

                      <label
                        className={`cursor-pointer ${
                          formData.transmission === "automatic"
                            ? "ring-2 ring-[#E10600] rounded-xl"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="transmission"
                          value="automatic"
                          checked={formData.transmission === "automatic"}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <div
                          className={`p-4 rounded-xl border-2 text-center transition-all ${
                            formData.transmission === "automatic"
                              ? "border-[#E10600] bg-[#E10600]/5"
                              : "border-[#E5E5E5] hover:border-[#E10600]/50"
                          }`}
                        >
                          <div className="text-base sm:text-lg font-bold mb-1 text-[#111111]">
                            Automatic
                          </div>
                          <div className="text-xs sm:text-sm text-[#555555]">
                            Automatic gear shifting
                          </div>
                        </div>
                      </label>
                    </div>

                    <p className="text-xs sm:text-sm text-[#555555]">
                      Note: Transmission info is not available in RC data.
                      Please select manual or automatic for your vehicle.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* API Error Display */}
              {vehicleData?.error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 sm:p-6 rounded-xl border bg-white space-y-4"
                >
                  <div className="text-red-600 p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="font-semibold text-sm sm:text-base">Unable to fetch vehicle details</p>
                    <p className="text-xs sm:text-sm mt-1 text-red-700">
                      {vehicleData.error}. You can enter your vehicle details manually without waiting.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualForm(true);
                        setManualMode(true);
                        if (rcNumber && !formData.plateNumber) {
                          setFormData((prev) => ({ ...prev, plateNumber: rcNumber.trim() }));
                        }
                      }}
                      className="mt-3 px-4 py-2 bg-[#E10600] text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#C10500] transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Enter Details Manually</span>
                    </button>
                  </div>
                </motion.div>
              )}

            {/* Next Button for Step 1 */}
            <div className="pt-2">
              <motion.button
                onClick={handleProceedToStep2}
                disabled={isFetchingData}
                type="button"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-[#E10600] to-[#C10500] hover:from-[#C10500] hover:to-[#A00400] text-white flex items-center justify-center gap-3 text-sm sm:text-base shadow-lg cursor-pointer disabled:bg-[#B8B8B8] disabled:cursor-not-allowed"
              >
                <span>Next: Upload Images & Number Plate</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Mandatory Images & Number Plate Upload */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Vehicle Summary Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5E5E5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#E10600]/10 rounded-xl shrink-0">
                  <Car className="w-7 h-7 text-[#E10600]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111111]">
                    {formData.brand} {formData.model} ({formData.year})
                  </h3>
                  <p className="text-xs sm:text-sm text-[#555555] mt-0.5">
                    RC:{" "}
                    <span className="font-mono font-semibold text-[#111111]">
                      {formData.plateNumber}
                    </span>{" "}
                    • {formData.fuelType?.toUpperCase()} •{" "}
                    {formData.transmission?.toUpperCase()} • {formData.seats}{" "}
                    Seats
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#E10600] hover:bg-[#E10600]/5 border border-[#E10600]/30 rounded-lg transition-colors w-fit shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Details
              </button>
            </div>

            {/* Mandatory Instruction Alert */}
            <div className="bg-red-50/80 rounded-xl p-4 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#E10600] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  Mandatory Documents Required
                </p>
                <p className="text-xs sm:text-sm text-red-700 mt-0.5">
                  Both your <strong>Vehicle Photo</strong> and{" "}
                  <strong>License Plate Photo</strong> are mandatory to complete
                  registration and verify your vehicle.
                </p>
              </div>
            </div>

            {/* 2-Column Responsive Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Car Images Upload */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-[#F7F7F7] rounded-2xl p-4 sm:p-6 border ${
                  errors.images
                    ? "border-red-400 bg-red-50/20"
                    : "border-[#E5E5E5]"
                } shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-[#111111] flex items-center gap-2">
                      <Upload className="w-5 h-5 text-[#E10600]" />
                      Vehicle Photo <span className="text-[#E10600]">*</span>
                    </h2>
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Mandatory
                    </span>
                  </div>

                  {errors.images && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-xs sm:text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errors.images}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {formData?.images?.length < 1 && (
                      <label className="block cursor-pointer group">
                        <div
                          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 group-hover:border-[#E10600] group-hover:bg-[#E10600]/5 ${
                            isUploading.carImages
                              ? "border-[#E10600] bg-[#E10600]/10"
                              : uploadedImageUrls.carImages.length > 0
                                ? "border-green-300 bg-green-50/50"
                                : "border-[#E5E5E5] bg-white"
                          }`}
                        >
                          {isUploading.carImages ? (
                            <div className="space-y-3">
                              <div className="w-10 h-10 mx-auto border-4 border-[#E10600] border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-[#111111] font-medium text-sm">
                                Uploading Vehicle Photo...
                              </p>
                              <p className="text-xs text-[#555555]">
                                Please wait
                              </p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 mx-auto text-[#555555] mb-3 group-hover:text-[#E10600] transition-colors" />
                              <p className="text-[#111111] font-semibold text-sm sm:text-base mb-1">
                                Upload Vehicle Photo
                              </p>
                              <p className="text-xs text-[#555555]">
                                Clear photo of your car from the outside
                              </p>
                              <p className="text-xs text-[#B8B8B8] mt-2">
                                Max 5MB • JPG, PNG, WebP
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="hidden"
                          disabled={isUploading.carImages}
                        />
                      </label>
                    )}

                    {/* Image Preview */}
                    {uploadedImageUrls.carImages.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#111111] flex items-center gap-1.5 text-green-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Vehicle Photo Uploaded
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {uploadedImageUrls.carImages.map((url, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="relative group rounded-xl overflow-hidden border border-[#E5E5E5] bg-white p-2"
                            >
                              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative">
                                <img
                                  src={url}
                                  alt="Car preview"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <motion.button
                                type="button"
                                onClick={() => removeImage(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute top-4 right-4 w-7 h-7 bg-[#E10600] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#C10500] transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {uploadedImageUrls.carImages.length > 0 && (
                  <label className="mt-4 block cursor-pointer">
                    <div className="py-2 px-3 border border-[#E5E5E5] hover:border-[#E10600] rounded-lg text-center text-xs font-semibold text-[#555555] hover:text-[#E10600] transition-colors bg-white">
                      Change Vehicle Photo
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                      disabled={isUploading.carImages}
                    />
                  </label>
                )}
              </motion.div>

              {/* Card 2: License Plate Image Upload */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`bg-[#F7F7F7] rounded-2xl p-4 sm:p-6 border ${
                  errors.plateImage
                    ? "border-red-400 bg-red-50/20"
                    : "border-[#E5E5E5]"
                } shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-[#111111] flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#E10600]" />
                      License Plate Photo <span className="text-[#E10600]">*</span>
                    </h2>
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Mandatory
                    </span>
                  </div>

                  {errors.plateImage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-xs sm:text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errors.plateImage}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {!uploadedImageUrls.plateImageUrl && (
                      <label className="block cursor-pointer group">
                        <div
                          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200 group-hover:border-[#E10600] group-hover:bg-[#E10600]/5 ${
                            isUploading.plateImage
                              ? "border-[#E10600] bg-[#E10600]/10"
                              : "border-[#E5E5E5] bg-white"
                          }`}
                        >
                          {isUploading.plateImage ? (
                            <div className="space-y-3">
                              <div className="w-10 h-10 mx-auto border-4 border-[#E10600] border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-[#111111] font-medium text-sm">
                                Uploading Plate Photo...
                              </p>
                              <p className="text-xs text-[#555555]">
                                Please wait
                              </p>
                            </div>
                          ) : (
                            <>
                              <FileText className="w-10 h-10 mx-auto text-[#555555] mb-3 group-hover:text-[#E10600] transition-colors" />
                              <p className="text-[#111111] font-semibold text-sm sm:text-base mb-1">
                                Upload Plate Photo
                              </p>
                              <p className="text-xs text-[#555555]">
                                Clear photo of the vehicle number plate
                              </p>
                              <p className="text-xs text-[#B8B8B8] mt-2">
                                Max 5MB • JPG, PNG, WebP
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                          disabled={isUploading.plateImage}
                        />
                      </label>
                    )}

                    {/* Plate Image Preview */}
                    {uploadedImageUrls.plateImageUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-green-700 flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Plate Photo Uploaded
                          </p>
                        </div>
                        <div className="relative rounded-xl overflow-hidden bg-white p-3 border border-[#E5E5E5]">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-2 relative">
                            <img
                              src={uploadedImageUrls.plateImageUrl}
                              alt="Plate preview"
                              className="max-h-full max-w-full object-contain"
                            />
                            <motion.button
                              type="button"
                              onClick={removePlateImage}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="absolute top-2 right-2 w-7 h-7 bg-[#E10600] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#C10500] transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <div className="mt-2 text-center">
                            <span className="text-xs font-mono font-bold bg-gray-100 text-[#111111] px-3 py-1 rounded">
                              {formData.plateNumber || "RC Number"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {uploadedImageUrls.plateImageUrl && (
                  <label className="mt-4 block cursor-pointer">
                    <div className="py-2 px-3 border border-[#E5E5E5] hover:border-[#E10600] rounded-lg text-center text-xs font-semibold text-[#555555] hover:text-[#E10600] transition-colors bg-white">
                      Change Plate Photo
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                      disabled={isUploading.plateImage}
                    />
                  </label>
                )}
              </motion.div>
            </div>

            {/* Error Message if submit failed */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 flex items-center gap-3"
              >
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800 text-sm sm:text-base">
                    Error
                  </p>
                  <p className="text-red-600 text-xs sm:text-sm">
                    {errors.submit}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 flex items-center gap-3"
              >
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 text-sm sm:text-base">
                    Success!
                  </p>
                  <p className="text-green-600 text-xs sm:text-sm">
                    {successMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2 Bottom Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-[#E5E5E5] hover:bg-gray-100 text-[#555555] font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Vehicle Data
              </button>

              <motion.button
                type="button"
                onClick={handleProceedFromStep2}
                disabled={
                  isSubmitting ||
                  isUploading.carImages ||
                  isUploading.plateImage
                }
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className={`flex-1 w-full sm:w-auto py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-200 ${
                  isSubmitting ||
                  isUploading.carImages ||
                  isUploading.plateImage
                    ? "bg-[#B8B8B8] cursor-not-allowed text-white"
                    : formData.images.length > 0 && formData.plateImage
                      ? "bg-gradient-to-r from-[#E10600] to-[#C10500] hover:from-[#C10500] hover:to-[#A00400] text-white shadow-lg cursor-pointer"
                      : "bg-[#E10600] hover:bg-[#C10500] text-white shadow-md cursor-pointer"
                } flex items-center justify-center gap-3 text-sm sm:text-base order-1 sm:order-2`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding Vehicle...</span>
                  </>
                ) : (
                  <>
                    <Car className="w-5 h-5" />
                    <span>Continue to Vehicle Type</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {isShowSelectType && (
        <ShowSelectVehicleType
          onClose={() => setIsShowSelectType(false)}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AddCar;

const ShowSelectVehicleType = ({
  onClose,
  setFormData,
  isSubmitting,
  onSubmit,
}) => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);

  const handleGetVehicleTypes = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await Axios.get(api.vehicleType.getByUser);
      } catch (getErr) {
        res = await Axios.post(api.vehicleType.getByUser);
      }

      if (res?.data?.success) {
        const types = res.data.vehicleTypes || res.data.data || [];
        setVehicleTypes(types);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load vehicle types",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetVehicleTypes();
  }, []);

  const handleSelectVehicleType = (vehicleType) => {
    setSelectedType(vehicleType);

    // Update parent form data
    setFormData((prev) => ({
      ...prev,
      vehicleType: vehicleType.type,
      vehicleTypeId: vehicleType._id,
    }));
  };

  const handleContinue = () => {
    if (!selectedType) {
      toast.error("Please select a vehicle type");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      vehicleType: selectedType.type,
      vehicleTypeId: selectedType._id,
    }));

    if (onSubmit) {
      onSubmit(selectedType);
    } else {
      onClose();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <Sparkles className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Vehicles
          </h3>
          <p className="text-gray-600">Getting available vehicle types...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Select Your Vehicle Type
              </h2>
              <p className="text-gray-600 mt-2">
                Choose the type of vehicle you want to register
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <p className="text-sm font-medium">
                <span className="font-semibold">Tip:</span> Select the vehicle
                type that matches your vehicle. This helps riders find the right
                ride.
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Types Grid */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {vehicleTypes.map((vehicleType, index) => (
              <motion.div
                key={vehicleType._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectVehicleType(vehicleType)}
                className={`relative cursor-pointer group rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  selectedType?._id === vehicleType._id
                    ? "border-purple-600 ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-purple-400 hover:shadow-lg"
                }`}
              >
                {/* Checkmark overlay */}
                {selectedType?._id === vehicleType._id && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-purple-600 text-white p-1.5 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                )}

                <div className="h-48 md:h-56 overflow-hidden bg-gray-100">
                  <img
                    src={vehicleType.image}
                    alt={vehicleType.type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.log("IMAGE ERROR:", e.target.src);
                    }}
                  />
                </div>

                {/* Vehicle Info */}
                <div className="p-4 md:p-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700">
                      {vehicleType.type}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {vehicleType.description}
                    </p>
                  </div>
                </div>

                {/* Selection Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${
                    selectedType?._id === vehicleType._id ? "opacity-100" : ""
                  }`}
                >
                  <div className="absolute bottom-4 left-4">
                    <span className="text-white text-sm font-medium">
                      {selectedType?._id === vehicleType._id
                        ? "Selected"
                        : "Click to select"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No vehicle types state */}
          {vehicleTypes.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Vehicle Types Available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There are no vehicle types configured yet. Please contact
                support.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              {selectedType ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={selectedType.image}
                      alt={selectedType.type}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Selected Vehicle</p>
                    <p className="font-semibold text-gray-900">
                      {selectedType.type}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  <span className="font-semibold">Step 1:</span> Select a
                  vehicle type from above
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedType || isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
