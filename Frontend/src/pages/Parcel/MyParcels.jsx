import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import UserSidebar from '../../components/Sidebar/UserSidebar';
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { Package, MapPin, Calendar, CheckCircle2, Clock, AlertCircle, Key, FileText, ChevronDown, ChevronUp, User, Radio, Loader2 } from "lucide-react";
import LiveRouteTrackingMap from "../../components/Tracking/LiveRouteTrackingMap";
import FindingDriverScreen from "../../components/Parcel/FindingDriverScreen";
import { useRazorpay } from "../../services/razorpay/useRazorpay";

const MyParcels = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedFindingParcelId, setSelectedFindingParcelId] = useState(
    location.state?.findingParcelId || localStorage.getItem("activeSearchingParcelId") || null
  );
  const razorLoaded = useRazorpay();

  useEffect(() => {
    if (location.state?.findingParcelId) {
      setSelectedFindingParcelId(location.state.findingParcelId);
      localStorage.setItem("activeSearchingParcelId", location.state.findingParcelId);
    }
  }, [location.state]);

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    try {
      const res = await Axios.get(api.parcel.getMyParcels);
      if (res.data.success) {
        setParcels(res.data.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch parcels");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      REQUESTED: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50", label: "Looking for Driver" },
      ACCEPTED: { icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-50", label: "Driver Assigned" },
      PICKED_UP: { icon: Package, color: "text-purple-500", bg: "bg-purple-50", label: "Picked Up" },
      IN_TRANSIT: { icon: Package, color: "text-indigo-500", bg: "bg-indigo-50", label: "In Transit" },
      DELIVERED: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", label: "Delivered" },
      COMPLETED: { icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100", label: "Completed" },
      CANCELLED: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", label: "Cancelled" },
    };
    return configs[status] || { icon: Package, color: "text-gray-500", bg: "bg-gray-50", label: status };
  };

  const findingParcel = parcels.find((p) => p._id === selectedFindingParcelId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-white via-[#F9FAFB] to-[#F3F4F6] pt-2"
    >
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="lg:hidden flex justify-between items-center px-4 mb-4">
          <h1 className="text-xl font-bold text-[#111111]">My Parcels</h1>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium shadow-sm text-gray-700"
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
            {findingParcel ? (
              <FindingDriverScreen
                parcel={findingParcel}
                onBack={() => {
                  setSelectedFindingParcelId(null);
                  localStorage.removeItem("activeSearchingParcelId");
                }}
                onDriverAssigned={(driver) => {
                  localStorage.removeItem("activeSearchingParcelId");
                  fetchParcels();
                }}
                onCancelled={(parcelId) => {
                  setSelectedFindingParcelId(null);
                  localStorage.removeItem("activeSearchingParcelId");
                  fetchParcels();
                }}
              />
            ) : selectedFindingParcelId && isLoading ? (
              <div className="bg-white rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px] border border-gray-100 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                <p className="text-sm font-semibold text-gray-700">Connecting to live driver search...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E5E5E5]/50 shadow-sm p-6 lg:p-8 min-h-[500px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#111111]">My Parcels</h1>
                    <p className="text-gray-500">Track and manage your sent parcels</p>
                  </div>
                </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : parcels.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-400">
                    <Package size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No parcels found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">You haven't sent any parcels yet. Request a delivery to see it here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {parcels.map((parcel) => {
                    const statusConfig = getStatusConfig(parcel.status);
                    const StatusIcon = statusConfig.icon;
                    const isExpanded = expandedId === parcel._id;

                    return (
                      <div key={parcel._id} className="border border-gray-200 rounded-xl overflow-hidden bg-white transition-all hover:border-gray-300 shadow-sm hover:shadow">
                        {/* Header / Summary */}
                        <div
                          className="p-5 cursor-pointer flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                          onClick={() => setExpandedId(isExpanded ? null : parcel._id)}
                        >
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                              <StatusIcon size={24} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${statusConfig.bg} ${statusConfig.color}`}>
                                  {statusConfig.label}
                                </span>
                                <span className="text-xs text-gray-400">#{parcel._id.slice(-6).toUpperCase()}</span>
                                {parcel.status === "REQUESTED" && !parcel.driver && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFindingParcelId(parcel._id);
                                      localStorage.setItem("activeSearchingParcelId", parcel._id);
                                    }}
                                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 transition shadow-2xs cursor-pointer"
                                  >
                                    <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
                                    <span>Finding Driver &rarr;</span>
                                  </button>
                                )}
                              </div>
                              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                {parcel.pickup.city} <span className="text-gray-300">→</span> {parcel.dropoff.city}
                              </h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar size={12} /> {new Date(parcel.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-16 sm:pl-0">
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-semibold text-gray-900">₹{parcel.amount}</p>
                              <p className="text-xs text-gray-500">{parcel.weight} kg • {parcel.itemType}</p>
                            </div>
                            <div className="text-gray-400">
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-gray-100 bg-gray-50/50"
                            >
                              <div className="p-5 space-y-6">

                                {/* Route Details with Real-time Live Tracking Map (Full Width) */}
                                <div className="w-full">
                                  <LiveRouteTrackingMap parcel={parcel} />
                                </div>

                                {/* Security & Info + Payment in 2 columns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Col 1: Security & Receiver Info */}
                                  <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Security & Receiver</h4>

                                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 shadow-sm">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                                          <Key size={14} className="text-emerald-600" /> Delivery OTP
                                        </div>
                                        <span className="text-[10px] text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full font-semibold">
                                          Sent to Receiver's Mobile
                                        </span>
                                      </div>
                                      <div className="flex items-baseline justify-between mt-1">
                                        <p className="font-mono text-2xl font-black text-gray-900 tracking-widest">
                                          {!['DELIVERED', 'CANCELLED'].includes(parcel.status) ? parcel.deliveryOtp : '••••'}
                                        </p>
                                        <p className="text-xs text-gray-500">Receiver: {parcel.receiverDetails?.phone}</p>
                                      </div>
                                      <p className="text-[11px] text-emerald-700/80 mt-1">
                                        Receiver will share this OTP with the delivery partner upon arrival.
                                      </p>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                          <User size={16} />
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">Receiver</p>
                                          <p className="text-sm font-medium text-gray-900">{parcel.receiverDetails.name}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="text-sm font-medium text-gray-900">{parcel.receiverDetails.phone}</p>
                                      </div>
                                    </div>

                                    {parcel.driver && (
                                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 shadow-sm">
                                        <p className="text-xs text-amber-600 mb-1">Assigned Driver</p>
                                        <p className="text-sm font-medium text-gray-900">
                                          {parcel.driver.firstName} {parcel.driver.lastName} • {parcel.driver.phone}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Col 2: Payment Details & Actions */}
                                  <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment & Status</h4>

                                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm space-y-2">
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">Payment Method</p>
                                        <p className="text-sm font-medium text-gray-900">{parcel.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500">Payment Status</p>
                                        <p className="text-sm font-medium text-gray-900">
                                          {parcel.status === 'COMPLETED' ? 'Paid ✓' :
                                            (parcel.paymentMethod === 'COD' ?
                                              (parcel.status === 'DELIVERED' ? 'Waiting for cash collection' : 'Cash will be collected after delivery') :
                                              (parcel.status === 'DELIVERED' ? 'Payment Pending' : 'Will be collected after delivery')
                                            )}
                                        </p>
                                      </div>
                                      {parcel.status === 'DELIVERED' && parcel.paymentMethod === 'ONLINE' && parcel.paymentStatus === 'PAYMENT_PENDING' && (
                                        <div className="pt-2">
                                          <button
                                            onClick={async () => {
                                              try {
                                                const orderRes = await Axios.post(api.payment.create, { total: parcel.amount, userId: parcel.sender, note: "Pay for Delivered Parcel" });
                                                if (!orderRes.data?.success) throw new Error("Payment initialization failed");

                                                const order = orderRes.data.order;
                                                const options = {
                                                  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                                                  amount: order.amount,
                                                  currency: "INR",
                                                  order_id: order.orderId || order.id,
                                                  name: "Humrahii",
                                                  description: "Pay for Parcel",
                                                  handler: async function (response) {
                                                    try {
                                                      await Axios.post(`/parcel/${parcel._id}/verify-payment`, {
                                                        razorpay_payment_id: response.razorpay_payment_id,
                                                        razorpay_order_id: response.razorpay_order_id,
                                                        razorpay_signature: response.razorpay_signature,
                                                      });
                                                      toast.success("Payment Successful! Parcel Completed.");
                                                      fetchParcels();
                                                    } catch (err) {
                                                      toast.error("Payment verification failed");
                                                    }
                                                  },
                                                  modal: { ondismiss: () => toast.error("Payment cancelled") }
                                                };
                                                const rzp = new window.Razorpay(options);
                                                rzp.open();
                                              } catch (error) {
                                                console.error("Payment Error:", error);
                                                toast.error(error?.response?.data?.message || error?.message || "Failed to start payment.");
                                              }
                                            }}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm transition cursor-pointer"
                                          >
                                            💳 Pay ₹{parcel.amount}
                                          </button>
                                        </div>
                                      )}
                                    </div>
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
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default MyParcels;
