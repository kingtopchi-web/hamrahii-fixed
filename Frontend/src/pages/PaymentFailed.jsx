import React from "react";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const PaymentFailed = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const orderId = params.get("order_id");

    if (!orderId) return;

    const key = `failed_redirect_${orderId}`;

    // ❌ already redirected → stop
    if (sessionStorage.getItem(key)) return;

    // ✅ mark as redirected
    sessionStorage.setItem(key, "true");

    // 🚀 redirect to app
    window.location.href = `humrahii://payment-failed?${params.toString()}`;

    // 💡 fallback (if app not installed)
    setTimeout(() => {
      window.location.href = "/"; // or download page
    }, 2000);
  }, []);
  return (
    <div className="flex fixed top-0 left-0 z-50000 w-full h-screen justify-center items-center bg-gradient-to-br from-red-50 to-white px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-[var(--bg-surface)] shadow-xl rounded-2xl p-8 max-w-md w-full text-center"
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <XCircle className="text-red-500 w-16 h-16" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Failed
        </h1>

        {/* Message */}
        <p className="text-gray-500 mb-6">
          Something went wrong while processing your payment. Please try again
          or use a different method.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
