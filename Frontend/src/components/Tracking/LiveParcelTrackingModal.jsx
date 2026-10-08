/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, User, Loader2 } from 'lucide-react';
import LiveRouteTrackingMap from './LiveRouteTrackingMap';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { toast } from 'react-toastify';
import { useRazorpay } from '../../services/razorpay/useRazorpay';

const LiveParcelTrackingModal = ({ isOpen, onClose, parcel, onPaymentSuccess }) => {
  const razorLoaded = useRazorpay();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!isOpen || !parcel) return null;

  const handlePayment = async () => {
    try {
      setIsProcessingPayment(true);
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
            if (onPaymentSuccess) onPaymentSuccess();
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
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelParcel = async () => {
    try {
      setIsCancelling(true);
      const res = await Axios.patch(api.parcel.updateStatus(parcel._id), {
        status: "CANCELLED"
      });
      if (res.data?.success) {
        toast.success("Parcel request cancelled successfully");
        setShowCancelModal(false);
        onClose(); // Close tracking modal
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to cancel parcel");
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = !["PICKUP_CONFIRMED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"].includes(parcel.status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          className="bg-gray-50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] p-4 sm:p-5 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Live Parcel Tracking</h2>
              <p className="text-xs text-gray-500">ID: #{parcel._id.slice(-6).toUpperCase()}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 sm:p-5 overflow-y-auto hide-scrollbar space-y-6 flex-1">
            {/* Live Map */}
            <div className="w-full">
              <LiveRouteTrackingMap parcel={parcel} />
            </div>

            {/* Details Grid */}
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
                      Sent to Receiver
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <p className="font-mono text-2xl font-black text-gray-900 tracking-widest">
                      {!['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(parcel.status) ? parcel.deliveryOtp : '••••'}
                    </p>
                    <p className="text-xs text-gray-500">Receiver: {parcel.receiverDetails?.phone}</p>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 mt-1">
                    Receiver will share this OTP with the delivery partner upon arrival.
                  </p>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Receiver</p>
                      <p className="text-sm font-medium text-gray-900">{parcel.receiverDetails?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{parcel.receiverDetails?.phone}</p>
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

                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3 shadow-sm space-y-2">
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
                        disabled={isProcessingPayment}
                        onClick={handlePayment}
                        className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-70"
                      >
                        {isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : '💳'} Pay ₹{parcel.amount}
                      </button>
                    </div>
                  )}
                </div>

                {canCancel && (
                  <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 shadow-sm flex flex-col items-start space-y-2">
                    <p className="text-xs text-red-600">You can cancel this request before the driver confirms pickup.</p>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </motion.div>

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[var(--bg-surface)] rounded-xl shadow-xl w-full max-w-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Parcel Request?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to cancel this parcel? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
                >
                  No, Keep it
                </button>
                <button
                  onClick={handleCancelParcel}
                  disabled={isCancelling}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveParcelTrackingModal;
