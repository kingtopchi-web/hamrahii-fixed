import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Phone, 
  Mail,
  Clock, 
  AlertCircle,
  RefreshCw,
  Shield,
  ArrowRight,
  Loader,
  Smartphone,
  Edit2,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserDetails } from '../../store/userReducer';

const VerifyPhone = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [verificationStatus, setVerificationStatus] = useState("false"); // idle, pending, sent, verifying, verified, error
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);
  

  const user = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();




  // Indian phone number validation regex
  const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
  const ALLOWED_COUNTRY_CODES = ['91', '+91', '0'];

  // Get user phone number and userId from Redux store
  useEffect(() => {
    if (user) {
      const userPhone = user?.phoneNumber || user?.phone || '';
      const storedUserId = user?._id || '';
      
      setUserId(storedUserId);
      setOriginalPhone(userPhone);
      
      // Format and set phone number for display
      const formattedPhone = formatIndianPhoneNumber(userPhone);
      setPhoneNumber(formattedPhone);
      
      // Validate existing phone
      validatePhoneNumber(userPhone);
      
      // Check if phone is already verified
      if (user?.phoneVerified) {
        setVerificationStatus('verified');
      } else {
        setVerificationStatus("idle")
      }
    }
  }, [user]);

  // Format Indian phone number for display
  const formatIndianPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Remove country code if present
    let phoneDigits = cleaned;
    if (cleaned.length > 10) {
      // Check if it starts with 91 or +91
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        phoneDigits = cleaned.slice(2);
      } else if (cleaned.startsWith('0') && cleaned.length === 11) {
        phoneDigits = cleaned.slice(1);
      }
    }
    
    // Format as XXX-XXX-XXXX
    if (phoneDigits.length === 10) {
      return `${phoneDigits.slice(0, 5)} ${phoneDigits.slice(5)}`;
    }
    
    return phoneDigits;
  };

  // Extract only digits for backend
  const extractPhoneDigits = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 91 and is 12 digits, remove 91
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned.slice(2);
    }
    
    // If it starts with 0 and is 11 digits, remove 0
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return cleaned.slice(1);
    }
    
    // Return as is (should be 10 digits)
    return cleaned;
  };

  // Validate Indian phone number
  const validatePhoneNumber = (phone) => {
    const digits = extractPhoneDigits(phone);
    
    if (!digits) {
      setPhoneError('Phone number is required');
      setIsValidPhone(false);
      return false;
    }
    
    if (digits.length !== 10) {
      setPhoneError('Phone number must be 10 digits');
      setIsValidPhone(false);
      return false;
    }
    
    if (!INDIAN_PHONE_REGEX.test(digits)) {
      setPhoneError('Invalid Indian phone number. Must start with 6, 7, 8, or 9');
      setIsValidPhone(false);
      return false;
    }
    
    setPhoneError('');
    setIsValidPhone(true);
    return true;
  };

  // Handle phone number input change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (digits.length > 10) return;
    
    // Format for display: XXX-XXX-XXXX
    let formatted = digits;
    if (digits.length > 5) {
      formatted = `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    
    setPhoneNumber(formatted);
    
    // Validate the actual digits
    validatePhoneNumber(digits);
  };

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    // Validate phone number before sending
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error('Please enter a valid Indian phone number');
      return;
    }

    if (!userId) {
      toast.error('User ID not found. Please log in again.');
      return;
    }

    const phoneDigits = extractPhoneDigits(phoneNumber);
    
    try {
      setVerificationStatus('pending');
      setLoading(true);

      const response = await Axios.post(api.user.sendPhoneVerificationOtp, {
        phone : phoneDigits 
      });

      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent to your mobile number!');
        setVerificationStatus('sent');
        setShowOtpInput(true);
        setCountdown(60); // 60 seconds cooldown for resend
        setIsEditing(false); // Exit edit mode after sending
        
        // Update phone in Redux if changed
        dispatch(setUserDetails(response?.data?.user))
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
        setVerificationStatus('error');
        setShowOtpInput(false);
      }
    } catch (error) {
      // console.error('Error sending verification:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      toast.error(errorMessage);
      
      if (error.response?.status === 400 && errorMessage.includes('already verified')) {
        setVerificationStatus('verified');
        setShowOtpInput(false);
        localStorage.setItem('isPhoneVerified', true);
      } else {
        setVerificationStatus('error');
        setShowOtpInput(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    try {
      setVerificationStatus('verifying');
      setLoading(true);

      const response = await Axios.post(api.user.verifyPhoneOtp, {
        userId: userId,
        otp: verificationCode
      });

      if (response.data.success) {
        toast.success('Phone number verified successfully!');
        setVerificationStatus('verified');
        setShowOtpInput(false);
        
        // Update verification status
        localStorage.setItem('isPhoneVerified', true);
        
        // Update Redux store
        dispatch(setUserDetails(response?.data?.user));
        
        // Redirect to profile after 2 seconds
        setTimeout(() => {
          navigate("/my-profile");
        }, 2000);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
        setVerificationStatus('sent');
      }
    } catch (error) {
      // console.error('Error verifying OTP:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed';
      toast.error(errorMessage);
      setVerificationStatus('sent');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) {
      toast.info(`Please wait ${countdown} seconds before resending`);
      return;
    }
    await handleSendVerification();
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel edit - revert to original
      const formattedOriginal = formatIndianPhoneNumber(originalPhone);
      setPhoneNumber(formattedOriginal);
      validatePhoneNumber(originalPhone);
    }
    setIsEditing(!isEditing);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getStatusContent = () => {
    switch (verificationStatus) {
      case 'verified':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'Phone Verified Successfully!',
          description: 'Your phone number has been verified successfully.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'sent':
      case 'verifying':
        return {
          icon: <Smartphone className="w-16 h-16 text-blue-500" />,
          title: 'Check Your Phone',
          description: 'We sent an OTP to your mobile number. Please enter it below.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-500" />,
          title: 'Verification Failed',
          description: 'There was an error sending the OTP. Please try again.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Shield className="w-16 h-16 text-[#E10600]" />,
          title: 'Verify Your Phone Number',
          description: 'Verify your Indian mobile number for security and notifications.',
          color: 'text-[#E10600]',
          bgColor: 'bg-[#E10600]/10',
          borderColor: 'border-[#E10600]/20'
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Info */}
          <div className="hidden lg:flex flex-col justify-center">
            <div className="space-y-6">
              <div className={`p-8 rounded-2xl ${statusContent.bgColor} border ${statusContent.borderColor}`}>
                <div className="flex flex-col items-center text-center space-y-4">
                  {statusContent.icon}
                  <h2 className="text-2xl font-bold text-[#111111]">
                    {statusContent.title}
                  </h2>
                  <p className="text-[#555555]">
                    {statusContent.description}
                  </p>
                </div>
              </div>

              {/* Indian Phone Guidelines */}
              <div className="bg-[#F7F7F7] rounded-2xl p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-semibold text-[#111111] mb-4">
                  Indian Mobile Number Guidelines
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#555555]">Must be 10 digits (excluding country code)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#555555]">Must start with 6, 7, 8, or 9</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#555555]">Do not include +91 or 0 prefix</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#555555]">OTP will be sent via SMS to this number</span>
                  </li>
                </ul>
              </div>

              {/* Security Info */}
              <div className="bg-gradient-to-br from-[#E10600]/10 to-[#C10500]/10 rounded-2xl p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-semibold text-[#111111] mb-3">
                  <Shield className="w-5 h-5 inline mr-2" />
                  Security Assurance
                </h3>
                <p className="text-sm text-[#555555]">
                  Your phone number is securely stored and used only for verification and important notifications. 
                  We never share your contact details with third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Verification Form */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#111111] mb-2">
                Mobile Number Verification
              </h1>
              <p className="text-[#555555]">
                Secure your account by verifying your Indian mobile number
              </p>
            </div>

            {/* Phone Number Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#555555]">
                  Indian Mobile Number
                </label>
                {verificationStatus !== 'verified' && !showOtpInput && (
                  <button
                    onClick={toggleEditMode}
                    className="text-sm text-[#E10600] hover:text-[#C10500] font-medium flex items-center gap-1"
                  >
                    {isEditing ? (
                      <>
                        <X size={14} />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 size={14} />
                        Edit
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-3 p-4 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                  <div className="flex items-center gap-2 text-[#555555]">
                    <Phone className="w-5 h-5" />
                    <span className="font-medium">+91</span>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full bg-transparent text-[#111111] font-medium focus:outline-none placeholder-[#B8B8B8]"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoFocus
                      />
                    ) : (
                      <span className="text-[#111111] font-medium">
                        {phoneNumber || 'Not set'}
                      </span>
                    )}
                  </div>
                  {verificationStatus === 'verified' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                      <CheckCircle size={14} />
                      Verified
                    </span>
                  )}
                </div>
                
                {phoneError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {phoneError}
                  </p>
                )}
                
                {!phoneError && isValidPhone && (
                  <p className="text-green-500 text-sm mt-2 flex items-center gap-1">
                    <CheckCircle size={14} />
                    Valid Indian mobile number
                  </p>
                )}
              </div>
              
              <div className="mt-3 text-sm text-[#555555] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Example: 9876543210 (10 digits starting with 6, 7, 8, or 9)</span>
              </div>
            </div>

            {/* OTP Input */}
            {showOtpInput && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#555555] mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={handleOtpChange}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#E10600] focus:ring-2 focus:ring-[#E10600]/20 text-[#111111] placeholder-[#B8B8B8] text-center text-2xl tracking-widest"
                    maxLength={6}
                    disabled={verificationStatus === 'verifying'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {verificationStatus === 'verifying' && (
                      <Loader className="w-5 h-5 text-[#E10600] animate-spin" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-[#555555] mt-2 flex items-center gap-1">
                  <Clock size={14} />
                  Enter the 6-digit OTP sent to your mobile (valid for 5 minutes)
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {verificationStatus === 'idle' && !showOtpInput && (
                <button
                  onClick={handleSendVerification}
                  disabled={loading || !userId || !isValidPhone}
                  className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP to Mobile
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}

              {showOtpInput && (
                <>
                  <button
                    onClick={handleVerifyCode}
                    disabled={loading || !verificationCode.trim() || verificationCode.length !== 4 || !userId}
                    className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verificationStatus === 'verifying' ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>

                  <button
                    onClick={handleResendCode}
                    disabled={countdown > 0 || loading || !userId || !isValidPhone}
                    className="w-full bg-transparent border border-[#E5E5E5] text-[#555555] hover:bg-[#F7F7F7] py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? (
                      <>
                        <Clock size={18} />
                        Resend in {countdown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} />
                        Resend OTP
                      </>
                    )}
                  </button>
                </>
              )}

              {verificationStatus === 'verified' && (
                <button
                  onClick={() => navigate("/my-profile")}
                  className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Go to Profile
                  <ArrowRight size={18} />
                </button>
              )}

              {verificationStatus === 'error' && (
                <button
                  onClick={handleSendVerification}
                  disabled={loading || !userId || !isValidPhone}
                  className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Try Again'
                  )}
                </button>
              )}

              {showOtpInput && (
                <div className="pt-4 border-t border-[#E5E5E5]">
                  <p className="text-center text-sm text-[#555555]">
                    Didn't receive the SMS?{' '}
                    <button
                      onClick={handleResendCode}
                      disabled={countdown > 0 || !userId || !isValidPhone}
                      className="text-[#E10600] hover:text-[#C10500] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Click to resend'}
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Status Indicators */}
            <div className="mt-8 space-y-3">
             
              
              {showOtpInput && verificationStatus === 'sent' && (
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <Clock size={14} />
                  <span>OTP expires in 5 minutes</span>
                </div>
              )}
              
              {showOtpInput && (
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <Smartphone size={14} />
                  <span>Check your mobile SMS inbox</span>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#555555] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#555555] mb-2">
                    <strong>Important:</strong> The OTP will be sent via SMS to your mobile number.
                    For security reasons, the OTP is valid for 5 minutes only.
                  </p>
                  <p className="text-sm text-[#555555]">
                    <strong>Note:</strong> Ensure you have good network coverage to receive SMS.
                    Standard SMS charges may apply.
                  </p>
                  {!userId && (
                    <p className="text-red-500 text-sm mt-2">
                      <strong>Error:</strong> User session not found. Please log in again.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden mt-8">
          <div className={`p-6 rounded-2xl ${statusContent.bgColor} border ${statusContent.borderColor} mb-6`}>
            <div className="flex flex-col items-center text-center space-y-4">
              {statusContent.icon}
              <h2 className="text-xl font-bold text-[#111111]">
                {statusContent.title}
              </h2>
              <p className="text-[#555555] text-sm">
                {statusContent.description}
              </p>
            </div>
          </div>

          {/* Guidelines for Mobile */}
          {verificationStatus !== 'verified' && (
            <div className="bg-[#F7F7F7] rounded-2xl p-6 border border-[#E5E5E5] mb-6">
              <h3 className="text-lg font-semibold text-[#111111] mb-3">
                Indian Mobile Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-[#555555]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>10 digits starting with 6, 7, 8, or 9</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Do not include +91 or 0 prefix</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>OTP sent via SMS to this number</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyPhone;