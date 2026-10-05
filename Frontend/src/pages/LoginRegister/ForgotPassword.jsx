import React, { useState, useEffect, useRef } from 'react'
import Axios from '../../services/axios'
import { api } from '../../services/endpoints'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Shield,
  Clock,
  Key,
  Mail,
  ChevronRight
} from 'lucide-react'

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP, 3: Password
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timer, setTimer] = useState(0)
  const user = useSelector(state => state.user)
  const navigate = useNavigate()
  
  // Form data
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(new Array(4).fill('')) // 4-digit OTP
  const [password, setPassword] = useState(new Array(6).fill('')) // 6-digit password in boxes
  const [showPassword, setShowPassword] = useState(false)
  
  const otpRefs = useRef([])
  const passwordRefs = useRef([])

  // Timer for OTP resend
  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  useEffect(() => {
    document.title = "Forgot Password - Hamrahi";
  }, [])

  useEffect(() => {
    if(user?.email){
      navigate("/")
    }
  },[user])

  // Initialize refs
  useEffect(() => {
    otpRefs.current = otpRefs.current.slice(0, 4)
    passwordRefs.current = passwordRefs.current.slice(0, 6)
  }, [])

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto focus next input
    if (value && index < 3) {
      setTimeout(() => {
        if (otpRefs.current[index + 1]) {
          otpRefs.current[index + 1].focus()
        }
      }, 10)
    }
    
    // Auto verify if all OTP digits are filled
    if (newOtp.every(digit => digit !== '') && index === 3) {
      setTimeout(() => {
        handleVerifyOtp()
      }, 300)
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setTimeout(() => {
        if (otpRefs.current[index - 1]) {
          otpRefs.current[index - 1].focus()
        }
      }, 10)
    }
    
    // Clear current digit and move to previous on backspace
    if (e.key === 'Backspace' && otp[index] && index > 0) {
      const newOtp = [...otp]
      newOtp[index] = ''
      setOtp(newOtp)
      setTimeout(() => {
        if (otpRefs.current[index - 1]) {
          otpRefs.current[index - 1].focus()
        }
      }, 10)
    }
  }

  // Handle password input changes (6-digit in boxes)
  const handlePasswordChange = (index, value) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return
    
    const newPassword = [...password]
    newPassword[index] = value
    setPassword(newPassword)
    
    // Auto focus next input
    if (value && index < 5) {
      setTimeout(() => {
        if (passwordRefs.current[index + 1]) {
          passwordRefs.current[index + 1].focus()
        }
      }, 10)
    }
    
    // Auto submit if all password digits are filled
    if (newPassword.every(digit => digit !== '') && index === 5) {
      setTimeout(() => {
        handleResetPassword()
      }, 300)
    }
  }

  const handlePasswordKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !password[index] && index > 0) {
      setTimeout(() => {
        if (passwordRefs.current[index - 1]) {
          passwordRefs.current[index - 1].focus()
        }
      }, 10)
    }
    
    // Clear current digit and move to previous on backspace
    if (e.key === 'Backspace' && password[index] && index > 0) {
      const newPassword = [...password]
      newPassword[index] = ''
      setPassword(newPassword)
      setTimeout(() => {
        if (passwordRefs.current[index - 1]) {
          passwordRefs.current[index - 1].focus()
        }
      }, 10)
    }
  }

  // Step 1: Send OTP to phone
  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }
    
    // Validate Indian phone number
    const phoneRegex = /^[6789]\d{9}$/
    if (!phoneRegex.test(phone.trim())) {
      setError('Please enter a valid 10-digit Indian phone number')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await Axios.post(api.user.sendOtpForResetPassword, {
        phone: phone.trim()
      })
      
      if (response.data.success) {
        setSuccess('OTP has been sent to your phone number')
        setTimer(60) // 1 minute timer
        setStep(2)
        
        // Focus first OTP input
        setTimeout(() => {
          if (otpRefs.current[0]) {
            otpRefs.current[0].focus()
          }
        }, 100)
      } else {
        setError(response.data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otp.join('')
    
    if (!otpString.trim()) {
      setError('Please enter the OTP')
      return
    }
    
    if (otpString.trim().length !== 4) {
      setError('OTP must be 4 digits')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await Axios.post(api.user.verifyPhoneOtp, {
        phone: phone.trim(),
        otp: otpString.trim()
      })
      
      if (response.data.success) {
        setSuccess('Phone verified successfully!')
        setStep(3)
        
        // Focus first password input
        setTimeout(() => {
          if (passwordRefs.current[0]) {
            passwordRefs.current[0].focus()
          }
        }, 100)
      } else {
        setError(response.data.message || 'Invalid OTP')
        // Clear OTP on error
        setOtp(new Array(4).fill(''))
        setTimeout(() => {
          if (otpRefs.current[0]) {
            otpRefs.current[0].focus()
          }
        }, 100)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Please try again.')
      // Clear OTP on error
      setOtp(new Array(4).fill(''))
      setTimeout(() => {
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus()
        }
      }, 100)
    } finally {
      setLoading(false)
    }
  }

  
  // Step 3: Reset Password
  const handleResetPassword = async () => {
    const passwordString = password.join('')
    
    if (!passwordString.trim()) {
      setError('Please enter a 6-digit password')
      return
    }
    
    if (passwordString.trim().length !== 6) {
      setError('Password must be 6 digits')
      return
    }
    
  
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await Axios.post(api.user.resetPassword, {
        phone: phone.trim(),
        password: passwordString.trim(),
        otp : otp.join('')
      })
      
      if (response.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...')
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(response.data.message || 'Failed to reset password')
      }
    } catch (err) {
      // console.log(err , "this is error")
      setError(err.response?.data?.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) {
      setError(`Please wait ${timer}s before resending`)
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await Axios.post(api.user.sendPhoneVerificationOtp, {
        phone: phone.trim()
      })
      
      if (response.data.success) {
        setSuccess('New OTP sent to your phone')
        setTimer(60)
      } else {
        setError(response.data.message || 'Failed to resend OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  // Render step 1: Phone input
  const renderPhoneStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Your Password</h2>
        <p className="text-gray-600">
          Enter your phone number to receive a verification code
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-800 bg-white"
              placeholder="9876543210"
              maxLength="10"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            10-digit Indian phone number starting with 6, 7, 8, or 9
          </p>
        </div>
        
        <motion.button
          type="button"
          onClick={handleSendOtp}
          disabled={loading || phone.length !== 10}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
            loading || phone.length !== 10
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-amber-400 hover:shadow-md'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Sending OTP...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Send Verification Code
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </motion.button>
        
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full text-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back to Login
        </button>
      </div>
    </motion.div>
  )

  // Render step 2: OTP verification
  const renderOtpStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify OTP</h2>
        <div className="text-gray-600 mb-3">
          <p className="mb-1">We sent a 4-digit code to</p>
          <p className="text-gray-800 font-medium">+91 {phone}</p>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border border-red-100 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Code expires in
          </div>
          <div className={`text-lg font-mono font-bold ${timer > 30 ? 'text-red-600' : 'text-red-700'}`}>
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
        </div>
        {timer < 30 && timer > 0 && (
          <div className="text-sm text-red-600 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Hurry! Code expiring soon
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            4-digit Verification Code
          </label>
          <div className="flex gap-3 justify-center mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => otpRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white text-gray-800"
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading || timer > 0}
              className={`text-sm ${
                timer > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-500 hover:text-red-600 cursor-pointer'
              } transition-colors inline-flex items-center gap-1`}
            >
              {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code'}
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <motion.button
            type="button"
            onClick={handleVerifyOtp}
            disabled={loading || otp.some(digit => digit === '')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
              loading || otp.some(digit => digit === '')
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-amber-400 hover:shadow-md'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Verifying...
              </span>
            ) : (
              'Verify & Continue'
            )}
          </motion.button>
          
          <button
            type="button"
            onClick={() => {
              setStep(1)
              setOtp(new Array(4).fill(''))
            }}
            className="w-full text-center text-gray-600 hover:text-gray-800 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Use a different phone number
          </button>
        </div>
      </div>
    </motion.div>
  )

  // Render step 3: Password reset
  const renderPasswordStep = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h2>
        <div className="text-gray-600 mb-3">
          <p>Create a 6-digit numeric password</p>
        </div>
        
        {/* Phone verification status */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Phone Verified: +91 {phone}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            6-digit Password
          </label>
          <div className="flex gap-2 justify-center mb-4">
            {password.map((digit, index) => (
              <input
                key={index}
                ref={el => passwordRefs.current[index] = el}
                type={showPassword ? "text" : "password"}
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handlePasswordChange(index, e.target.value)}
                onKeyDown={(e) => handlePasswordKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all bg-white text-gray-800"
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              {showPassword ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Password
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Show Password
                </>
              )}
            </button>
          </div>
          
          {/* Password strength indicator */}
          {password.some(digit => digit !== '') && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Digits Entered: {password.filter(digit => digit !== '').length}/6
                </span>
                <span className={`text-xs font-medium ${
                  password.filter(digit => digit !== '').length === 6
                    ? 'text-green-600'
                    : password.filter(digit => digit !== '').length >= 4
                      ? 'text-amber-600'
                      : 'text-red-600'
                }`}>
                  {password.filter(digit => digit !== '').length === 6
                    ? 'Complete'
                    : password.filter(digit => digit !== '').length >= 4
                      ? 'Medium'
                      : 'Weak'}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(password.filter(digit => digit !== '').length / 6) * 100}%`
                  }}
                  className={`h-full ${
                    password.filter(digit => digit !== '').length === 6
                      ? 'bg-green-500'
                      : password.filter(digit => digit !== '').length >= 4
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          )}
          
          {/* Password tips */}
         
        </div>
        
        <div className="space-y-3">
          <motion.button
            type="button"
            onClick={handleResetPassword}
            disabled={loading || password.some(digit => digit === '')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
              loading || password.some(digit => digit === '')
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-400 hover:shadow-md'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Resetting Password...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Reset Password
                <CheckCircle className="w-4 h-4" />
              </span>
            )}
          </motion.button>
          
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full text-center text-gray-600 hover:text-gray-800 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to OTP verification
          </button>
        </div>
      </div>
    </motion.div>
  )

  // Render progress indicator
  const renderProgress = () => (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-center">
        {[1, 2, 3].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${step > stepNumber ? 'bg-gradient-to-r from-red-500 to-amber-400 text-white' : 
                  step === stepNumber ? 'border-2 border-red-500 text-red-500' :
                  'border-2 border-gray-300 text-gray-400'}
                transition-all duration-300
              `}>
                {step > stepNumber ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`
                text-xs mt-2 font-medium
                ${step >= stepNumber ? 'text-gray-800' : 'text-gray-400'}
              `}>
                {stepNumber === 1 ? 'Phone' : stepNumber === 2 ? 'OTP' : 'Password'}
              </span>
            </div>
            
            {stepNumber < 3 && (
              <div className="w-16 h-1 mx-2">
                <div className={`
                  h-full rounded-full transition-all duration-500
                  ${step > stepNumber ? 'bg-gradient-to-r from-red-500 to-amber-400' : 'bg-gray-300'}
                `}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Secure your account with a new password
          </p>
        </div>
        
        {/* Progress Indicator */}
        {renderProgress()}
        
        {/* Error/Success Messages */}
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {error && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}
            
            {success && (
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">{success}</div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {step === 1 && renderPhoneStep()}
          {step === 2 && renderOtpStep()}
          {step === 3 && renderPasswordStep()}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <button
              onClick={() => navigate('/contact')}
              className="text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              Contact Support
            </button>
          </p>
          
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Your information is secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword