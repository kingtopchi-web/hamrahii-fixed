import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  CreditCard,
  Smartphone,
  UserCheck,
  UserX,
  Globe,
  Package,
  Music,
  PawPrint,
  MessageSquare,
  Clock,
  Battery,
  Wifi,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  MessageCircle,
  Send,
  Loader,
  PlusCircle,
  Wallet,
  Coins,
} from "lucide-react";
import { toast } from "react-toastify";
import Axios from "../../../services/axios";
import { api } from "../../../services/api";
import { formatUserName, formatUserEmail } from "../../../utils/formatters";
import AddWalletMoneyModal from "./AddWalletMoneyModal";

export const getUserAvatarUrl = (photoUrl) => {
  if (!photoUrl || typeof photoUrl !== "string" || !photoUrl.trim()) {
    return "/default-avatar.jpg";
  }
  const clean = photoUrl.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
    return clean;
  }
  const baseUrl = (import.meta.env.VITE_ASSETS_URL || "http://localhost:9898").trim().replace(/\/$/, "");
  const normalized = clean.startsWith("/") ? clean : `/${clean}`;
  return `${baseUrl}${normalized}`;
};

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Verification state
  const [isUpdating, setIsUpdating] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState(""); // 'verify' or 'reject'
  const [adminMessage, setAdminMessage] = useState("");
  const [selectedCommonMessage, setSelectedCommonMessage] = useState("");
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);

  // Common messages for admin
  const commonMessages = {
    verify: [
      "Profile photos and documents meet our verification standards.",
      "All required documents are clear and valid.",
      "Information matches with provided documents.",
      "Profile meets all verification criteria.",
      "User identity successfully verified.",
    ],
    reject: [
      "Profile photos are unclear or insufficient.",
      "Documents are expired or invalid.",
      "Information mismatch with documents.",
      "Additional documentation required.",
      "Profile does not meet verification criteria.",
    ],
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (location?.state?.user?._id) {
        setUser(location.state.user);
        setLoading(false);
        return;
      }
      if (!userId) {
        navigate("/admin/users");
        return;
      }
      try {
        setLoading(true);
        const res = await Axios.get(`${api.user.getUserDetails}/${userId}`);
        if (res?.data?.success && res.data.user) {
          setUser(res.data.user);
          setError(null);
        } else {
          setError(res?.data?.message || "User not found");
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, location?.state]);

  // Handle verification action
  const handleVerificationAction = async (action) => {
    setVerificationAction(action);
    setShowVerificationModal(true);

    // Set default message based on action
    if (action === "verify") {
      setAdminMessage(commonMessages.verify[0]);
      setSelectedCommonMessage(commonMessages.verify[0]);
    } else {
      setAdminMessage(commonMessages.reject[0]);
      setSelectedCommonMessage(commonMessages.reject[0]);
    }
  };

  const submitVerification = async () => {
    if (!adminMessage.trim()) {
      alert("Please enter a message for the user");
      return;
    }

    setIsUpdating(true);
    try {
      // Call your backend API here
      // await Axios.put(`/api/users/${userId}/verification`, {
      //   status: verificationAction === 'verify' ? 'verified' : 'rejected',
      //   message: adminMessage
      // });
      const res = await Axios.post(api.user.updateStatus, {
        status: verificationAction === "verify" ? "verified" : "rejected",
        message: adminMessage,
        userId : user?._id
      });

      if (res?.data?.success) {
        setUser((prev) => ({
          ...prev,
          isVerified: verificationAction === "verify" ? "verified" : "rejected",
          verificationMessage: adminMessage,
        }));
        toast.success(res?.data?.message);
      }

      setShowVerificationModal(false);
      setAdminMessage("");
      setSelectedCommonMessage("");

    } catch (err) {
      // console.error("Error updating verification:", err);
      toast.info(err?.response?.data?.message || "Failed to update verification status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      inactive: { bg: "bg-[#F8FAFC]", text: "text-[#0F172A]", label: "Inactive" },
      suspended: { bg: "bg-red-100", text: "text-red-800", label: "Suspended" },
      deleted: { bg: "bg-[#F8FAFC]", text: "text-[#0F172A]", label: "Deleted" },
    };

    const config = statusConfig[status] || statusConfig.inactive;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        <Activity className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  // Get verification badge
  const getVerificationBadge = (status) => {
    const config = {
      verified: {
        icon: <Shield className="w-3 h-3 mr-1" />,
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Verified",
      },
      rejected: {
        icon: <XCircle className="w-3 h-3 mr-1" />,
        bg: "bg-red-100",
        text: "text-red-800",
        label: "Rejected",
      },
      review: {
        icon: <AlertCircle className="w-3 h-3 mr-1" />,
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Under Review",
      },
      pending: {
        icon: <Clock className="w-3 h-3 mr-1" />,
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Pending",
      },
      incomplete: {
        icon: <UserX className="w-3 h-3 mr-1" />,
        bg: "bg-[#F8FAFC]",
        text: "text-[#0F172A]",
        label: "Incomplete",
      },
    };

    const currentConfig = config[status] || config.incomplete;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentConfig.bg} ${currentConfig.text}`}
      >
        {currentConfig.icon}
        {currentConfig.label}
      </span>
    );
  };

  const getKycBadge = (kycStatus) => {
    switch(kycStatus) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Shield className="w-3 h-3 mr-1" />
            KYC Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            KYC Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            KYC Rejected
          </span>
        );
      case 'NOT_SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F8FAFC] text-[#0F172A]">
            <UserX className="w-3 h-3 mr-1" />
            No KYC
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-300 rounded-xl"></div>
                <div className="h-48 bg-gray-300 rounded-xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-300 rounded-xl"></div>
                <div className="h-32 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/admin/users")}
            className="inline-flex items-center text-[#555555] hover:text-[#111111] mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </button>

          <div className="bg-[#F7F7F7] rounded-xl p-12 text-center border border-[#E5E5E5]">
            <div className="text-[#EF4444] mb-4">
              <UserX className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-[#111111] mb-2">
              User Not Found
            </h3>
            <p className="text-[#555555] mb-4">
              {error || "The requested user does not exist."}
            </p>
            <button
              onClick={() => navigate("/admin/users")}
              className="px-6 py-2 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#C10500] transition-colors"
            >
              Back to Users List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-[#555555] hover:text-[#111111] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E5E5E5] bg-[#F8FAFC] flex-shrink-0 shadow-sm">
                <img
                  src={getUserAvatarUrl(user.profilePhotos?.[0]?.url || user.profilePhoto)}
                  alt={formatUserName(user)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.jpg";
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#111111]">
                  {formatUserName(user)}
                </h1>
                <p className="text-[#555555] mt-1">User ID: {user._id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              {getStatusBadge(user.status)}
              {getVerificationBadge(user.isVerified)}
              {getKycBadge(user.kyc?.status)}
            </div>
          </div>
        </div>

        {/* Profile Photos Section */}
        {(() => {
          const photos = (user.profilePhotos && user.profilePhotos.length > 0)
            ? user.profilePhotos
            : (user.profilePhoto ? [{ url: user.profilePhoto, isDefault: true }] : []);

          return (
            <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[#E5E5E5] mb-6">
              <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Profile Photos ({photos.length})
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.length > 0 ? (
                  photos.slice(0, 4).map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-lg border-2 border-[#E5E5E5] bg-[#FFFFFF] flex items-center justify-center">
                        <img
                          src={getUserAvatarUrl(photo.url || photo)}
                          alt={`Profile ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.jpg";
                          }}
                        />
                      </div>
                      {photo.isDefault && (
                        <span className="absolute top-2 right-2 bg-[#EF4444] text-white text-xs px-2 py-1 rounded shadow">
                          Default
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <img
                      src="/default-avatar.jpg"
                      alt="Default avatar"
                      className="w-16 h-16 rounded-full mx-auto mb-3 opacity-60 border border-[#E2E8F0]"
                    />
                    <p className="text-[#64748B]">No profile photos uploaded</p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Verification Actions */}
        <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[#E5E5E5] mb-6">
          <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Verification Status
          </h2>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Current Status */}
            <div className="flex-1 bg-[#FFFFFF] rounded-lg p-4 border border-[#E5E5E5]">
              <h3 className="font-medium text-[#111111] mb-2">
                Profile Status
              </h3>
              <div className="flex items-center space-x-3">
                {getVerificationBadge(user.isVerified)}
                {user.verificationMessage && (
                  <div className="text-sm text-[#555555] italic">
                    "{user.verificationMessage}"
                  </div>
                )}
              </div>
            </div>

            {/* KYC Status */}
            <div className="flex-1 bg-[#FFFFFF] rounded-lg p-4 border border-[#E5E5E5]">
              <h3 className="font-medium text-[#111111] mb-2">
                Aadhaar KYC Status
              </h3>
              <div className="flex flex-col space-y-2">
                <div>{getKycBadge(user.kyc?.status)}</div>
                {user.kyc?.documentNumber && (
                  <div className="text-sm text-[#555555]">
                    Aadhaar: **** **** {user.kyc.documentNumber.slice(-4)}
                  </div>
                )}
                {user.kyc?.verifiedAt && (
                  <div className="text-xs text-[#888888]">
                    Verified: {new Date(user.kyc.verifiedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
              <button
                onClick={() => handleVerificationAction("verify")}
                disabled={user.isVerified === "verified"}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify User
              </button>

              <button
                onClick={() => handleVerificationAction("reject")}
                disabled={user.isVerified === "rejected"}
                className="px-6 py-3 bg-[#DC2626] text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Verification
              </button>
            </div>
          </div>
        </div>

        {/* Verification Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#FFFFFF] rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-[#E5E5E5]">
                <h3 className="text-xl font-bold text-[#111111]">
                  {verificationAction === "verify"
                    ? "Verify User"
                    : "Reject Verification"}
                </h3>
                <p className="text-[#555555] mt-1">
                  {verificationAction === "verify"
                    ? "This will mark the user as verified."
                    : "This will reject the user verification."}
                </p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#111111] mb-3">
                    Message to User{" "}
                    {verificationAction === "verify"
                      ? "(optional)"
                      : "(required)"}
                  </label>

                  {/* Common Messages */}
                  <div className="mb-4">
                    <label className="block text-sm text-[#555555] mb-2">
                      Select common message:
                    </label>
                    <select
                      value={selectedCommonMessage}
                      onChange={(e) => {
                        setSelectedCommonMessage(e.target.value);
                        setAdminMessage(e.target.value);
                      }}
                      className="w-full px-4 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#E10600] focus:border-transparent transition-all"
                    >
                      <option value="">Select a message</option>
                      {commonMessages[verificationAction].map((msg, index) => (
                        <option key={index} value={msg}>
                          {msg}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Message */}
                  <textarea
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="Enter your message to the user..."
                    rows="4"
                    className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#111111] placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#E10600] focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowVerificationModal(false);
                      setAdminMessage("");
                      setSelectedCommonMessage("");
                    }}
                    className="px-6 py-2 bg-[#F7F7F7] text-[#111111] rounded-lg font-medium hover:bg-[#E5E5E5] transition-colors"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitVerification}
                    disabled={
                      isUpdating ||
                      (verificationAction === "reject" && !adminMessage.trim())
                    }
                    className="px-6 py-2 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#C10500] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isUpdating ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {verificationAction === "verify"
                          ? "Verify User"
                          : "Reject Verification"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[#E5E5E5]">
              <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#555555] block mb-1">
                      Full Name
                    </label>
                    <p className="text-[#111111] font-medium">
                      {formatUserName(user)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-[#555555] block mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-[#555555] mr-2" />
                      <p className="text-[#111111] font-medium">{formatUserEmail(user.email)}</p>
                      {user.emailVerified ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-[#555555] block mb-1">
                      Gender
                    </label>
                    <p className="text-[#111111] font-medium capitalize">
                      {user.gender}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#555555] block mb-1">
                      Phone Number
                    </label>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-[#555555] mr-2" />
                      <p className="text-[#111111] font-medium">
                        {user.phone || "Not provided"}
                      </p>
                      {user.phoneVerified ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-[#555555] block mb-1">
                      Date of Birth
                    </label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-[#555555] mr-2" />
                      <p className="text-[#111111] font-medium">
                        {user.dateOfBirth
                          ? formatDate(user.dateOfBirth)
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-[#555555] block mb-1">
                      Role
                    </label>
                    <p className="text-[#111111] font-medium capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
                  <label className="text-sm text-[#555555] block mb-2">
                    Bio
                  </label>
                  <p className="text-[#111111]">{user.bio}</p>
                </div>
              )}
            </div>

            {/* Preferences */}
            {user.preferences && (
              <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[#E5E5E5]">
                <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Travel Preferences
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 text-[#555555] mr-3" />
                      <div>
                        <label className="text-sm text-[#555555] block">
                          Luggage Space
                        </label>
                        <div className="flex space-x-2 mt-1">
                          {user.preferences.luggageSpace?.small && (
                            <span className="px-2 py-1 bg-[#F8FAFC] text-[#0F172A] text-xs rounded">
                              Small
                            </span>
                          )}
                          {user.preferences.luggageSpace?.medium && (
                            <span className="px-2 py-1 bg-[#F8FAFC] text-[#0F172A] text-xs rounded">
                              Medium
                            </span>
                          )}
                          {user.preferences.luggageSpace?.large && (
                            <span className="px-2 py-1 bg-[#F8FAFC] text-[#0F172A] text-xs rounded">
                              Large
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Music className="w-4 h-4 text-[#555555] mr-3" />
                      <div>
                        <label className="text-sm text-[#555555] block">
                          Music
                        </label>
                        <p className="text-[#111111] font-medium capitalize">
                          {user.preferences.music || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <PawPrint className="w-4 h-4 text-[#555555] mr-3" />
                      <div>
                        <label className="text-sm text-[#555555] block">
                          Pets
                        </label>
                        <p className="text-[#111111] font-medium capitalize">
                          {user.preferences.pets || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 text-[#555555] mr-3" />
                      <div>
                        <label className="text-sm text-[#555555] block">
                          Conversation
                        </label>
                        <p className="text-[#111111] font-medium capitalize">
                          {user.preferences.conversation || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <User className="w-4 h-4 text-[#555555] mr-3" />
                      <div>
                        <label className="text-sm text-[#555555] block">
                          Smoking
                        </label>
                        <p className="text-[#111111] font-medium capitalize">
                          {user.preferences.smoking || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Wallet & Virtual Money Information */}
            <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[#E5E5E5]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#111111] flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-[#0F172A]" />
                  Balances & Wallet
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddMoneyModal(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Add virtual money to user"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Virtual</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Virtual Money Card */}
                <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-purple-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-purple-600" />
                      Virtual Money (Credits)
                    </span>
                    <span className="text-[10px] bg-purple-200/70 text-purple-800 font-semibold px-2 py-0.5 rounded-md">
                      20% Ride Discount
                    </span>
                  </div>
                  <div className="text-2xl font-black text-purple-900 mt-1">
                    ₹{(user.virtualMoney?.balance || 0).toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Real Wallet Card */}
                <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5E5E5] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider block">
                      Real Wallet Balance
                    </span>
                    <div className="text-lg font-bold text-[#0F172A] mt-0.5">
                      ₹{(user.wallet?.balance || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#94A3B8] bg-[#F8FAFC] px-2 py-1 rounded-md">
                    {user.wallet?.currency || "INR"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddMoneyModal(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Coins className="w-4 h-4" />
                  <span>Add Virtual Money to User</span>
                </button>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[#E5E5E5]">
              <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Activity
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-[#555555] mr-2" />
                    <span className="text-sm text-[#555555]">Last Login</span>
                  </div>
                  <span className="text-[#111111] font-medium">
                    {formatDate(user.lastLogin)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 text-[#555555] mr-2" />
                    <span className="text-sm text-[#555555]">Last Active</span>
                  </div>
                  <span className="text-[#111111] font-medium">
                    {formatDate(user.lastActive)}
                  </span>
                </div>

                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Battery className="w-4 h-4 text-[#555555] mr-2" />
                    <span className="text-sm text-[#555555]">Trust Score</span>
                  </div>
                  <span className="text-[#111111] font-medium">{user.trustScore || 0}</span>
                </div> */}

                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 text-[#555555] mr-2" />
                    <span className="text-sm text-[#555555]">Status</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      user.isOnline ? 'bg-[#ECFDF5]0' : 'bg-gray-400'
                    }`}></span>
                    <span className="text-[#111111] font-medium">
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-[#F7F7F7] rounded-xl p-6 border border-[#E5E5E5]">
              <h2 className="text-xl font-bold text-[#111111] mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Info
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#555555] block mb-1">
                    Member Since
                  </label>
                  <p className="text-[#111111] font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-[#555555] block mb-1">
                    Last Updated
                  </label>
                  <p className="text-[#111111] font-medium">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>

                {/* <div>
                  <label className="text-sm text-[#555555] block mb-1">Profile Complete</label>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-[#EF4444] h-2 rounded-full"
                        style={{ width: `${user.profilePhotos?.length > 0 ? '75%' : '40%'}` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-[#111111]">
                      {user.profilePhotos?.length > 0 ? '75%' : '40%'}
                    </span>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddMoneyModal && (
        <AddWalletMoneyModal
          isOpen={showAddMoneyModal}
          onClose={() => setShowAddMoneyModal(false)}
          user={user}
          onSuccess={(updatedUser, newBalance) => {
            setUser((prev) => ({
              ...prev,
              ...(updatedUser || {}),
              virtualMoney: {
                ...(prev?.virtualMoney || {}),
                ...(updatedUser?.virtualMoney || {}),
                balance: newBalance,
              },
            }));
          }}
        />
      )}
    </div>
  );
};

export default AdminUserDetails;
