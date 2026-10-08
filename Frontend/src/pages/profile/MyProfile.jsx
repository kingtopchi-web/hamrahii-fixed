import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import UserSidebar from "../../components/Sidebar/UserSidebar";

const MyProfile = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  // Keep a minimal horizontal tab bar for mobile if they are on a specific route,
  // or just rely on the hamburger menu (handled inside UserSidebar).
  // The old code had a horizontal scroll for mobile. I will keep it simple here.
  // Actually, I can just let UserSidebar handle the mobile overlay.

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-white via-[#F9FAFB] to-[#F3F4F6] pt-2"
    >
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        {/* Mobile menu toggle (optional, Navbar handles top level, but if they need it here) */}
        <div className="lg:hidden flex justify-between items-center px-4 mb-4">
          <h1 className="text-xl font-bold text-[#111111]">My Account</h1>
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

          {/* Main Content */}
          <main className="lg:col-span-9 space-y-6 lg:h-[90vh] lg:overflow-y-scroll hide-scrollbar pb-16 lg:pb-0 px-4 lg:px-0">
            <div
              key={location.pathname}
              className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]/50 shadow-sm overflow-hidden min-h-[500px]"
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default MyProfile;
