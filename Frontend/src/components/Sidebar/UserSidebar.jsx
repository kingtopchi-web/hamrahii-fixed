import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import avatar from "../../assets/default-avatar.jpg";
import {
  User, Home, Route, Clock, Calendar, CreditCard,
  ChevronRight, WalletIcon, IndianRupee, Gift,
  MapMinus, PlusCircle, Car, HelpCircle, XIcon, Truck
} from "lucide-react";
import { useSelector } from "react-redux";
import { getDefaultProfilePhoto } from "../../utils/profileImageHelper";

const UserSidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const user = useSelector((state) => state?.user || {});
  const location = useLocation();
  const profileImage = getDefaultProfilePhoto(user);

  const userData = {
    name: user?.firstName || "Guest User",
    email: user?.email || "No Email",
    level: user?.level || "Silver",
  };

  const formatBalance = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "0.00";
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const categories = [
    {
      title: "DASHBOARD",
      items: [
        { path: "/user/dashboard", label: "My Dashboard", icon: Home, exact: true },
      ]
    },
    {
      title: "ACCOUNT",
      items: [
        { path: "/my-profile", label: "Personal Details", icon: User, exact: true },
        { path: "/my-profile/cars", label: "Vehicle", icon: Car },
      ]
    },
    {
      title: "RIDES",
      items: [
        { path: "/my-profile/offered-rides", label: "Offered Rides", icon: Route },
      ]
    },
    {
      title: "BOOKINGS",
      items: [
        { path: "/my-profile/bookings", label: "New Bookings", icon: Clock },
        { path: "/my-profile/booking-history", label: "Booking History", icon: Calendar },
      ]
    },
    {
      title: "PARCEL",
      items: [
        { path: "/user/parcel-delivery", label: "Parcel Delivery", icon: Truck },
        { path: "/user/my-parcels", label: "My Parcels", icon: MapMinus },
      ]
    },
    {
      title: "FINANCE & OTHER",
      items: [
        { path: "/my-profile/wallet", label: "Wallet", icon: CreditCard },
        { path: "/my-profile/support", label: "Help & Support", icon: HelpCircle },
      ]
    }
  ];

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const DesktopSidebar = () => (
    <motion.aside variants={itemVariants} className="lg:col-span-3 space-y-6 hidden lg:block hide-scrollbar h-[90vh] overflow-y-scroll">
      {/* User Profile Card */}
      <motion.div variants={fadeIn} className="bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl p-6 border border-[#E5E5E5]/50 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E10600] to-[#F59E0B] rounded-full blur-md opacity-30" />
            <img
              src={profileImage || avatar}
              alt={userData.name}
              className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
              onError={(e) => { e.target.src = avatar; }}
            />
          </div>
          <h3 className="text-xl font-bold text-[#111111] mb-1">{userData.name}</h3>
          <p className="text-sm text-[#555555] mb-4">{userData.email}</p>

          {/* Wallet Cards */}
          <motion.div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-sm w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E10600]/10 rounded-lg flex items-center justify-center">
                    <WalletIcon size={16} className="text-[#E10600]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#111111]">Wallet Balance</h3>
                    <p className="text-xs text-[#555555]">Available funds</p>
                  </div>
                </div>
                <div className="text-xs text-[#B8B8B8]">INR</div>
              </div>
              <div className="grid grid-cols-1 gap-3 w-full">
                <div className="border border-emerald-100 rounded-lg p-3 bg-emerald-50 overflow-hidden">
                  <div className="flex items-center w-full gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                      <IndianRupee size={14} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-xs text-emerald-700 font-medium truncate">Real Money</p>
                      <p className="text-sm sm:text-base font-bold text-[#111111] truncate" title={`₹${formatBalance(user?.wallet?.balance)}`}>
                        ₹{formatBalance(user?.wallet?.balance)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border border-purple-100 rounded-lg p-3 bg-purple-50 overflow-hidden">
                  <div className="flex items-center w-full gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                      <Gift size={14} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-xs text-purple-700 font-medium truncate">Virtual Money</p>
                      <p className="text-sm sm:text-base font-bold text-[#111111] truncate" title={`₹${formatBalance(user?.virtualMoney?.balance)}`}>
                        ₹{formatBalance(user?.virtualMoney?.balance)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.nav variants={fadeIn} className="bg-white rounded-2xl p-4 border border-[#E5E5E5]/50 shadow-sm">
        <div className="space-y-4">
          {categories.map((category, idx) => (
            <div key={idx}>
              <h4 className="text-xs font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">{category.title}</h4>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-[#E10600]/10 to-[#F59E0B]/10 text-[#E10600] border-l-4 border-[#E10600]"
                          : "text-[#555555] hover:bg-[#F7F7F7] hover:text-[#E10600]"
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-[#E10600] text-white"
                          : "bg-[#F7F7F7] text-[#555555] group-hover:bg-[#E10600] group-hover:text-white"
                      }`}>
                        <Icon size={18} />
                      </div>
                      <span className="font-medium flex-1 text-sm">{item.label}</span>
                      {isActive && (
                        <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-[#E10600]">
                          <ChevronRight size={16} />
                        </motion.div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </motion.nav>
    </motion.aside>
  );

  const MobileSidebar = () => (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-2xl lg:hidden overflow-y-auto"
          >
            <div className="px-6 pb-6 pt-3 border-b border-[#E5E5E5]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#111111]">Menu</h2>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-[#F7F7F7] z-100">
                  <XIcon size={20} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={profileImage || avatar} alt={userData.name} className="w-12 h-12 rounded-full border-3 border-white shadow-lg object-cover" onError={(e) => { e.target.src = avatar; }} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#111111]">{userData.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#555555]">{userData.level}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-6">
              {categories.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-[10px] font-bold text-gray-400 mb-2 px-4 uppercase tracking-wider">{category.title}</h4>
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
                    return (
                      <NavLink
                        key={item.path} to={item.path} end={item.exact}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${
                          isActive ? "bg-[#E10600] text-white shadow-lg" : "text-[#555555] hover:bg-[#F7F7F7]"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                        {isActive && <ChevronRight size={16} className="ml-auto" />}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default UserSidebar;
