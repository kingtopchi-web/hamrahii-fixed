import { useEffect, useState } from "react";

export const useRazorpay = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setLoaded(true);
    script.onerror = () => setLoaded(false);

    document.body.appendChild(script);
  }, []);

  return loaded;
};