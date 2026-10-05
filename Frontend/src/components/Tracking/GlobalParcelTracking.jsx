/* eslint-disable */
import React, { useState, useEffect } from 'react';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, Navigation, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import LiveParcelTrackingModal from './LiveParcelTrackingModal';

const GlobalParcelTracking = () => {
  const [parcels, setParcels] = useState([]);
  const [activeParcels, setActiveParcels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  
  const user = useSelector(state => state.user);
  
  const fetchParcels = async () => {
    if (!user || !user._id) return;
    try {
      const res = await Axios.get(api.parcel.getMyParcels);
      if (res.data.success) {
        setParcels(res.data.data);
      }
    } catch (error) {
      console.warn("Failed to fetch parcels for global tracking");
    }
  };

  useEffect(() => {
    fetchParcels();
    const intervalId = setInterval(fetchParcels, 10000); // 10 seconds poll
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (parcels.length > 0) {
      let active = parcels.filter(parcel => {
        if (['CANCELLED', 'REJECTED', 'COMPLETED', 'EXPIRED'].includes(parcel.status)) return false;
        
        // Show only if driver assigned or beyond
        const isAssigned = parcel.driver || ['RIDER_ASSIGNED', 'ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(parcel.status);
        return isAssigned;
      });

      // Sort by creation date descending (most recent first)
      active = active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Only keep the most recent active parcel
      if (active.length > 0) {
        active = [active[0]];
      }
      setActiveParcels(active);

      // Update selected parcel if it was modified
      if (selectedParcel) {
        const updatedSelected = active.find(p => p._id === selectedParcel._id);
        if (updatedSelected) {
          setSelectedParcel(updatedSelected);
        } else {
          // If it's no longer active, wait, if the modal is open, we should probably keep it open until user closes or payment is done.
          // But if we want to auto-close, we can. Let's keep it in state.
          const stillExists = parcels.find(p => p._id === selectedParcel._id);
          if (stillExists) setSelectedParcel(stillExists);
        }
      }
    }
  }, [parcels]);

  if (!user || !user._id || activeParcels.length === 0) {
    return null; // Hide completely
  }

  const handleCardClick = (parcel) => {
    setSelectedParcel(parcel);
    setIsModalOpen(true);
    setShowSelector(false);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACCEPTED': return "Driver is reaching pickup";
      case 'OUT_FOR_PICKUP': return "Driver is on the way to pickup";
      case 'PICKED_UP': return "Parcel is on the way";
      case 'IN_TRANSIT': return "Driver is carrying your parcel";
      case 'OUT_FOR_DELIVERY': return "Driver is near the destination";
      case 'DELIVERED': return "Payment Pending";
      default: return status;
    }
  };

  return (
    <>
      <div className="fixed z-[9990] top-[15px] left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-[20px] md:top-[85px]">
        {activeParcels.length === 1 ? (
          // Single Parcel Pulsing Pill
          <div 
            onClick={() => handleCardClick(activeParcels[0])}
            className="relative group cursor-pointer inline-block"
          >
            {/* Pulsing Ripple Effects */}
            <div className="absolute -inset-1 bg-red-500 rounded-full animate-ping opacity-30"></div>
            <div className="absolute -inset-0.5 bg-red-500 rounded-full animate-pulse opacity-40"></div>
            
            {/* Pill Button */}
            <div className="relative bg-red-600 text-white shadow-2xl rounded-full px-5 py-2.5 flex items-center gap-3 transition-transform transform hover:scale-105 hover:bg-red-700">
              <Truck className="w-5 h-5 shrink-0" />
              <div className="flex flex-col items-start justify-center">
                <span className="font-bold text-[13px] leading-tight">
                  {activeParcels[0].status === 'DELIVERED' ? 'Parcel Delivered' : 'Parcel on the way'}
                </span>
                <span className="text-[10px] text-red-200 font-semibold leading-tight">
                  Track Parcel
                </span>
              </div>
              <ChevronRight className="w-4 h-4 ml-1 opacity-80" />
            </div>
          </div>
        ) : (
          // Multiple Parcels Selector
          <div className="relative">
            <AnimatePresence>
              {showSelector && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-gray-900 rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-700/50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Parcels</span>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto hide-scrollbar">
                    {activeParcels.map(parcel => (
                      <div 
                        key={parcel._id}
                        onClick={() => handleCardClick(parcel)}
                        className="p-3 border-b border-gray-700/50 last:border-0 hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-bold text-sm">#{parcel._id.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{getStatusText(parcel.status)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 truncate max-w-[200px]">
                            {parcel.pickup?.city} → {parcel.dropoff?.city}
                          </span>
                          <span className="text-[10px] font-bold text-blue-400">Track &rarr;</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div 
              onClick={() => setShowSelector(!showSelector)}
              className="bg-gray-900 rounded-xl shadow-2xl p-4 cursor-pointer hover:bg-gray-800 transition-all border border-gray-700/50 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Package className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-white font-bold text-sm">
                  {activeParcels.length} Active Parcels
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 rounded border border-red-500/30">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-red-500 tracking-wider">LIVE</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <LiveParcelTrackingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        parcel={selectedParcel} 
        onPaymentSuccess={fetchParcels}
      />
    </>
  );
};

export default GlobalParcelTracking;
