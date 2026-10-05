import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  Calendar,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Save,
  Globe,
  MapPin
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { api } from '../../services/endpoints';
import { setUserDetails } from '../../store/userReducer';
import Axios from '../../services/axios';

const EditBasicDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state?.user);
  
  // Form state - Updated with new fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: 'male',
    language: '',
    location: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [age, setAge] = useState(null);

  // Language options
  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'other', label: 'Other' }
  ];

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  // Calculate age from date
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    
    return calculatedAge;
  };

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      const initialData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        gender: userData.gender || 'male',
        language: userData.language || '',
        location: userData.location || userData.currentLocation?.city || ''
      };
      
      setFormData(initialData);
      
      // Calculate initial age if date exists
      if (initialData.dateOfBirth) {
        const initialAge = calculateAge(initialData.dateOfBirth);
        setAge(initialAge);
      }
    }
  }, [userData]);

  // Validate date of birth (must be 18+)
  const validateDateOfBirth = (date) => {
    const calculatedAge = calculateAge(date);
    
    if (calculatedAge < 18) {
      return { valid: false, message: 'You must be at least 18 years old' };
    }
    return { valid: true, message: '' };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {  
      newErrors.email = 'Please enter a valid Email';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dateValidation = validateDateOfBirth(formData.dateOfBirth);
      if (!dateValidation.valid) {
        newErrors.dateOfBirth = dateValidation.message;
      }
    }
    
    // Language and location are optional, no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle date of birth blur
  const handleDateBlur = () => {
    if (formData.dateOfBirth) {
      const dateValidation = validateDateOfBirth(formData.dateOfBirth);
      const calculatedAge = calculateAge(formData.dateOfBirth);
      setAge(calculatedAge);
      
      if (!dateValidation.valid) {
        setErrors(prev => ({
          ...prev,
          dateOfBirth: dateValidation.message
        }));
      } else {
        // Clear any existing date error
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dateOfBirth;
          return newErrors;
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    setSuccess('');
    
    try {
      const response = await Axios.post(api.user.editBasicDetails, {
        ...formData
      });
      
      if (response.data.success) {
        // Update Redux store
        dispatch(setUserDetails(response.data.user));
        
        setSuccess('Basic details updated successfully!');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/my-profile');
        }, 2000);
      } else {
        setErrors({ general: response.data.message || 'Update failed' });
      }
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E10600] mx-auto"></div>
          <p className="mt-4 text-[#555555]">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E5E5E5] bg-white sticky top-0 z-10">
        <div className="px-6 py-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/my-profile')}
                className="p-2 hover:bg-[#F7F7F7] rounded-lg text-[#555555] transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#111111]">Edit Basic Details</h1>
                <p className="text-sm text-[#555555] mt-1">
                  Update your personal information
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <Shield size={14} className="text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Verified Account
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-8 max-w-4xl mx-auto">
        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 border border-green-200 bg-green-50 rounded-xl flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-800 font-medium">{success}</p>
                <p className="text-xs text-green-700 mt-1">
                  Redirecting to profile...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* General Error */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 border border-red-200 bg-red-50 rounded-xl flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{errors.general}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Details Card */}
            <motion.form
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
            >
              <div className="border-b border-[#E5E5E5] px-6 py-4 bg-[#F7F7F7]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E10600] rounded-lg">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#111111]">
                      Basic Information
                    </h3>
                    <p className="text-sm text-[#555555]">
                      Update your personal details
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* First Name & Last Name Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                        <User size={16} />
                        First Name
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border ${
                            errors.firstName 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-[#E5E5E5] focus:ring-[#E10600] focus:border-[#E10600]'
                          } rounded-lg outline-none transition-all bg-white text-[#111111] placeholder-[#B8B8B8]`}
                          placeholder="Enter your first name"
                        />
                        {formData.firstName && !errors.firstName && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle size={16} className="text-green-500" />
                          </div>
                        )}
                      </div>
                      {errors.firstName && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.firstName}
                        </motion.p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                        <User size={16} />
                        Last Name
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border ${
                            errors.lastName 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-[#E5E5E5] focus:ring-[#E10600] focus:border-[#E10600]'
                          } rounded-lg outline-none transition-all bg-white text-[#111111] placeholder-[#B8B8B8]`}
                          placeholder="Enter your last name"
                        />
                        {formData.lastName && !errors.lastName && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <CheckCircle size={16} className="text-green-500" />
                          </div>
                        )}
                      </div>
                      {errors.lastName && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.lastName}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                      <Phone size={16} />
                      Email 
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border ${
                          errors.email 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-[#E5E5E5] focus:ring-[#E10600] focus:border-[#E10600]'
                        } rounded-lg outline-none transition-all bg-white text-[#111111] placeholder-[#B8B8B8]`}
                        placeholder="example@email.com"
                      />
                      {formData.email && validateEmail(formData.email) && !errors.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle size={16} className="text-green-500" />
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-red-600 flex items-center gap-1"
                      >
                        <AlertCircle size={14} />
                        {errors.email}
                      </motion.p>
                    )}
                    {formData.email && validateEmail(formData.email) && !errors.email && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} />
                        Valid email format
                      </p>
                    )}
                  </div>

                  {/* Date of Birth & Gender Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                        <Calendar size={16} />
                        Date of Birth
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={(e) => {handleChange(e); validateDateOfBirth(e.target.value)}}
                          onBlur={handleDateBlur}
                          max={new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0]}
                          className={`w-full px-4 py-3 border ${
                            errors.dateOfBirth 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-[#E5E5E5] focus:ring-[#E10600] focus:border-[#E10600]'
                          } rounded-lg outline-none transition-all bg-white text-[#111111] placeholder-[#B8B8B8]`}
                        />
                       
                      </div>
                      {errors.dateOfBirth ? (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {errors.dateOfBirth}
                        </motion.p>
                      ) : formData.dateOfBirth && (
                        <p className="text-sm text-[#555555]">
                          Age: {age} years
                          {age >= 18 ? (
                            <span className="text-green-600 ml-2 flex items-center gap-1">
                              <CheckCircle size={12} />
                              Eligible
                            </span>
                          ) : (
                            <span className="text-red-600 ml-2 flex items-center gap-1">
                              <AlertCircle size={12} />
                              Not eligible (must be 18+)
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-[#555555]">
                        <User size={16} />
                        Gender
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {genderOptions.map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-all ${
                              formData.gender === option.value
                                ? 'border-[#E10600] bg-red-50 text-[#E10600]'
                                : 'border-[#E5E5E5] hover:border-[#B8B8B8] text-[#555555]'
                            }`}
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={option.value}
                              checked={formData.gender === option.value}
                              onChange={handleChange}
                              className="hidden"
                            />
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                 

                  {/* Submit Button */}
                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3.5 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                        loading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-[#E10600] text-white hover:bg-[#C10600] active:bg-[#A10400]'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                    
                    <button
                      type="button"
                      onClick={() => navigate('/my-profile')}
                      className="w-full mt-3 py-2.5 text-center text-[#555555] hover:text-[#111111] text-sm font-medium hover:bg-[#F7F7F7] rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.form>
          </div>

          {/* Right Column - Info & Requirements */}
          <div className="space-y-6">
            {/* Requirements Card */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#E10600] rounded-lg">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111111]">
                    Requirements
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-[#F7F7F7] rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">!</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111111] mb-1">
                        Age Requirement
                      </div>
                      <div className="text-xs text-[#555555]">
                        Must be 18 years or older to use our services
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#F7F7F7] rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone size={12} className="text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111111] mb-1">
                        Email Verification
                      </div>
                      <div className="text-xs text-[#555555]">
                        Valid email required for account verification
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#F7F7F7] rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle size={12} className="text-green-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111111] mb-1">
                        Real Information
                      </div>
                      <div className="text-xs text-[#555555]">
                        Please provide accurate and up-to-date information
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Current Information Card */}
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#111111] mb-4">
                  Current Information
                </h3>

                <div className="space-y-4">
                  <div className="p-3 bg-[#F7F7F7] rounded-lg">
                    <div className="text-sm font-medium text-[#555555] mb-1">
                      Email Address
                    </div>
                    <div className="text-[#111111] font-medium">
                      {userData.email}
                    </div>
                    {userData.emailVerified && (
                      <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                        <CheckCircle size={12} />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-[#F7F7F7] rounded-lg">
                    <div className="text-sm font-medium text-[#555555] mb-1">
                      Account Status
                    </div>
                    <div className="text-[#111111] font-medium capitalize">
                      {userData.isActive ? 'Active' : 'Inactive'}
                    </div>
                    {userData.isVerified === 'verified' && (
                      <div className="flex items-center gap-1 mt-1 text-green-600 text-xs">
                        <Shield size={12} />
                        <span>Verified Account</span>
                      </div>
                    )}
                  </div>

                  
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBasicDetails;