import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock,  
  FaCar, 
  FaShareAlt, 
  FaPhone, 
  FaEnvelope,
  FaMapPin
} from 'react-icons/fa';
import { 
  MdEventSeat, 
  MdCheckCircle, 
  MdLocationOn, 
  MdArrowForward, 
  MdDirectionsCar,
  MdClose,
  MdPlace
} from 'react-icons/md';
import { FaIndianRupeeSign } from "react-icons/fa6";

const ViewRides = ({ viewRides, setViewRides }) => {
  const [bookingSeats, setBookingSeats] = useState(1);
  const [showAllStops, setShowAllStops] = useState(false);

  if (!viewRides) return null;

  // Calculate ride status and styling
  const getStatusStyle = (status) => {
    switch(status) {
      case 'scheduled': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'active': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'completed': return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      default: return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
    }
  };

  // Format date and time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  // Calculate duration from distance
  const calculateDuration = () => {
    if (!viewRides.distance) return "N/A";
    const hours = Math.floor(viewRides.distance / 60);
    const minutes = Math.round(((viewRides.distance % 60) / 60) * 60);
    return `${hours}h ${minutes}m`;
  };

  const handleBookRide = () => {
    if (bookingSeats > viewRides.availableSeats) {
      alert(`Only ${viewRides.availableSeats} seats available!`);
      return;
    }
    alert(`Booking confirmed for ${bookingSeats} seat(s)! Total: ₹${viewRides.pricePerSeat * bookingSeats}`);
    // Add actual booking logic here
  };

  const handleShareRide = () => {
    const shareText = `Join my ride from ${viewRides.from.city} to ${viewRides.to.city} on ${formatDate(viewRides.departureDate)} at ${formatTime(viewRides.departureTime)}. Price: ₹${viewRides.pricePerSeat}/seat. Ride ID: ${viewRides.rideId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Share Ride Details',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Ride details copied to clipboard!');
    }
  };

  // Display stops with show more/less functionality
  const displayedStops = showAllStops 
    ? viewRides.stops 
    : viewRides.stops?.slice(0, 3) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto hide-scrollbar">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
        onClick={() => setViewRides(null)}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl">
          {/* Close Button */}
          <button
            onClick={() => setViewRides(null)}
            className="absolute -top-12 right-0 z-10 p-3 text-white hover:text-gray-300 transition-colors"
          >
            <MdClose className="w-8 h-8" />
          </button>

          <div className="bg-[#FFFFFF] rounded-3xl shadow-2xl overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto hide-scrollbar">
            {/* Header with Gradient */}
            <div className={`relative ${getStatusStyle(viewRides.status)} px-8 py-6`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Ride Details
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FFFFFF]/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <MdDirectionsCar />
                      {viewRides.distance ? `${viewRides.distance.toFixed(2)} km` : 'Distance: N/A'}
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFFFF]/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    <MdCheckCircle className="text-xl" />
                    {viewRides.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Route Section with Stops */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaMapMarkerAlt className="text-[#3B82F6]" />
                    </div>
                    <h2 className="text-xl font-bold text-[#0F172A]">Route Information</h2>
                  </div>
                  <div className="text-sm text-[#475569] bg-[#F8FAFC] px-3 py-1 rounded-full">
                    {viewRides.stops?.length || 0} Stops
                  </div>
                </div>
                
                {/* Main Route Timeline */}
                <div className="relative mb-8">
                  {/* Timeline line */}
                  <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-green-400"></div>
                  
                  {/* Start Point */}
                  <div className="relative pl-12 md:pl-16 mb-6">
                    <div className="absolute left-0 -translate-x-1/2 w-8 h-8 bg-[#EFF6FF]0 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#FFFFFF] rounded-full"></div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-2xl border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#3B82F6] font-semibold mb-1">START</p>
                          <h3 className="text-lg font-bold text-[#0F172A] mb-2">{viewRides.from.city}</h3>
                          <p className="text-[#475569] text-sm flex items-start gap-2">
                            <MdLocationOn className="text-[#94A3B8] mt-1 flex-shrink-0" />
                            {viewRides.from.address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#64748B]">Departure</p>
                          <p className="font-semibold">{formatTime(viewRides.departureTime)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stops */}
                  {displayedStops.map((stop, index) => (
                    <div key={index} className="relative pl-12 md:pl-16 mb-4">
                      <div className="absolute left-0 -translate-x-1/2 w-6 h-6 bg-purple-400 rounded-full border-3 border-white flex items-center justify-center">
                        <MdPlace className="text-white text-xs" />
                      </div>
                      <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                Stop {index + 1}
                              </span>
                              {stop.estimatedTime && (
                                <span className="text-xs text-[#64748B]">
                                  ~{stop.estimatedTime}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-[#0F172A]">{stop.city || stop.address?.split(',')[0]}</p>
                            <p className="text-xs text-[#64748B] truncate">{stop.address}</p>
                          </div>
                          <div className="text-right">
                            {stop.price && (
                              <p className="text-sm font-semibold text-[#10B981]">₹{stop.price}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Show More/Less Button for Stops */}
                  {viewRides.stops?.length > 3 && (
                    <div className="pl-12 md:pl-16 mb-6">
                      <button
                        onClick={() => setShowAllStops(!showAllStops)}
                        className="flex items-center gap-2 text-[#3B82F6] hover:text-blue-700 text-sm font-medium"
                      >
                        {showAllStops ? (
                          <>
                            Show Less
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            Show {viewRides.stops.length - 3} More Stops
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* End Point */}
                  <div className="relative pl-12 md:pl-16">
                    <div className="absolute left-0 -translate-x-1/2 w-8 h-8 bg-[#ECFDF5]0 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#FFFFFF] rounded-full"></div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-white p-5 rounded-2xl border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#10B981] font-semibold mb-1">DESTINATION</p>
                          <h3 className="text-lg font-bold text-[#0F172A] mb-2">{viewRides.to.city}</h3>
                          <p className="text-[#475569] text-sm flex items-start gap-2">
                            <MdLocationOn className="text-[#94A3B8] mt-1 flex-shrink-0" />
                            {viewRides.to.address}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-[#64748B]">Arrival</p>
                          <p className="font-semibold">
                            {viewRides.distance ? `~${calculateDuration()}` : 'Time: N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distance & Duration Summary */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <MdDirectionsCar className="text-[#3B82F6]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#475569]">Total Distance</p>
                        <p className="text-xl font-bold text-[#0F172A]">
                          {viewRides.distance ? `${viewRides.distance.toFixed(2)} km` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <FaClock className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-[#475569]">Estimated Duration</p>
                        <p className="text-xl font-bold text-[#0F172A]">
                          {viewRides.distance ? calculateDuration() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <FaMapPin className="text-[#10B981]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#475569]">Total Stops</p>
                        <p className="text-xl font-bold text-[#0F172A]">
                          {viewRides.stops?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Date & Time */}
                <div className="bg-[#F8FAFC] p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FaCalendarAlt className="text-[#3B82F6] text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Departure Date</p>
                      <p className="font-bold text-[#0F172A]">{formatDate(viewRides.departureDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <FaClock className="text-purple-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Departure Time</p>
                      <p className="font-bold text-[#0F172A]">{formatTime(viewRides.departureTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Seats */}
                <div className="bg-[#F8FAFC] p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <MdEventSeat className="text-[#10B981] text-2xl" />
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Available Seats</p>
                      <p className="font-bold text-3xl text-[#0F172A]">
                        {viewRides.availableSeats}<span className="text-lg text-[#64748B]">/{viewRides.totalSeats}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: viewRides.totalSeats }).map((_, index) => (
                      <div
                        key={index}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          index < viewRides.availableSeats 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : 'bg-gray-300'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-[#F8FAFC] p-5 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <FaIndianRupeeSign className="text-yellow-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-[#64748B]">Price per Seat</p>
                      <p className="font-bold text-3xl text-[#0F172A]">
                        ₹{viewRides.pricePerSeat}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                    <p className="text-sm text-[#64748B]">Total Value</p>
                    <p className="font-semibold text-[#0F172A]">
                      ₹{viewRides.totalAmount || viewRides.pricePerSeat * viewRides.totalSeats}
                    </p>
                  </div>
                </div>
                
              </div>

              {/* Driver Information */}
              <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-2xl border border-blue-100 mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaUser className="text-[#3B82F6]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0F172A]">Driver Information</h2>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Profile Image */}
                  <div className="relative">
                    {viewRides.driver?.profilePhotos[0] ? (
                            <img 
                              src={viewRides.driver.profilePhotos[0].url} 
                              alt={viewRides.driver.firstName}
                              className="w-24 h-24 rounded-full border border-[#E2E8F0]"
                                onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = `${import.meta?.env.VITE_ASSETS_URL}${viewRides.driver.profilePhotos[0].url}`
                                            }}
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                              {viewRides.driver?.firstName?.charAt(0)  + viewRides.driver?.lastName?.charAt(0) || 'D'}
                            </div>
                          )}
                    <div className="absolute -bottom-2 -right-2 bg-[#ECFDF5]0 text-white rounded-full p-2">
                      <FaCar />
                    </div>
                  </div>
                  
                  {/* Driver Details */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                      {viewRides.driver.firstName} {viewRides.driver.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2 text-[#475569]">
                        <FaEnvelope className="text-[#94A3B8]" />
                        {viewRides.driver.email}
                      </div>
                      <div className="flex items-center gap-2 text-[#475569]">
                        <FaPhone className="text-[#94A3B8]" />
                        {viewRides.driver.phone}
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0F172A] mb-1">4.8</div>
                    <div className="text-yellow-500">★★★★☆</div>
                    <div className="text-sm text-[#64748B] mt-1">Excellent</div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#F8FAFC] p-6 rounded-xl">
                  <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-[#3B82F6]" />
                    Ride Timeline
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-[#475569]">Created</span>
                      <span className="font-semibold">{formatDate(viewRides.createdAt)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[#475569]">Departure</span>
                      <span className="font-semibold">{formatDate(viewRides.departureDate)}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-[#F8FAFC] p-6 rounded-xl">
                  <h3 className="font-bold text-[#0F172A] mb-4">Ride Policies</h3>
                  <ul className="space-y-2 text-sm text-[#475569]">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#EFF6FF]0 rounded-full mt-1.5"></div>
                      Cancellation allowed up to 2 hours before departure
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-[#ECFDF5]0 rounded-full mt-1.5"></div>
                      Price includes all taxes and charges
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                      Maximum luggage: 15kg per seat
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                      Pickup available at designated stops only
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRides;