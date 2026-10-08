import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  CheckCircle, 
  X, 
  Save, 
  Music, 
  Coffee, 
  PawPrint, 
  MessageSquare, 
  Package,
  Shield,
  User,
  AlertCircle,
  Loader,
  Sparkles,
  Headphones,
  Volume2,
  VolumeX,
  Smile,
  Frown,
  Meh,
  Truck,
  ChevronRight,
  ArrowLeft,
  Filter
} from 'lucide-react';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails } from '../../store/userReducer';

const EditPreference = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.user || {});
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [originalPreferences, setOriginalPreferences] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  useEffect(() => {
    if (user?._id) {
      // Initialize preferences from user data
      const initialPrefs = {
        smoking: user?.preferences?.smoking || 'not-allowed',
        music: user?.preferences?.music || 'allowed',
        pets: user?.preferences?.pets || 'not-allowed',
        conversation: user?.preferences?.conversation || 'neutral',
        luggageSpace: user?.preferences?.luggageSpace || {
          small: true,
          medium: true,
          large: false
        }
      };
      
      setPreferences(initialPrefs);
      setOriginalPreferences(JSON.parse(JSON.stringify(initialPrefs)));
    } else {
      toast.error('Please login to edit preferences');
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePreferenceChange = (category, value) => {
    if (!preferences) return;
    
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleLuggageChange = (size) => {
    if (!preferences) return;
    
    setPreferences(prev => ({
      ...prev,
      luggageSpace: {
        ...prev.luggageSpace,
        [size]: !prev.luggageSpace[size]
      }
    }));
  };

  const handleSave = async () => {
    if (!user?._id) {
      toast.error('User ID is required');
      return;
    }

    if (!preferences) {
      toast.error('No preferences to save');
      return;
    }

    setSaving(true);
    try {
      const res = await Axios.post(api.user.editPreferences, {
        ...preferences
      });

      if (res.data?.success) {
        toast.success('Preferences updated successfully!');
        setOriginalPreferences(JSON.parse(JSON.stringify(preferences)));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Update Redux store with new user data
        if (res.data?.user) {
          dispatch(setUserDetails(res.data.user));
        }
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate("/my-profile");
        }, 1500);
      } else {
        toast.error(res.data?.message || 'Failed to update preferences');
      }
    } catch (error) {
      // console.error('Error updating preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    const defaultPrefs = {
      smoking: 'not-allowed',
      music: 'allowed',
      pets: 'not-allowed',
      conversation: 'neutral',
      luggageSpace: {
        small: true,
        medium: true,
        large: false
      }
    };
    setPreferences(defaultPrefs);
  };

  const resetToOriginal = () => {
    if (originalPreferences) {
      setPreferences(JSON.parse(JSON.stringify(originalPreferences)));
    }
  };

  const hasChanges = preferences && originalPreferences 
    ? JSON.stringify(preferences) !== JSON.stringify(originalPreferences)
    : false;

  // Preference options
  const preferenceOptions = {
    smoking: [
      { value: 'allowed', label: 'Allowed', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
      { value: 'not-allowed', label: 'Not Allowed', icon: X, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    ],
    music: [
      { value: 'allowed', label: 'Allowed', icon: Volume2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      { value: 'not-allowed', label: 'Not Allowed', icon: VolumeX, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-[var(--border-subtle)]' }
    ],
    pets: [
      { value: 'allowed', label: 'Allowed', icon: PawPrint, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      { value: 'not-allowed', label: 'Not Allowed', icon: X, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
    ],
    conversation: [
      { value: 'preferred', label: 'Preferred', icon: Smile, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
      { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
      { value: 'quiet', label: 'Quiet Ride', icon: Frown, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' }
    ]
  };

  // Luggage sizes
  const luggageSizes = [
    { size: 'small', label: 'Small Bag', icon: Package, description: 'Backpack, laptop bag', max: 'Up to 5kg' },
    { size: 'medium', label: 'Medium Bag', icon: Package, description: 'Cabin luggage, duffle bag', max: 'Up to 15kg' },
    { size: 'large', label: 'Large Bag', icon: Truck, description: 'Suitcase, travel bag', max: 'Up to 25kg' }
  ];

  // Filter categories for tabs
  const categories = {
    all: ['smoking', 'music', 'pets', 'conversation', 'luggageSpace'],
    comfort: ['smoking', 'music', 'conversation'],
    logistics: ['pets', 'luggageSpace']
  };

  const getFilteredPreferences = () => {
    if (activeTab === 'all') return Object.keys(categories).flatMap(key => categories[key]);
    return categories[activeTab];
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // If preferences are not loaded yet, show loading
  if (!preferences && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50/30 via-white to-red-50/20 py-8 flex items-center justify-center">
        <Loader className="w-12 h-12 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/30 via-white to-red-50/20 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-br from-red-200/20 to-orange-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gradient-to-tr from-blue-200/10 to-purple-200/10 rounded-full blur-3xl" />
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-6 right-6 z-50"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <div className="font-bold">Preferences Updated!</div>
                <div className="text-sm opacity-90">Your changes have been saved successfully</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            
            
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg"
              >
                <Settings className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Edit Your <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Preferences</span>
                </h1>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                  Customize your ride experience to match your travel style and comfort
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <div className="bg-[var(--bg-surface)]/80 backdrop-blur-sm rounded-xl p-4 border border-[var(--border-subtle)]/50 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">Better Matches</div>
                <div className="text-sm text-gray-600">Find compatible riders</div>
              </div>
              <div className="bg-[var(--bg-surface)]/80 backdrop-blur-sm rounded-xl p-4 border border-[var(--border-subtle)]/50 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">Comfortable Rides</div>
                <div className="text-sm text-gray-600">Personalized experience</div>
              </div>
              <div className="bg-[var(--bg-surface)]/80 backdrop-blur-sm rounded-xl p-4 border border-[var(--border-subtle)]/50 shadow-sm">
                <div className="text-2xl font-bold text-gray-900">Save Time</div>
                <div className="text-sm text-gray-600">Quick booking process</div>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Main Content */}
        <div className="">
       
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-[var(--bg-surface)]/90 backdrop-blur-sm rounded-2xl border border-[var(--border-subtle)]/50 p-6 lg:p-8 shadow-lg">
              {/* Header with Save Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Customize Your Ride Experience</h2>
                  <p className="text-gray-600 mt-2">
                    Select your preferences to find the perfect ride matches
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-orange-50 text-red-700 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Unsaved Changes
                    </motion.div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
                      hasChanges
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:shadow-red-500/30'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Preferences
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader className="w-12 h-12 text-red-500 animate-spin mb-4" />
                  <div className="text-gray-600">Loading your preferences...</div>
                </div>
              ) : (
                <motion.div
                  variants={staggerChildren}
                  initial="initial"
                  animate="animate"
                  className="space-y-8"
                >
                  {/* Smoking Preference */}
                  {getFilteredPreferences().includes('smoking') && (
                    <motion.div variants={fadeInUp} className="bg-gray-50/50 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <Coffee className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Smoking</h3>
                            <p className="text-gray-600">Choose your smoking preference</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full text-sm font-medium">
                          Comfort
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {preferenceOptions.smoking.map(option => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePreferenceChange('smoking', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                              preferences?.smoking === option.value
                                ? `${option.bg} ${option.border} border-2 scale-[1.02]`
                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg ${option.bg} flex items-center justify-center`}>
                              <option.icon className={`w-5 h-5 ${option.color}`} />
                            </div>
                            <div className="text-left">
                              <div className={`font-bold ${preferences?.smoking === option.value ? option.color : 'text-gray-900'}`}>
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {option.value === 'allowed' ? 'Smoking is permitted' : 'No smoking allowed'}
                              </div>
                            </div>
                            {preferences?.smoking === option.value && (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Music Preference */}
                  {getFilteredPreferences().includes('music') && (
                    <motion.div variants={fadeInUp} className="bg-gray-50/50 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                            <Music className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Music</h3>
                            <p className="text-gray-600">Audio preferences during the ride</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-sm font-medium">
                          Entertainment
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {preferenceOptions.music.map(option => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePreferenceChange('music', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                              preferences?.music === option.value
                                ? `${option.bg} ${option.border} border-2 scale-[1.02]`
                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg ${option.bg} flex items-center justify-center`}>
                              <option.icon className={`w-5 h-5 ${option.color}`} />
                            </div>
                            <div className="text-left">
                              <div className={`font-bold ${preferences?.music === option.value ? option.color : 'text-gray-900'}`}>
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {option.value === 'allowed' ? 'Music is allowed' : 'No music preferred'}
                              </div>
                            </div>
                            {preferences?.music === option.value && (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Pets Preference */}
                  {getFilteredPreferences().includes('pets') && (
                    <motion.div variants={fadeInUp} className="bg-gray-50/50 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                            <PawPrint className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Pets</h3>
                            <p className="text-gray-600">Pet travel preferences</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full text-sm font-medium">
                          Animal Policy
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {preferenceOptions.pets.map(option => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePreferenceChange('pets', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                              preferences?.pets === option.value
                                ? `${option.bg} ${option.border} border-2 scale-[1.02]`
                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg ${option.bg} flex items-center justify-center`}>
                              <option.icon className={`w-5 h-5 ${option.color}`} />
                            </div>
                            <div className="text-left">
                              <div className={`font-bold ${preferences?.pets === option.value ? option.color : 'text-gray-900'}`}>
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-500">
                                {option.value === 'allowed' ? 'Pets are welcome' : 'No pets allowed'}
                              </div>
                            </div>
                            {preferences?.pets === option.value && (
                              <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Conversation Preference */}
                  {getFilteredPreferences().includes('conversation') && (
                    <motion.div variants={fadeInUp} className="bg-gray-50/50 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Conversation</h3>
                            <p className="text-gray-600">Social interaction preference</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full text-sm font-medium">
                          Social
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {preferenceOptions.conversation.map(option => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePreferenceChange('conversation', option.value)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                              preferences?.conversation === option.value
                                ? `${option.bg} ${option.border} border-2 scale-[1.02]`
                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-lg ${option.bg} flex items-center justify-center`}>
                              <option.icon className={`w-6 h-6 ${option.color}`} />
                            </div>
                            <div className="text-center">
                              <div className={`font-bold ${preferences?.conversation === option.value ? option.color : 'text-gray-900'}`}>
                                {option.label}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {option.value === 'preferred' && 'Enjoy conversations'}
                                {option.value === 'neutral' && 'Either is fine'}
                                {option.value === 'quiet' && 'Prefer quiet ride'}
                              </div>
                            </div>
                            {preferences?.conversation === option.value && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Luggage Space Preference */}
                  {getFilteredPreferences().includes('luggageSpace') && (
                    <motion.div variants={fadeInUp} className="bg-gray-50/50 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Luggage Space</h3>
                            <p className="text-gray-600">Select what luggage sizes you can accommodate</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 rounded-full text-sm font-medium">
                          Storage
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {luggageSizes.map(item => (
                          <motion.button
                            key={item.size}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleLuggageChange(item.size)}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                              preferences?.luggageSpace?.[item.size]
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 scale-[1.02]'
                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-lg ${
                              preferences?.luggageSpace?.[item.size] 
                                ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                                : 'bg-gray-100'
                            } flex items-center justify-center`}>
                              <item.icon className={`w-6 h-6 ${
                                preferences?.luggageSpace?.[item.size] ? 'text-green-600' : 'text-gray-400'
                              }`} />
                            </div>
                            <div className="text-center">
                              <div className={`font-bold ${
                                preferences?.luggageSpace?.[item.size] ? 'text-green-700' : 'text-gray-900'
                              }`}>
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                              <div className="text-xs font-medium text-gray-600 mt-2">{item.max}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                preferences?.luggageSpace?.[item.size] ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              <span className="text-sm font-medium">
                                {preferences?.luggageSpace?.[item.size] ? 'Available' : 'Not Available'}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Footer Actions */}
              {!loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 pt-8 border-t border-[var(--border-subtle)]"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Your preferences help us find better matches
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-[var(--bg-surface)] border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-all"
                      >
                        Cancel
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className={`px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
                          hasChanges
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-xl hover:shadow-red-500/30'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {saving ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save All Preferences
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditPreference;