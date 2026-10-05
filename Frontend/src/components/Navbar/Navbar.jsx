
import React, { useState, useEffect } from "react";
import { 
  Menu, X, Car, User, Search, Shield, HelpCircle, 
  LogOut, Wallet, UserCircle, Car as CarIcon,
  Info, Phone, ChevronDown , MapMinus , Home, Bell, CheckCheck, Clock, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../../services/endpoints";
import Axios from "../../services/axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetails, clearUserDetails } from "../../store/userReducer";
import { requestFCMToken, onForegroundMessage } from "../../services/firebase";
import { toast } from "react-toastify";
import logo from "../../assets/logo.jpg"
import { getDefaultProfilePhoto } from "../../utils/profileImageHelper";
import { clearUserSessionDrafts } from "../../utils/sessionCleaner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!user?.phone;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchNotifications = async () => {
    if (!user?.phone) return;
    try {
      setLoadingNotifications(true);
      const res = await Axios.get(api.user.notifications);
      if (res?.data?.success) {
        const list = res?.data?.data || [];
        setNotifications(list);
        setUnreadCount(res?.data?.unreadCount !== undefined ? res?.data?.unreadCount : list.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      // console.log("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await Axios.post(api.user.markNotificationsRead, {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      // console.log("Failed to mark notifications read:", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await Axios.post(api.user.markNotificationsRead, { notificationId: notif._id });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      // ignore
    }
    setShowNotificationDropdown(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  useEffect(() => {
    let unsubscribe = null;
    const setupFCM = async () => {
      try {
        const token = await requestFCMToken();
        if (token) {
          handleSaveFcm(token);
        }
        unsubscribe = await onForegroundMessage((payload) => {
          const title = payload.notification?.title || payload.data?.title || "Hamrahii";
          const body = payload.notification?.body || payload.data?.body || "You have a new notification";
          toast.info(
            <div>
              <p className="font-bold text-sm">{title}</p>
              <p className="text-xs mt-1 text-gray-700">{body}</p>
            </div>,
            {
              autoClose: 6000,
              icon: false,
              position: "top-right",
            }
          );
          fetchNotifications();
        });
      } catch (err) {
        // console.warn("FCM setup error:", err);
      }
    };

    if (user?.phone) {
      setupFCM();
      fetchNotifications();
    }

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user]);

  const handleSaveFcm = async (token) => {
    try {
      await Axios.post(api.user.saveFcm, { token });
    } catch (error) {
      // console.log(error, "Error saving FCM token");
    }
  };

  useEffect(() => {
    handleGetUserDetails();
  }, []);

  const navItems = [
    { name: "Find Rides", path: "/rides", icon: Search },
    { name: "Offer Ride", path: "/offer-ride", icon: CarIcon },
    { name: "Parcel", path: "/user/send-parcel", icon: Package },
    { name: "How it Works", path: "/how-it-works", icon: HelpCircle },
    { name: "Safety", path: "/safety", icon: Shield },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  const mobileNavItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Find", path: "/rides", icon: Search },
    { name: "Offer", path: "/offer-ride", icon: MapMinus },
    { name: "Cars", path: "/my-profile/cars", icon: CarIcon },
    { name: "Menu", path: "#", icon: Menu },
  ];

  const handleSignIn = (e) => {
    if (e) e.stopPropagation();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleGetUserDetails = async () => {
    try {
      const res = await Axios.post(api.user.getFullDetails);
      if (res?.data?.success) {
        dispatch(setUserDetails(res?.data?.user));
      }
    } catch (error) {
      // console.log("Error fetching user details:", error);
      dispatch(clearUserDetails());
    }
  };

  const handleSignOut = async (e) => {
    if (e) e.stopPropagation();
    try {
      clearUserSessionDrafts();
      const res = await Axios.get(api.user.logOut);
      if (res?.data?.success) {
        dispatch(clearUserDetails());
        setShowUserDropdown(false);
        setIsMenuOpen(false);
      }
    } catch (error) {
      // console.log(error);
      clearUserSessionDrafts();
      dispatch(clearUserDetails());
      setShowUserDropdown(false);
      setIsMenuOpen(false);
    }
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserDropdown && !e.target.closest(".user-dropdown-container")) {
        setShowUserDropdown(false);
      }
      if (showNotificationDropdown && !e.target.closest(".notification-dropdown-container")) {
        setShowNotificationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown, showNotificationDropdown]);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserDropdown(false);
    setShowNotificationDropdown(false);
  }, [location.pathname]);

  const getUserFullName = () => {
    if (!user) return "User";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.email || "User";
  };

  return (
    <>
      {/* Desktop & Tablet Navbar */}
      <nav className={`hidden md:block fixed w-full z-50 glass-nav transition-all duration-300 ${
        isScrolled ? "shadow-card-subtle border-b border-[#E5E5E5]/80 py-1.5" : "border-b border-gray-100/60 py-2.5"
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              className="flex items-center cursor-pointer"
            >
              <img
                src={logo}
                alt="Humrahii"
                className="h-12 md:h-14 object-contain rounded-xl shadow-sm hover:opacity-95 transition-opacity"
              />
            </motion.div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1 lg:space-x-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? "text-[#E10600] bg-red-50/70" 
                        : "text-[#343030] hover:text-[#E10600] hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={17} className={`transition-transform duration-200 ${isActive ? "text-[#E10600]" : "text-gray-500 group-hover:text-[#E10600]"}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-xl border border-red-200/80 -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  {/* Notification Bell */}
                  <div className="relative notification-dropdown-container">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowNotificationDropdown(!showNotificationDropdown);
                        setShowUserDropdown(false);
                      }}
                      className="relative p-2 rounded-full text-[#343030] hover:text-[#E10600] hover:bg-[#F7F7F7] transition-colors focus:outline-none"
                      title="Notifications"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E10600] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </motion.button>

                    {/* Notification Dropdown */}
                    <AnimatePresence>
                      {showNotificationDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                        >
                          <div className="p-3 border-b border-[#E5E5E5] bg-[#F7F7F7] flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-[#111111]">Notifications</span>
                              {unreadCount > 0 && (
                                <span className="bg-[#fee2e2] text-[#E10600] text-xs font-medium px-2 py-0.5 rounded-full">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                            {unreadCount > 0 && (
                              <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-[#E10600] hover:text-[#b00500] font-medium flex items-center space-x-1 transition-colors"
                              >
                                <CheckCheck size={14} />
                                <span>Mark all read</span>
                              </button>
                            )}
                          </div>

                          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                            {loadingNotifications ? (
                              <div className="py-8 text-center text-xs text-gray-400">Loading notifications...</div>
                            ) : notifications.length === 0 ? (
                              <div className="py-8 px-4 text-center">
                                <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-xs text-gray-500 font-medium">No notifications yet</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">You will receive broadcast alerts and updates here</p>
                              </div>
                            ) : (
                              notifications.map((n) => (
                                <div
                                  key={n._id}
                                  onClick={() => handleNotificationClick(n)}
                                  className={`p-3 text-left transition-colors cursor-pointer hover:bg-[#F9FAFB] flex space-x-3 items-start ${
                                    !n.isRead ? "bg-red-50/40" : "bg-white"
                                  }`}
                                >
                                  {n.icon || n.image ? (
                                    <img
                                      src={n.icon || n.image}
                                      alt=""
                                      className="w-9 h-9 rounded-full object-cover border border-gray-200 mt-0.5 shrink-0"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-red-100 text-[#E10600] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                      🔔
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className={`text-xs font-semibold truncate ${!n.isRead ? "text-[#111111]" : "text-gray-600"}`}>
                                        {n.title || "Hamrahii"}
                                      </h4>
                                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                        {formatTimeAgo(n.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                      {n.body || n.message}
                                    </p>
                                  </div>
                                  {!n.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-[#E10600] shrink-0 mt-1.5" />
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative user-dropdown-container">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowUserDropdown(!showUserDropdown);
                        setShowNotificationDropdown(false);
                      }}
                      className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl hover:bg-[#F7F7F7] border border-gray-200/60 transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 ring-2 ring-red-200/60 flex items-center justify-center overflow-hidden">
                        {(user?.profilePhotos?.length || user?.profilePhoto) ? (
                          <img
                            src={getDefaultProfilePhoto(user)}
                            alt={getUserFullName()}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/default-avatar.jpg";
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#E10600]">
                            {getUserFullName().charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[#111111]">
                        {getUserFullName().split(" ")[0]}
                      </span>
                      <ChevronDown 
                        size={15} 
                        className={`text-[#555555] transition-transform duration-200 ${
                          showUserDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </motion.button>

                    {/* User Dropdown */}
                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card-hover border border-gray-100 overflow-hidden z-50 p-1.5"
                        >
                          <div className="p-3 bg-[#F7F7F7] rounded-xl mb-1">
                            <div className="text-sm font-bold text-[#111111]">
                              {getUserFullName()}
                            </div>
                            <div className="text-xs text-[#555555] truncate mt-0.5">
                              {user?.phone}
                            </div>
                          </div>
                          
                            <div className="space-y-0.5">
                              <Link
                                to="/user/dashboard"
                                onClick={() => setShowUserDropdown(false)}
                                className="group flex items-center space-x-2.5 px-3 py-2 text-sm text-[#111111] hover:bg-red-50/60 hover:text-[#E10600] rounded-xl transition-colors font-medium"
                              >
                                <Home size={17} className="text-[#B8B8B8] group-hover:text-[#E10600] transition-colors" />
                                <span>My Dashboard</span>
                              </Link>
                              <Link
                                to="/my-profile"
                                onClick={() => setShowUserDropdown(false)}
                                className="group flex items-center space-x-2.5 px-3 py-2 text-sm text-[#111111] hover:bg-red-50/60 hover:text-[#E10600] rounded-xl transition-colors font-medium"
                              >
                                <UserCircle size={17} className="text-[#B8B8B8] group-hover:text-[#E10600] transition-colors" />
                                <span>My Profile</span>
                              </Link>
                              <Link
                                to="/user/my-parcels"
                                onClick={() => setShowUserDropdown(false)}
                                className="group flex items-center space-x-2.5 px-3 py-2 text-sm text-[#111111] hover:bg-red-50/60 hover:text-[#E10600] rounded-xl transition-colors font-medium"
                              >
                                <MapMinus size={17} className="text-[#B8B8B8] group-hover:text-[#E10600] transition-colors" />
                                <span>My Parcels</span>
                              </Link>
                              <Link
                                to="/my-profile/wallet"
                                onClick={() => setShowUserDropdown(false)}
                                className="group flex items-center space-x-2.5 px-3 py-2 text-sm text-[#111111] hover:bg-red-50/60 hover:text-[#E10600] rounded-xl transition-colors font-medium"
                              >
                                <Wallet size={17} className="text-[#B8B8B8] group-hover:text-[#E10600] transition-colors" />
                                <span>Wallet</span>
                              </Link>
                            
                            <div className="pt-1 mt-1 border-t border-gray-100">
                              <button
                                onClick={handleSignOut}
                                className="group flex items-center space-x-2.5 w-full px-3 py-2 text-sm text-[#E10600] hover:bg-red-50 rounded-xl transition-colors font-semibold"
                              >
                                <LogOut size={17} />
                                <span>Sign out</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 text-sm font-semibold text-[#555555] hover:text-[#111111] hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Login
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/register")}
                    className="px-5 py-2 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-red-glow transition-all flex items-center gap-1"
                  >
                    Get Started
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[90%] mx-auto px-4 h-14 flex items-center justify-between">
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="flex items-center cursor-pointer"
          >
            <img
              src={logo}
              alt="Humrahii"
              className="h-10 sm:h-11 object-contain rounded-xl shadow-sm hover:opacity-95 transition-opacity"
            />
          </motion.div>
          
          {!isLoggedIn ? (
            <button
              onClick={() => navigate("/register")}
              className="px-3 py-1.5 bg-[#E10600] text-white rounded-lg font-medium text-xs"
            >
              Get Started
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Notification Bell Mobile */}
              <div className="relative notification-dropdown-container">
                <button
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="relative p-2 rounded-full text-[#343030] hover:bg-[#F7F7F7] focus:outline-none"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E10600] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Notification Dropdown */}
                <AnimatePresence>
                  {showNotificationDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="fixed left-4 right-4 top-16 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[75vh] flex flex-col"
                    >
                      <div className="p-3 border-b border-[#E5E5E5] bg-[#F7F7F7] flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-[#111111]">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="bg-[#fee2e2] text-[#E10600] text-xs font-medium px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-[#E10600] hover:text-[#b00500] font-medium flex items-center space-x-1"
                          >
                            <CheckCheck size={14} />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
                        {loadingNotifications ? (
                          <div className="py-8 text-center text-xs text-gray-400">Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                          <div className="py-8 px-4 text-center">
                            <Bell size={28} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-xs text-gray-500 font-medium">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3 text-left transition-colors cursor-pointer hover:bg-[#F9FAFB] flex space-x-3 items-start ${
                                !n.isRead ? "bg-red-50/40" : "bg-white"
                              }`}
                            >
                              {n.icon || n.image ? (
                                <img
                                  src={n.icon || n.image}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover border border-gray-200 mt-0.5 shrink-0"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-red-100 text-[#E10600] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                                  🔔
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-xs font-semibold truncate ${!n.isRead ? "text-[#111111]" : "text-gray-600"}`}>
                                    {n.title || "Hamrahii"}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                                    {formatTimeAgo(n.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                  {n.body || n.message}
                                </p>
                              </div>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#E10600] shrink-0 mt-1.5" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile Avatar link in Mobile */}
              <Link to="/my-profile" className="w-7 h-7 rounded-full bg-[#f47979] flex items-center justify-center overflow-hidden">
                {(user?.profilePhotos?.length || user?.profilePhoto) ? (
                  <img
                    src={getDefaultProfilePhoto(user)}
                    alt={getUserFullName()}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "/default-avatar.jpg"; }}
                  />
                ) : (
                  <span className="text-xs font-medium text-[#E10600]">
                    {getUserFullName().charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return item.name === "Menu" ? (
              <button
                key={item.name}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative flex flex-col items-center justify-center py-1 flex-1 group"
              >
                <div className={`transition-all duration-200 ${
                  isMenuOpen 
                    ? "text-[#E10600] scale-110" 
                    : "text-gray-400 group-hover:text-[#E10600]"
                }`}>
                  {isMenuOpen ? <X size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-[11px] mt-0.5 font-medium transition-colors ${
                  isMenuOpen ? "text-[#E10600] font-semibold" : "text-gray-500"
                }`}>
                  Menu
                </span>
                {isMenuOpen && (
                  <span className="w-1 h-1 rounded-full bg-[#E10600] mt-0.5" />
                )}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                className="relative flex flex-col items-center justify-center py-1 flex-1 group"
              >
                <div className={`transition-all duration-200 ${
                  isActive 
                    ? "text-[#E10600] scale-110" 
                    : "text-gray-400 group-hover:text-[#E10600]"
                }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[11px] mt-0.5 font-medium transition-colors ${
                  isActive ? "text-[#E10600] font-semibold" : "text-gray-500"
                }`}>
                  {item.name}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#E10600] mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <div
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/20 z-40"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="md:hidden fixed inset-y-0 right-0 w-64 bg-white z-50 shadow-lg"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#111111]">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-[#F7F7F7]"
                  >
                    <X size={18} className="text-[#111111]" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1 mb-6">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#F7F7F7] transition-colors"
                      >
                        <div className={`transition-all duration-200 group-hover:scale-110 ${
                          isActive 
                            ? "text-[#E10600]" 
                            : "text-[#B8B8B8] group-hover:text-[#E10600]"
                        }`}>
                          <Icon size={18} />
                        </div>
                        <span className={`font-medium transition-colors ${
                          isActive 
                            ? "text-[#111111]" 
                            : "text-[#555555] group-hover:text-[#111111]"
                        }`}>
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Auth Section */}
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#F7F7F7] rounded-lg">
                      <div className="text-sm font-medium text-[#111111]">
                        {getUserFullName()}
                      </div>
                      <div className="text-xs text-[#555555] truncate">
                        {user?.phone}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Link
                        to="/my-profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="group flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#F7F7F7] text-[#111111] transition-colors"
                      >
                        <UserCircle size={18} className="text-[#B8B8B8] group-hover:text-[#E10600] transition-colors" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg hover:bg-[#F7F7F7] text-[#E10600] transition-colors font-medium"
                      >
                        <LogOut size={18} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleSignIn}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 text-sm font-medium text-[#111111] border border-[#E5E5E5] rounded-lg hover:border-[#111111] transition-colors"
                    >
                      <User size={16} />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/register");
                      }}
                      className="flex items-center justify-center space-x-2 w-full py-2.5 text-sm font-medium text-white bg-[#E10600] rounded-lg hover:bg-[#D00500] transition-colors"
                    >
                      <Car size={16} />
                      <span>Get Started</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacers */}
       <div className="hidden md:block h-20"></div>
      <div className="md:hidden h-14 mb-1"></div> 
    </>
  );
};

export default Navbar;