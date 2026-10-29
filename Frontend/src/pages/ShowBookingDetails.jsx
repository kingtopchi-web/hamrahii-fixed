import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, MapPin, Car, Clock, Users, 
  DollarSign, User, Phone, MessageCircle, 
  Music, Cigarette, PawPrint, MessageSquare,
  Navigation, Route, CheckCircle, AlertCircle,
  Download, Shield, Info, UserCheck, UserX,
  Settings, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import Axios from '../services/axios';
import { api } from '../services/endpoints';

const ShowBookingDetails = ({ showBookingDetail, setShowBookingDetail }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [booking, setBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const user = useSelector(state => state.user);

  useEffect(() => {
    if (showBookingDetail && typeof showBookingDetail === 'object') {
      if (showBookingDetail.booking) {
        setBooking(showBookingDetail.booking);
      } else if (showBookingDetail._id) {
        setBooking(showBookingDetail);
      }
    } else {
      setBooking(null);
    }
  }, [showBookingDetail]);

  const handleClose = () => {
    setShowBookingDetail(null);
    setBooking(null);
    setActiveTab('overview');
  };

  if (!booking || !showBookingDetail) return null;

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return {
          color: "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/20",
          label: "Scheduled",
          icon: <Clock size={16} />
        };
      case "ongoing":
      case "started":
        return {
          color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          label: "Ongoing",
          icon: <AlertCircle size={16} />
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-800 border border-green-200",
          label: "Completed",
          icon: <CheckCircle size={16} />
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border border-red-200",
          label: "Cancelled",
          icon: <X size={16} />
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border border-[var(--border-subtle)]",
          label: status || "Scheduled",
          icon: <Clock size={16} />
        };
    }
  };

  // Resolve passenger info for the logged-in user
  const currentUserId = user?._id || localStorage.getItem("userId");
  const passengersList = booking.passengers || booking.passanger || [];
  const myPassenger = Array.isArray(passengersList)
    ? passengersList.find(
        (p) => (p.user?._id || p.user)?.toString() === currentUserId?.toString()
      ) || passengersList[0]
    : null;

  const rawPassengerStatus = myPassenger?.status || booking.passengerStatus || "requested";
  const passengerStatus = rawPassengerStatus.toLowerCase();
  const isPassengerAccepted = passengerStatus === "accepted" || passengerStatus === "confirmed";

  const statusConfig = getStatusConfig(booking.status || booking.rideStatus || "scheduled");

  // Driver details resolution
  const driverObj = booking.driver && typeof booking.driver === 'object' ? booking.driver : null;
  const driverName = booking.driverName || (driverObj ? `${driverObj.firstName || ''} ${driverObj.lastName || ''}`.trim() : "") || "Driver";
  const driverPhone = booking.driverPhone || driverObj?.phone || "";

  // Car details resolution
  const carObj = booking.car && typeof booking.car === 'object' ? booking.car : (booking.carDetails || {});
  const carBrand = booking.carBrand || carObj.brand || "";
  const carModel = booking.carName || carObj.model || "Car";
  const carType = booking.carType || carObj.type || "Vehicle";

  // Seats & Fare
  const seatsBooked = myPassenger?.seatsBooked || booking.seatsBooked || 1;
  const pricePerSeat = booking.pricePerSeat || 0;
  const totalFare = booking.amount || (pricePerSeat * seatsBooked);

  // Locations
  const fromCity = booking.fromCity || booking.from?.city || (typeof booking.from === 'string' ? booking.from.split(',')[0] : "Origin");
  const toCity = booking.toCity || booking.to?.city || (typeof booking.to === 'string' ? booking.to.split(',')[0] : "Destination");
  const fromAddress = booking.from?.address || (typeof booking.from === 'string' ? booking.from : fromCity);
  const toAddress = booking.to?.address || (typeof booking.to === 'string' ? booking.to : toCity);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not specified";
    try {
      if (timeString.includes("T")) {
        return new Date(timeString).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  const getPreferenceIcon = (key) => {
    switch (key) {
      case 'music': return <Music size={18} />;
      case 'smoking': return <Cigarette size={18} />;
      case 'pets': return <PawPrint size={18} />;
      case 'conversation': return <MessageSquare size={18} />;
      default: return null;
    }
  };

  const getPreferenceLabel = (key, value) => {
    const labels = {
      music: { allowed: 'Music Allowed', 'not-allowed': 'No Music' },
      smoking: { allowed: 'Smoking Allowed', 'not-allowed': 'No Smoking' },
      pets: { allowed: 'Pets Allowed', 'not-allowed': 'No Pets' },
      conversation: { allowed: 'Chatty', 'not-allowed': 'Quiet Ride', either: 'Flexible' }
    };
    return labels[key]?.[value] || value;
  };

  const handleContactDriver = () => {
    if (driverPhone) {
      window.open(`tel:${driverPhone}`);
    } else {
      toast.error("Driver phone number not available");
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking? Note: Cancellation is only allowed up to 2 hours before departure time.")) return;
    try {
      setCancelling(true);
      const rideId = booking.rideId || booking._id;
      const res = await Axios.post(api.ride.cancelBooking, { rideId });
      if (res.data?.success) {
        toast.success(res.data.message || "Booking cancelled successfully");
        if (showBookingDetail?.onCancelled) {
          showBookingDetail.onCancelled();
        }
        handleClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'stops', label: 'Stops' },
    { id: 'preferences', label: 'Preferences' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[var(--bg-surface)] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    My Booked Ride
                  </h2>
                  <p className="text-xs text-gray-500">
                    Ride ID: {booking.rideId?.slice(-8) || booking._id?.slice(-8)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Passenger Status Badge */}
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  isPassengerAccepted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : passengerStatus === 'requested' || passengerStatus === 'pending'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {isPassengerAccepted ? (
                    <UserCheck size={14} />
                  ) : passengerStatus === 'requested' || passengerStatus === 'pending' ? (
                    <Clock size={14} />
                  ) : (
                    <UserX size={14} />
                  )}
                  {isPassengerAccepted ? 'Booking Confirmed' : passengerStatus === 'requested' ? 'Pending Approval' : passengerStatus.toUpperCase()}
                </span>

                {booking.status && booking.status !== passengerStatus && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
                    {statusConfig.icon}
                    Ride: {statusConfig.label}
                  </span>
                )}
                
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Location Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="font-semibold text-gray-900">{fromCity}</p>
                  <p className="text-xs text-gray-600 truncate max-w-[200px]">
                    {fromAddress}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="w-full h-px bg-gray-200 md:hidden"></div>
                <div className="hidden md:block">
                  <Route className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">To</p>
                  <p className="font-semibold text-gray-900">{toCity}</p>
                  <p className="text-xs text-gray-600 truncate max-w-[200px]">
                    {toAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[var(--border-subtle)] bg-gray-50 px-6">
            <div className="flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
 
          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Vehicle Details */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Car size={18} className="text-indigo-600" />
                      Vehicle Details
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Brand</span>
                        <span className="font-medium text-gray-900">{carBrand || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Model</span>
                        <span className="font-medium text-gray-900">{carModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Vehicle Type</span>
                        <span className="font-medium text-gray-900">{carType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Seats Booked by You</span>
                        <span className="font-bold text-indigo-600">{seatsBooked} seat(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ride Total Seats</span>
                        <span className="font-medium text-gray-900">{booking.totalSeats || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ride Info */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-indigo-600" />
                      Ride Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Departure Date</p>
                          <p className="font-medium text-gray-900">{formatDate(booking.departureDate || booking.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Departure Time</p>
                          <p className="font-medium text-gray-900">{formatTime(booking.departureTime || booking.departureDateTime)}</p>
                        </div>
                      </div>
                      {booking.distance && (
                        <div className="flex items-center gap-3">
                          <Navigation size={18} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Distance</p>
                            <p className="font-medium text-gray-900">{booking.distance} km</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Driver Info */}
                  {isPassengerAccepted ? (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User size={18} className="text-indigo-600" />
                        Driver Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                            {driverName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{driverName}</p>
                            <p className="text-xs text-gray-500">Ride Driver</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-semibold text-gray-900">{driverPhone || "Not provided"}</span>
                          </div>
                        </div>
                        
                        {driverPhone && (
                          <div className="pt-2">
                            <button
                              onClick={handleContactDriver}
                              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 cursor-pointer font-medium text-sm shadow-sm"
                            >
                              <Phone size={16} />
                              Call Driver
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                      <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield size={18} className="text-amber-600" />
                        Driver Information
                      </h3>
                      <div className="flex flex-col items-center justify-center text-center py-3">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                          <Info className="w-6 h-6 text-amber-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          Driver Contact Details Protected
                        </h4>
                        <p className="text-xs text-gray-600 mb-3 max-w-xs">
                          Driver's phone number will become visible as soon as the driver confirms your booking request.
                        </p>
                        <div className="px-3 py-1 bg-amber-200/60 text-amber-900 rounded-full text-xs font-semibold">
                          Status: Waiting for Driver
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign size={18} className="text-emerald-600" />
                      Fare & Payment Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Price per Seat</span>
                        <span className="font-medium text-gray-800">₹{pricePerSeat}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Seats Booked</span>
                        <span className="font-medium text-gray-800">{seatsBooked}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Fare</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ₹{totalFare}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stops Tab */}
            {activeTab === 'stops' && (
              <div>
                {booking.stops && booking.stops.length > 0 ? (
                  <div className="space-y-4">
                    {booking.stops.map((stop, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{stop.city || stop.address}</p>
                          {stop.address && stop.address !== stop.city && (
                            <p className="text-xs text-gray-500 mt-0.5">{stop.address}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Route className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">Direct ride with no intermediate stops.</p>
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                {booking.preferences && Object.keys(booking.preferences).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(booking.preferences).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                          {getPreferenceIcon(key)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 capitalize">{key}</p>
                          <p className="font-semibold text-gray-800 text-sm">{getPreferenceLabel(key, value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm">No specific driver preferences recorded.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 px-6 border-t border-[var(--border-subtle)] bg-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {passengerStatus === 'cancelled'
                ? "This booking is cancelled."
                : passengerStatus === 'completed'
                ? "This trip has been completed."
                : "Cancellation allowed up to 2 hours before departure."}
            </span>

            <div className="flex items-center gap-3">
              {passengerStatus !== 'cancelled' && passengerStatus !== 'completed' && passengerStatus !== 'rejected' && (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition disabled:opacity-50 cursor-pointer text-xs flex items-center gap-1.5"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    "Cancel Booking"
                  )}
                </button>
              )}

              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShowBookingDetails;
