import React, { useEffect, useState } from "react";
import { getCarImageUrl } from "../utils/profileImageHelper";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  User,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Music,
  Cigarette,
  PawPrint,
  MessageSquare,
  Route,
  Users,
  Fuel,
  Settings,
  ChevronRight,
  Star,
  Shield,
  CheckCircle,
  Navigation,
  Phone,
  Mail,
  Sparkles,
  Heart,
  Share2,
  AlertCircle,
  Package,
  BadgeInfo,
  CarFront,
  Map,
  Flag,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Thermometer,
  Wifi,
  Wind,
  Battery,
  Zap,
  PhoneCall,
  MessageCircle,
  Eye,
  X,
  Hash,
  CarTaxiFront,
  FuelIcon,
  CalendarDays,
  UserCircle,
  PhoneOutgoing,
  Mail as MailIcon,
} from "lucide-react";
import Axios from "../services/axios";
import { api } from "../services/endpoints";
import { motion, AnimatePresence } from "framer-motion";
import ShowBooking from "./ShowBooking";
import { useSelector } from "react-redux";

const ViewRideDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [rideDetails, setRideDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllStops, setShowAllStops] = useState(false);
  const [expandedStopIndex, setExpandedStopIndex] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCarImage, setSelectedCarImage] = useState(0);
  const [isBooked, setIsBooked] = useState(false)
  const user = useSelector(state => state.user)


  useEffect(() => {
    const passangers = rideDetails?.passengers
    console.log(passangers, "these are passangers")
    const userId = user?._id
    const data = passangers?.find((passanger) => passanger?.user == userId)
    if (data?.user) {
      setIsBooked(true)
    }
  }, [user, rideDetails])


  const handleGetRideDetails = async (rideId) => {
    setIsLoading(true);
    try {
      const res = await Axios.post(api.ride.getById, { rideId });
      if (res?.data?.success) {
        setRideDetails(res?.data?.ride);
      }
    } catch (error) {
      // console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location?.state?.rideId) {
      handleGetRideDetails(location?.state?.rideId);
    }
  }, [location?.state]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  const calculateDuration = () => {
    const hours = Math.floor((rideDetails.distance || 892) / 60);
    const minutes = Math.round(
      (((rideDetails.distance || 892) % 60) / 60) * 60,
    );
    return `${hours}h ${minutes}m`;
  };

  const handleBookRide = async (e) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      const bookingData = {
        rideId: rideDetails._id,
        seatsBooked: selectedSeats
      }

      const response = await Axios.post(api.ride.requestRide, bookingData)

      if (response.data.success) {
        toast.success('🎉 Ride request sent successfully!')
        setIsBooked(true)
        setShowBooking(false)
      } else {
        toast.error(response.data.message || 'Failed to request ride')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request ride')
    } finally {
      setIsLoading(false)
    }
  }





  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#F7F7F7] to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#E10600] border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#555555]"
          >
            Loading ride details...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const stops = rideDetails.stops || [];
  const displayedStops = showAllStops ? stops : stops.slice(0, 3);
  const hasStops = stops.length > 0;
  const driverProfilePhoto =
    rideDetails.driver?.profilePhotos?.find((p) => p.isDefault)?.url ||
    rideDetails.driver?.profilePhotos?.[0]?.url;
  const carImages = rideDetails.carDetails?.images || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F7F7F7] to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-[#E5E5E5] px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#111111] mb-2">
                {rideDetails.from?.city} → {rideDetails.to?.city}
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <div className="flex items-center text-[#555555] text-sm">
                  <Route className="w-4 h-4 mr-2 text-[#E10600]" />
                  <span>
                    {rideDetails.distance || 892.44} km • {calculateDuration()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 text-[#E10600] rounded-full text-xs font-semibold border border-[#E10600]/20">
                    {rideDetails.status?.charAt(0).toUpperCase() +
                      rideDetails.status?.slice(1)}
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-500/20">
                    Available
                  </span>
                </div>
              </div>
            </div>

            {/* <div className="flex items-center gap-3">
                            <div className="flex items-center px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-lg">
                                <Star className="w-4 h-4 mr-1 fill-amber-500 text-amber-500" />
                                <span className="font-bold text-[#111111]">4.8</span>
                                <span className="text-[#555555] text-sm ml-1">(124)</span>
                            </div>
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={`p-2 rounded-lg border ${isLiked ? 'bg-rose-50 border-rose-200' : 'bg-white border-[#E5E5E5]'}`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-[#555555]'}`} />
                            </button>
                            <button className="p-2 rounded-lg bg-white border border-[#E5E5E5]">
                                <Share2 className="w-5 h-5 text-[#555555]" />
                            </button>
                        </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          {[
            {
              label: "Distance",
              value: `${rideDetails.distance || 892.44} km`,
              icon: Route,
              color: "from-blue-500/10 to-blue-500/5",
              border: "border-blue-100",
            },
            {
              label: "Duration",
              value: calculateDuration(),
              icon: Clock,
              color: "from-emerald-500/10 to-emerald-500/5",
              border: "border-emerald-100",
            },
            {
              label: rideDetails?.isFullSharing
                ? "Full Vehicle"
                : "Available Seats",
              value: rideDetails?.isFullSharing
                ? " Full Vehicle"
                : rideDetails.availableSeats || 3,
              icon: Users,
              color: "from-amber-500/10 to-amber-500/5",
              border: "border-amber-100",
            },
            {
              label: rideDetails?.isFullSharing ? "Price" : "Price/Seat",
              value: `₹${rideDetails.pricePerSeat || 800}`,
              icon: IndianRupee,
              color: "from-[#E10600]/10 to-[#E10600]/5",
              border: "border-red-100",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-white p-4 md:p-5 rounded-2xl border ${stat.border} shadow-card-subtle hover:shadow-card-hover transition-all duration-300`}
            >
              <div className="flex items-center gap-2.5 md:gap-3.5">
                <div
                  className={`p-2.5 bg-gradient-to-r ${stat.color} rounded-xl shrink-0`}
                >
                  <stat.icon className="w-5 h-5 text-gray-800" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#555555]">{stat.label}</p>
                  <p className="font-bold text-[#111111] text-base md:text-xl">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto mb-6 pb-2 gap-2 scrollbar-hide border-b border-gray-100">
          {["details", "driver", "vehicle", "preferences"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 font-semibold text-sm md:text-base flex-shrink-0 rounded-xl transition-all duration-200 cursor-pointer ${activeTab === tab
                ? "bg-[#E10600] text-white shadow-sm"
                : "text-[#555555] hover:text-[#111111] hover:bg-gray-100/80"
                }`}
            >
              {tab === "details" && "Journey Details"}
              {tab === "driver" && "Driver Profile"}
              {tab === "vehicle" && "Vehicle Info"}
              {tab === "preferences" && "Preferences"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Route Card */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-card-subtle">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl md:text-2xl font-bold text-[#111111]">
                      Route Details
                    </h2>
                  </div>

                  {/* Route Visualization */}
                  <div className="relative p-5 sm:p-6 bg-gray-50/70 rounded-2xl border border-gray-100 mb-6">
                    <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-[#E10600] to-[#B8B8B8] rounded-full"></div>

                    <div className="space-y-6 pl-6">
                      {/* Departure */}
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-[#E10600] rounded-full ring-2 ring-[#E10600]/20 mt-1.5"></div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#111111]">
                              Departure
                            </h3>
                            <span className="px-2 py-0.5 bg-[#E10600]/10 text-[#E10600] text-xs rounded">
                              Pickup
                            </span>
                          </div>
                          <p className="text-[#111111] text-sm">
                            {rideDetails.from?.address}
                          </p>
                          <p className="text-xs text-[#555555] mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {rideDetails.from?.city}
                          </p>
                        </div>
                      </div>

                      {/* Stops Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-[#111111] flex items-center gap-2">
                            <Flag className="w-4 h-4 text-[#E10600]" />
                            Route Stops ({stops.length})
                          </h4>
                          {hasStops && stops.length > 3 && (
                            <button
                              onClick={() => setShowAllStops(!showAllStops)}
                              className="text-sm text-[#E10600] hover:text-[#E10600]/80 flex items-center gap-1"
                            >
                              {showAllStops
                                ? "Show Less"
                                : `Show All ${stops.length}`}
                              {showAllStops ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>

                        {hasStops ? (
                          <div className="space-y-3">
                            {displayedStops.map((stop, index) => (
                              <div
                                key={stop._id || index}
                                className="flex items-start"
                              >
                                <div className="w-2 h-2 bg-[#B8B8B8] rounded-full mt-2"></div>
                                <div
                                  className="ml-4 flex-1 bg-white border border-[#E5E5E5] rounded-lg p-3 hover:border-[#E10600]/30 cursor-pointer transition-colors"
                                  onClick={() =>
                                    setExpandedStopIndex(
                                      expandedStopIndex === index
                                        ? null
                                        : index,
                                    )
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-[#555555]">
                                          Stop {index + 1}
                                        </span>
                                        <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                          Optional
                                        </span>
                                      </div>
                                      <h4 className="font-semibold text-[#111111]">
                                        {stop.city}
                                      </h4>
                                      <p className="text-sm text-[#555555] truncate">
                                        {stop.address}
                                      </p>
                                    </div>
                                    <ChevronDown
                                      className={`w-4 h-4 text-[#555555] transition-transform ${expandedStopIndex === index ? "rotate-180" : ""}`}
                                    />
                                  </div>

                                  {expandedStopIndex === index && (
                                    <div className="mt-3 pt-3 border-t border-[#E5E5E5]">
                                      <div className="flex items-center gap-4 text-xs">
                                        <span className="flex items-center gap-1 text-[#555555]">
                                          <Clock className="w-3 h-3" />
                                          ~10 min stop
                                        </span>
                                        <span className="flex items-center gap-1 text-[#555555]">
                                          <Info className="w-3 h-3" />
                                          Quick break
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 text-center bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                            <Flag className="w-8 h-8 text-[#B8B8B8] mx-auto mb-2" />
                            <h4 className="font-medium text-[#555555] mb-1">
                              No Stops Added
                            </h4>
                            <p className="text-sm text-[#555555]">
                              Direct ride from {rideDetails.from?.city} to{" "}
                              {rideDetails.to?.city}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Destination */}
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-[#B8B8B8] rounded-full ring-2 ring-[#B8B8B8]/20 mt-1.5"></div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#111111]">
                              Destination
                            </h3>
                            <span className="px-2 py-0.5 bg-[#B8B8B8]/10 text-[#555555] text-xs rounded">
                              Drop-off
                            </span>
                          </div>
                          <p className="text-[#111111] text-sm">
                            {rideDetails.to?.address}
                          </p>
                          <p className="text-xs text-[#555555] mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {rideDetails.to?.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 rounded-lg mr-3">
                          <Calendar className="w-4 h-4 text-[#E10600]" />
                        </div>
                        <h3 className="font-semibold text-[#111111]">
                          Departure Date
                        </h3>
                      </div>
                      <p className="text-lg font-bold text-[#111111]">
                        {formatDate(rideDetails.departureDate)}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-[#E5E5E5]">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 rounded-lg mr-3">
                          <Clock className="w-4 h-4 text-[#E10600]" />
                        </div>
                        <h3 className="font-semibold text-[#111111]">
                          Departure Time
                        </h3>
                      </div>
                      <p className="text-lg font-bold text-[#111111]">
                        {formatTime(rideDetails.departureTime)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing & Seats Card */}


                {rideDetails?.isFullSharing ? null : <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-card-subtle">
                  <h2 className="text-xl md:text-2xl font-bold text-[#111111] mb-5">
                    Pricing & Availability
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
                      <div className="flex items-center mb-3">
                        <div className="p-2.5 bg-[#E10600]/10 rounded-xl mr-3">
                          <IndianRupee className="w-5 h-5 text-[#E10600]" />
                        </div>
                        <h3 className="font-semibold text-[#111111]">
                          Price per Seat
                        </h3>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl md:text-3xl font-bold text-[#111111] mr-2">
                          ₹{rideDetails.pricePerSeat}
                        </span>
                        <span className="text-[#555555] text-sm">
                          per person
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
                      <div className="flex items-center mb-3">
                        <div className="p-2.5 bg-[#E10600]/10 rounded-xl mr-3">
                          <Users className="w-5 h-5 text-[#E10600]" />
                        </div>
                        <h3 className="font-semibold text-[#111111]">
                          Seat Availability
                        </h3>
                      </div>
                      <div className="flex items-baseline mb-3">
                        <span className="text-2xl md:text-3xl font-bold text-[#111111] mr-2">
                          {rideDetails.availableSeats}
                        </span>
                        <span className="text-[#555555] text-sm">
                          of {rideDetails.totalSeats} seats
                        </span>
                      </div>
                      <div className="w-full bg-[#E5E5E5] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#E10600] to-[#FF3B30] h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(rideDetails.availableSeats / rideDetails.totalSeats) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>}

              </div>
            )}

            {activeTab === "driver" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-card-subtle">
                <h2 className="text-xl md:text-2xl font-bold text-[#111111] mb-6">
                  Driver Information
                </h2>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-white shadow">
                      {driverProfilePhoto ? (
                        <img
                          src={
                            import.meta.env.VITE_ASSETS_URL + driverProfilePhoto
                          }
                          alt={rideDetails.driver?.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
                          <User className="w-16 h-16 text-blue-500/50" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#E10600] to-[#E10600]/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Verified
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#111111] mb-1">
                          {rideDetails.driver?.firstName}
                        </h3>
                        <p className="text-[#555555]">Professional Driver</p>
                      </div>
                      {/* <div className="flex items-center mt-3 md:mt-0 gap-2">
                                                <button className="px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-lg text-sm font-medium flex items-center gap-1.5">
                                                    <PhoneCall className="w-4 h-4" />
                                                    Call
                                                </button>
                                                <button className="px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-lg text-sm font-medium flex items-center gap-1.5">
                                                    <MessageCircle className="w-4 h-4" />
                                                    Message
                                                </button>
                                            </div> */}
                    </div>

                    <div className="p-4 bg-[#F7F7F7] rounded-lg border border-[#E5E5E5] mb-6">
                      <p className="text-[#111111]">
                        {rideDetails.driver?.bio ||
                          "Experienced driver with excellent safety record. Committed to providing a comfortable and safe journey for all passengers."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          icon: UserCircle,
                          label: "Gender",
                          value: rideDetails.driver?.gender,
                        },
                        {
                          icon: CalendarDays,
                          label: "Member Since",
                          value: "2024",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-[#E5E5E5]"
                        >
                          <div className="flex items-center text-[#555555] text-xs mb-1">
                            <item.icon className="w-3 h-3 mr-1.5" />
                            {item.label}
                          </div>
                          <div className="font-bold text-[#111111] truncate">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Driver Preferences */}
                    {/* {rideDetails.driver?.preferences && (
                                            <div className="mt-6">
                                                <h4 className="font-semibold text-[#111111] mb-3">Driver Preferences</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {Object.entries(rideDetails.driver.preferences).map(([key, value]) => (
                                                        <div key={key} className="bg-white p-3 rounded-lg border border-[#E5E5E5]">
                                                            <div className="text-xs text-[#555555] mb-1 capitalize">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </div>
                                                            <div className="font-semibold text-[#111111] capitalize">
                                                                {value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )} */}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "vehicle" && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 md:p-6">
                <h2 className="text-xl font-bold text-[#111111] mb-6">
                  Vehicle Details
                </h2>

                <div className="space-y-6">
                  {/* Main Car Image */}
                  <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#F7F7F7] to-white rounded-xl border border-[#E5E5E5] overflow-hidden">
                    {carImages.length > 0 ? (
                      <img
                        src={getCarImageUrl(carImages[selectedCarImage])}
                        alt={`${rideDetails.carDetails?.brand} ${rideDetails.carDetails?.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/default-car.svg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-24 h-24 text-[#B8B8B8]" />
                      </div>
                    )}

                    {/* Image Navigation */}
                    {carImages.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                        {carImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedCarImage(index)}
                            className={`w-2 h-2 rounded-full transition-all ${selectedCarImage === index ? "bg-[#E10600] w-8" : "bg-white/70 hover:bg-white"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {carImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {carImages.slice(0, 4).map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedCarImage(index)}
                          className={`h-20 rounded-lg border-2 overflow-hidden ${selectedCarImage === index ? "border-[#E10600]" : "border-[#E5E5E5]"}`}
                        >
                          <img
                            src={getCarImageUrl(img)}
                            alt={`Car view ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/default-car.svg";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Vehicle Specifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 md:p-6 rounded-xl border border-[#E5E5E5]">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-lg mr-3">
                          <CarTaxiFront className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="font-semibold text-[#111111]">
                          Vehicle Information
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          {
                            label: "Brand",
                            value: rideDetails.carDetails?.brand,
                            icon: Car,
                          },
                          {
                            label: "Model",
                            value: rideDetails.carDetails?.model,
                          },
                          {
                            label: "Year",
                            value: rideDetails.carDetails?.year,
                            icon: Calendar,
                          },
                          {
                            label: "Plate Number",
                            value: rideDetails.carDetails?.plateNumber,
                            icon: Hash,
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-2 border-b border-[#E5E5E5] last:border-b-0"
                          >
                            <div className="flex items-center text-[#555555]">
                              {item.icon && (
                                <item.icon className="w-4 h-4 mr-2" />
                              )}
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <span className="font-semibold text-[#111111]">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-xl border border-[#E5E5E5]">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg mr-3">
                          <Settings className="w-5 h-5 text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-[#111111]">
                          Specifications
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          {
                            label: "Fuel Type",
                            value: rideDetails.carDetails?.fuelType,
                            icon: FuelIcon,
                          },
                          {
                            label: "Transmission",
                            value: rideDetails.carDetails?.transmission,
                          },
                          {
                            label: "Seating Capacity",
                            value: `${rideDetails.carDetails?.seats} Seats`,
                            icon: Users,
                          },
                          {
                            label: "Status",
                            value: rideDetails.carDetails?.status,
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-2 border-b border-[#E5E5E5] last:border-b-0"
                          >
                            <div className="flex items-center text-[#555555]">
                              {item.icon && (
                                <item.icon className="w-4 h-4 mr-2" />
                              )}
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <span className="font-semibold text-[#111111] capitalize">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-white p-4 md:p-6 rounded-xl border border-[#E5E5E5]">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-lg mr-3">
                        <Info className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="font-semibold text-[#111111]">
                        Additional Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[#555555] mb-1">
                          Registration Date
                        </p>
                        <p className="font-semibold text-[#111111]">
                          {new Date(
                            rideDetails.carDetails?.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#555555] mb-1">
                          Last Updated
                        </p>
                        <p className="font-semibold text-[#111111]">
                          {new Date(
                            rideDetails.carDetails?.updatedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 md:p-6">
                <h2 className="text-xl font-bold text-[#111111] mb-6">
                  Ride Preferences
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Music,
                      label: "Music",
                      value: rideDetails.preferences?.music || "allowed",
                      description: "Background music during ride",
                      color: "from-purple-500/10 to-purple-500/5",
                      iconColor: "text-purple-500",
                    },
                    {
                      icon: Cigarette,
                      label: "Smoking",
                      value: rideDetails.preferences?.smoking || "not-allowed",
                      description: "Smoking inside vehicle",
                      color: "from-rose-500/10 to-rose-500/5",
                      iconColor: "text-rose-500",
                    },
                    {
                      icon: PawPrint,
                      label: "Pets",
                      value: rideDetails.preferences?.pets || "not-allowed",
                      description: "Traveling with pets",
                      color: "from-amber-500/10 to-amber-500/5",
                      iconColor: "text-amber-500",
                    },
                    {
                      icon: MessageSquare,
                      label: "Conversation",
                      value: rideDetails.preferences?.conversation || "either",
                      description: "Chatting during journey",
                      color: "from-blue-500/10 to-blue-500/5",
                      iconColor: "text-blue-500",
                    },
                  ].map((pref, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-[#E5E5E5] bg-gradient-to-br from-white to-[#F7F7F7]"
                    >
                      <div className="flex items-center mb-3">
                        <div className={`p-2 rounded-lg mr-3 ${pref.color}`}>
                          <pref.icon className={`w-5 h-5 ${pref.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#111111]">
                            {pref.label}
                          </h3>
                          <p className="text-xs text-[#555555]">
                            {pref.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-[#111111] capitalize">
                          {pref.value?.replace("-", " ")}
                        </p>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${pref.value === "allowed" ? "bg-emerald-500/10 text-emerald-700" : pref.value === "not-allowed" ? "bg-rose-500/10 text-rose-700" : "bg-blue-500/10 text-blue-700"}`}
                        >
                          {pref.value === "allowed"
                            ? "✓ Allowed"
                            : pref.value === "not-allowed"
                              ? "✗ Not Allowed"
                              : pref.value === "either"
                                ? "↔ Flexible"
                                : "Ask First"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Section */}
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-[#1c1c1e] via-[#141414] to-[#0a0a0a] rounded-3xl p-6 md:p-7 text-white shadow-card-hover border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#E10600]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="text-lg md:text-xl font-bold">Booking Summary</h3>
                <div className="p-2 bg-white/10 rounded-xl">
                  <Sparkles className="w-4 h-4 text-[#FF3B30]" />
                </div>
              </div>

              <div className="space-y-3 mb-5 relative z-10">
                {[
                  {
                    label: "Distance",
                    value: `${rideDetails.distance || 892.44} km`,
                    icon: Route,
                  },
                  {
                    label: "Duration",
                    value: calculateDuration(),
                    icon: Clock,
                  },
                  {
                    label: "Seats Available",
                    value: rideDetails?.isFullSharing ? "Full vehicle" : rideDetails.availableSeats || 3,
                    icon: Users,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2.5 border-b border-white/10"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 text-white/60" />
                      <span className="text-white/70 text-sm">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-bold text-sm md:text-base">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/15 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-sm">
                      {rideDetails?.isFullSharing ? "Price" : "Price per Seat"}
                    </span>
                  </div>
                  <span className="font-bold text-base">
                    ₹{rideDetails.pricePerSeat || 800}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/15">
                  <div>
                    <span className="font-semibold text-sm md:text-base">Total Amount</span>
                    <p className="text-white/50 text-xs mt-0.5">
                      {rideDetails?.isFullSharing ? "For full Vehicle" : `For ${selectedSeats} seat${selectedSeats > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-[#FF3B30]">
                    ₹{(rideDetails.pricePerSeat || 800) * selectedSeats}
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            {rideDetails?.isFullSharing ? null : <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-card-subtle">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-[#111111] text-base md:text-lg">Select Seats</h4>
                  <p className="text-[#555555] text-xs mt-0.5">
                    Choose number of seats
                  </p>
                </div>
                <div className="p-2 bg-red-50 rounded-xl">
                  <Package className="w-5 h-5 text-[#E10600]" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#111111] font-medium text-sm md:text-base">
                    Number of seats
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        setSelectedSeats((prev) => Math.max(1, prev - 1))
                      }
                      disabled={selectedSeats <= 1}
                      className="w-9 h-9 rounded-full bg-gray-100 text-[#111111] flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 border border-gray-200 transition-colors font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-[#111111] w-8 text-center">
                      {selectedSeats}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedSeats((prev) =>
                          Math.min(rideDetails.availableSeats || 3, prev + 1),
                        )
                      }
                      disabled={
                        selectedSeats >= (rideDetails.availableSeats || 3)
                      }
                      className="w-9 h-9 rounded-full bg-gray-100 text-[#111111] flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 border border-gray-200 transition-colors font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/70">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800 text-xs sm:text-sm">
                        Only {rideDetails.availableSeats || 3} seat
                        {rideDetails.availableSeats !== 1 ? "s" : ""} left!
                      </p>
                      <p className="text-xs text-amber-700/80 mt-0.5">
                        Book soon to secure your spot
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={(e) => handleBookRide(e)}
                disabled={isBooked}
                className={`w-full py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isBooked
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-[#E10600] to-[#FF3B30] hover:from-[#c50500] hover:to-[#e6352b] hover:shadow-lg text-white shadow-md active:scale-[0.98]"
                }`}
              >
                <CheckCircle className="mr-2 w-5 h-5" />
                {isBooked ? "Already Requested" : rideDetails?.isFullSharing
                  ? "Book now"
                  : `Book ${selectedSeats} Seat${selectedSeats > 1 ? "s" : ""}`}
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/user/send-parcel", { state: { rideDetails } })}
                className={`w-full py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center transition-all duration-200 cursor-pointer bg-white text-[#111111] border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50`}
              >
                <Package className="mr-2 w-5 h-5 text-gray-600" />
                Send a Parcel
              </button>
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-card-subtle">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-[#111111] text-base md:text-lg">Quick Facts</h4>
                <div className="p-1.5 bg-red-50 rounded-xl">
                  <BadgeInfo className="w-4 h-4 text-[#E10600]" />
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    icon: Users,
                    label: "Vehicle Capacity",
                    value: `${rideDetails.carDetails?.seats || 3} seats`,
                    color: "text-blue-500",
                  },
                  {
                    icon: CarFront,
                    label: "Vehicle Type",
                    value: `${rideDetails.carDetails?.brand || "Toyota"} ${rideDetails.carDetails?.model || "Fortuner"}`,
                    color: "text-emerald-500",
                  },
                  {
                    icon: MapPin,
                    label: "Departure City",
                    value: rideDetails.from?.city || "New Delhi",
                    color: "text-[#E10600]",
                  },
                  {
                    icon: Calendar,
                    label: "Departure Date",
                    value: new Date(
                      rideDetails.departureDate,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    }),
                    color: "text-purple-500",
                  },
                ].map((fact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl hover:bg-white hover:shadow-xs transition-all border border-gray-100/60"
                  >
                    <div className="flex items-center text-[#111111] text-sm">
                      <fact.icon className={`w-4 h-4 mr-2.5 ${fact.color}`} />
                      <span className="text-gray-600 font-medium">{fact.label}</span>
                    </div>
                    <span className="font-bold text-[#111111] text-sm">
                      {fact.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* {showBooking ? (
        <ShowBooking
          setShowBooking={setShowBooking}
          rideDetails={rideDetails}
          selectedSeats={selectedSeats}
        />
      ) : (
        ""
      )} */}
    </div>
  );
};

export default ViewRideDetails;
