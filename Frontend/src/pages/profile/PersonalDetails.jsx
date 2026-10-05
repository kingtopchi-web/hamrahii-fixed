import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Shield,
  CheckCircle,
  XCircle,
  Camera,
  AlertCircle,
  Map,
  ChevronRight,
  Star,
  CreditCard,
  Globe,
  MapPin,
  Briefcase,
  MessageSquare,
  Music,
  Wind,
  Thermometer,
  Users,
  Car,
  Lock,
  Wallet as WalletIcon,
  Award,
  Sparkles,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDefaultProfilePhoto } from "../../utils/profileImageHelper";

const PersonalDetails = () => {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();
 

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E10600] mx-auto"></div>
          <p className="mt-4 text-[#555555]">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Overview Card */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Profile Image */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="relative group"
                  >
                    <div className="relative w-28 h-28">
                      <img
                        src={getDefaultProfilePhoto(user)}
                        alt="Profile"
                        className="w-full h-full rounded-full border-4 border-white shadow-lg object-cover"
                        onError={(e) => {
                          e.target.src = "/default-avatar.jpg";
                        }}
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#E10600]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate("/my-profile/upload-profile-pic")}
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#E10600] to-[#F59E0B] text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                    >
                      <Camera size={18} />
                    </motion.button>
                  </motion.div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-[#111111] mb-1">
                          {user?.firstName || "User"} {user?.lastName || ""}
                        </h2>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-[#555555]">
                            <Mail size={16} />
                            <span className="text-sm">
                              {user?.email || "No email"}
                            </span>
                          </div>
                          {user?.lastLogin && (
                            <div className="flex items-center gap-2 text-[#555555]">
                              <Calendar size={16} />
                              <span className="text-sm">
                                Last active: {formatDate(user?.lastLogin)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Verification Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                            user?.isVerified === "verified"
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                              : user?.isVerified === "pending"
                                ? "bg-yellow-50 border border-yellow-200"
                                : "bg-red-50 border border-red-200"
                          }`}
                        >
                          {user?.isVerified === "verified" && (
                            <CheckCircle size={14} className="text-green-600" />
                          )}
                          {user?.isVerified === "pending" && (
                            <AlertCircle
                              size={14}
                              className="text-yellow-600"
                            />
                          )}
                          {user?.isVerified === "incomplete" && (
                            <XCircle size={14} className="text-red-600" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              user?.isVerified === "verified"
                                ? "text-green-700"
                                : user?.isVerified === "pending"
                                  ? "text-yellow-700"
                                  : "text-red-700"
                            }`}
                          >
                            {user?.isVerified === "verified" &&
                              "Verified Account"}
                            {user?.isVerified === "pending" &&
                              "Verification Pending"}
                            {user?.isVerified === "incomplete" &&
                              "Verification Needed"}
                          </span>
                        </div>

                        {user?.trustScore > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < Math.floor(user?.trustScore / 20)
                                      ? "fill-[#FFD700] text-[#FFD700]"
                                      : "fill-[#E5E5E5] text-[#E5E5E5]"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-[#111111]">
                              Trust Score: {user?.trustScore}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Edit Button - Basic Details */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/my-profile/edit-basic-details")}
                      className="group flex items-center gap-2 px-4 py-2.5 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg mt-4 transition-colors duration-200"
                    >
                      <Edit2
                        size={16}
                        className="text-[#555555] group-hover:text-[#E10600]"
                      />
                      <span className="text-sm font-medium text-[#555555] group-hover:text-[#111111]">
                        Complete your Basic Details
                      </span>
                      <ChevronRight
                        size={14}
                        className="text-[#B8B8B8] group-hover:text-[#555555] ml-auto"
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Personal Information Section */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
            >
              {/* Section Header */}
              <div className="border-b border-[#E5E5E5] px-6 py-4 bg-[#F7F7F7]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#E10600] rounded-lg">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#111111]">
                        Personal Information
                      </h3>
                      <p className="text-sm text-[#555555]">
                        Your basic details and identification
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: User,
                      label: "First Name",
                      value: user?.firstName || "Add first name",
                      color: "text-blue-500",
                    },
                    {
                      icon: User,
                      label: "Last Name",
                      value: user?.lastName || "Add last name",
                      color: "text-blue-500",
                    },
                    {
                      icon: Mail,
                      label: "Email Address",
                      value: user?.email || "Add email",
                      color: "text-purple-500",
                      verified: user?.emailVerified,
                    },
                    {
                      icon: Phone,
                      label: "Phone Number",
                      value: user?.phone || "Add phone number",
                      color: "text-green-500",
                      verified: user?.phoneVerified,
                    },
                    {
                      icon: Calendar,
                      label: "Date of Birth",
                      value: user?.dateOfBirth
                        ? formatDate(user.dateOfBirth)
                        : "Add date of birth",
                      color: "text-pink-500",
                    },
                    {
                      icon: Users,
                      label: "Gender",
                      value: user?.gender || "Add gender",
                      color: "text-indigo-500",
                    },
                    // {
                    //   icon: MapPin,
                    //   label: "Location",
                    //   value: user?.currentLocation?.coordinates
                    //     ? `Lat: ${user.currentLocation.coordinates[1]?.toFixed(4)}, Lon: ${user.currentLocation.coordinates[0]?.toFixed(4)}`
                    //     : "Add location",
                    //   color: "text-orange-500"
                    // }
                  ].map((field, index) => (
                    <motion.div
                      key={field.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group p-4 bg-[#F7F7F7] rounded-xl hover:bg-[#E5E5E5]/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-lg bg-white ${field.color}`}
                          >
                            <field.icon size={16} />
                          </div>
                          <span className="text-sm font-medium text-[#555555]">
                            {field.label}
                          </span>
                        </div>
                        {field.verified && (
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle size={12} />
                            Verified
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-sm font-semibold ${!field.value.includes("Add") ? "text-[#111111]" : "text-[#555555]"}`}
                      >
                        {field.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Bio Section */}
            {user?.bio ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E10600] rounded-lg">
                        <MessageSquare size={20} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[#111111]">
                        About Me
                      </h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/my-profile/edit-bio")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[#E10600] hover:text-[#C10600] text-sm font-medium transition-colors"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </motion.button>
                  </div>
                  <div className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl p-5">
                    <p className="text-[#555555] leading-relaxed">{user.bio}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E10600] rounded-lg">
                        <MessageSquare size={20} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[#111111]">
                        About Me
                      </h3>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <MessageSquare
                      size={48}
                      className="text-[#B8B8B8] mx-auto mb-3"
                    />
                    <p className="text-[#555555] mb-4">No bio added yet</p>
                    <button
                      onClick={() => navigate("/my-profile/edit-bio")}
                      className="px-4 py-2 bg-[#E10600] hover:bg-[#C10500] text-white rounded-lg font-medium transition-colors"
                    >
                      Add Bio
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Account Status Card */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#E10600] rounded-lg">
                    <Shield size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111111]">
                    Account Status
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Account Status",
                      status: user?.status === "active" ? "Active" : "Inactive",
                      icon: user?.status === "active" ? CheckCircle : XCircle,
                      color:
                        user?.status === "active"
                          ? "text-green-600"
                          : "text-red-600",
                      feature: () => {},
                      bgColor:
                        user?.status === "active" ? "bg-green-50" : "bg-red-50",
                    },
                    {
                      label: "Email Verification",
                      status: user?.emailVerified ? "Verified" : "Not Verified",
                      icon: user?.emailVerified ? CheckCircle : XCircle,
                      feature: () => {
                        navigate("/my-profile/verify-email")
                      },
                      color: user?.emailVerified
                        ? "text-green-600"
                        : "text-red-600",
                      bgColor: user?.emailVerified
                        ? "bg-green-50"
                        : "bg-red-50",
                    },
                    {
                      label: "Phone Verification",
                      status: user?.phoneVerified ? "Verified" : "Not Verified",
                      icon: user?.phoneVerified ? CheckCircle : XCircle,
                      color: user?.phoneVerified  
                        ? "text-green-600"
                        : "text-red-600",
                      feature: () => {
                        navigate("/my-profile/verify-phone")
                      },
                      bgColor: user?.phoneVerified
                        ? "bg-green-50"
                        : "bg-red-50",
                    },
                    // {
                    //   label: "Online Status",
                    //   status: user?.isOnline ? "Online" : "Offline",
                    //   icon: user?.isOnline ? CheckCircle : XCircle,
                    //   color: user?.isOnline
                    //     ? "text-green-600"
                    //     : "text-gray-600",
                    //   bgColor: user?.isOnline ? "bg-green-50" : "bg-gray-50",
                    //   feature: () => {},
                    // },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={(e) => item.feature()}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F7F7] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.bgColor}`}>
                          <item.icon size={18} className={item.color} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#111111]">
                            {item.label}
                          </div>
                          <div className={`text-xs font-medium ${item.color}`}>
                            {item.status}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-[#B8B8B8]" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Travel Preferences Card */}
            {user?.preferences && (
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#E10600] rounded-lg">
                        <Map size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#111111]">
                          Travel Preferences
                        </h3>
                        <p className="text-sm text-[#555555]">
                          Your ride settings and preferences
                        </p>
                      </div>
                    </div>

                    {/* Edit Button - Travel Preferences */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/my-profile/edit-preferences")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[#E10600] hover:text-[#C10600] text-sm font-medium transition-colors"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </motion.button>
                  </div>

                  <div className="space-y-5">
                    {/* Smoking Preference */}
                    {user.preferences?.smoking && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                          <Thermometer size={16} />
                          <span>Smoking</span>
                        </div>
                        <div className="px-3 py-2 bg-[#F7F7F7] rounded-lg text-[#111111] font-medium capitalize">
                          {user.preferences.smoking.replace("-", " ")}
                        </div>
                      </div>
                    )}

                    {/* Music Preference */}
                    {user.preferences?.music && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                          <Music size={16} />
                          <span>Music</span>
                        </div>
                        <div className="px-3 py-2 bg-[#F7F7F7] rounded-lg text-[#111111] font-medium capitalize">
                          {user.preferences.music}
                        </div>
                      </div>
                    )}

                    {/* Conversation Preference */}
                    {user.preferences?.conversation && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                          <MessageSquare size={16} />
                          <span>Conversation</span>
                        </div>
                        <div className="px-3 py-2 bg-[#F7F7F7] rounded-lg text-[#111111] font-medium capitalize">
                          {user.preferences.conversation}
                        </div>
                      </div>
                    )}

                    {/* Pets Preference */}
                    {user.preferences?.pets && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                          <Briefcase size={16} />
                          <span>Pets</span>
                        </div>
                        <div className="px-3 py-2 bg-[#F7F7F7] rounded-lg text-[#111111] font-medium capitalize">
                          {user.preferences.pets.replace("-", " ")}
                        </div>
                      </div>
                    )}

                    {/* Luggage Space */}
                    {user.preferences?.luggageSpace && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                          <Briefcase size={16} />
                          <span>Luggage Space</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(user.preferences.luggageSpace).map(
                            ([size, allowed]) => (
                              <div
                                key={size}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                                  allowed
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                }`}
                              >
                                {size.charAt(0).toUpperCase() + size.slice(1)}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;
