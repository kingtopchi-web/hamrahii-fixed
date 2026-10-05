import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Clock,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { api } from "../services/api";
import { toast } from "react-toastify";
import Axios from "../services/axios";
import { useDispatch, useSelector } from "react-redux";
import { setAdminDetails, clearAdminDetails } from "../store/adminReducer";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
const Login = () => {
  const [step, setStep] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const disptach = useDispatch();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState("");
  const [emailForOtp, setEmailForOtp] = useState("");
  const admin = useSelector((state) => state.admin);
  const navigate = useNavigate();

  // Timer effect
  useEffect(() => {
    if (step === "otp" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleGetAdminData = async () => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      return;
    }

    try {
      const res = await Axios.get(api.admin.getData);
      if (res?.data?.success && res?.data?.admin?.role === "admin") {
        disptach(setAdminDetails(res?.data?.admin));
        navigate("/admin", { replace: true });
      } else {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminId");
        localStorage.removeItem("adminUser");
        sessionStorage.clear();
        disptach(clearAdminDetails());
      }
    } catch (error) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminUser");
      sessionStorage.clear();
      disptach(clearAdminDetails());
    }
  };

  useEffect(() => {
    handleGetAdminData();
  }, []);

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(api.admin.sendLoginOtp, formData);

      if (res?.data?.success) {
        setEmailForOtp(formData.email);
        setStep("otp");
        setTimeLeft(120); // Reset to 5 minutes
        toast.success(res?.data?.message);
        setOtp(["", "", "", "", "", ""]);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const otpString = newOtp.join("");
      if (otpString.length === 6) {
        handleOtpSubmit(otpString);
      }
    }
  };

  // Handle OTP key events
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    if (e.key === "Enter") {
      const otpString = otp.join("");
      if (otpString.length === 6) {
        handleOtpSubmit(otpString);
      }
    }
  };

  // Submit OTP
  const handleOtpSubmit = async (otpString) => {
    if (!otpString) {
      otpString = otp.join("");
    }

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (timeLeft <= 0) {
      setError("OTP has expired");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await Axios.post(api.admin.verifyOtpLogin, {
        email: emailForOtp,
        otp: otpString,
      });

      if (res?.data?.success) {
        if (res.data.token) {
          localStorage.setItem("adminToken", res.data.token);
          sessionStorage.setItem("adminToken", res.data.token);
        }
        if (res.data.admin?._id) {
          localStorage.setItem("adminId", res.data.admin._id);
          sessionStorage.setItem("adminId", res.data.admin._id);
        }
        if (res.data.admin) {
          localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
        }

        disptach(setAdminDetails(res?.data?.admin));

        setStep("success");
        navigate("/admin");
        toast.success(res?.data?.message);
      } else {
        setError(res?.data?.message || "Invalid OTP");
      }
    } catch (err) {
      // console.log(err, "this is err");
      setError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };


  // Go back to login
  const handleBackToLogin = () => {
    setStep("login");
    setError("");
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <div className="min-h-screen dashboard-bg flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3.5 mb-3 group">
            <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-[#98E9E9] to-[#1A1A1A] flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-300">
              <img
                src={logo}
                alt="HumRahii"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black bg-gradient-to-r from-[#1A1A1A] to-[#666666] bg-clip-text text-transparent">
                  HumRahii
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#E10600] border border-red-100">
                  ADMIN
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-500">
                Official Super Administration Portal
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            <span className="text-xs sm:text-sm font-semibold">{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Login Form */}
          {step === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-7 sm:p-9 shadow-card-hover border border-gray-100/90 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E10600] via-rose-500 to-[#E10600]" />

              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Sign In to Dashboard
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Enter your administrative credentials to continue
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition-all font-medium"
                      placeholder="admin@company.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      minLength="6"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200/90 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition-all font-medium"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-2xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-[#E10600] to-[#FF3B30] hover:from-[#c50500] hover:to-[#e6352b] shadow-md shadow-red-500/20 text-xs sm:text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    "Send Verification OTP"
                  )}
                </motion.button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400 font-medium">
                  Two-factor authentication code will be dispatched to your authorized email
                </p>
              </div>
            </motion.div>
          )}

          {/* OTP Form */}
          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-7 sm:p-9 shadow-card-hover border border-gray-100/90 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E10600] via-rose-500 to-[#E10600]" />

              <div className="mb-6">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                  Enter Two-Factor OTP
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Sent to <span className="font-bold text-gray-900">{emailForOtp}</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* OTP Inputs */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-3 text-center uppercase tracking-wider">
                    6-digit verification code
                  </label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        disabled={loading}
                        className="w-10 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-2xl bg-gray-50/70 border border-gray-200/90 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition-all text-gray-900"
                      />
                    ))}
                  </div>
                </div>

                {/* Timer */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-bold">
                    <Clock
                      className={`w-3.5 h-3.5 ${timeLeft < 60 ? "text-[#E10600]" : "text-gray-500"}`}
                    />
                    <span className={timeLeft < 60 ? "text-[#E10600]" : "text-gray-700"}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  {timeLeft < 60 && (
                    <p className="text-xs mt-1.5 text-[#E10600] font-semibold">
                      OTP expiring soon
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.99 }}
                    onClick={() => handleOtpSubmit()}
                    disabled={loading || timeLeft <= 0}
                    className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-[#E10600] to-[#FF3B30] hover:from-[#c50500] hover:to-[#e6352b] shadow-md shadow-red-500/20 text-xs sm:text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : timeLeft <= 0 ? (
                      "OTP Expired"
                    ) : (
                      "Verify & Enter Portal"
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={handleLoginSubmit}
                    disabled={loading || timeLeft > 240}
                    className="w-full py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#E10600] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Resend OTP{" "}
                    {timeLeft > 240 &&
                      `(in ${Math.ceil((timeLeft - 240) / 60)}m)`}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="mt-6 text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
              >
                <span>← Use different email</span>
              </button>
            </motion.div>
          )}

          {/* Success State */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 sm:p-10 text-center shadow-card-hover border border-gray-100/90"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-emerald-50 text-emerald-600 border border-emerald-100"
              >
                <CheckCircle className="w-8 h-8" />
              </motion.div>

              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">
                Authentication Successful
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 font-medium">
                Welcome back to Admin Portal. Redirecting to workspace...
              </p>

              <div className="mt-6">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#E10600]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-gray-400 font-medium"
        >
          <p>Hamrahi Super Administration • v2.0 Enterprise</p>
          <p className="mt-1">© {new Date().getFullYear()} Hamrahii Technologies Pvt Ltd. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
