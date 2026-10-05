import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Mail, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Shield,
  ArrowRight,
  Loader
} from 'lucide-react';
import { toast } from 'react-toastify';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserDetails } from '../../store/userReducer';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle, pending, sent, verifying, verified, error
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const user = useSelector(state => state.user);
  const dispatch = useDispatch()

  const navigate = useNavigate()

  // Get user email and userId from Redux store
  useEffect(() => {
    if (user) {
      const userEmail = user?.email || '';
      const storedUserId = user?._id || '';
      
      setEmail(userEmail);
      setUserId(storedUserId);
      
      // Check if email is already verified from user data
      if (user?.emailVerified) {
        setVerificationStatus('verified');
      } else {
        // Check localStorage as fallback
        const isVerified = localStorage.getItem('isEmailVerified') === true;
        if (isVerified) {
          setVerificationStatus('verified');
        }
      }
    }
  }, [user]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerification = async () => {
    if (!userId) {
      toast.error('User ID not found. Please log in again.');
      return;
    }

    try {
      setVerificationStatus('pending');
      setLoading(true);

      const response = await Axios.post(api.user.sendEmailVerificationOtp, {
        userId: userId,
        email
      });

      if (response.data.success) {
        toast.success('Verification email sent successfully!');
        setVerificationStatus('sent');
        setShowOtpInput(true); // Show OTP input after sending email
        setCountdown(60); // 60 seconds cooldown for resend
      } else {
        toast.error(response.data.message || 'Failed to send verification email');
        setVerificationStatus('error');
        setShowOtpInput(false);
      }
    } catch (error) {
      // console.error('Error sending verification:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 400 && errorMessage.includes('already verified')) {
        setVerificationStatus('verified');
        setShowOtpInput(false);
        localStorage.setItem('isEmailVerified', true);
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
      toast.error('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!userId) {
      toast.error('User ID not found. Please log in again.');
      return;
    }

    try {
      setVerificationStatus('verifying');
      setLoading(true);

      const response = await Axios.post(api.user.verifyEmailOtp, {
        userId: userId,
        otp: verificationCode
      });

      if (response.data.success) {
        toast.success('Email verified successfully!');
        setVerificationStatus('verified');
        setShowOtpInput(false);
        localStorage.setItem('isEmailVerified', true);
        
       dispatch(setUserDetails(response.data.user))
        navigate("/my-profile");
      } else {
        toast.error(response.data.message || 'Invalid verification code');
        setVerificationStatus('sent'); // Stay in sent state to retry
      }
    } catch (error) {
      // console.error('Error verifying code:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed';
      toast.error(errorMessage);
      console.log(error , "this si")
      
      // Stay in sent state to allow retry
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
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    if (value.length <= 6) {
      setVerificationCode(value);
    }
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
          title: 'Email Verified Successfully!',
          description: 'Your email address has been verified. You will be redirected to your dashboard shortly.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'sent':
      case 'verifying':
        return {
          icon: <Mail className="w-16 h-16 text-blue-500" />,
          title: 'Check Your Email',
          description: 'We sent a verification code to your email address. Please enter it below.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-500" />,
          title: 'Verification Failed',
          description: 'There was an error sending the verification email. Please try again.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Shield className="w-16 h-16 text-[#E10600]" />,
          title: 'Verify Your Email',
          description: 'Please verify your email address to access all features and ensure account security.',
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
          {/* Left Column - Illustration and Info */}
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

              {/* Security Features */}
              <div className="bg-[#F7F7F7] rounded-2xl p-6 border border-[#E5E5E5]">
                <h3 className="text-lg font-semibold text-[#111111] mb-4">
                  Why Verify Your Email?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#555555]">Secure your account against unauthorized access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#555555]">Receive important notifications and updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#555555]">Reset your password if you forget it</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[#555555]">Access premium features and benefits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Verification Form */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#111111] mb-2">
                Email Verification
              </h1>
              <p className="text-[#555555]">
                Protect your account by verifying your email address
              </p>
            </div>

            {/* Email Display */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#555555] mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 p-4 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
                <Mail className="w-5 h-5 text-[#555555]" />
                 <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full px-4 py-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#E10600] focus:ring-2 focus:ring-[#E10600]/20 text-[#111111] placeholder-[#B8B8B8]  text-xl tracking-widest"
                    disabled={verificationStatus === 'verifying'}
         
                  />
                {verificationStatus === 'verified' && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                    <CheckCircle size={14} />
                    Verified
                  </span>
                )}
              </div>
              {!userId && (
                <p className="text-red-500 text-sm mt-2">
                  User ID not found. Please log in again.
                </p>
              )}
            </div>

            {/* Verification Code Input (shown after email is sent) */}
            {showOtpInput && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#555555] mb-2">
                  Verification Code
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
                  Enter the 6-digit code sent to your email (valid for 5 minutes)
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {verificationStatus === 'idle' && !showOtpInput && (
                <button
                  onClick={handleSendVerification}
                  disabled={loading || !userId}
                  className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Verification Email
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}

              {showOtpInput && (
                <>
                  <button
                    onClick={handleVerifyCode}
                    disabled={loading || !verificationCode.trim() || verificationCode.length !== 6 || !userId}
                    className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verificationStatus === 'verifying' ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  <button
                    onClick={handleResendCode}
                    disabled={countdown > 0 || loading || !userId}
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
                        Resend Code
                      </>
                    )}
                  </button>
                </>
              )}

              {verificationStatus === 'verified' && (
                <button
                  onClick={() =>  navigate("/my-profile")}
                  className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight size={18} />
                </button>
              )}

              {verificationStatus === 'error' && (
                <button
                  onClick={handleSendVerification}
                  disabled={loading || !userId}
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
                    Didn't receive the email?{' '}
                    <button
                      onClick={handleResendCode}
                      disabled={countdown > 0 || !userId}
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#555555]">Email Status</span>
                <span className={`text-sm font-medium ${statusContent.color}`}>
                  {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
                </span>
              </div>
              
              {showOtpInput && verificationStatus === 'sent' && (
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <Clock size={14} />
                  <span>Code expires in 5 minutes</span>
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-[#F7F7F7] rounded-xl border border-[#E5E5E5]">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#555555] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#555555]">
                    <strong>Important:</strong> Check your spam folder if you don't see the verification email.
                    For security reasons, the verification code is valid for 5 minutes only.
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

        {/* Mobile View - Single Column */}
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
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;