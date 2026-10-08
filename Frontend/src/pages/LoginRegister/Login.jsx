import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Sparkles,
  ArrowRight,
  Shield,
  UserPlus,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Phone,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/endpoints";
import { setUserDetails } from "../../store/userReducer";
import Axios from "../../services/axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { countries } from "../../utils/countryCode";
import { Flag } from "../../components/Flags";
import logo from "../../assets/logo.jpg";
import { clearUserSessionDrafts } from "../../utils/sessionCleaner";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [password, setPassword] = useState(["", "", "", "", "", ""]);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [selected, setSelected] = useState({
    name: "India",
    code: "IN",
    dial_code: "+91",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  // Create refs for password inputs
  const passwordInputRefs = useRef([]);

  useEffect(() => {
    if (user?.phone) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = "Login | Humrahii";
  }, []);

  // Handle phone input change with strict numeric sanitization
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    const cleanVal = rawVal.replace(/\D/g, "").slice(0, 10);
    setPhone(cleanVal);
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
    if (!phone) {
      setPhoneError("Phone number is required");
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError(
        "Enter a valid 10-digit Indian mobile number (starts with 6-9)"
      );
    } else {
      setPhoneError("");
    }
  };

  // Handle password digit change
  const handlePasswordChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const char = cleaned.slice(-1);
    const newPassword = [...password];
    newPassword[index] = char;
    setPassword(newPassword);
    if (passwordError) setPasswordError("");
    if (serverError) setServerError("");

    // Auto focus next input if digit entered
    if (char && index < 5) {
      setTimeout(() => {
        if (passwordInputRefs.current[index + 1]) {
          passwordInputRefs.current[index + 1].focus();
        }
      }, 10);
    }
  };

  // Handle backspace, arrow navigation
  const handlePasswordKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!password[index] && index > 0) {
        // Move to previous box if current is already empty
        e.preventDefault();
        const newPassword = [...password];
        newPassword[index - 1] = "";
        setPassword(newPassword);
        setTimeout(() => {
          if (passwordInputRefs.current[index - 1]) {
            passwordInputRefs.current[index - 1].focus();
          }
        }, 10);
      } else if (password[index]) {
        // Clear current box
        const newPassword = [...password];
        newPassword[index] = "";
        setPassword(newPassword);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      passwordInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      passwordInputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle paste for 6-digit password
  const handlePasswordPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newPassword = [...password];
    for (let i = 0; i < 6; i++) {
      newPassword[i] = pastedData[i] || "";
    }
    setPassword(newPassword);
    if (passwordError) setPasswordError("");
    if (serverError) setServerError("");

    const targetIndex = Math.min(pastedData.length, 5);
    setTimeout(() => {
      if (passwordInputRefs.current[targetIndex]) {
        passwordInputRefs.current[targetIndex].focus();
      }
    }, 10);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let hasError = false;
    if (!phone) {
      setPhoneError("Phone number is required");
      hasError = true;
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError(
        "Enter a valid 10-digit Indian mobile number (starts with 6-9)"
      );
      hasError = true;
    }

    const passwordString = password.join("");
    if (passwordString.length !== 6) {
      setPasswordError("Please enter complete 6-digit password");
      hasError = true;
    }

    if (hasError || isLoading) return;

    setServerError("");
    setIsLoading(true);

    try {
      const res = await Axios.post(api?.user?.login, {
        phone,
        password: passwordString,
        rememberMe,
      });

      if (res?.data?.success) {
        clearUserSessionDrafts();
        dispatch(setUserDetails(res?.data?.user));
        toast.success(res?.data?.message || "Login successful!");
        navigate("/");
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        "Invalid phone or password. Please try again.";
      setServerError(errMsg);
      toast.error(errMsg);
      // Clear password on error and focus first digit
      setPassword(["", "", "", "", "", ""]);
      setTimeout(() => {
        if (passwordInputRefs.current[0]) {
          passwordInputRefs.current[0].focus();
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };


  const enteredPasswordLength = password.filter((d) => d !== "").length;
  const isFormValid =
    phone.length === 10 &&
    /^[6-9]\d{9}$/.test(phone) &&
    enteredPasswordLength === 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center pt-16 md:pt-24 pb-16 md:pb-8 px-2.5 sm:px-4 md:px-6 overflow-hidden relative">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={floatingAnimation}
          className="absolute top-1/4 -left-10 w-72 h-72 bg-gradient-to-br from-red-200/20 to-amber-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ ...floatingAnimation, y: [0, 10, 0] }}
          className="absolute bottom-1/4 -right-10 w-96 h-96 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-20 items-center relative z-10 my-4">
        {/* Left Side - Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="hidden lg:flex flex-col justify-center"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <Link to="/" className="inline-flex items-center group">
              <img
                src={logo}
                alt="Humrahii"
                className="h-16 object-contain rounded-xl shadow-sm hover:opacity-95 transition-opacity"
              />
            </Link>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl xl:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight"
          >
            Welcome back
            <br />
            <span className="bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
              Ride with friends
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-gray-600 text-lg mb-10 max-w-md"
          >
            Sign in to continue your journey with trusted riders. Access your
            rides, manage bookings, and connect with fellow travelers.
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-5">
            {[
              {
                icon: <Key size={20} />,
                text: "6-digit numeric password for quick login",
              },
              {
                icon: <Sparkles size={20} />,
                text: "Instant ride matching with verified users",
              },
              {
                icon: <Shield size={20} />,
                text: "End-to-end encrypted secure payments",
              },
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-100 to-amber-100 flex items-center justify-center shrink-0">
                  <div className="text-red-600">{feature.icon}</div>
                </div>
                <span className="text-gray-700 font-medium text-sm sm:text-base">
                  {feature.text}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-12 p-6 bg-[var(--bg-surface)]/60 backdrop-blur-md rounded-2xl border border-[var(--border-subtle)]/60 shadow-sm"
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Rides Shared</div>
              </div>
              <div className="text-center border-x border-[var(--border-subtle)]">
                <div className="text-2xl font-bold text-gray-900">4.8★</div>
                <div className="text-xs sm:text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99%</div>
                <div className="text-xs sm:text-sm text-gray-600">Safe Rides</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center lg:justify-end w-full"
        >
          <div className="w-full max-w-md lg:max-w-[430px] lg:ml-auto">
            <div className="bg-[var(--bg-surface)] rounded-3xl shadow-card-hover p-6 sm:p-8 md:p-10 border border-[var(--border-subtle)]">
              <div className="text-center mb-5 sm:mb-8">
                <div className="lg:hidden flex justify-center mb-4">
                  <Link to="/" className="inline-flex items-center">
                    <img
                      src={logo}
                      alt="Humrahii"
                      className="h-14 object-contain rounded-xl shadow-sm"
                    />
                  </Link>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Welcome back! Please enter your details
                </p>
              </div>

              {/* Server Error Alert */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5"
                  >
                    <AlertCircle size={18} className="shrink-0 text-red-600" />
                    <span className="font-medium">{serverError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number
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
                      id="phone-input"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      placeholder="Enter 10-digit mobile number"
                      required
                      disabled={isLoading}
                      aria-invalid={!!phoneError}
                      aria-describedby={phoneError ? "phone-error" : undefined}
                      className="w-full px-3.5 py-3.5 outline-none bg-transparent text-gray-900 placeholder-gray-400 font-medium text-sm sm:text-base"
                    />
                  </div>

                  {phoneError && (
                    <p
                      id="phone-error"
                      className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"
                    >
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  )}
                </div>

                {/* 6-Digit Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      6-Digit Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="p-1 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* 6-digit PIN boxes */}
                  <div
                    className="flex justify-between items-center gap-1 sm:gap-2 md:gap-2.5 my-2 w-full"
                    onPaste={handlePasswordPaste}
                  >
                    {password.map((digit, index) => (
                      <input
                        key={index}
                        id={`login-password-${index}`}
                        ref={(el) => (passwordInputRefs.current[index] = el)}
                        type={showPassword ? "text" : "password"}
                        maxLength={1}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={digit}
                        onChange={(e) =>
                          handlePasswordChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handlePasswordKeyDown(index, e)}
                        className={`w-9 h-11 sm:w-11 sm:h-12 md:w-12 md:h-12 text-center text-base sm:text-xl font-bold rounded-xl border-2 transition-all outline-none ${
                          passwordError
                            ? "border-red-400 bg-red-50/30"
                            : digit
                            ? "border-red-500 bg-red-50/20 text-gray-900"
                            : "border-gray-300 bg-gray-50/50 hover:bg-[var(--bg-surface)] focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        }`}
                        disabled={isLoading}
                        aria-label={`Digit ${index + 1} of 6`}
                      />
                    ))}
                  </div>

                  {passwordError && (
                    <p
                      id="password-error"
                      className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium"
                    >
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{passwordError}</span>
                    </p>
                  )}

                  {/* Password progress indicator */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">
                        Digits entered: {enteredPasswordLength}/6
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          enteredPasswordLength === 6
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {enteredPasswordLength === 6
                          ? "✓ Complete"
                          : "Enter 6 digits"}
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

                {/* Remember Me on left, Forgot Password on right */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer transition-colors"
                    />
                    <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      Remember me for 30 days
                    </span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 transition-colors hover:underline whitespace-nowrap"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={isFormValid && !isLoading ? { scale: 1.01 } : {}}
                  whileTap={isFormValid && !isLoading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className={`w-full py-3.5 px-6 font-bold rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2 group ${
                    isFormValid && !isLoading
                      ? "bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white cursor-pointer hover:shadow-red-glow"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </motion.button>


                {/* Sign Up Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-red-600 hover:text-red-700 inline-flex items-center space-x-1 group ml-1"
                    >
                      <span>Sign up free</span>
                      <UserPlus
                        size={15}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Security Note */}
            <div className="mt-5 text-center">
              <div className="inline-flex items-center space-x-2 text-gray-500 text-xs sm:text-sm">
                <Shield size={15} className="text-green-600" />
                <span>Your data is securely encrypted and never shared</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
