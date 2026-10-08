import React from "react";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Shield,
  Award,
  Users,
  Heart,
  ArrowUpRight,
  Download,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import data from '../../assets/data.json'
import logo from "../../assets/logo.jpg"

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: "Find Rides", href: "/rides" },
      { name: "Offer Ride", href: "/offer-ride" },
      { name: "How It Works", href: "/how-it-works" },
      { name: "Safety Features", href: "/safety" },
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Blog", href: "/blog" },
      { name: "Partners", href: "/partners" },
      { name: "Sustainability", href: "/sustainability" },
    ],
    Support: [
      { name: "Help Center", href: "/help" },
      { name: "Community", href: "/community" },
      { name: "Contact Us", href: "/contact" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
    // Cities: [
    //   { name: "Mumbai", href: "/city/mumbai" },
    //   { name: "Delhi", href: "/city/delhi" },
    //   { name: "Bangalore", href: "/city/bangalore" },
    //   { name: "Hyderabad", href: "/city/hyderabad" },
    //   { name: "Chennai", href: "/city/chennai" },
    //   { name: "Pune", href: "/city/pune" },
    //   { name: "View all 50+ cities", href: "/cities", highlight: true },
    // ],
  };

  const socialLinks = [
    { icon: <Facebook size={18} />, href: "#", label: "Facebook" },
    { icon: <Twitter size={18} />, href: "#", label: "Twitter" },
    { icon: <Instagram size={18} />, href: "#", label: "Instagram" },
    { icon: <Linkedin size={18} />, href: "#", label: "LinkedIn" },
  ];

  const appStores = [
    {
      platform: "App Store",
      icon: "🍎",
      href: "#",
      label: "Download on the App Store",
    },
    {
      platform: "Google Play",
      icon: "▶️",
      href: "#",
      label: "Get it on Google Play",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white z-50">



      {/* Top Wave Separator */}
      <div className="relative  ">
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 blur-xl" />
        <div className="w-full overflow-hidden">
          <svg
            className="relative w-full h-16 text-gray-900"
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

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="container mx-auto px-4 lg:px-8 pt-3 flex justify-center items-center pb-20 md:pb-0"
      >
        <div className="flex flex-wrap gap-10 justify-between w-full md:w-[80%]">
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center space-x-3 group">
                {/* <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Car size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    <span className="text-red-400">Hum</span>
                    <span className="text-white">Rahii</span>
                  </h2>
                  <p className="text-gray-400 text-sm font-medium">
                    Ride together, save together
                  </p>
                </div> */}


                  <img src={logo} className="h-15" alt="" />

              </Link>
            </div>

            <p className="text-gray-400 mb-6 max-w-md">
              Connecting commuters across India with safe, affordable, and
              reliable ridesharing solutions. Join our community of trusted
              riders today.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <MapPin size={16} className="text-[#FF3B30] shrink-0" />
                <span>{data.address}, {data.city} {data.pinCode}</span>
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

          </motion.div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              variants={itemVariants}
              transition={{ delay: index * 0.05 }}
              className="lg:col-span-2"
            >
              <h3 className="text-lg font-semibold mb-6 text-white flex items-center">
                {category}
                <ArrowUpRight size={14} className="ml-2 text-gray-500" />
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <motion.div whileHover={{ x: 3 }}>
                      <Link
                        to={link.href}
                        className={`flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 group ${link.highlight
                            ? "font-semibold text-amber-400 hover:text-amber-300"
                            : ""
                          }`}
                      >
                        {link.icon && (
                          <span className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {link.icon}
                          </span>
                        )}
                        <span>{link.name}</span>
                        {link.highlight && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-gradient-to-r from-red-500/20 to-amber-500/20 rounded-full border border-red-500/30">
                            New
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>


      </motion.div>

      {/* Social Icons & Payment Methods - Full Width Row */}
      <div className="container mx-auto px-4 lg:px-8 pb-8 pt-4 md:w-[80%]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {socialLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                aria-label={item.label}
                className="w-9 h-9 rounded-xl bg-[var(--bg-surface)]/5 hover:bg-[#E10600] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
              >
                {item.icon}
              </a>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm font-medium mr-2 hidden sm:inline-block">Secure Payments:</span>
            {[
              { name: "Mastercard", src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" },
              { name: "Visa", src: "https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png" },
              { name: "PayPal", src: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" },
              { name: "GPay", src: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" },
              { name: "RuPay", src: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" }
            ].map((payment, idx) => (
              <div key={idx} className="bg-white px-2 py-1 rounded-md border border-gray-200 flex items-center justify-center w-[50px] h-[30px] hover:shadow-md transition-shadow">
                <img 
                  src={payment.src} 
                  alt={payment.name} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>      <div className="w-full bg-black text-white py-4 px-4 md:px-[5%] mb-10 md:mb-0 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">

        {/* Left */}
        <p className="text-center md:text-left">
          © {new Date().getFullYear()}{" "}
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
        <p className="text-center md:text-right">
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
    </footer>
  );
};

export default Footer;
