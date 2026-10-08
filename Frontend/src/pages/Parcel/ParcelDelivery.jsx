import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setUserDetails } from "../../store/userReducer";
import UserSidebar from "../../components/Sidebar/UserSidebar";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import {
  Package, MapPin, CheckCircle2, Clock, Truck, User, Phone,
  ChevronDown, ChevronUp, Key, Loader2, Navigation, AlertCircle,
  Banknote, AlertTriangle, Wallet
} from "lucide-react";
import LiveRouteTrackingMap from "../../components/Tracking/LiveRouteTrackingMap";
import AddMoneyModal from "../profile/wallet/AddMoneyModal";
import useLiveLocationTracker from "../../hooks/useLiveLocationTracker";

const ParcelDelivery = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "completed"
  const [expandedId, setExpandedId] = useState(null);
  const [otpMap, setOtpMap] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  // Insufficient Balance & Wallet Topup states
  const [insufficientModalOpen, setInsufficientModalOpen] = useState(false);
  const [insufficientData, setInsufficientData] = useState(null);
  const [addMoneyModalOpen, setAddMoneyModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState(10);

  // Initialize live tracking if there are active deliveries
  useLiveLocationTracker(
    deliveries.some((p) => ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(p.status))
  );

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setIsLoading(true);
      const res = await Axios.get(api.parcel.getDeliveries || "/parcel/deliveries");
      if (res.data?.success) {
        setDeliveries(res.data.data || []);
        // Automatically expand first active delivery if available
        const active = (res.data.data || []).filter(
          (p) => ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(p.status)
        );
        if (active.length > 0) {
          setExpandedId(active[0]._id);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch deliveries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (parcelId, status, otp = "") => {
    setActionLoading((prev) => ({ ...prev, [parcelId]: true }));
    try {
      const res = await Axios.patch(
        api.parcel.updateStatus ? api.parcel.updateStatus(parcelId) : `/parcel/${parcelId}/status`,
        { status, otp }
      );
      if (res.data?.success) {
        toast.success(res.data.message || `Parcel status updated to ${status.replace("_", " ")}`);
        // Clear OTP for this parcel
        setOtpMap((prev) => ({ ...prev, [parcelId]: "" }));
        // Refresh deliveries list
        fetchDeliveries();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update parcel status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [parcelId]: false }));
    }
  };

  const handleCashReceived = async (parcelId) => {
    if (actionLoading[parcelId]) return;
    setActionLoading((prev) => ({ ...prev, [parcelId]: true }));
    try {
      const res = await Axios.post(`/parcel/${parcelId}/cash-received`);
      if (res.data?.success) {
        toast.success(res.data.message || "Cash received marked successfully!");
        if (res.data?.walletBalance !== undefined && user) {
          dispatch(
            setUserDetails({
              ...user,
              wallet: {
                ...user.wallet,
                balance: res.data.walletBalance,
              },
            })
          );
        }
        fetchDeliveries();
      }
    } catch (e) {
      const errData = e.response?.data;
      if (errData?.insufficientBalance) {
        setInsufficientData({
          parcelId,
          platformFee: errData.data?.platformFee ?? 0,
          currentBalance: errData.data?.currentBalance ?? 0,
          requiredAdditional: errData.data?.requiredAdditional ?? 0,
          message: errData.message,
        });
        setInsufficientModalOpen(true);
      } else {
        toast.error(errData?.message || "Failed to mark cash received.");
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [parcelId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return {
          label: "Ready for Pickup",
          color: "text-amber-700 bg-amber-50 border-amber-200",
          step: 1,
        };
      case "PICKED_UP":
        return {
          label: "Picked Up",
          color: "text-purple-700 bg-purple-50 border-purple-200",
          step: 2,
        };
      case "IN_TRANSIT":
        return {
          label: "In Transit",
          color: "text-blue-700 bg-blue-50 border-blue-200",
          step: 3,
        };
      case "DELIVERED":
        return {
          label: "Delivered",
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          step: 4,
        };
      case "COMPLETED":
        return {
          label: "Completed",
          color: "text-emerald-800 bg-emerald-100 border-emerald-300",
          step: 4,
        };
      default:
        return {
          label: status,
          color: "text-gray-700 bg-gray-50 border-[var(--border-subtle)]",
          step: 0,
        };
    }
  };

  const activeDeliveries = deliveries.filter((p) =>
    ["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(p.status)
  );

  const completedDeliveries = deliveries.filter((p) =>
    ["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"].includes(p.status)
  );

  const displayedDeliveries =
    activeTab === "active" ? activeDeliveries : completedDeliveries;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-white via-[#F9FAFB] to-[#F3F4F6] pt-2"
    >
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="lg:hidden flex justify-between items-center px-4 mb-4">
          <h1 className="text-xl font-bold text-[#111111]">Parcel Delivery</h1>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm font-medium shadow-sm text-gray-700"
          >
            Menu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-8rem)] lg:h-[90vh] lg:overflow-y-scroll hide-scrollbar">
          <UserSidebar
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />

          <main className="lg:col-span-9 space-y-6 lg:h-[90vh] lg:overflow-y-scroll hide-scrollbar pb-16 lg:px-0 px-4">
            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]/50 shadow-sm p-6 lg:p-8 min-h-[500px]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#111111]">Parcel Deliveries</h1>
                    <p className="text-sm text-gray-500">
                      Manage and verify your accepted parcel delivery orders
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "active"
                        ? "bg-[var(--bg-surface)] text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Active Deliveries ({activeDeliveries.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === "completed"
                        ? "bg-[var(--bg-surface)] text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    Completed ({completedDeliveries.length})
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : displayedDeliveries.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-[var(--border-subtle)]">
                  <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
                    <Truck size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {activeTab === "active"
                      ? "No active deliveries"
                      : "No completed deliveries"}
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto text-sm">
                    {activeTab === "active"
                      ? "When you accept a parcel request from your Dashboard, it will appear here for pickup & delivery."
                      : "Delivered parcels will be archived here."}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {displayedDeliveries.map((parcel) => {
                    const badge = getStatusBadge(parcel.status);
                    const isExpanded = expandedId === parcel._id;
                    const otpValue = otpMap[parcel._id] || "";
                    const isProcessing = Boolean(actionLoading[parcel._id]);

                    return (
                      <div
                        key={parcel._id}
                        className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition-all"
                      >
                        {/* Summary Header */}
                        <div
                          className="p-5 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-surface)]"
                          onClick={() => setExpandedId(isExpanded ? null : parcel._id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <Package size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                                >
                                  {badge.label}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">
                                  #{parcel._id.slice(-6).toUpperCase()}
                                </span>
                                {parcel.vehicleType && (
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                    {parcel.vehicleType}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <span>{parcel.pickup?.city || "Pickup"}</span>
                                <span className="text-gray-300">➔</span>
                                <span>{parcel.dropoff?.city || "Drop-off"}</span>
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-16 sm:pl-0">
                            <div className="text-left sm:text-right">
                              {parcel.amount > 0 && (
                                <p className="text-lg font-extrabold text-emerald-600">
                                  ₹{parcel.amount}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 font-medium">
                                {parcel.weight} kg • {parcel.itemType || "Package"}
                              </p>
                            </div>
                            <div className="p-1 rounded-lg bg-gray-50 text-gray-400">
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Flow & Actions */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-[var(--border-subtle)] bg-gray-50/70 p-5 space-y-6"
                            >
                              {/* Step Progress Bar removed as requested */}

                              {/* Full-width Live Route Tracking Map */}
                              <div className="w-full">
                                <LiveRouteTrackingMap parcel={parcel} isDriverView={true} />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Information */}
                                <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-4">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Contact Information
                                  </h4>

                                  {/* Pickup Info */}
                                  <div className="space-y-1 pb-3 border-b border-[var(--border-subtle)]">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                        <MapPin size={14} /> Pickup Location
                                      </span>
                                      {parcel.sender?.phone && (
                                        <a
                                          href={`tel:${parcel.sender.phone}`}
                                          className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
                                        >
                                          <Phone size={12} /> Call Sender
                                        </a>
                                      )}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {parcel.pickup?.address}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      City: {parcel.pickup?.city} • Sender:{" "}
                                      {parcel.sender?.firstName} {parcel.sender?.lastName} (
                                      {parcel.sender?.phone || "No phone"})
                                    </p>
                                  </div>

                                  {/* Dropoff Info */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                                        <MapPin size={14} /> Drop-off Location
                                      </span>
                                      {parcel.receiverDetails?.phone && (
                                        <a
                                          href={`tel:${parcel.receiverDetails.phone}`}
                                          className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
                                        >
                                          <Phone size={12} /> Call Receiver
                                        </a>
                                      )}
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {parcel.dropoff?.address}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      City: {parcel.dropoff?.city} • Receiver:{" "}
                                      {parcel.receiverDetails?.name} (
                                      {parcel.receiverDetails?.phone})
                                    </p>
                                  </div>
                                </div>

                                {/* Action & OTP Section */}
                                <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col justify-between">
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                      Driver Actions
                                    </h4>

                                    {/* Action 1: Pickup Parcel - No OTP required */}
                                    {parcel.status === "ACCEPTED" && (
                                      <div className="space-y-3">
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                                          <p className="font-bold flex items-center gap-1.5">
                                            <Package size={14} /> Ready for Pickup
                                          </p>
                                          <p className="mt-1">
                                            Collect the parcel from the sender and click Confirm Pickup below.
                                          </p>
                                        </div>
                                        <button
                                          onClick={() =>
                                            handleUpdateStatus(parcel._id, "PICKED_UP")
                                          }
                                          disabled={isProcessing}
                                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                                        >
                                          {isProcessing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <>
                                              <CheckCircle2 size={16} />
                                              <span>Confirm Pickup</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}

                                    {/* Action 2: Start Transit */}
                                    {parcel.status === "PICKED_UP" && (
                                      <div className="space-y-3">
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800">
                                          <p className="font-bold flex items-center gap-1.5">
                                            <Truck size={14} /> Parcel is with you
                                          </p>
                                          <p className="mt-1">
                                            Click below when you are ready and heading towards the delivery destination.
                                          </p>
                                        </div>
                                        <button
                                          onClick={() =>
                                            handleUpdateStatus(parcel._id, "IN_TRANSIT")
                                          }
                                          disabled={isProcessing}
                                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                                        >
                                          {isProcessing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                            <>
                                              <Navigation size={16} />
                                              <span>Start Transit to Destination</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}

                                    {/* Action 3: Verify Delivery OTP */}
                                    {parcel.status === "IN_TRANSIT" && (
                                      <div className="space-y-3">
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                                          <p className="font-bold flex items-center gap-1.5">
                                            <Key size={14} /> Enter Delivery OTP
                                          </p>
                                          <p className="mt-1">
                                            Ask the receiver for their 4-digit Delivery OTP upon handing over the parcel.
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            maxLength={4}
                                            placeholder="4-digit OTP"
                                            value={otpValue}
                                            onChange={(e) =>
                                              setOtpMap({
                                                ...otpMap,
                                                [parcel._id]: e.target.value.replace(/\D/g, ""),
                                              })
                                            }
                                            className="px-3 py-2 border border-gray-300 rounded-xl text-sm font-mono tracking-widest text-center w-36 focus:ring-2 focus:ring-emerald-500 outline-none"
                                          />
                                          <button
                                            onClick={() =>
                                              handleUpdateStatus(parcel._id, "DELIVERED", otpValue)
                                            }
                                            disabled={isProcessing || otpValue.length !== 4}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                          >
                                            {isProcessing ? (
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <>
                                                <CheckCircle2 size={16} />
                                                <span>Verify & Deliver</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Action 4: Payment / Completed */}
                                    {parcel.status === "DELIVERED" && parcel.paymentMethod === "COD" && parcel.paymentStatus === "CASH_PENDING" && (
                                      <div className="space-y-3">
                                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold flex items-center gap-1.5">
                                              <Banknote size={15} className="text-emerald-700" /> Cash Collection (COD)
                                            </span>
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">
                                              Pending Collection
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center pt-1 border-t border-emerald-100">
                                            <span className="text-emerald-800 font-medium">Amount to Collect:</span>
                                            <span className="font-extrabold text-base text-emerald-700">₹{parcel.amount}</span>
                                          </div>
                                          {(parcel.calculatedPlatformFee !== undefined || parcel.platformCommission !== undefined) && (
                                            <div className="flex justify-between items-center text-[11px] text-emerald-700/80">
                                              <span>Platform Fee (deducted from wallet):</span>
                                              <span className="font-semibold text-emerald-900">
                                                ₹{parcel.calculatedPlatformFee ?? parcel.platformCommission}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => handleCashReceived(parcel._id)}
                                          disabled={isProcessing}
                                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm cursor-pointer"
                                        >
                                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cash Received"}
                                        </button>
                                      </div>
                                    )}

                                    {parcel.status === "DELIVERED" && parcel.paymentMethod === "ONLINE" && parcel.paymentStatus === "PAYMENT_PENDING" && (
                                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-1">
                                        <p className="text-sm font-bold text-blue-900">Online Payment</p>
                                        <p className="text-xs text-blue-700">Waiting for customer payment.</p>
                                        <p className="text-xs font-bold text-blue-800 mt-2">Payment Status: Pending</p>
                                      </div>
                                    )}

                                    {parcel.status === "COMPLETED" && (
                                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                                        <p className="text-sm font-bold text-emerald-900">Payment Status: Paid ✓</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Insufficient Wallet Balance Modal */}
      <AnimatePresence>
        {insufficientModalOpen && insufficientData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[var(--border-subtle)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
                <AlertTriangle size={28} />
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 text-center">
                Insufficient Wallet Balance
              </h3>

              <p className="text-xs sm:text-sm text-gray-600 text-center mt-2 leading-relaxed">
                Your wallet balance is insufficient to pay the platform fee of{" "}
                <span className="font-bold text-gray-900">₹{insufficientData.platformFee}</span>.
                Please add{" "}
                <span className="font-bold text-[#E10600]">
                  ₹{insufficientData.requiredAdditional}
                </span>{" "}
                or more to your wallet to complete this COD delivery.
              </p>

              {/* Fee Breakdown Card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-[var(--border-subtle)]/80 space-y-2.5 my-5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Platform Fee:</span>
                  <span className="font-bold text-gray-900">₹{insufficientData.platformFee}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Current Wallet Balance:</span>
                  <span className="font-bold text-gray-900">₹{insufficientData.currentBalance}</span>
                </div>
                <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center font-bold">
                  <span className="text-amber-800">Additional Amount Required:</span>
                  <span className="text-base text-[#E10600]">₹{insufficientData.requiredAdditional}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    const needed = Math.max(10, Math.ceil(insufficientData.requiredAdditional));
                    setTopupAmount(needed);
                    setInsufficientModalOpen(false);
                    setAddMoneyModalOpen(true);
                  }}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <Wallet size={16} />
                  <span>
                    Add ₹{Math.max(10, Math.ceil(insufficientData.requiredAdditional))} to Wallet
                  </span>
                </button>

                <button
                  onClick={() => setInsufficientModalOpen(false)}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallet Top-up Modal */}
      <AddMoneyModal
        open={addMoneyModalOpen}
        onClose={() => setAddMoneyModalOpen(false)}
        defaultAmount={topupAmount}
        currency="INR"
        onSuccess={async () => {
          setAddMoneyModalOpen(false);
          // Refresh user profile and deliveries
          try {
            const profileRes = await Axios.get(api.user.getMyProfile);
            if (profileRes.data?.user) {
              dispatch(setUserDetails(profileRes.data.user));
            }
          } catch (err) {
            console.error("Failed to refresh profile:", err);
          }
          fetchDeliveries();
          toast.success("Wallet updated! You can now click Cash Received to complete this delivery.");
        }}
      />
    </motion.div>
  );
};

export default ParcelDelivery;
