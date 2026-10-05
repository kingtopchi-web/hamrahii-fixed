import { useEffect, useState } from "react";
import {motion} from "framer-motion"
import { AlertCircle, Loader2 } from "lucide-react";

const PaymentPage = () => {
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const initPayment = async () => {
      const params = new URLSearchParams(window.location.search);

      const orderId = params.get("order_id");
      const amount = params.get("amount");
      const userId = params.get("userId");

      // ✅ validation
      if (!orderId || !amount || !userId) {
        setError("Invalid payment request");
        return;
      }

      if (!orderId.startsWith("order_")) {
        setError("Invalid order ID");
        return;
      }

      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        setError("Failed to load payment gateway");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // ⚠️ put real key here
        amount: amount,
        currency: "INR",
        order_id: orderId,
        name: "Humrahii",
        logo : "https://humrahii.com/favicon.png",
        description: "Wallet Topup",
        theme: {
          color: "#E10600",
        },

        handler: function (response) {
          const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          } = response;

          // ✅ SUCCESS → back to app
          window.location.href =
            `https://humrahii.com/payment-success?` +
            `payment_id=${razorpay_payment_id}` +
            `&order_id=${razorpay_order_id}` +
            `&signature=${razorpay_signature}` +
            `&userId=${userId}`;
        },

        modal: {
          ondismiss: function () {
            // ✅ CANCEL → back to app
            window.location.href =
              `https://humrahii.com/payment-failed?order_id=${orderId}&userId=${userId}`;
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        const error = response.error;

        // ✅ FAILED → back to app
        window.location.href =
          `https://humrahii.com/payment-failed?` +
          `reason=${encodeURIComponent(error?.description || "failed")}` +
          `&order_id=${orderId}` +
          `&userId=${userId}`;
      });

      rzp.open();
    };

    initPayment();
  }, []);

  return (
    <div className="w-full fixed top-0 left-0 h-screen z-[999999] flex justify-center items-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center"
      >
        {/* ICON */}
        <div className="flex justify-center mb-4">
          {error ? (
            <AlertCircle className="text-red-500 w-14 h-14" />
          ) : (
            <Loader2 className="text-blue-500 w-14 h-14 animate-spin" />
          )}
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {error ? "Payment Failed" : "Processing Payment"}
        </h2>

        {/* MESSAGE */}
        <p className={`text-sm ${error ? "text-red-500" : "text-gray-500"}`}>
          {error
            ? error
            : "Opening secure payment gateway. Please do not press back or close the app."}
        </p>

        {/* EXTRA INFO */}
        {!error && (
          <p className="text-xs text-gray-400 mt-3">
            This may take a few seconds...
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentPage;