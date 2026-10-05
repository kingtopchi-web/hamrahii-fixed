import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Axios from "../../services/axios";
import { toast } from "react-toastify";
import { Package, MapPin, CheckCircle, XCircle, Loader2, Navigation, Clock, AlertTriangle } from "lucide-react";

const RequestCard = ({ req, handleAction, actionLoading, pendingCashCollection }) => {
  const parcel = req.parcelId;
  const [timeLeft, setTimeLeft] = useState("");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!req.expiresAt) return;

    const expiryTime = new Date(req.expiresAt).getTime();
    const now = Date.now();

    if (expiryTime > now) {
      setExpired(false);
      const initialDist = expiryTime - now;
      const initialMins = Math.floor((initialDist % (1000 * 60 * 60)) / (1000 * 60));
      const initialSecs = Math.floor((initialDist % (1000 * 60)) / 1000);
      setTimeLeft(`${initialMins.toString().padStart(2, "0")}:${initialSecs.toString().padStart(2, "0")}`);
    } else {
      setExpired(true);
      setTimeLeft("00:00");
    }

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const distance = expiryTime - currentTime;

      if (distance <= 0) {
        clearInterval(interval);
        setExpired(true);
        setTimeLeft("00:00");
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [req.expiresAt, req._id]);

  if (!parcel) return null;

  if (expired) {
    return (
      <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-xl p-3 flex items-center justify-between text-xs opacity-60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gray-200/80 text-gray-500 flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <span className="font-semibold text-gray-700 capitalize text-xs block truncate max-w-[130px]">
              {parcel.itemType || "Parcel"}
            </span>
            <span className="text-[10px] text-gray-400 block">
              Expired
            </span>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-gray-400 bg-gray-200/70 px-2 py-0.5 rounded-full shrink-0">
          Closed
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-2xs hover:shadow-md hover:border-red-100 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-900 capitalize block leading-snug">
                {parcel.itemType || "Parcel Package"}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                  {parcel.vehicleType || "Bike"}
                </span>
                {parcel.weight && (
                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-semibold">
                    {parcel.weight} kg
                  </span>
                )}
              </div>
            </div>
          </div>
          {parcel.amount > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Fare</span>
              <span className="text-base font-extrabold text-emerald-600">
                ₹{parcel.amount}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-xs text-gray-600 mb-3.5">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Pickup</span>
              <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                {parcel.pickup?.address || parcel.pickup?.city || "Nearby location"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Drop-off</span>
              <p className="text-xs font-semibold text-gray-800 line-clamp-1">
                {parcel.dropoff?.address || parcel.dropoff?.city || "Destination"}
              </p>
            </div>
          </div>
          {parcel.description && (
            <p className="text-[11px] text-gray-500 italic pl-4 border-l-2 border-gray-100 line-clamp-1 mt-1">
              "{parcel.description}"
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        {req.expiresAt && !expired && (
          <div className="flex items-center justify-between px-2.5 py-1 bg-amber-50/70 border border-amber-200/50 rounded-lg text-[11px] text-amber-700 font-semibold mb-2.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              Expires in
            </span>
            <span className="font-mono">{timeLeft}</span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => handleAction(parcel._id, "accept")}
            disabled={actionLoading === parcel._id || pendingCashCollection}
            title={pendingCashCollection ? "Complete cash received for current COD parcel first" : "Accept parcel"}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {actionLoading === parcel._id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Accept</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleAction(parcel._id, "reject")}
            disabled={actionLoading === parcel._id}
            className="flex-1 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs border border-gray-200/80 hover:border-red-200 disabled:opacity-60 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Decline</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ParcelRequests = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isLive = Boolean(user?.liveLocationEnabled);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingCashCollection, setPendingCashCollection] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await Axios.get("/parcel/requests");
      if (res.data?.success) {
        setRequests(res.data.data || []);
        setPendingCashCollection(Boolean(res.data.pendingCashCollection));
      }
    } catch (error) {
      console.error("Failed to fetch parcel requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Poll every 5 seconds for real-time responsiveness
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleAction = async (parcelId, action) => {
    if (action === "accept" && pendingCashCollection) {
      toast.warning("Please complete the Cash Received confirmation for your current COD parcel before accepting another parcel.");
      return;
    }

    setActionLoading(parcelId);
    try {
      const res = await Axios.post(`/parcel/${parcelId}/${action}`);
      if (res.data?.success) {
        setRequests((prev) => prev.filter((req) => req.parcelId?._id !== parcelId));
        toast.success(res.data.message || `Parcel ${action}ed successfully.`);
        if (action === "accept") {
          navigate("/user/parcel-delivery");
        }
      }
    } catch (error) {
      console.error(error);
      const errData = error.response?.data;
      if (errData?.pendingCashCollection) {
        setPendingCashCollection(true);
      }
      toast.error(errData?.message || `Failed to ${action} parcel`);
      fetchRequests(); // Refresh in case it was assigned to someone else
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs hover:shadow-sm transition-all p-5 border border-gray-100 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-red-600" />
            Nearby Parcel Requests
            {requests.length > 0 && (
              <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold border border-red-100">
                {requests.length} New
              </span>
            )}
          </h3>
          {isLive && (
            <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Scanning 10 km
            </span>
          )}
        </div>

        {/* Pending Cash Collection Restriction Banner */}
        {pendingCashCollection && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-amber-950">COD Cash Received Pending</p>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-snug">
                Please complete the Cash Received confirmation for your current COD parcel before accepting another parcel.
              </p>
              <button
                onClick={() => navigate("/user/parcel-delivery")}
                className="mt-2 inline-flex items-center gap-1.5 font-bold text-[11px] text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer"
              >
                Go to Parcel Delivery &rarr;
              </button>
            </div>
          </div>
        )}

        {!isLive ? (
          <div className="py-6 flex flex-col items-center justify-center text-center text-gray-400 opacity-80 h-full">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-2">
              <Navigation className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-gray-500">Offline</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-2.5">
              <Package className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-gray-700">Looking for parcel requests...</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Requests within 10 km matching your vehicle and capacity will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {requests.map((req) => (
              <RequestCard 
                key={req._id} 
                req={req} 
                handleAction={handleAction} 
                actionLoading={actionLoading} 
                pendingCashCollection={pendingCashCollection}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelRequests;
