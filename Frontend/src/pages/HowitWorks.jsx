import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  MessageSquare,
  Car,
  Shield,
  MapPin,
  Target,
  Cpu,
  Wallet,
  ChevronRight,
  Star,
  CheckCircle,
  TrendingUp,
  Zap,
  Heart,
  Award,
  Clock,
  Percent,
  ArrowRight,
  Route,
  Navigation,
  UserCheck,
  Smartphone,
  Sparkles,
  Calendar,
  PawPrint,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Axios from "../services/axios";
import { api } from "../services/endpoints";
import { useGoogleMaps } from "../components/maps/GoogleMapsProvider";

const HowitWorks = () => {
  const user = useSelector((stats) => stats.user);
  const [recentRides, setRecentRides] = useState({});
     const { isLoaded } = useGoogleMaps();

  const navigate = useNavigate();
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  useEffect(() => {
    document.title = "See how Humrahii works";
  }, []);  
  
  useEffect(() => {
    if (!isLoaded) return;
    handleGetRecentRides();
  }, [isLoaded]);



  const handleGetRecentRides = async () => {
    try {
      const city  = await getCity()
      const res = await Axios.post(api.ride.getRecentRides , {city });

      setRecentRides(res.data.data);
    } catch (error) {}
  };



   const getCity = async () => {
      if (!isLoaded) return alert("Google not loaded yet");
  
      console.log("running...");
      try {
        const { lat, lng } = await getBrowserCoords();
  
        const city = await getCityFromCoords(lat, lng);
  
        console.log("User city:", city);
        return city;
      } catch (err) {
        console.log("Location error:", err);
      }
    };

  const steps = [
    {
      number: "1",
      icon: MapPin,
      title: "Enter Your Route",
      description: "Tell us where you want to go from and to",
      bgColor: "bg-[#F7F7F7]",
      iconColor: "#E10600",
    },
    {
      number: "2",
      icon: Users,
      title: "Find Your Match",
      description: "Browse verified riders going your way",
      bgColor: "bg-[#F7F7F7]",
      iconColor: "#E10600",
    },
    {
      number: "3",
      icon: MessageSquare,
      title: "Book & Connect",
      description: "Book your seat and chat with co-travellers",
      bgColor: "bg-[#F7F7F7]",
      iconColor: "#E10600",
    },
    {
      number: "4",
      icon: Car,
      title: "Ride & Save",
      description: "Enjoy your journey and save money",
      bgColor: "bg-[#F7F7F7]",
      iconColor: "#E10600",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Safe & Verified",
      description:
        "All users are verified with government ID and background checks",
      stat: "500K+ Verified Users",
    },
    {
      icon: Target,
      title: "Real-time Tracking",
      description: "Track your ride in real-time with live GPS updates",
      stat: "99.8% On-time Accuracy",
    },
    {
      icon: Cpu,
      title: "Smart Matching",
      description: "AI-powered matching with compatible co-travellers",
      stat: "Under 60 Seconds",
    },
    {
      icon: Wallet,
      title: "Save up to 70%",
      description: "Share costs and save money on your daily commute",
      stat: "₹10Cr+ Total Savings",
    },
  ];

  const testimonials = [
    {
      role: "Software Engineer",
      name: "Priya Sharma",
      location: "Bangalore",
      rides: "45 rides",
      quote:
        "Saves me ₹4000 monthly! The platform is reliable and the community is amazing.",
      savings: "₹18,000 saved",
    },
    {
      role: "College Student",
      name: "Rohan Patel",
      location: "Mumbai",
      rides: "32 rides",
      quote:
        "Perfect for students on a budget. Always find rides to my college campus.",
      savings: "₹9,600 saved",
    },
    {
      role: "Marketing Manager",
      name: "Anjali Mehta",
      location: "Delhi",
      rides: "67 rides",
      quote:
        "The safety features are exceptional. I feel completely secure during my rides.",
      savings: "₹26,800 saved",
    },
  ];

  const stats = [
    {
      value: "500K+",
      label: "Happy Riders",
      subtext: "Across 50+ cities",
      trend: "+25% this year",
    },
    {
      value: "50K+",
      label: "Daily Rides",
      subtext: "Completed daily",
      trend: "99.2% satisfaction",
    },
    {
      value: "₹10Cr+",
      label: "Total Savings",
      subtext: "Collective user savings",
      trend: "₹15K avg/user/year",
    },
    {
      value: "4.8/5",
      label: "App Rating",
      subtext: "Based on 125K reviews",
      trend: "Play Store & App Store",
    },
  ];

  const popularRoutes = [
    { from: "Delhi", to: "Gurgaon", price: "From ₹45", time: "45 min" },
    {
      from: "Bangalore",
      to: "Electronic City",
      price: "From ₹65",
      time: "50 min",
    },
    { from: "Mumbai", to: "Thane", price: "From ₹55", time: "40 min" },
    { from: "Hyderabad", to: "Gachibowli", price: "From ₹50", time: "35 min" },
    { from: "Pune", to: "Hinjewadi", price: "From ₹60", time: "55 min" },
  ];

  const benefits = [
    "Reduce traffic congestion by 20%",
    "Cut carbon emissions by 30% per ride",
    "Meet like-minded professionals",
    "Flexible ride scheduling",
    "24/7 customer support",
    "Instant payment settlements",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#F7F7F7] to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#F7F7F7] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-[#111111] mb-6 leading-tight flex flex-wrap justify-center gap-3">
              <span>Travel Smarter,</span>
              <span className="text-[#E10600]">Save Together</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-[#555555] max-w-3xl mx-auto mb-10">
              Join thousands of commuters sharing rides across India. Save
              money, reduce traffic, and make new connections on every journey.
            </p>

            {/* Stats Grid */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:border-[#E10600]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-[#111111] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-[#111111] mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-[#555555] mb-2">
                    {stat.subtext}
                  </div>
                  <div className="text-xs font-medium text-[#E10600]">
                    {stat.trend}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            {user.phone ? (
              ""
            ) : (
              <motion.button
                onClick={() => navigate("/register")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#E10600] text-white rounded-xl font-semibold text-lg hover:bg-[#C10500] transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl"
              >
                <Zap className="w-5 h-5" />
                Start Your Journey - It's Free
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-[#F7F7F7] py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-[#E5E5E5] text-[#111111] text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4 mr-2 text-[#E10600]" />
              Simple & Easy Process
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] mb-6">
              How It Works
            </h2>
            <p className="text-lg text-[#555555] max-w-2xl mx-auto">
              Get started with carpooling in just 4 simple steps. Join India's
              fastest-growing commuting community.
            </p>
          </motion.div>

          {/* Steps Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 hover:border-[#E10600] hover:shadow-lg transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-[#E10600] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl ${step.bgColor} flex items-center justify-center mb-6`}
                  >
                    <step.icon
                      className="w-8 h-8"
                      style={{ color: step.iconColor }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-[#111111] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#555555] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Section */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 md:p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#111111] mb-4">
                Travel Made Better, Together
              </h2>
              <p className="text-[#555555] max-w-2xl mx-auto">
                Experience the future of commuting with our smart features
                designed for safety, convenience, and savings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] p-6 hover:border-[#E10600] hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#E10600] flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-[#555555] text-sm mb-3 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="text-sm font-semibold text-[#E10600]">
                    {feature.stat}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Routes Section */}
      <section className="py-8 lg:py-12 bg-gradient-to-b from-white to-gray-50/30 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/50 mb-4">
              <Car size={16} className="text-red-500" />
              <span className="text-sm font-semibold text-red-700">
                Available Rides
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-red-600">Recent</span> & Upcoming Rides
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join these verified rides happening soon. Book your seat and
              travel smart!
            </p>
          </motion.div>

          {/* Rides Display - Updated to handle recentRides properly */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {recentRides &&
            Array.isArray(recentRides) &&
            recentRides.length > 0 ? (
              recentRides.map((ride, index) => (
                <motion.div
                  key={ride._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 overflow-hidden group"
                >
                  {/* Ride Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {ride.from?.city || "Location"} →{" "}
                          {ride.to?.city || "Destination"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} />
                          <span>
                            {ride?.departureDate
                              ? new Date(
                                  ride?.departureDate,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Date not specified"}
                          </span>
                          <Clock size={14} className="ml-2" />
                          <span>
                            {ride?.departureTime?.split("T")[1].slice(0, 5) ||
                              "Time not specified"}
                          </span>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 rounded-full">
                        <span className="text-sm font-semibold text-red-700">
                          ₹{ride.pricePerSeat || "0"}/seat
                        </span>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                        {ride.driver?.firstName?.[0] || "U"}
                        {ride.driver?.lastName?.[0] || ride.lastName?.[0] || ""}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {ride.driver?.firstName === undefined
                            ? "Anonymous"
                            : ride.driver?.firstName +
                              "" +
                              ride.driver?.lastName}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span> {ride?.carDetails?.model || "CAR"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ride Details */}
                  <div className="p-5">
                    {/* Route Info */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-0.5 h-8 bg-gradient-to-b from-red-500 to-orange-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1 line-clamp-1">
                          {ride.from?.address || "Pickup Location"}
                        </div>
                        <div className="text-sm text-gray-500 mb-3 line-clamp-1">
                          {ride.from?.city || "City"},{" "}
                          {ride.from?.state || "State"}
                        </div>
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {ride.to?.location ||
                            ride.to?.address ||
                            "Drop Location"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ride.to?.city || "City"}, {ride.to?.state || "State"}
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {ride.preferences.music === "allowed" ? (
                        <div className="px-3 py-1 bg-blue-50 rounded-full flex items-center gap-1">
                          <span className="text-xs font-medium text-blue-700">
                            🎵 {ride.preferences.music}
                          </span>
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-blue-50 rounded-full flex items-center gap-1">
                          <span className="text-xs font-medium text-blue-700">
                            🎵 {ride.preferences.music}
                          </span>
                        </div>
                      )}

                      {ride.preferences?.smoking === "not-allowed" ? (
                        <div className="px-3 py-1 bg-red-50 rounded-full flex items-center gap-1">
                          <span className="text-xs font-medium text-red-700">
                            🚭 {ride.preferences.smoking}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-medium text-blue-700">
                            {" "}
                            🚬 {ride.preferences.smoking}{" "}
                          </span>
                        </div>
                      )}

                      <div className="px-3 py-1 bg-red-50 rounded-full flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-700 flex justify-center items-center gap-2">
                          <PawPrint /> {ride.preferences.pets}
                        </span>
                      </div>

                      <div className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-700">
                          💬 {ride.preferences?.conversation || "Chat Optional"}
                        </span>
                      </div>
                    </div>

                    {/* Seats & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          <span className="text-red-600 font-bold">
                            {ride.availableSeats || ride.seatsAvailable || 1}
                          </span>{" "}
                          seat{ride.availableSeats !== 1 ? "s" : ""} available
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          navigate("/view-ride-details", {
                            state: { rideId: ride?._id },
                          })
                        }
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-200 transition-all duration-300 flex items-center gap-2"
                      >
                        <span>Book Now</span>
                        <ArrowRight size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              // Show message when no rides are available
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-50 to-orange-50 mb-4">
                  <Car size={24} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No rides available at the moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to offer a ride and help others travel smarter!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/offer-ride")}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all duration-300 flex items-center gap-2 mx-auto"
                >
                  <Zap size={20} />
                  <span>Offer a Ride Now</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* View All Rides Button - Only show if there are rides */}
          {recentRides.data &&
            Array.isArray(recentRides.data) &&
            recentRides.data.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-center mt-10"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/rides")}
                  className="px-8 py-3 bg-white border-2 border-red-200 text-red-700 font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mx-auto group"
                >
                  <Car size={20} />
                  <span>View All Available Rides</span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.button>
              </motion.div>
            )}
        </div>
      </section>
      {/* Testimonials Section */}
      <div className="bg-[#F7F7F7] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-[#E5E5E5] text-[#111111] text-sm font-semibold mb-4">
              <Heart className="w-4 h-4 mr-2 text-[#E10600]" />
              Loved by Riders Across India
            </div>
            <h2 className="text-4xl font-bold text-[#111111] mb-4">
              Real Stories, Real Savings
            </h2>
            <p className="text-[#555555]">
              Join thousands of happy commuters who save money and make friends
              every day
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-[#E5E5E5] p-8 hover:border-[#E10600] hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-[#111111]">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-[#555555]">
                      {testimonial.role}, {testimonial.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-[#F7F7F7] text-[#111111] rounded-lg text-xs font-medium">
                    <Car className="w-3 h-3" />
                    <span>{testimonial.rides}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[#555555] italic mb-4">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#E10600]">
                    <Wallet className="w-4 h-4" />
                    <span>{testimonial.savings}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#E5E5E5]">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#E10600] text-[#E10600]"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#555555]">
                    <UserCheck className="w-4 h-4" />
                    <span>Verified Rider</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits & CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Benefits Column */}
            <div>
              <h3 className="text-3xl font-bold text-[#111111] mb-6">
                Why Choose Carpooling?
              </h3>
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#E10600] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[#555555]">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#111111] to-gray-900 rounded-2xl p-8 md:p-12 text-white"
            >
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-gray-300 mb-8">
                Join India's fastest-growing carpooling community. Save money,
                reduce your carbon footprint, and make every commute memorable.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/register")}
                  className="w-full py-4 bg-[#E10600] text-white rounded-xl font-semibold hover:bg-[#C10500] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                >
                  <Zap className="w-5 h-5" />
                  Sign Up for Free
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-white/10 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>

                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  <span>Save up to 70%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Final CTA Banner */}
      <div className="border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[#111111] mb-4">
              Start carpooling today and make a difference
            </h3>
            <p className="text-[#555555] mb-8 max-w-2xl mx-auto">
              Every shared ride reduces traffic, saves money, and helps the
              environment.
            </p>
            <button
              onClick={() => navigate("/rides")}
              className="px-8 py-3 bg-[#E10600] text-white rounded-lg font-semibold hover:bg-[#C10500] transition-all duration-300 inline-flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Find Your First Rides
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowitWorks;
