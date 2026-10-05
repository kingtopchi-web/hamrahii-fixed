import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Star, Clock, Award, Car, Shield, 
  Wallet, HelpCircle, FileText, Bell, Settings, LogOut, Heart, Search, Gift, ChevronRight, Zap, CheckCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProfileOverview = () => {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();

  const userName = user?.firstName || 'User';
  const balance = user?.wallet?.balance || 0;
  const virtualBalance = user?.virtualMoney?.balance || 0;
  const trustScore = user?.trustScore || 0;
  const isVerified = user?.isVerified === "verified" || user?.isVerified === "review";

  const stats = [
    { icon: Car, label: 'Total Rides', value: '0', subtitle: 'Journeys made', color: 'from-blue-500 to-cyan-400' },
    { icon: Wallet, label: 'Wallet Balance', value: `₹${balance}`, subtitle: 'Available funds', color: 'from-emerald-500 to-teal-400' },
    { icon: Gift, label: 'Hamrahi Coins', value: `${virtualBalance}`, subtitle: 'Reward points', color: 'from-purple-500 to-pink-500' },
    { icon: Shield, label: 'Trust Score', value: `${trustScore}%`, subtitle: 'Profile credibility', color: 'from-amber-500 to-orange-400' },
  ];

  const quickActions = [
    { icon: Search, label: 'Find a Ride', color: 'text-blue-600', bg: 'bg-blue-50', link: '/find-ride' },
    { icon: Car, label: 'Offer a Ride', color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/offer-ride' },
    { icon: Wallet, label: 'Add Money', color: 'text-purple-600', bg: 'bg-purple-50', link: '/profile/wallet' },
    { icon: Shield, label: 'Verify Profile', color: 'text-amber-600', bg: 'bg-amber-50', link: '/profile/verify-id' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 lg:space-y-8 pb-8"
    >
      {/* Hero Welcome Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 shadow-xl shadow-red-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-white/80 text-lg max-w-lg">
              Ready for your next journey? Find rides, share costs, and travel smarter with Hamrahi.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/find-ride')}
              className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Find a Ride
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/offer-ride')}
              className="px-6 py-3 bg-black/20 text-white border border-white/30 font-bold rounded-xl hover:bg-black/30 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <Car size={18} />
              Offer a Ride
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              {/* Decorative gradient blur in background */}
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300`} />
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-extrabold text-gray-900">{stat.value}</h3>
                  <p className="text-xs text-gray-400 mt-2 font-medium">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Verification Status */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden h-full">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${isVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {isVerified ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Profile Status</h3>
                <p className="text-sm text-gray-500">
                  {isVerified ? 'Your profile is verified and trusted.' : 'Complete your verification to get more rides.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user?.phoneVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                    <CheckCircle size={20} />
                  </div>
                  <span className="font-semibold text-gray-700">Phone Verification</span>
                </div>
                {user?.phoneVerified ? (
                  <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">Verified</span>
                ) : (
                  <button onClick={() => navigate('/profile/verify-phone')} className="text-blue-600 hover:underline font-bold text-sm">Verify Now</button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user?.emailVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                    <CheckCircle size={20} />
                  </div>
                  <span className="font-semibold text-gray-700">Email Verification</span>
                </div>
                {user?.emailVerified ? (
                  <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">Verified</span>
                ) : (
                  <button onClick={() => navigate('/profile/verify-email')} className="text-blue-600 hover:underline font-bold text-sm">Verify Now</button>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user?.dlVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                    <CheckCircle size={20} />
                  </div>
                  <span className="font-semibold text-gray-700">Driving License</span>
                </div>
                {user?.dlVerified ? (
                  <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full">Verified</span>
                ) : (
                  <button onClick={() => navigate('/profile/verify-dl')} className="text-blue-600 hover:underline font-bold text-sm">Verify Now</button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="text-amber-500" /> Quick Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(action.link)}
                    className={`${action.bg} rounded-2xl p-4 flex flex-col items-center justify-center gap-3 border border-transparent hover:border-gray-200 transition-all group`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 text-center">{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Need Help Section */}
      <motion.div variants={itemVariants}>
        <div className="bg-gray-900 rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 mx-auto md:mx-0 border border-white/10">
                <HelpCircle size={32} className="text-red-400" />
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-2">Need help with your account?</h4>
                <p className="text-gray-400 font-medium">Our support team is here to help you 24/7 with any issues or queries.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile/support')}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 w-full sm:w-auto"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-sm border border-white/10 w-full sm:w-auto"
              >
                View FAQs
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileOverview;