import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  MapPin,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Star,
  Globe,
  Sparkles,
  Shield,
  ChevronRight,
  Clock,
  ArrowLeft,
  Key,
  LogIn,
  Gift,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { api } from "../../services/endpoints";
import { Link, useNavigate, useParams } from "react-router-dom";
import Axios from "../../services/axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "../../store/userReducer";
import { toast } from "react-toastify";
import { countries } from "../../utils/countryCode";
import { Flag } from "../../components/Flags";
import { clearUserSessionDrafts } from "../../utils/sessionCleaner";

const Register = () => {
  const [registrationStep, setRegistrationStep] = useState(1); // 1: Phone, 2: OTP, 3: Password
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [referalCode, setreferalCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");

  const [selected, setSelected] = useState({
    name: "India",
    code: "IN",
    dial_code: "+91",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", ""]);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  const [passwordOtp, setPasswordOtp] = useState(["", "", "", "", "", ""]);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const phoneOtpInputRefs = useRef([]);
  const passwordOtpInputRefs = useRef([]);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (params?.referalCode) {
      setreferalCode(params.referalCode.toUpperCase());
    }
  }, [params]);

  useEffect(() => {
    if (user?.email || user?.phone) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = "Register | Humrahii";
  }, []);

  // Timer for OTP resend countdown
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && otpSent) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [timer, otpSent]);

  // Step 1: Handle Phone input change with strict numeric filtering
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(cleanVal);
    if (serverError) setServerError("");

    if (cleanVal.length === 0) {
      setPhoneError("");
    } else if (cleanVal.length === 10) {
      if (!/^[6-9]\d{9}$/.test(cleanVal)) {
        setPhoneError(
          "Enter a valid 10-digit Indian mobile number (starts with 6-9)"
        );
      } else {
        setPhoneError("");
      }
    } else {
      setPhoneError("Phone number must be exactly 10 digits");
    }
  };

  const handlePhoneBlur = () => {
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
    } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setPhoneError(
        "Enter a valid 10-digit Indian mobile number (starts with 6-9)"
      );
    } else {
      setPhoneError("");
    }
  };

  // Step 1: Send OTP to verify phone
  const handleSendOtpVerifyPhone = async () => {
    let hasError = false;
    if (!phoneNumber) {
      setPhoneError("Phone number is required");
      hasError = true;
    } else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setPhoneError(
        "Enter a valid 10-digit Indian mobile number (starts with 6-9)"
      );
      hasError = true;
    }

    if (!termsAccepted) {
      setTermsError("You must accept the Terms and Privacy Policy");
      hasError = true;
    } else {
      setTermsError("");
    }

    if (hasError || loading) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await Axios.post(api.user.sendPhoneVerificationOtp, {
        phone: phoneNumber,
        referalCode: referalCode.trim(),
      });

      if (res.data?.success) {
        setOtpSent(true);
        setRegistrationStep(2);
        setTimer(60);
        setCanResendOtp(false);
        setServerError("");
        toast.success(res.data?.message || "Verification code sent to your phone");
        setTimeout(() => {
          if (phoneOtpInputRefs.current[0]) {
            phoneOtpInputRefs.current[0].focus();
          }
        }, 100);
      } else {
        const errMsg = res.data?.message || "Failed to send OTP";
        setServerError(errMsg);
        toast.error(errMsg);
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Failed to send verification code. Please try again.";
      setServerError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp || loading) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await Axios.post(api.user.sendPhoneVerificationOtp, {
        phone: phoneNumber,
        referalCode: referalCode.trim(),
      });

      if (res.data?.success) {
        setTimer(60);
        setCanResendOtp(false);
        setServerError("");
        setPhoneOtp(["", "", "", ""]);
        toast.success("New verification code sent!");
        setTimeout(() => {
          if (phoneOtpInputRefs.current[0]) {
            phoneOtpInputRefs.current[0].focus();
          }
        }, 100);
      } else {
        setServerError(res.data?.message || "Failed to resend OTP");
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Failed to resend verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle 4-digit OTP digit change
  const handlePhoneOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const char = cleaned.slice(-1);
    const newOtp = [...phoneOtp];
    newOtp[index] = char;
    setPhoneOtp(newOtp);
    if (serverError) setServerError("");

    if (char && index < 3) {
      setTimeout(() => {
        if (phoneOtpInputRefs.current[index + 1]) {
          phoneOtpInputRefs.current[index + 1].focus();
        }
      }, 10);
    }
  };

  const handlePhoneOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!phoneOtp[index] && index > 0) {
        e.preventDefault();
        const newOtp = [...phoneOtp];
        newOtp[index - 1] = "";
        setPhoneOtp(newOtp);
        setTimeout(() => {
          if (phoneOtpInputRefs.current[index - 1]) {
            phoneOtpInputRefs.current[index - 1].focus();
          }
        }, 10);
      } else if (phoneOtp[index]) {
        const newOtp = [...phoneOtp];
        newOtp[index] = "";
        setPhoneOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      phoneOtpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      phoneOtpInputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleVerifyPhoneOtp();
    }
  };

  const handlePhoneOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!pastedData) return;

    const newOtp = [...phoneOtp];
    for (let i = 0; i < 4; i++) {
      newOtp[i] = pastedData[i] || "";
    }
    setPhoneOtp(newOtp);
    if (serverError) setServerError("");

    const targetIndex = Math.min(pastedData.length, 3);
    setTimeout(() => {
      if (phoneOtpInputRefs.current[targetIndex]) {
        phoneOtpInputRefs.current[targetIndex].focus();
      }
    }, 10);
  };

  // Step 2: Verify Phone OTP
  const handleVerifyPhoneOtp = async () => {
    const otpString = phoneOtp.join("");
    if (otpString.length !== 4) {
      setServerError("Please enter complete 4-digit verification code");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const res = await Axios.post(api.user.verifyPhoneOtp, {
        phone: phoneNumber,
        otp: otpString,
      });

      if (res.data?.success) {
        setPhoneVerified(true);
        setRegistrationStep(3);
        setServerError("");
        toast.success("Phone verified successfully!");
        setTimeout(() => {
          if (passwordOtpInputRefs.current[0]) {
            passwordOtpInputRefs.current[0].focus();
          }
        }, 100);
      } else {
        setServerError(res.data?.message || "Invalid OTP code");
        setPhoneOtp(["", "", "", ""]);
        phoneOtpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      setServerError(errMsg);
      setPhoneOtp(["", "", "", ""]);
      phoneOtpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Handle 6-digit password setup
  const handlePasswordOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const char = cleaned.slice(-1);
    const newPassword = [...passwordOtp];
    newPassword[index] = char;
    setPasswordOtp(newPassword);
    if (passwordError) setPasswordError("");
    if (serverError) setServerError("");

    if (char && index < 5) {
      setTimeout(() => {
        if (passwordOtpInputRefs.current[index + 1]) {
          passwordOtpInputRefs.current[index + 1].focus();
        }
      }, 10);
    }
  };

  const handlePasswordOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!passwordOtp[index] && index > 0) {
        e.preventDefault();
        const newPassword = [...passwordOtp];
        newPassword[index - 1] = "";
        setPasswordOtp(newPassword);
        setTimeout(() => {
          if (passwordOtpInputRefs.current[index - 1]) {
            passwordOtpInputRefs.current[index - 1].focus();
          }
        }, 10);
      } else if (passwordOtp[index]) {
        const newPassword = [...passwordOtp];
        newPassword[index] = "";
        setPasswordOtp(newPassword);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      passwordOtpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      passwordOtpInputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      onCompleteRegistration();
    }
  };

  const handlePasswordOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newPassword = [...passwordOtp];
    for (let i = 0; i < 6; i++) {
      newPassword[i] = pastedData[i] || "";
    }
    setPasswordOtp(newPassword);
    if (passwordError) setPasswordError("");
    if (serverError) setServerError("");

    const targetIndex = Math.min(pastedData.length, 5);
    setTimeout(() => {
      if (passwordOtpInputRefs.current[targetIndex]) {
        passwordOtpInputRefs.current[targetIndex].focus();
      }
    }, 10);
  };

  // Step 3: Complete registration
  const onCompleteRegistration = async () => {
    if (!phoneVerified) {
      setServerError("Please verify your phone number first");
      return;
    }

    const passwordString = passwordOtp.join("");
    if (passwordString.length !== 6) {
      setPasswordError("Please create a complete 6-digit password");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const registrationData = {
        phone: phoneNumber,
        password: passwordString,
        referralCode: referalCode.trim(),
        country: selected,
      };

      const response = await Axios.post(api.user.register, registrationData);

      if (response.data?.success) {
        clearUserSessionDrafts();
        setSuccess(true);
        dispatch(setUserDetails(response?.data?.user));
        toast.success(
          response.data?.message || "Account created successfully!"
        );
        setTimeout(() => {
          navigate("/my-profile");
        }, 2000);
      } else {
        const errMsg = response.data?.message || "Registration failed";
        setServerError(errMsg);
        toast.error(errMsg);
        setPasswordOtp(["", "", "", "", "", ""]);
        passwordOtpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setServerError(errMsg);
      toast.error(errMsg);
      setPasswordOtp(["", "", "", "", "", ""]);
      passwordOtpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const goBackToPhone = () => {
    setRegistrationStep(1);
    setOtpSent(false);
    setPhoneVerified(false);
    setPhoneOtp(["", "", "", ""]);
    setServerError("");
  };

  const goBackToOtp = () => {
    setRegistrationStep(2);
    setPhoneVerified(false);
    setServerError("");
  };

  const floatingElements = [
    { icon: <Plane size={24} />, top: "10%", left: "5%", delay: 0 },
    { icon: <Globe size={24} />, top: "15%", right: "5%", delay: 0.5 },
    { icon: <MapPin size={24} />, top: "80%", left: "10%", delay: 1 },
    { icon: <Star size={24} />, top: "85%", right: "12%", delay: 1.5 },
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center">
        {/* Step 1: Phone */}
        <div className="flex flex-col items-center">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              registrationStep >= 1
                ? "bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white shadow-sm"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {registrationStep > 1 ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              "1"
            )}
          </div>
          <span className="text-xs font-semibold mt-1 text-gray-600">
            Phone
          </span>
        </div>

        <div
          className={`w-12 sm:w-16 h-1 mx-1.5 sm:mx-2 rounded-full transition-all duration-300 ${
            registrationStep >= 2
              ? "bg-gradient-to-r from-[#E10600] to-[#FF3B30]"
              : "bg-gray-200"
          }`}
        />

        {/* Step 2: OTP */}
        <div className="flex flex-col items-center">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              registrationStep >= 2
                ? "bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white shadow-sm"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {registrationStep > 2 ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              "2"
            )}
          </div>
          <span className="text-xs font-semibold mt-1 text-gray-600">
            OTP
          </span>
        </div>

        <div
          className={`w-12 sm:w-16 h-1 mx-1.5 sm:mx-2 rounded-full transition-all duration-300 ${
            registrationStep >= 3
              ? "bg-gradient-to-r from-[#E10600] to-[#FF3B30]"
              : "bg-gray-200"
          }`}
        />

        {/* Step 3: Password */}
        <div className="flex flex-col items-center">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              registrationStep >= 3
                ? "bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white shadow-sm"
                : "bg-gray-200 text-gray-400"
            }`}
          >
            {success ? <CheckCircle className="w-5 h-5" /> : "3"}
          </div>
          <span className="text-xs font-semibold mt-1 text-gray-600">
            Password
          </span>
        </div>
      </div>
    </div>
  );

  const isStep1Valid =
    phoneNumber.length === 10 &&
    /^[6-9]\d{9}$/.test(phoneNumber) &&
    termsAccepted;

  const isOtpComplete = phoneOtp.every((d) => d !== "");
  const isPasswordComplete = passwordOtp.every((d) => d !== "");
  const enteredPasswordLength = passwordOtp.filter((d) => d !== "").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50 overflow-hidden relative pt-18 sm:pt-24 pb-20 md:pb-12 px-2.5 sm:px-4">
      {/* Floating Travel Icons */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-red-200/40 pointer-events-none hidden md:block"
          style={{
            top: element.top,
            left: element.left,
            right: element.right,
          }}
          initial={{ y: 0 }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: 4,
            delay: element.delay,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {element.icon}
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-3 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white py-1.5 px-4 rounded-full text-xs sm:text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Join Our Travel Community</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
            Start your journey with us. Share rides, connect with verified
            travelers, and save together.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
          {/* Left Side - Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-7/12"
          >
            <div className="bg-[var(--bg-surface)] rounded-3xl shadow-card-hover p-6 sm:p-8 md:p-10 border border-[var(--border-subtle)] h-full flex flex-col justify-between">
              {success ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-10 my-auto"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-20 h-20 mx-auto mb-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Welcome Aboard!
                  </h2>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Your account has been created successfully. Redirecting to
                    your profile...
                  </p>
                  <div className="w-40 h-1.5 bg-gray-100 mx-auto rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </motion.div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <User className="w-5 h-5 text-red-600" />
                      {registrationStep === 1 && "Enter Phone Number"}
                      {registrationStep === 2 && "Verify Phone OTP"}
                      {registrationStep === 3 && "Set 6-Digit Password"}
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      {registrationStep === 1 &&
                        "We'll send a 4-digit verification code to your phone"}
                      {registrationStep === 2 &&
                        `Code sent to ${phoneNumber}`}
                      {registrationStep === 3 &&
                        "Create a fast 6-digit numeric password for logins"}
                    </p>
                  </div>

                  {/* Step Indicator */}
                  {renderStepIndicator()}

                  {/* Server Error Alert */}
                  <AnimatePresence>
                    {serverError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2.5"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                        <span className="font-medium">{serverError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* STEP 1: Phone + Referral + Terms */}
                  {registrationStep === 1 && (
                    <div className="space-y-5">
                      {/* Phone Number Input */}
                      <div>
                        <label
                          htmlFor="register-phone"
                          className="block text-gray-700 mb-1.5 text-sm font-medium"
                        >
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div
                          className={`relative flex items-center rounded-xl border transition-all duration-200 bg-gray-50/50 hover:bg-[var(--bg-surface)] overflow-hidden ${
                            phoneError
                              ? "border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                              : "border-gray-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                          }`}
                        >
                          {/* Country Flag Selector */}
                          <div className="relative flex items-center pl-3 pr-2.5 py-3.5 border-r border-[var(--border-subtle)] bg-gray-100/70 hover:bg-gray-200/60 transition-colors shrink-0 cursor-pointer">
                            <div className="flex items-center gap-1">
                              <Flag size={40} code={selected?.code || "IN"} />
                              <ChevronDown size={14} className="text-gray-500" />
                            </div>
                            <select
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              onChange={(e) => {
                                try {
                                  const sel = JSON.parse(e.target.value);
                                  setSelected(sel);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              value={JSON.stringify(selected)}
                              aria-label="Select Country"
                            >
                              {countries.map((country) => (
                                <option
                                  key={country.code}
                                  value={JSON.stringify(country)}
                                >
                                  {country.name} ({country.dial_code})
                                </option>
                              ))}
                            </select>
                          </div>

                          <input
                            id="register-phone"
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            onBlur={handlePhoneBlur}
                            placeholder="Enter 10-digit mobile number"
                            disabled={loading}
                            className="w-full px-3.5 py-3.5 outline-none bg-transparent text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base"
                          />
                        </div>
                        {phoneError && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{phoneError}</span>
                          </p>
                        )}
                      </div>

                      {/* Referral Code Field */}
                      <div>
                        <label
                          htmlFor="referral-code"
                          className="block text-gray-700 mb-1.5 text-sm font-medium"
                        >
                          Referral Code{" "}
                          <span className="text-gray-400 text-xs font-normal">
                            (Optional)
                          </span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            id="referral-code"
                            type="text"
                            value={referalCode}
                            onChange={(e) => {
                              setreferalCode(e.target.value.toUpperCase());
                              if (serverError) setServerError("");
                            }}
                            placeholder="e.g. JOIN2026"
                            disabled={loading}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all bg-gray-50/50 hover:bg-[var(--bg-surface)] text-sm sm:text-base uppercase tracking-wider font-semibold text-gray-800"
                          />
                          <Gift className="absolute left-3.5 w-4 h-4 text-gray-400" />
                        </div>
                      </div>

                      {/* Terms & Conditions Checkbox */}
                      <div className="pt-1">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => {
                              setTermsAccepted(e.target.checked);
                              if (e.target.checked) setTermsError("");
                            }}
                            className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                            disabled={loading}
                          />
                          <span className="text-xs sm:text-sm text-gray-600 leading-snug">
                            I agree to the{" "}
                            <Link
                              to="/terms"
                              target="_blank"
                              className="text-red-600 font-semibold hover:underline"
                            >
                              Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                              to="/privacy"
                              target="_blank"
                              className="text-red-600 font-semibold hover:underline"
                            >
                              Privacy Policy
                            </Link>
                          </span>
                        </label>
                        {termsError && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{termsError}</span>
                          </p>
                        )}
                      </div>

                      {/* Send OTP Button */}
                      <motion.button
                        type="button"
                        onClick={handleSendOtpVerifyPhone}
                        disabled={loading || !isStep1Valid}
                        whileHover={
                          !loading && isStep1Valid ? { scale: 1.01 } : {}
                        }
                        whileTap={
                          !loading && isStep1Valid ? { scale: 0.98 } : {}
                        }
                        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                          loading || !isStep1Valid
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-[#E10600] to-[#FF3B30] hover:from-[#c50500] hover:to-[#e6352b] shadow-md hover:shadow-lg cursor-pointer"
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending OTP...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span>Send Verification Code</span>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </motion.button>
                    </div>
                  )}

                  {/* STEP 2: 4-digit OTP Verification */}
                  {registrationStep === 2 && (
                    <div className="space-y-6">
                      <button
                        type="button"
                        onClick={goBackToPhone}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Change phone number ({phoneNumber})</span>
                      </button>

                      <div className="text-center">
                        <label className="block text-gray-700 mb-3 text-sm font-medium">
                          Enter 4-digit verification code
                        </label>

                        {/* 4-digit OTP boxes */}
                        <div
                          className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-4"
                          onPaste={handlePhoneOtpPaste}
                        >
                          {phoneOtp.map((digit, index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              ref={(el) =>
                                (phoneOtpInputRefs.current[index] = el)
                              }
                              type="text"
                              maxLength={1}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={digit}
                              onChange={(e) =>
                                handlePhoneOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) =>
                                handlePhoneOtpKeyDown(index, e)
                              }
                              className={`w-11 h-13 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                                digit
                                  ? "border-red-500 bg-red-50/20 text-gray-900"
                                  : "border-gray-300 bg-gray-50/50 hover:bg-[var(--bg-surface)] focus:border-red-500 focus:ring-2 focus:ring-red-100"
                              }`}
                              disabled={loading}
                              aria-label={`OTP Digit ${index + 1}`}
                            />
                          ))}
                        </div>

                        {/* Resend OTP Timer & Button */}
                        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600 mt-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {timer > 0 ? (
                            <span>
                              Resend code in{" "}
                              <strong className="text-red-600">{timer}s</strong>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendOtp}
                              disabled={!canResendOtp || loading}
                              className={`font-semibold transition-colors flex items-center gap-1 ${
                                canResendOtp && !loading
                                  ? "text-red-600 hover:text-red-700 cursor-pointer underline"
                                  : "text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <RefreshCw size={13} />
                              <span>Resend Verification Code</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Verify Button */}
                      <motion.button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={loading || !isOtpComplete}
                        whileHover={
                          !loading && isOtpComplete ? { scale: 1.01 } : {}
                        }
                        whileTap={
                          !loading && isOtpComplete ? { scale: 0.98 } : {}
                        }
                        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                          loading || !isOtpComplete
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-[#E10600] to-[#FF3B30] hover:from-[#c50500] hover:to-[#e6352b] shadow-md hover:shadow-lg cursor-pointer"
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Verifying code...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span>Verify & Continue</span>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </motion.button>
                    </div>
                  )}

                  {/* STEP 3: 6-digit Password Setup */}
                  {registrationStep === 3 && (
                    <div className="space-y-5">
                      <button
                        type="button"
                        onClick={goBackToOtp}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to verification step</span>
                      </button>

                      {/* Phone Verified Banner */}
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium">
                          Verified Phone: {phoneNumber}
                        </span>
                      </div>

                      {/* 6-Digit Password Input */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-gray-700 text-sm font-medium">
                            Create 6-Digit Numeric Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <>
                                <EyeOff size={14} />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye size={14} />
                                <span>Show</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* PIN Boxes */}
                        <div
                          className="flex justify-between items-center gap-1 sm:gap-2 md:gap-2.5 my-3 w-full"
                          onPaste={handlePasswordOtpPaste}
                        >
                          {passwordOtp.map((digit, index) => (
                            <input
                              key={index}
                              id={`register-password-${index}`}
                              ref={(el) =>
                                (passwordOtpInputRefs.current[index] = el)
                              }
                              type={showPassword ? "text" : "password"}
                              maxLength={1}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={digit}
                              onChange={(e) =>
                                handlePasswordOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) =>
                                handlePasswordOtpKeyDown(index, e)
                              }
                              className={`w-9 h-11 sm:w-11 sm:h-12 md:w-12 md:h-12 text-center text-base sm:text-xl font-bold rounded-xl border-2 transition-all outline-none ${
                                passwordError
                                  ? "border-red-400 bg-red-50/30"
                                  : digit
                                  ? "border-red-500 bg-red-50/20 text-gray-900"
                                  : "border-gray-300 bg-gray-50/50 hover:bg-[var(--bg-surface)] focus:border-red-500 focus:ring-2 focus:ring-red-100"
                              }`}
                              disabled={loading}
                              aria-label={`Digit ${index + 1} of 6`}
                            />
                          ))}
                        </div>

                        {passwordError && (
                          <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>{passwordError}</span>
                          </p>
                        )}

                        {/* Password strength indicator */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-gray-500">
                              Digits entered: {enteredPasswordLength}/6
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                enteredPasswordLength === 6
                                  ? "text-green-600"
                                  : enteredPasswordLength >= 4
                                  ? "text-amber-500"
                                  : "text-gray-400"
                              }`}
                            >
                              {enteredPasswordLength === 6
                                ? "✓ Ready"
                                : "6 digits required"}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={false}
                              animate={{
                                width: `${(enteredPasswordLength / 6) * 100}%`,
                              }}
                              transition={{ duration: 0.2 }}
                              className={`h-full ${
                                enteredPasswordLength === 6
                                  ? "bg-green-500"
                                  : enteredPasswordLength >= 4
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Complete Registration Button */}
                      <motion.button
                        type="button"
                        onClick={onCompleteRegistration}
                        disabled={loading || !isPasswordComplete}
                        whileHover={
                          !loading && isPasswordComplete ? { scale: 1.01 } : {}
                        }
                        whileTap={
                          !loading && isPasswordComplete ? { scale: 0.98 } : {}
                        }
                        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                          loading || !isPasswordComplete
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                            : "bg-gradient-to-r from-[#E10600] to-[#FF3B30] hover:from-[#c50500] hover:to-[#e6352b] shadow-md hover:shadow-lg cursor-pointer"
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Creating Account...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span>Complete Registration</span>
                            <CheckCircle className="w-4 h-4" />
                          </span>
                        )}
                      </motion.button>
                    </div>
                  )}

                  {/* Sign In Link */}
                  <div className="text-center mt-6 pt-4 border-t border-[var(--border-subtle)]">
                    <p className="text-gray-600 text-sm">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="font-semibold text-[#E10600] hover:text-[#c50500] inline-flex items-center gap-1 group ml-1"
                      >
                        <span>Sign In</span>
                        <LogIn
                          size={15}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Side - Benefits Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-5/12"
          >
            <div className="bg-gradient-to-br from-[#E10600] via-[#c50500] to-[#9e0400] rounded-3xl shadow-xl p-6 sm:p-8 text-white h-full flex flex-col justify-between border border-red-700/30 relative overflow-hidden">
              <div>
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    Why Join Humrahii?
                  </h2>
                  <p className="text-red-100 text-xs sm:text-sm opacity-95">
                    Discover amazing advantages of our community carpooling
                    network
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {[
                    {
                      icon: <Key className="w-5 h-5" />,
                      title: "Simple 6-Digit Password",
                      desc: "Quick, memorable numeric PIN for fast and hassle-free logins.",
                    },
                    {
                      icon: <Sparkles className="w-5 h-5" />,
                      title: "Smart Ride Matching",
                      desc: "Connect seamlessly with verified co-travelers headed your way.",
                    },
                    {
                      icon: <Shield className="w-5 h-5" />,
                      title: "Verified & Safe",
                      desc: "Every profile and vehicle is thoroughly verified for your peace of mind.",
                    },
                    {
                      icon: <Globe className="w-5 h-5" />,
                      title: "Eco-Friendly & Economical",
                      desc: "Cut your travel expenses up to 70% and reduce carbon footprint.",
                    },
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="flex items-start gap-3 p-3.5 bg-[var(--bg-surface)]/10 rounded-2xl backdrop-blur-md border border-white/10"
                    >
                      <div className="p-2 bg-[var(--bg-surface)]/20 rounded-xl shrink-0">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm mb-0.5">
                          {benefit.title}
                        </h3>
                        <p className="text-xs text-red-100 opacity-90 leading-relaxed">
                          {benefit.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="p-4 bg-[var(--bg-surface)]/15 rounded-2xl backdrop-blur-md border border-white/10 mt-4">
                <p className="text-xs sm:text-sm text-white italic mb-3">
                  "The 6-digit numeric password makes login super fast on my
                  phone. Finding trustworthy co-riders has never been easier!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)]/30 flex items-center justify-center font-bold text-xs text-white">
                    AJ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Alex Johnson
                    </div>
                    <div className="text-[11px] text-red-100 opacity-80">
                      Daily Commuter, Mumbai
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <Shield className="w-4 h-4 text-green-600" />
            <span>Your information is protected with 256-bit SSL encryption</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
