import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import data from "../../assets/data.json";
import logo from "../../assets/logo.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Services: [
      { name: "Find Rides", href: "/rides" },
      { name: "Offer Ride", href: "/offer-ride" },
      { name: "Send Parcel", href: "/user/send-parcel" },
      { name: "How It Works", href: "/how-it-works" },
      { name: "Safety Features", href: "/safety" },
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press & Media", href: "/press" },
      { name: "Blog & Stories", href: "/blog" },
      { name: "Partners", href: "/partners" },
      { name: "Sustainability", href: "/sustainability" },
    ],
    Support: [
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Contact Us", href: "/contact" },
      { name: "Report Issue", href: "/help" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "User Security", href: "/safety" },
    ],
  };

  const socialLinks = [
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
  ];

  const paymentMethods = [
    { name: "Mastercard", src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
    { name: "Visa", src: "https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png" },
    { name: "PayPal", src: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
    { name: "GPay", src: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" },
    { name: "RuPay", src: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white z-50 overflow-hidden">
      {/* Top Wave Separator */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 blur-xl" />
        <div className="w-full overflow-hidden">
          <svg
            className="relative w-full h-14 text-gray-900"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Main Footer Content */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
        className="w-full max-w-[1580px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 pt-4 pb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16">
          {/* Brand & Contact Column (Left Side) */}
          <motion.div variants={itemVariants} className="lg:col-span-4 xl:col-span-4 space-y-5">
            <div>
              <Link to="/" onClick={scrollToTop} className="inline-block group">
                <img
                  src={logo}
                  className="h-14 md:h-16 object-contain rounded-xl hover:opacity-95 transition-opacity"
                  alt="Humrahii"
                />
              </Link>
            </div>

            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-sm">
              Connecting commuters across India with safe, affordable, and
              reliable ridesharing solutions. Join our community of trusted
              riders today.
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start space-x-3 text-gray-300 text-sm">
                <MapPin size={16} className="text-[#FF3B30] shrink-0 mt-0.5" />
                <span className="leading-snug">{data.address}, {data.city} {data.pinCode}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Phone size={16} className="text-[#FF3B30] shrink-0" />
                <span>+91 {data.mob1}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Mail size={16} className="text-[#FF3B30] shrink-0" />
                <span>{data.supportMail}</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-2.5">
              {socialLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  aria-label={item.label}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#E10600] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns (Right Side - 4 Columns) */}
          <div className="lg:col-span-8 xl:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {Object.entries(footerLinks).map(([category, links], index) => (
              <motion.div
                key={category}
                variants={itemVariants}
                transition={{ delay: index * 0.04 }}
              >
                <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-5 text-white flex items-center">
                  <span>{category}</span>
                  <ArrowUpRight size={14} className="ml-1.5 text-gray-500" />
                </h3>
                <ul className="space-y-2.5 sm:space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <motion.div whileHover={{ x: 3 }}>
                        <Link
                          to={link.href}
                          className="flex items-center space-x-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200 group"
                        >
                          <span className="group-hover:text-red-400 transition-colors">
                            {link.name}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Middle Assurance & Payment Bar */}
      <div className="border-t border-gray-800/80 bg-gray-950/40">
        <div className="w-full max-w-[1580px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <span>100% Verified Community & Encrypted Ridesharing Platform</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-xs sm:text-sm font-medium hidden md:inline-block">
                Secure Payments:
              </span>
              <div className="flex items-center gap-2">
                {paymentMethods.map((payment, idx) => (
                  <div
                    key={idx}
                    className="bg-white px-2 py-1 rounded-md border border-gray-200 flex items-center justify-center w-[48px] h-[28px] hover:shadow-md transition-shadow"
                    title={payment.name}
                  >
                    <img
                      src={payment.src}
                      alt={payment.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="w-full bg-black border-t border-gray-900 text-white py-4 mb-10 md:mb-0 text-sm">
        <div className="w-full max-w-[1580px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left */}
          <p className="text-center md:text-left text-gray-400 text-xs sm:text-sm">
            © {currentYear}{" "}
            <Link
              to="/"
              onClick={scrollToTop}
              className="text-red-400 hover:text-red-500 transition-colors duration-200 font-medium"
            >
              Humrahii.com
            </Link>{" "}
            all rights reserved
          </p>

          {/* Right */}
          <p className="text-center md:text-right text-gray-400 text-xs sm:text-sm">
            Designed & developed by{" "}
            <a
              href="https://nextgoodtechnologies.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-500 transition-colors duration-200 font-medium"
            >
              NextGood Technologies Pvt Ltd.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
