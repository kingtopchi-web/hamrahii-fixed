import React, { useState } from 'react';
import { motion } from "framer-motion";
import UserSidebar from '../../components/Sidebar/UserSidebar';
import { useSelector } from "react-redux";
import { Package, Route, Wallet, Clock, ArrowRight, Car, Search, Gift, Shield, Zap, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import RiderAvailability from "../../components/Rider/RiderAvailability";
import ParcelRequests from "../../components/Rider/ParcelRequests";
import WeatherWidget from "../../components/Weather/WeatherWidget";
import KycGuard from "../../components/KycGuard";

const UserDashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector((state) => state?.user || {});
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const formatBalance = (val) => {
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const balance = formatBalance(user?.wallet?.balance ?? 0);
  const virtualBalance = formatBalance(user?.virtualMoney?.balance ?? 0);
  const trustScore = user?.trustScore || 0;
  const isVerified = user?.isVerified === "verified" || user?.isVerified === "review";

  const stats = [
    { icon: Car, label: 'Offered Rides', value: user?.totalRides || 0, subtitle: 'Journeys made', color: 'from-blue-500 to-cyan-400' },
    { icon: Wallet, label: 'Wallet Balance', value: `₹${balance}`, subtitle: 'Available funds', color: 'from-emerald-500 to-teal-400' },
    { icon: Package, label: 'Parcels', value: user?.parcelsCount || 0, subtitle: 'Sent & Received', color: 'from-purple-500 to-pink-500' },
    { icon: Clock, label: 'Bookings', value: user?.bookingsCount || 0, subtitle: 'Total booked', color: 'from-amber-500 to-orange-400' },
  ];

  const quickActions = [
    { icon: Search, label: 'Find a Ride', color: 'text-blue-600', bg: 'bg-blue-50', link: '/rides' },
    { icon: Car, label: 'Offer a Ride', color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/offer-ride' },
    { icon: Clock, label: 'My Bookings', color: 'text-purple-600', bg: 'bg-purple-50', link: '/my-profile/bookings' },
    { icon: Wallet, label: 'Add Money', color: 'text-amber-600', bg: 'bg-amber-50', link: '/my-profile/wallet' },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-white via-[#F9FAFB] to-[#F3F4F6] pt-2"
    >
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="lg:hidden flex justify-between items-center px-4 mb-4">
          <h1 className="text-xl font-bold text-[#111111]">Dashboard</h1>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-sm font-medium shadow-sm text-gray-700"
          >
            Menu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-8rem)] lg:h-[90vh] lg:overflow-y-scroll hide-scrollbar">
          
          <UserSidebar 
            mobileMenuOpen={mobileMenuOpen} 
            setMobileMenuOpen={setMobileMenuOpen} 
          />

          <main className="lg:col-span-9 space-y-6 lg:h-[90vh] lg:overflow-y-scroll hide-scrollbar pb-16 lg:pb-0 px-4 lg:px-0">
            <div className="space-y-6 lg:space-y-8 pb-8">
              {/* Hero Welcome Section */}
              <motion.div 
                variants={itemVariants} 
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl shadow-blue-900/20 border border-blue-800"
              >
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 -mb-16 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                
                <div className="relative z-10 p-6 md:p-8 lg:p-9 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)]/10 text-xs font-semibold text-gray-200 border border-white/10 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Hamrahi Smart Mobility</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                      Welcome back, {user?.firstName || 'User'}! 👋
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed">
                      Find rides, share travel costs, or deliver parcels effortlessly across your city.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto shrink-0">
                    <KycGuard>
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/rides')}
                        className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 text-sm transition-all"
                      >
                        <Search size={16} />
                        Find a Ride
                      </motion.button>
                    </KycGuard>
                    <KycGuard>
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/offer-ride')}
                        className="px-5 py-3 bg-[var(--bg-surface)]/10 hover:bg-[var(--bg-surface)]/15 text-white border border-white/15 font-bold rounded-xl backdrop-blur-sm transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <Car size={16} />
                        Offer a Ride
                      </motion.button>
                    </KycGuard>
                  </div>
                </div>
              </motion.div>

              {/* Weather Widget */}
              <motion.div variants={itemVariants}>
                  <WeatherWidget />
              </motion.div>

              {/* Stats Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ y: -3, scale: 1.01 }}
                      className="bg-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border-subtle)] shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group"
                    >
                      <div className={`absolute -right-6 -top-6 w-20 h-20 bg-gradient-to-br ${stat.color} rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300`} />
                      
                      <div className="flex items-start justify-between relative z-10 gap-3">
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 truncate">{stat.label}</p>
                          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight truncate max-w-full" title={typeof stat.value === 'string' ? stat.value : undefined}>
                            {stat.value}
                          </h3>
                          <p className="text-[11px] text-gray-400 mt-1.5 font-medium truncate">{stat.subtitle}</p>
                        </div>
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                          <Icon size={20} strokeWidth={2.5} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 items-start">
                <motion.div variants={itemVariants} className="lg:col-span-1 self-start">
                  <RiderAvailability />
                </motion.div>
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <ParcelRequests />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Verification Status */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <div className="bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--border-subtle)] shadow-xs relative overflow-hidden h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-[var(--border-subtle)]">
                        <div className={`p-2.5 rounded-xl ${isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {isVerified ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900">Profile Verification</h3>
                          <p className="text-xs text-gray-500">
                            {isVerified ? 'Your profile is fully verified and trusted.' : 'Complete your verification to unlock more privileges.'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-[var(--border-subtle)]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.phoneVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                              <CheckCircle size={16} />
                            </div>
                            <span className="font-semibold text-xs text-gray-700">Phone Verification</span>
                          </div>
                          {user?.phoneVerified ? (
                            <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">Verified</span>
                          ) : (
                            <button onClick={() => navigate('/my-profile/verify-phone')} className="text-blue-600 hover:underline font-bold text-xs">Verify Now</button>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-[var(--border-subtle)]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.emailVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                              <CheckCircle size={16} />
                            </div>
                            <span className="font-semibold text-xs text-gray-700">Email Verification</span>
                          </div>
                          {user?.emailVerified ? (
                            <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">Verified</span>
                          ) : (
                            <button onClick={() => navigate('/my-profile/verify-email')} className="text-blue-600 hover:underline font-bold text-xs">Verify Now</button>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 border border-[var(--border-subtle)]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.dlVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                              <CheckCircle size={16} />
                            </div>
                            <span className="font-semibold text-xs text-gray-700">Driving License</span>
                          </div>
                          {user?.dlVerified ? (
                            <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 border border-emerald-200/50 px-2.5 py-0.5 rounded-full">Verified</span>
                          ) : (
                            <button onClick={() => navigate('/my-profile/verify-driving-license')} className="text-blue-600 hover:underline font-bold text-xs">Verify Now</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions Grid */}
                <motion.div variants={itemVariants}>
                  <div className="bg-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--border-subtle)] shadow-xs h-full flex flex-col justify-between">
                    <h3 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                      <Zap className="text-amber-500 w-4 h-4" /> Quick Actions
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        const ButtonNode = (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(action.link)}
                            className={`${action.bg} rounded-xl p-3.5 flex flex-col items-center justify-center gap-2.5 border border-transparent hover:border-[var(--border-subtle)] transition-all cursor-pointer w-full`}
                          >
                            <div className={`w-10 h-10 rounded-xl bg-[var(--bg-surface)] shadow-xs flex items-center justify-center ${action.color}`}>
                              <Icon size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 text-center">{action.label}</span>
                          </motion.button>
                        );

                        if (action.link === '/rides' || action.link === '/offer-ride') {
                           return <KycGuard key={index}>{ButtonNode}</KycGuard>;
                        }
                        
                        return <React.Fragment key={index}>{ButtonNode}</React.Fragment>;
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Need Help Section */}
              <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 rounded-2xl p-6 md:p-8 relative overflow-hidden text-white shadow-md border border-slate-800">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)]/10 backdrop-blur-md flex items-center justify-center shrink-0 mx-auto md:mx-0 border border-white/10 text-red-400">
                        <HelpCircle size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg md:text-xl font-bold mb-1">Need help with your account?</h4>
                        <p className="text-slate-400 text-xs md:text-sm font-medium">Our support team is here to assist you 24/7 with any inquiries.</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/my-profile/support')}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/25 w-full sm:w-auto"
                      >
                        Contact Support
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-6 py-2.5 bg-[var(--bg-surface)]/10 hover:bg-[var(--bg-surface)]/15 text-white font-bold text-xs rounded-xl transition-all backdrop-blur-sm border border-white/15 w-full sm:w-auto"
                      >
                        View FAQs
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default UserDashboard;
