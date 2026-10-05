// Admin.jsx — Modernized SaaS Admin Layout
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Car, 
  Settings,
  BookOpen, 
  Bell, 
  Search,
  Menu,
  X,
  LogOut,
  TrendingUp,
  Shield,
  MapPin,
  Calendar,
  MessageSquare,
  Wallet,
  Radio,
  TicketSlash,
  IndianRupee,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Activity,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Axios from '../../services/axios';
import { api } from '../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { clearAdminDetails } from '../../store/adminReducer';
import logo from '../../assets/logo.jpg';

const Admin = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.admin);
  let localAdmin = null;
  try {
    localAdmin = JSON.parse(localStorage.getItem("adminUser") || "{}");
  } catch (e) {}
  const currentAdmin = (admin && Object.keys(admin).length > 0) ? admin : (localAdmin || {});
  const adminName = [currentAdmin?.firstName, currentAdmin?.lastName].filter(Boolean).join(" ") || currentAdmin?.name || "Admin User";
  const adminEmail = currentAdmin?.email || "super.admin@hamrahi.com";
  const adminInitial = (currentAdmin?.firstName?.[0] || currentAdmin?.name?.[0] || "A").toUpperCase();

  const [allRide, setAllRide] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allMessage, setallMessage] = useState([]);

  const handleLogOut = async () => {
    try {
      const res = await Axios.get(api.admin.logout);
      dispatch(clearAdminDetails());
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminUser");
      sessionStorage.clear();
      toast.success(res?.data?.message || "Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      dispatch(clearAdminDetails());
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      localStorage.removeItem("adminUser");
      sessionStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  const navSections = [
    {
      title: "OVERVIEW",
      items: [
        { path: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { path: '/admin/analytics', icon: <BarChart3 size={18} />, label: 'Platform Health' },
      ]
    },
    {
      title: "OPERATIONS",
      items: [
        { path: '/admin/rides', icon: <Car size={18} />, label: 'Rides', badge: allRide?.length ? `${allRide.length}` : undefined },
        { path: '/admin/parcels', icon: <Package size={18} />, label: 'Parcels' },
        { path: '/admin/users', icon: <Users size={18} />, label: 'Users', badge: allUsers?.length ? `${allUsers.length}` : undefined },
        { path: '/admin/cars', icon: <Car size={18} />, label: 'Vehicles' },
        { path: '/admin/show-vehicle-type', icon: <Car size={18} />, label: 'Vehicle Slabs' },
        { path: '/admin/parcel-slabs', icon: <Package size={18} />, label: 'Parcel Slabs' },
      ]
    },
    {
      title: "COMMUNICATION",
      items: [
        { path: '/admin/messages', icon: <MessageSquare size={18} />, label: 'Messages', badge: allMessage?.length ? `${allMessage.length}` : undefined },
        { path: '/admin/broadcast', icon: <Radio size={18} />, label: 'Broadcast' },
        { path: '/admin/show-blog', icon: <BookOpen size={18} />, label: 'Blog' },
      ]
    },
    {
      title: "SYSTEM & FINANCE",
      items: [
        { path: '/admin/banner', icon: <TicketSlash size={18} />, label: 'Banners' },
        { path: '/admin/commisions', icon: <Settings size={18} />, label: 'Global Settings' },
      ]
    }
  ];

  const handleGetAllRides = async () => {
    try {
      const res = await Axios.get(api.admin.getAllRides);
      setAllRide(res.data.data || []);
    } catch (error) {}
  };

  const handleGetAllUsers = async () => {
    try {
      const res = await Axios.get(api.admin.getAllUsers);
      setAllUsers(res.data.users || []);
    } catch (error) {}
  };

  const handleGetAllMessage = async () => {
    try {
      const res = await Axios.post(api.admin.getMessages);
      setallMessage(res.data.message || []);
    } catch (error) {}
  };

  useEffect(() => {
    handleGetAllRides();
    handleGetAllUsers();
    handleGetAllMessage();
  }, []);

  // Helper to find current page label
  const getCurrentPageLabel = () => {
    for (const section of navSections) {
      const found = section.items.find(item => item.path === location.pathname);
      if (found) return found.label;
    }
    if (location.pathname.startsWith('/admin/users-details')) return 'User Details';
    return 'Dashboard';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#64748B] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#98E9E9] to-[#1A1A1A] flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-300">
              <img src={logo} alt="HumRahii" className="w-full h-full object-cover rounded-xl" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#1A1A1A] to-[#666666] bg-clip-text text-transparent">
              HumRahii
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EF4444] to-[#DC2626] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {adminInitial}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-68 sm:w-72 bg-[#0F172A] border-r border-[#1E293B] flex flex-col shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#1E293B] flex items-center justify-between">
          <Link to="/admin" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#98E9E9] to-[#1A1A1A] flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <img src={logo} alt="HumRahii" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold bg-gradient-to-r from-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent">
                  HumRahii
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] font-medium">Administration Console</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-[#94A3B8] hover:text-[#FFFFFF] rounded-lg hover:bg-[#1E293B]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto hide-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                {section.title}
              </p>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium ${
                      isActive
                        ? 'bg-[#1E293B] text-[#EF4444] font-semibold'
                        : 'text-[#E2E8F0] hover:text-[#FFFFFF] hover:bg-[#1E293B]'
                    }`}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#EF4444] rounded-r-full shadow-red-glow" />
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <div className={`transition-colors ${isActive ? 'text-[#EF4444]' : 'text-[#94A3B8] group-hover:text-[#FFFFFF]'}`}>
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full transition-colors ${
                        isActive
                          ? 'bg-[#EF4444] text-[#FFFFFF] shadow-xs'
                          : 'bg-[#1E293B] text-[#94A3B8] group-hover:text-[#FFFFFF]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Super Administration Card */}
        <div className="p-3.5 border-t border-[#1E293B] bg-[#0F172A]">
          <div className="bg-[#1E293B] p-3 rounded-2xl border border-[#334155] shadow-sm transition-colors duration-200 hover:border-[#475569]">
            <div className="flex items-center space-x-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#EF4444] to-[#DC2626] flex items-center justify-center text-[#FFFFFF] font-bold text-sm shadow-xs ring-2 ring-[#0F172A]">
                  {adminInitial}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-[#0F172A] rounded-full" title="Online"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-[#FFFFFF] truncate" title={adminName}>
                  {adminName}
                </p>
                <p className="text-[11px] text-[#94A3B8] truncate" title={adminEmail}>
                  {adminEmail}
                </p>
                <div className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#450A0A] text-[#FCA5A5]">
                  <Shield size={9} />
                  <span>Super Admin</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogOut}
              className="mt-3 w-full flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-[#FFFFFF] bg-transparent hover:bg-[#334155] border border-[#334155] transition-all cursor-pointer"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-[#FFFFFF] backdrop-blur-md border-b border-[#E2E8F0] sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Admin Portal
            </span>
            <span className="text-[#E2E8F0]">/</span>
            <span className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
              {getCurrentPageLabel()}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>System Live</span>
            </div>

            {/* Date Display */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs font-medium text-[#64748B] bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
              <Calendar size={13} className="#94A3B8" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Notifications Bell */}
            <button
              className="relative p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#64748B] transition-colors border border-[#E2E8F0] cursor-pointer"
              title="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content Scroll View */}
        <main className="flex-1 overflow-y-auto hide-scrollbar pt-14 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Admin;