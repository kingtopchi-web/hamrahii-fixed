import React, { useEffect } from "react";
import {
  Users,
  Car,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  Target,
  Heart,
  TrendingUp,
  Leaf,
  User,
  MessageCircle,
  Clock,
  Award,
  Zap,
  IndianRupee,
  ArrowRight,
  Target as Bullseye,
  Globe,
  Handshake,
  Car as CarIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const About = () => {
  const navigate = useNavigate();
  const user = useSelector((stats) => stats.user);
  // Color constants
  const colors = {
    primary: "#E10600",
    background: "#FFFFFF",
    surface: "#F7F7F7",
    textPrimary: "#111111",
    textSecondary: "#555555",
    border: "#E5E5E5",
    accent: "#B8B8B8",
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    document.title = "Know About us ";
  }, []);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const fadeInUp = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const stats = [
    {
      icon: <Users className="w-8 h-8 mt-4" />,
      value: "500K+",
      label: "Happy Riders",
      delay: 0.1,
    },
    {
      icon: <Car className="w-8 h-8  mt-4" />,
      value: "50K+",
      label: "Daily Rides",
      delay: 0.2,
    },
    {
      icon: <IndianRupee className="w-8 h-8  mt-4" />,
      value: "₹10Cr+",
      label: "Saved by Users",
      delay: 0.3,
    },
    {
      icon: <Star className="w-8 h-8  mt-4" />,
      value: "4.8*",
      label: "Average Rating",
      delay: 0.4,
    },
    {
      icon: <Shield className="w-8 h-8  mt-4" />,
      value: "99%",
      label: "Safety Score",
      delay: 0.5,
    },
  ];

  const values = [
    {
      icon: <Shield className="w-12 h-12  mt-4" />,
      title: "Safety First",
      description:
        "Every user undergoes strict government ID verification and background checks for your peace of mind.",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
    },
    {
      icon: <Leaf className="w-12 h-12" />,
      title: "Sustainable Travel",
      description:
        "We're reducing India's carbon footprint, one shared ride at a time. Join us in making eco-friendly commutes.",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
    },
    {
      icon: <User className="w-12 h-12" />,
      title: "Community Building",
      description:
        "Connecting people across cities, building meaningful relationships on every journey.",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Smart Technology",
      description:
        "AI-powered matching and real-time tracking ensure the perfect ride every time.",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
    },
  ];

  const milestones = [
    {
      year: "2021",
      event: "Founded in Bangalore",
      description: "Started with 100 riders in Bengaluru",
    },
    {
      year: "2022",
      event: "1 Million Rides",
      description: "Reached milestone of 1 million shared rides",
    },
    {
      year: "2023",
      event: "Pan-India Expansion",
      description: "Launched in 50+ cities across India",
    },
    {
      year: "2024",
      event: "500K+ Community",
      description: "Grew to over half a million happy riders",
    },
  ];

  const team = [
    {
      name: "Priya Sharma",
      role: "Software Engineer",
      city: "Bangalore",
      rides: "45 rides",
      color: "bg-red-100",
    },
    {
      name: "Rohan Patel",
      role: "College Student",
      city: "Mumbai",
      rides: "32 rides",
      color: "bg-blue-100",
    },
    {
      name: "Anjali Mehta",
      role: "Marketing Manager",
      city: "Delhi",
      rides: "67 rides",
      color: "bg-green-100",
    },
  ];

  return (
    <div
      className="min-h-screen w-full md:w-[80%] flex justify-center items-center mx-auto"
      style={{ backgroundColor: colors.background }}
    >
      <div>

     
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden mt-6 md:mt-10 pb-4 md:pb-6 pt-8"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ backgroundColor: colors.primary }}
            >
              <Handshake className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{ color: colors.textPrimary }}
            >
              About <span style={{ color: colors.primary }}>HumRahii</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl mb-8"
              style={{ color: colors.textSecondary }}
            >
              India's #1 Carpooling Platform - Making Commutes Smarter, Greener,
              and More Social
            </motion.p>

            {/* Travel Smarter badge removed */}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="my-5 md:my-8 py-2 md:py-3"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                custom={stat.delay}
                whileHover={{ y: -5 }}
                className="rounded-xl p-4 text-center bg-[var(--bg-surface)] shadow-xs hover:shadow-md transition-all duration-300"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${colors.border}`,
                }}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 mx-auto"
                  style={{ backgroundColor: colors.primary }}
                >
                  <div className="text-white">{stat.icon}</div>
                </motion.div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-2xl font-bold mb-1"
                  style={{ color: colors.textPrimary }}
                >
                  {stat.value}
                </motion.div>
                <div
                  className="text-sm font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Our Story Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-5"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div
                className="inline-block px-4 py-1.5 rounded-full font-semibold mb-4 text-sm"
                style={{
                  backgroundColor: `${colors.primary}15`,
                  color: colors.primary,
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                Our Journey
              </div>
              <h2
                className="text-4xl font-bold mb-6"
                style={{ color: colors.textPrimary }}
              >
                The Story Behind{" "}
                <span style={{ color: colors.primary }}>HumRahii</span>
              </h2>
              <p
                className="text-lg leading-relaxed"
                style={{ color: colors.textSecondary }}
              >
                Founded in 2021 with a simple idea - to make commuting more
                affordable, sustainable, and social. What started as a small
                initiative in Bangalore has grown into India's largest
                carpooling community, connecting thousands of commuters daily
                across the nation.
              </p>
            </motion.div>

            {/* Timeline */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              <div
                className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 hidden md:block"
                style={{ backgroundColor: colors.border }}
              ></div>

              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative mb-12 md:flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className="md:w-1/2 md:px-8">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-6 rounded-xl"
                      style={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        className="text-2xl font-bold mb-2"
                        style={{ color: colors.primary }}
                      >
                        {milestone.year}
                      </div>
                      <div
                        className="text-xl font-semibold mb-2"
                        style={{ color: colors.textPrimary }}
                      >
                        {milestone.event}
                      </div>
                      <p style={{ color: colors.textSecondary }}>
                        {milestone.description}
                      </p>
                    </motion.div>
                  </div>

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white hidden md:block"
                    style={{ backgroundColor: colors.primary }}
                  ></div>

                  <div className="md:w-1/2"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-10"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-6"
              style={{ color: colors.textPrimary }}
            >
              Our Core <span style={{ color: colors.primary }}>Values</span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: colors.textSecondary }}
            >
              The principles that guide every ride and every decision we make
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-xl border ${value.borderColor}`}
                style={{ backgroundColor: value.bgColor }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6`}
                  style={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div style={{ color: colors.primary }}>{value.icon}</div>
                </motion.div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: colors.textPrimary }}
                >
                  {value.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: colors.textSecondary }}
                >
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Community Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-10"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2
              className="text-4xl font-bold mb-6"
              style={{ color: colors.textPrimary }}
            >
              Meet Our <span style={{ color: colors.primary }}>Community</span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto mb-10"
              style={{ color: colors.textSecondary }}
            >
              Real people, real stories, real connections
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="p-6 rounded-xl text-center"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${member.color}`}
                >
                  <User
                    af
                    className="w-10 h-10"
                    style={{ color: colors.primary }}
                  />
                </div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: colors.textPrimary }}
                >
                  {member.name}
                </h3>
                <p className="mb-1" style={{ color: colors.textSecondary }}>
                  {member.role}, {member.city}
                </p>
                <div
                  className="inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2"
                  style={{
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary,
                  }}
                >
                  {member.rides}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-10"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-4xl font-bold text-center mb-8"
              style={{ color: colors.textPrimary }}
            >
              Our <span style={{ color: colors.primary }}>Mission</span>
            </h2>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 rounded-xl mb-8 text-center"
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              <p
                className="text-xl leading-relaxed max-w-3xl mx-auto"
                style={{ color: colors.textPrimary }}
              >
                To revolutionize urban commuting in India by creating a
                sustainable, affordable, and connected transportation ecosystem
                where every journey is shared, every ride saves money, and every
                trip makes a positive impact on our environment.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 px-5 py-3 rounded-full"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                />
                <span
                  className="font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Reduce Traffic
                </span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 px-5 py-3 rounded-full"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <IndianRupee
                  className="w-5 h-5"
                  style={{ color: colors.primary }}
                />
                <span
                  className="font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Save Money
                </span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 px-5 py-3 rounded-full"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Leaf className="w-5 h-5" style={{ color: colors.primary }} />
                <span
                  className="font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Go Green
                </span>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 px-5 py-3 rounded-full"
                style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Globe className="w-5 h-5" style={{ color: colors.primary }} />
                <span
                  className="font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  50+ Cities
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-10"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-4xl font-bold mb-6"
              style={{ color: colors.textPrimary }}
            >
              Join Our Journey
            </h2>
            <p
              className="text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: colors.textSecondary }}
            >
              Be part of India's fastest-growing carpooling community. Save
              money, reduce your carbon footprint, and make every commute
              memorable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user?.phone ? (
                ""
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center gap-2"
                  style={{
                    backgroundColor: colors.primary,
                    color: "#FFFFFF",
                  }}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}

              <motion.button
                onClick={() => navigate("/how-it-works")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full text-lg font-bold"
                style={{
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                See How It Works
              </motion.button>
            </div>

            <p className="mt-6 text-sm" style={{ color: colors.textSecondary }}>
              No credit card required • 7-day free trial
            </p>
          </motion.div>
        </div>
      </motion.section>
       </div>
    </div>
  );
};

export default About;
