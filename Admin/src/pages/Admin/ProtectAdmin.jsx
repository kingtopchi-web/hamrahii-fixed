import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../../services/axios";
import { api } from "../../services/api";
import Loader from "../../components/loader/Loader";
import { useNavigate } from "react-router-dom";
import { setAdminDetails, clearAdminDetails } from "../../store/adminReducer";

const ProtectAdmin = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((state) => state.admin);
  const [isVerifying, setIsVerifying] = useState(!admin?.email || admin?.role !== "admin");
  const isCheckingRef = useRef(false);

  const checkAuth = async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    if (!token) {
      dispatch(clearAdminDetails());
      setIsVerifying(false);
      isCheckingRef.current = false;
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await Axios.get(api.admin.getData);
      if (res?.data?.success && res?.data?.admin?.role === "admin") {
        dispatch(setAdminDetails(res?.data?.admin));
      } else {
        throw new Error("Unauthorized");
      }
    } catch (error) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminUser");
      sessionStorage.clear();
      dispatch(clearAdminDetails());
      navigate("/login", { replace: true });
    } finally {
      setIsVerifying(false);
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    checkAuth();

    // Handle bfcache (browser back/forward button restores from cache)
    const handlePageShow = (event) => {
      const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
      if (event.persisted || !token) {
        checkAuth();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
  if (!token) {
    return null;
  }

  if (isVerifying && (!admin?.email || admin?.role !== "admin")) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (!admin?.email || admin?.role !== "admin") {
    return null;
  }

  return children;
};

export default ProtectAdmin;
