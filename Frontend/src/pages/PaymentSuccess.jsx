import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/endpoints";
import Axios from "../services/axios";

const PaymentSuccess = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");

    if (!paymentId) return;

    const key = `payment_${paymentId}`;

    // 🚫 already processed
    if (sessionStorage.getItem(key)) {
      return;
    }

    sessionStorage.setItem(key, "true");

    const data = {
      razorpay_payment_id: paymentId,
      razorpay_order_id: params.get("order_id"),
      razorpay_signature: params.get("signature"),
      userId: params.get("userId"),
    };

    handleSendPaymentRequest(data);
  }, []);

  const handleSendPaymentRequest = async (data) => {
    try {
      const res = await Axios.post(api.payment.handlePayment, data);

      if (res?.data?.success) {
        toast.success("Payment success")
        const urlParams = new URLSearchParams(window.location.search);
        const deepLink = `humrahii://payment-success?${urlParams.toString()}`;

        // Try deep link
        window.location.href = deepLink;
        

        // fallback (increase delay)
        setTimeout(() => {
          window.location.href = "https://humrahii.com";
        }, 1500);
      }
    } catch (error) {
      console.log(error, "this is error");
      toast.warning(error?.response?.data?.message || "Verification failed");
      toast.error(error);
    }
  };

  return (
    <div className="flex fixed top-0 left-0 z-[5000] w-full h-screen justify-center items-center bg-gradient-to-br from-green-50 to-white px-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-[var(--bg-surface)] shadow-xl rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful 🎉
        </h1>

        <p className="text-gray-500 mb-4">Redirecting you securely...</p>
        {/* <button onClick={(e) => setPayed(true)}>close</button> */}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
