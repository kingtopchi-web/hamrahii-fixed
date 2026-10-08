import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  IndianRupee,
  CreditCard,
  Smartphone,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { toast } from "react-toastify";
import axios from "axios";
import Axios from "../../../services/axios";
import { api } from "../../../services/endpoints";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails } from "../../../store/userReducer";
import { useNavigate } from "react-router-dom";
import data from "../../../assets/data.json";
import logo from "../../../assets/favicon.png";
import { useRazorpay } from "../../../services/razorpay/useRazorpay";
import { useEffect } from "react";

const AddMoneyModal = ({
  open,
  onClose,
  currency,
  location,
  fetchTransactions,
  defaultAmount,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(defaultAmount || location?.state?.amount || (location?.state?.type === "first-ride" ? 250 : 100));

  useEffect(() => {
    if (defaultAmount) {
      setAmount(defaultAmount.toString());
    }
  }, [defaultAmount, open]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isCencelled, setIsCencelled] = useState(false)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const razorLoaded = useRazorpay();
  const type = location?.state?.type || ""

  useEffect(() => {
    console.log(type, "thiis is type")
  }, [type])



  const quickAmounts = [100, 250, 500, 1000, 2000, 5000];

  const closeModel = () => {
    setIsCencelled(false)
    onClose()
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // console.log(api.user.creditWallet);
      const res = await Axios.post(api.user.creditWallet, {
        amount: numAmount,
        source: "dummy",
        description: "this si dummy data and not valid money",
        referenceId: Date.now(),
      });

      // console.log(res, "this is repsonse");
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        setLoading(false);
        setAmount("");
        onClose();
        dispatch(setUserDetails(res?.data?.user));
        if (fetchTransactions) fetchTransactions();
        if (onSuccess) onSuccess(res?.data?.user);
        if (location?.state?.redirect === "prefrences") {
          // console.log("working...");
          navigate("/offer-ride", { state: { redirect: "prefrences" } });
        }
      }
    } catch (error) {
      // console.log(error, "this si error");
      toast.error(error?.response?.data?.message);
    }
  };

  const handleQuickSelect = (quickAmount) => {
    setAmount(quickAmount.toString());
    setError("");
  };

  const handleSendPaymentRequest = async (data) => {
    try {
      const res = await Axios.post(api.payment.handlePayment, data);
      console.log(res, "this is repsonse");
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        setLoading(false);
        setAmount("");
        onClose();
        dispatch(setUserDetails(res?.data?.user));
        if (fetchTransactions) fetchTransactions();
        if (onSuccess) onSuccess(res?.data?.user);
        if (location?.state?.redirect === "prefrences") {
          // console.log("working...");
          navigate("/offer-ride", { state: { redirect: "prefrences" } });
        }
      }
    } catch (error) {
      console.log(error);
      toast.info(error?.response?.data?.message);
    }
  };

  const handleCredit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const numAmount = parseInt(amount);

    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (numAmount > 10000) {
      setError("Maximum amount per transaction is 10,000");
      return;
    }

    if (numAmount < 10) {
      setError("Minimum amount is 10");
      return;
    }

    try {
      console.log(api.payment.create, "this is payment")
      const res = await Axios.post(api?.payment?.create, {
        total: numAmount,
        userId: user?._id || user?.user?._id,
        note: `Payment creation for credit account with amount ${numAmount}`,
      });
      console.log(res, "this is orderCreateResponse");

      if (res?.data?.success) {
        toast.success(res?.data?.message);
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: res?.data?.order?.amount,
        currency: "INR",
        name: "Humrahii",
        description: res?.data?.order?.notes[0],
        image: logo,
        order_id: res?.data?.order?.id,

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },

        prefill: {
          name: user?.firstName || "User",
          email: user?.email || "user@email.com",
          contact: user?.phone || 6587412365,
        },

        notes: {
          address: data.address,
          totalPrice: amount,
        },

        theme: {
          color: "#E10600",
        },

        // 🔥 THIS IS WHAT YOU NEED
        handler: (response) => handleSendPaymentRequest(response),

        modal: {
          ondismiss: function () {
            setIsCencelled(true)

          },
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>

      {isCencelled ? <PaymentCancelledModal amount={amount} closeModel={closeModel} /> : <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-200/70  bg-opacity-50"
          onClick={(e) => { onClose(); setLoading(false) }}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-md"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wallet className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Add Money to Wallet
                    </h3>
                    <p className="text-sm text-gray-600">
                      Enter amount to add to your wallet
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCredit}>
              <div className="p-6">
                {/* Payment Method Selection */}


                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError("");
                      }}
                      onBlur={(e) => {
                        const minAmount = type === "first-ride" ? 250 : 10;
                        if (amount < minAmount) {
                          toast.info(`Amount should be greater or equal to ${minAmount}`);
                          setAmount(minAmount);
                        }
                      }}
                      className={`block w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${error ? "border-red-300" : "border-gray-300"
                        }`}
                      placeholder="Enter amount"
                      disabled={loading}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>


                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {quickAmounts.map((quickAmount) => (
                      <button
                        type="button"
                        key={quickAmount}
                        onClick={() => handleQuickSelect(quickAmount)}
                        className={`p-3 rounded-lg border transition-all ${amount === quickAmount.toString()
                          ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                          : "border-[var(--border-subtle)] hover:border-purple-300 hover:bg-purple-50"
                          }`}
                      >
                        ₹{quickAmount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 ${type === "first-ride" ? "text-red-500" : "text-blue-600"}  flex-shrink-0 mt-0.5 `} />
                    <div>
                      <p className={`text-sm ${type === "first-ride" ? "text-red-500" : "text-blue-600"}`}>
                        {type === "first-ride" ? "Add minimum balance of Rs. 250 . It is required to create first ride" :  " Amount will be added instantly. You can use this for ride payments and other services."}
                       
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCredit}
                    disabled={loading || !amount}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <IndianRupee className="w-5 h-5" />
                        Add ₹{amount || 0}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>}



    </AnimatePresence>
  );
};

export default AddMoneyModal;




const PaymentCancelledModal = ({ amount, closeModel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="w-full max-w-sm bg-[var(--bg-surface)] rounded-xl shadow-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={closeModel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Payment Cancelled
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-4">
          Your payment transaction was not completed.
        </p>

        {/* Amount */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <span className="text-lg font-semibold text-gray-900">
              Amount: ₹{amount}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={closeModel}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Add retry payment logic here
              closeModel();
            }}
            className="flex-1 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};
