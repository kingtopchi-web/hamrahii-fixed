import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, MapPin, Car, Clock, Users, 
  DollarSign, User, Phone, MessageCircle, 
  Music, Cigarette,PawPrint, MessageSquare,
  Navigation, Route, CheckCircle, AlertCircle,
  Download, Shield, Info, UserCheck, UserX,
  Settings
} from 'lucide-react';
import { toast } from 'react-toastify';
import {useSelector} from "react-redux"

const ShowBookingDetails = ({ showBookingDetail, setShowBookingDetail }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [booking, setBooking] = useState(null);
  const user = useSelector(state => state.user)


  console.log(showBookingDetail , "this is booking  ")

 
  // Extract booking from showBookingDetail if it's an object with booking data
  useEffect(() => {
    if (showBookingDetail && typeof showBookingDetail === 'object') {
      if (showBookingDetail.booking) {
        setBooking(showBookingDetail.booking);
      } else if (showBookingDetail._id) {
        // If showBookingDetail itself is the booking data
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
          color: "bg-gray-100 text-gray-800 border border-gray-200",
          label: status || "Unknown",
          icon: <Clock size={16} />
        };
    }
  };



  // Check if passenger status is accepted
  
  const passanger =  booking.passanger.find(value => value.user === user?._id)
  
  const isPassengerAccepted =  passanger?.status === "accepted" ? true : false
  
  const statusConfig = getStatusConfig(booking.status);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not specified";
    try {
      return new Date(timeString).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Invalid time";
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
    if (booking.driverPhone) {
      window.open(`tel:${booking.driverPhone}`);
    } else {
      toast.error("Driver phone number not available");
    }
  };

  const handleOpenChat = () => {
    if (booking.chatRoomId) {
      toast.info("Chat feature coming soon!");
    } else {
      toast.error("Chat not available");
    }
  };

  const handleDownloadReceipt = () => {
    toast.info("Receipt download feature coming soon!");
  };

  const handleCancelBooking = () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      toast.info("Cancel booking feature coming soon!");
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
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#E10600]/10">
                  <Car className="w-6 h-6 text-[#E10600]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Booking Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Ride ID: {booking.rideId?.slice(-8) || booking._id?.slice(-8)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Passenger Status Badge */}
                {booking.passengerStatus && (
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                    booking.passengerStatus.toLowerCase() === 'accepted'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : booking.passengerStatus.toLowerCase() === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {booking.passengerStatus.toLowerCase() === 'accepted' ? (
                      <UserCheck size={16} />
                    ) : booking.passengerStatus.toLowerCase() === 'pending' ? (
                      <Clock size={16} />
                    ) : (
                      <UserX size={16} />
                    )}
                    {booking.passengerStatus}
                  </span>
                )}
                
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
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
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium text-gray-900">{booking.fromCity || "City"}</p>
                  <p className="text-sm text-gray-600 truncate max-w-[200px]">
                    {booking.from?.split(',')[0] || booking.from}
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
                <div className="p-2 rounded-lg bg-green-50">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium text-gray-900">{booking.toCity || "City"}</p>
                  <p className="text-sm text-gray-600 truncate max-w-[200px]">
                    {booking.to?.split(',')[0] || booking.to}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50 ">
            <div className="flex overflow-x-auto ">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#E10600] text-[#E10600]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
 
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 hide-scrollbar  pb-40">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Car Details */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Car size={20} />
                      Vehicle Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand</span>
                        <span className="font-medium">{booking.carBrand || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model</span>
                        <span className="font-medium">{booking.carName || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium">{booking.carType || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Seating Capacity</span>
                        <span className="font-medium">
                          {booking.totalSeats || booking.passengers || 1} seats
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available Seats</span>
                        <span className="font-medium">{booking.availableSeats || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ride Info */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock size={20} />
                      Ride Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Departure Date</p>
                          <p className="font-medium">{formatDate(booking.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Departure Time</p>
                          <p className="font-medium">{formatTime(booking.departureDateTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Navigation size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Distance</p>
                          <p className="font-medium">{booking.distance || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Driver Info - Only show if passenger is accepted */}
                  {isPassengerAccepted ? (
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User size={20} />
                        Driver Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.driverName || "Driver"}</p>
                            <p className="text-sm text-gray-500">Driver</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{booking.driverPhone || "Not available"}</span>
                          </div>
                          {/* <div className="flex items-center gap-2 text-sm">
                            <MessageCircle size={16} className="text-gray-400" />
                            <span className="text-gray-600">Chat Room:</span>
                            <span className="font-medium">
                              {booking.chatRoomId ? "Available" : "Not available"}
                            </span>
                          </div> */}
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleContactDriver}
                            className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            disabled={!booking.driverPhone}
                          >
                            <Phone size={18} />
                            Call Driver
                          </button>
                          {/* <button
                            onClick={handleOpenChat}
                            className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                            disabled={!booking.chatRoomId}
                          >
                            <MessageCircle size={18} />
                            Chat
                          </button> */}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield size={20} />
                        Driver Information
                      </h3>
                      <div className="flex flex-col items-center justify-center text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                          <Info className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Driver Details Locked
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Driver contact information will be available once your booking is accepted by the driver.
                        </p>
                        <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
                          Current Status: <span className="font-medium">{booking.passengerStatus || "Pending"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    
                     ₹ Payment Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600"> {booking.isFullSharing ? "Price" : "Price per Seat" } </span>
                        <span className="text-xl font-bold text-[#E10600]">
                          ₹{booking.pricePerSeat || 0}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Booking Date</span>
                        <span>{formatDate(booking.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Stops Tab */}
            {activeTab === 'stops' && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stops</h3>
                {booking.stops && booking.stops.length > 0 ? (
                  <div className="space-y-3">
                    {booking.stops.map((stop, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{stop.address}</p>
                          {stop.city && (
                            <p className="text-sm text-gray-500">{stop.city}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No stops on this route</p>
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Preferences</h3>
                {booking.preferences ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(booking.preferences).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="p-2 rounded-lg bg-gray-100">
                          {getPreferenceIcon(key) || <Info size={18} className="text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{key.replace('_', ' ')}</p>
                          <p className="text-sm text-gray-600">{getPreferenceLabel(key, value)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No preferences specified for this ride</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {/* <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {formatDate(booking.updatedAt)}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Download Receipt
                </button>
                {booking.passengerStatus?.toLowerCase() === 'accepted' ? " " : (
                  <button
                    onClick={handleCancelBooking}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div> */}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShowBookingDetails;