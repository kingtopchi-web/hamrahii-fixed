import React, { useState } from "react";
import { toast } from "react-toastify";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle,
  XCircle,
  User,
  Calendar,
  MapPin,
  Car,
  IdCard,
  Shield,
  AlertCircle,
  Loader2,
  Key,
  Home,
  Navigation,
  Check,
  X,
  Verified,
  Clock,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { setUserDetails } from "../../store/userReducer";

const VerifyDrivingLicence = () => {
  const [dlNumber, setDlNumber] = useState("");
  const [dob, setDob] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [showPopUp , setShowPopUp] = useState(false)
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleSkip = () => {
    sessionStorage.setItem("dlSkipped", "true");
    navigate("/my-profile/add-car", {
      state: { skippedDl: true },
      replace: true,
    });
  };

  useEffect(() => {
    if (user?.dlVerified) {
      navigate("/my-profile/add-car", { replace: true });
    }
  }, [user?.dlVerified]);

  const handleGetDlInformation = async () => {
    if (!dlNumber.trim() || !dob) {
      toast.error("Please enter DL number and date of birth");
      return;
    }

    setLoading(true);

    try {
      const res = await Axios.post(api.user.getDlDetails, {
        dob,
        id_number: dlNumber,
      });

      const detail = res?.data?.details;

      const data = {
        blood_group: detail?.blood_group,
        citizenship: detail?.citizenship,
        dob: detail?.dob,
        doe: detail?.doe,
        doi: detail?.doi,
        initial_doi: detail?.initial_doi,
        father_or_husband_name: detail?.father_or_husband_name,
        gender: detail?.gender,
        license_number: detail?.license_number,
        name: detail?.name,
        ola_code: detail?.ola_code,
        ola_name: detail?.ola_name,
        permanent_address: detail?.permanent_address,
        permanent_zip: detail?.permanent_zip,
        temporary_address: detail?.temporary_address,
        temporary_zip: detail?.temporary_zip,
        state: detail?.state,
        transport_doe: detail?.transport_doe,
        transport_doi: detail?.transport_doi,
        vehicle_classes: detail?.vehicle_classes,
        profile_image: detail?.profile_image,
      };

      setDetails(data);
      setShowConfirmation(true);
      toast.success("Driving license details fetched successfully");
    } catch (error) {
      // console.error("Error fetching DL details:", error);
      setShowPopUp(true)
      // toast.error(
      //   error?.response?.data?.message || "Failed to fetch DL details",
      // );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (confirmed) => {
    if (!details) return;

    setVerifying(true);
    try {
      const payload = {
        details,
        isConfirmed: confirmed,
        dl_number: dlNumber,
      };

      const res = await Axios.post(api.user.confirmDlDetails, payload);

      if (res?.data?.success) {
        setUserConfirmed(confirmed);
        if (confirmed) {
          toast.success("Driving license verified successfully!");

          dispatch(setUserDetails(res?.data?.user))
          // Store verification status in localStorage
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.dlVerified = true;
          user.dl_number = dlNumber;
          localStorage.setItem("user", JSON.stringify(user));

          // Navigate to dashboard after 2 seconds
          navigate(-1)
        } else {
          toast.info(
            "License verification declined. Please enter correct details.",
          );
          setShowConfirmation(false);
        }
      }
    } catch (error) {
      // console.error("Error confirming DL details:", error);
      toast.error(
        error?.response?.data?.message || "Failed to confirm DL details",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    setDetails(null);
    setShowConfirmation(false);
    setUserConfirmed(false);
    setDlNumber("");
    setDob("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Check if DL is already verified

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  Driving License Verification
                </h1>
                <p className="text-gray-600 mt-2">
                  Securely verify your driving license for account verification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-surface)] hover:bg-gray-50 text-blue-600 hover:text-blue-700 rounded-full shadow-sm border border-blue-200 text-sm font-medium transition-colors cursor-pointer"
              >
                <span>Skip for now</span>
                <span>→</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Panel - Input Form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-6"
            >
              <div className="bg-[var(--bg-surface)] rounded-2xl shadow-xl border border-[var(--border-subtle)] overflow-hidden">
                {/* Form Header */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[var(--bg-surface)] rounded-lg shadow-sm">
                      <IdCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Enter License Details
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Please provide your driving license information
                  </p>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <div className="space-y-5">
                    {/* DL Number Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Driving License Number
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={dlNumber}
                          onChange={(e) =>
                            setDlNumber(e.target.value.toUpperCase())
                          }
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="DL12345678901234"
                          disabled={loading || details}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Date of Birth Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date of Birth
                        </div>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          disabled={loading || details}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleGetDlInformation}
                          disabled={
                            loading || !dlNumber.trim() || !dob || details
                          }
                          className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5" />
                              <span>Verify License</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleSkip}
                          className="py-3.5 px-4 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 font-semibold text-sm transition-colors cursor-pointer shrink-0"
                        >
                          Skip
                        </button>
                      </div>

                      {details && (
                        <button
                          type="button"
                          onClick={handleReset}
                          className="w-full py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                          <span>Verify Another License</span>
                        </button>
                      )}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Verification Note
                          </p>
                          <p className="text-xs text-blue-700">
                            Ensure your DL number and date of birth match
                            exactly as on your license. All data is encrypted
                            and securely processed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Results Display */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {details ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  {/* License Card Preview */}
                  <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl shadow-2xl overflow-hidden text-white">
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        {/* Profile Image Section */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                         
                            <div className="absolute -bottom-2 -right-2 bg-[var(--bg-surface)] text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                              INDIA
                            </div>
                          </div>
                        </div>

                        {/* License Info */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                                {details.name || "N/A"}
                              </h2>
                              <p className="text-blue-200 mb-4">
                                S/O: {details.father_or_husband_name || "N/A"}
                              </p>

                              {/* Quick Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <div className="text-xs text-blue-300">
                                    Blood Group
                                  </div>
                                  <div className="font-bold text-lg">
                                    {details.blood_group || "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-blue-300">
                                    Gender
                                  </div>
                                  <div className="font-bold text-lg">
                                    {details.gender || "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-blue-300">
                                    State
                                  </div>
                                  <div className="font-bold text-lg flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {details.state || "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-blue-300">
                                    Citizenship
                                  </div>
                                  <div className="font-bold text-lg">
                                    {details.citizenship || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* License Number */}
                            <div className="bg-[var(--bg-surface)]/10 backdrop-blur-sm rounded-xl p-4">
                              <div className="text-xs text-blue-300 mb-1">
                                License No.
                              </div>
                              <div className="font-mono font-bold text-xl tracking-wider">
                                {details.license_number || dlNumber}
                              </div>
                            </div>
                          </div>

                          {/* Vehicle Classes */}
                          {details.vehicle_classes && (
                            <div className="mt-6 pt-6 border-t border-white/20">
                              <div className="flex items-center gap-2 mb-3">
                                <Car className="w-5 h-5" />
                                <h4 className="font-semibold">
                                  Vehicle Classes
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(details.vehicle_classes) ? (
                                  details.vehicle_classes.map((cls, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1.5 bg-[var(--bg-surface)]/20 rounded-full text-sm font-medium"
                                    >
                                      {cls}
                                    </span>
                                  ))
                                ) : (
                                  <span className="px-3 py-1.5 bg-[var(--bg-surface)]/20 rounded-full text-sm">
                                    {details.vehicle_classes}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Details */}
                    <div className="bg-[var(--bg-surface)] rounded-2xl shadow-lg border border-[var(--border-subtle)] p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Personal Details
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          {
                            label: "Date of Birth",
                            value: formatDate(details.dob),
                          },
                          { label: "OLA Name", value: details.ola_name },
                          { label: "OLA Code", value: details.ola_code },
                          {
                            label: "Date of Issue",
                            value: formatDate(details.doi),
                          },
                          {
                            label: "Date of Expiry",
                            value: formatDate(details.doe),
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-2 border-b border-[var(--border-subtle)] last:border-0"
                          >
                            <span className="text-gray-600 text-sm">
                              {item.label}
                            </span>
                            <span className="font-medium text-gray-900">
                              {item.value || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address Details */}
                    <div className="bg-[var(--bg-surface)] rounded-2xl shadow-lg border border-[var(--border-subtle)] p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Address Details
                        </h3>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Home className="w-4 h-4 text-gray-500" />
                            <h4 className="font-medium text-gray-900">
                              Permanent Address
                            </h4>
                          </div>
                          <p className="text-gray-700">
                            {details.permanent_address || "N/A"}
                          </p>
                          {details.permanent_zip && (
                            <div className="text-sm text-gray-600 mt-2">
                              ZIP: {details.permanent_zip}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Navigation className="w-4 h-4 text-gray-500" />
                            <h4 className="font-medium text-gray-900">
                              Temporary Address
                            </h4>
                          </div>
                          <p className="text-gray-700">
                            {details.temporary_address || "N/A"}
                          </p>
                          {details.temporary_zip && (
                            <div className="text-sm text-gray-600 mt-2">
                              ZIP: {details.temporary_zip}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Section */}
                  {showConfirmation && !userConfirmed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              Confirm Your Information
                            </h3>
                            <p className="text-gray-700">
                              Please verify that all the details above match
                              your driving license. This information will be
                              saved to your profile.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleConfirm(false)}
                            disabled={verifying}
                            className="px-6 py-3 text-gray-700 bg-[var(--bg-surface)] border border-gray-300 hover:bg-gray-50 font-medium rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                          >
                            {verifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                            No, Try Again
                          </button>
                          <button
                            onClick={() => handleConfirm(true)}
                            disabled={verifying}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-md"
                          >
                            {verifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Yes, Confirm & Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {userConfirmed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 rounded-xl">
                            <Verified className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              Verification Complete! 🎉
                            </h3>
                            <p className="text-green-700 mt-1">
                              Your driving license has been verified and saved
                              successfully. Redirecting to dashboard...
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleReset}
                          className="px-6 py-3 bg-[var(--bg-surface)] text-green-700 border border-green-300 hover:bg-green-50 font-medium rounded-xl transition-all"
                        >
                          Verify Another
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                // Empty State
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[var(--bg-surface)] rounded-2xl shadow-lg border border-[var(--border-subtle)] p-8 md:p-12"
                >
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <IdCard className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Ready to Verify Your License
                    </h3>
                    <p className="text-gray-600 mb-8">
                      Enter your driving license number and date of birth to
                      start the verification process. Your information will be
                      securely verified and displayed here.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">
                        End-to-end encrypted verification
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showPopUp ? (
              <PopUp
                onClose={() => {
                  navigate(-1);
                  setShowPopUp(false);
                }}
                onSkip={() => {
                  setShowPopUp(false);
                  handleSkip();
                }}
              />
            ) : null}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            This verification process uses secure government-approved APIs. Your
            data is protected with 256-bit encryption.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyDrivingLicence;



const PopUp = ({ onClose, onSkip }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] rounded-xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
        >
          <X size={24} />
        </button>

        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-8 border-red-100">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Service Temporarily Unavailable
          </h3>
          <p className="text-gray-600 text-base leading-relaxed">
            The DL verification API is not responding at the moment. You can skip DL verification for now and proceed directly to adding your vehicle.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="bg-[#E10600] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#C10500] transition-colors cursor-pointer shadow-md text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <span>Skip & Add Vehicle</span>
              <span>→</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer text-sm sm:text-base"
          >
            Close
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs mt-6">
          You can verify your driving license later in your profile.
        </p>
      </div>
    </div>
  );
};

