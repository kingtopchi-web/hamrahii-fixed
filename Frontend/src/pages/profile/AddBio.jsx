import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Edit2, 
  Save, 
  X, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Sparkles,
  Quote,
  Smile,
  Award,
  Globe,
  BookOpen,
  Type,
  TrendingUp,
  Users,
  Eye,
  MessageCircle,
  Star,
  Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { toast } from 'react-toastify';
import { setUserDetails } from '../../store/userReducer';

const AddBio = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.user || {});
  
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [originalBio, setOriginalBio] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const MAX_CHARS = 800;
  const MIN_CHARS = 20;

  // Sample bio suggestions
  const bioSuggestions = [
    {
      id: 1,
      text: "Tech enthusiast and travel lover. Always up for road trips and meeting new people on the way!",
      category: "casual",
      icon: <Smile className="w-4 h-4" />
    },
    {
      id: 2,
      text: "Professional with a passion for long drives. Love good music and interesting conversations.",
      category: "professional",
      icon: <Award className="w-4 h-4" />
    },
    {
      id: 3,
      text: "Adventure seeker and photography enthusiast. Enjoy connecting with fellow travelers.",
      category: "adventurous",
      icon: <Compass className="w-4 h-4" />
    },
    {
      id: 4,
      text: "Reliable driver with 5+ years of experience. Committed to safe and comfortable journeys.",
      category: "reliable",
      icon: <Star className="w-4 h-4" />
    },
    {
      id: 5,
      text: "Music lover and coffee enthusiast. Looking forward to sharing rides and stories.",
      category: "friendly",
      icon: <MessageCircle className="w-4 h-4" />
    }
  ];

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
    const loadUserBio = () => {
      if (user?._id) {
        setLoading(true);
        const userBio = user?.bio || '';
        setBio(userBio);
        setOriginalBio(userBio);
        setCharCount(userBio.length);
        setLoading(false);
      } else {
        toast.error('Please login to edit bio');
        navigate('/login');
      }
    };

    loadUserBio();
  }, [user, navigate]);

  useEffect(() => {
    if (bio.length >= 10) {
      const matchingSuggestions = bioSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(bio.toLowerCase().substring(0, 20))
      );
      setSuggestions(matchingSuggestions);
      setShowSuggestions(matchingSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [bio]);

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setBio(value);
      setCharCount(value.length);
    }
  };

  const handleSave = async () => {
    if (!user?._id) {
      toast.error('User ID is required');
      return;
    }

    if (bio.length < MIN_CHARS) {
      toast.error(`Bio must be at least ${MIN_CHARS} characters`);
      return;
    }

    if (bio === originalBio) {
      toast.info('No changes detected');
      return;
    }

    setSaving(true);
    try {
      const res = await Axios.post(api.user.addBio, { bio: bio });

      if (res.data?.success) {
        toast.success('Bio updated successfully!');
        setOriginalBio(bio);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        if (res.data?.data) {
          dispatch(setUserDetails(res?.data?.data));
        }
        
        setTimeout(() => {
          navigate("/my-profile");
        }, 1500);
      } else {
        toast.error(res.data?.message || 'Failed to update bio');
      }
    } catch (error) {
      // console.error('Error updating bio:', error);
      toast.error(error.response?.data?.message || 'Failed to update bio');
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setBio(suggestionText);
    setCharCount(suggestionText.length);
    setShowSuggestions(false);
  };

  const resetToOriginal = () => {
    setBio(originalBio);
    setCharCount(originalBio.length);
  };

  const clearBio = () => {
    setBio('');
    setCharCount(0);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  const hasChanges = bio !== originalBio;
  const isValid = bio.length >= MIN_CHARS && bio.length <= MAX_CHARS;
  const charCountPercentage = (charCount / MAX_CHARS) * 100;

  // Get progress bar color based on character count
  const getProgressColor = () => {
    if (charCount < MIN_CHARS) return 'bg-red-500';
    if (charCount < 100) return 'bg-yellow-500';
    if (charCount < MAX_CHARS - 50) return 'bg-green-500';
    return 'bg-red-500';
  };

  // Get character count message
  const getCharCountMessage = () => {
    if (charCount === 0) return 'Start typing your bio...';
    if (charCount < MIN_CHARS) return `${MIN_CHARS - charCount} more characters needed`;
    if (charCount > MAX_CHARS - 20) return `${MAX_CHARS - charCount} characters left`;
    return `${charCount}/${MAX_CHARS} characters`;
  };

  // Responsive textarea height
  const getTextareaHeight = () => {
    if (window.innerWidth < 640) return 'h-48'; // Mobile
    if (window.innerWidth < 1024) return 'h-56'; // Tablet
    return 'h-64'; // Desktop
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/30 via-white to-blue-50/20 py-4 sm:py-6 lg:py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/10 rounded-full blur-2xl sm:blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 sm:-right-40 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-tr from-indigo-200/10 to-purple-200/10 rounded-full blur-2xl sm:blur-3xl" />
      </div>

      {/* Success Notification - Responsive */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 sm:top-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md mx-auto sm:mx-0"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl flex items-center gap-2 sm:gap-3">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm sm:text-base truncate">Bio Updated!</div>
                <div className="text-xs sm:text-sm opacity-90 truncate">Your bio has been saved successfully</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
        {/* Header with Back Button - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 lg:mb-10"
        >
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>

          <div className="text-center px-2 sm:px-0">
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
              >
                <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                  Your <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Personal Bio</span>
                </h1>
                <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base max-w-2xl mx-auto px-2">
                  Tell others about yourself and what makes you a great travel companion
                </p>
              </div>
            </div>

            {/* Stats - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 max-w-3xl mx-auto mb-6 sm:mb-8">
              {[
                { icon: <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />, title: "Better Connections", desc: "Connect with travelers" },
                { icon: <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />, title: "Increased Trust", desc: "Build credibility" },
                { icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />, title: "More Rides", desc: "Get selected more" },
                { icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />, title: "Global Network", desc: "Join community" }
              ].map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-gray-200/50 shadow-sm">
                  <div className="flex flex-col items-center justify-center gap-1 sm:gap-2">
                    {stat.icon}
                    <div className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 text-center line-clamp-2">{stat.title}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 text-center line-clamp-2">{stat.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 p-4 sm:p-6 lg:p-8 shadow-lg"
        >
          {/* Header with Save Button - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Craft Your Story</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base line-clamp-2">
                Share your interests, travel style, and what you're looking for in a ride companion
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-3 sm:mt-0">
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
                >
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Unsaved Changes</span>
                </motion.div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={!hasChanges || !isValid || saving}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all text-sm sm:text-base ${
                  hasChanges && isValid
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">Save</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Save Bio</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <Loader className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 animate-spin mb-3 sm:mb-4" />
              <div className="text-gray-600 text-sm sm:text-base">Loading your profile...</div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Bio Editor */}
              <motion.div
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 sm:p-6 border-2 border-gray-200/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                      <Edit2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Write Your Bio</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Share something interesting about yourself</p>
                    </div>
                  </div>
                  <div className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium self-start sm:self-center">
                    {charCount} chars
                  </div>
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={bio}
                    onChange={handleBioChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Example: Adventure enthusiast and music lover. I've traveled across 20+ countries and love sharing stories. Looking for pleasant company and smooth rides..."
                    className={`w-full ${getTextareaHeight()} p-3 sm:p-4 lg:p-6 text-gray-800 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-200/50 transition-all resize-none shadow-sm text-sm sm:text-base`}
                    maxLength={MAX_CHARS}
                  />
                  
                  {/* Character Count Progress */}
                  <div className="mt-3 sm:mt-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <div className={`text-xs sm:text-sm font-medium ${
                        charCount < MIN_CHARS ? 'text-red-600' : 
                        charCount > MAX_CHARS ? 'text-red-600' : 
                        'text-gray-700'
                      }`}>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{getCharCountMessage()}</span>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 text-right">
                        {charCount}/{MAX_CHARS}
                      </div>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${getProgressColor()}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(charCountPercentage, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Keyboard Shortcut Hint */}
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <span className="hidden sm:inline">Press</span>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl/Cmd</kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd>
                    <span>to save</span>
                  </div>

                  {/* Validation Messages */}
                  <AnimatePresence>
                    {charCount > 0 && charCount < MIN_CHARS && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 flex items-start gap-1.5 sm:gap-2 text-red-600 text-xs sm:text-sm"
                      >
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                        <span>Bio should be at least {MIN_CHARS} characters for a meaningful introduction</span>
                      </motion.div>
                    )}
                    
                    {charCount >= MIN_CHARS && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-start gap-1.5 sm:gap-2 text-green-600 text-xs sm:text-sm"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                        <span>Great! Your bio is now meaningful enough</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearBio}
                    disabled={bio.length === 0}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                      bio.length > 0
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    Clear
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetToOriginal}
                    disabled={!hasChanges}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                      hasChanges
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    Reset
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 hover:from-blue-100 hover:to-cyan-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    Suggestions
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTips(!showTips)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 hover:from-green-100 hover:to-emerald-100 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ml-auto"
                  >
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    {showTips ? 'Hide Tips' : 'Show Tips'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Bio Suggestions - Collapsible */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-xl p-4 sm:p-6 border-2 border-indigo-200/50 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Bio Suggestions</h3>
                          <p className="text-gray-600 text-xs sm:text-sm">Try one of these pre-written bios</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowSuggestions(false)}
                        className="p-1.5 sm:p-2 hover:bg-white/50 rounded-lg self-end"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                      {bioSuggestions.map((suggestion) => (
                        <motion.button
                          key={suggestion.id}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSuggestionClick(suggestion.text)}
                          className="p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 text-left hover:border-indigo-300 hover:shadow-sm transition-all text-sm sm:text-base"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {suggestion.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-800 mb-2 line-clamp-3">{suggestion.text}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full">
                                  {suggestion.category}
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-500">
                                  {suggestion.text.length} chars
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>


              {/* Preview Section */}
              {bio.length >= MIN_CHARS && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-xl p-4 sm:p-6 border-2 border-amber-200/50"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Bio Preview</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">How your bio will appear to others</p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-inner">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm sm:text-lg lg:text-xl flex-shrink-0">
                        {user?.firstName?.[0]?.toUpperCase() + user?.lastName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 truncate">
                          {user?.firstName + " " + user?.lastName || 'Your Name'}
                        </div>
                        <div className="text-gray-700 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-4 sm:line-clamp-5">
                          {bio}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Footer Actions - Responsive */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 sm:mt-8 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200"
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>A good bio increases your chances of getting selected by 70%</span>
                  </div>
                </div>
                
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(-1)}
                    className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:border-gray-400 transition-all text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={!hasChanges || !isValid || saving}
                    className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all text-xs sm:text-sm flex-1 sm:flex-none ${
                      hasChanges && isValid
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 animate-spin" />
                        <span className="hidden sm:inline">Saving Bio...</span>
                        <span className="sm:hidden">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                        <span className="hidden sm:inline">Save & Update</span>
                        <span className="sm:hidden">Save</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Mobile Bottom Navigation */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 z-40">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 text-gray-700 text-sm flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={!hasChanges || !isValid || saving}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${
                hasChanges && isValid
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {saving ? 'Saving...' : 'Save Bio'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBio;