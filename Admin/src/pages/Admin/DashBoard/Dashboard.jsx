// Dashboard.jsx (Updated with gradients)
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Car, 
  TrendingUp, 
  DollarSign,
  MapPin,
  Calendar,
  Shield,
  ArrowUpRight,
  MessageSquare,
  Clock,
  Star,
  TrendingDown,
  Activity
} from 'lucide-react';
import axios from 'axios';
import Axios from '../../../services/axios';
import { useEffect } from 'react';

const Dashboard = () => {

 
  const stats = [
    {
      title: 'Total Users',
      value: '45,892',
      change: '+12.5%',
      trend: 'up',
      icon: <Users className="text-white" size={24} />,
      gradient: 'from-[#E10600] to-red-500',
      description: 'Active users this month'
    },
    {
      title: 'Active Rides',
      value: '1,243',
      change: '+8.2%',
      trend: 'up',
      icon: <Car className="text-white" size={24} />,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Currently ongoing'
    },
    {
      title: 'Revenue Today',
      value: '$28,450',
      change: '+5.7%',
      trend: 'up',
      icon: <DollarSign className="text-white" size={24} />,
      gradient: 'from-green-500 to-emerald-500',
      description: 'From 2,843 rides'
    },
    {
      title: 'Safety Score',
      value: '98.2%',
      change: '+0.4%',
      trend: 'up',
      icon: <Shield className="text-white" size={24} />,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Platform safety rating'
    },
  ];

  const recentActivities = [
    { 
      id: 1, 
      user: 'John Doe', 
      action: 'Booked premium ride', 
      time: '5 min ago', 
      type: 'booking',
      icon: <Car size={16} />,
      color: 'bg-gradient-to-r from-[#E10600] to-red-500'
    },
    { 
      id: 2, 
      user: 'Sarah Smith', 
      action: 'Became verified driver', 
      time: '12 min ago', 
      type: 'driver',
      icon: <Users size={16} />,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    { 
      id: 3, 
      user: 'Mike Johnson', 
      action: '5-star ride review', 
      time: '25 min ago', 
      type: 'review',
      icon: <Star size={16} />,
      color: 'bg-gradient-to-r from-amber-500 to-yellow-500'
    },
    { 
      id: 4, 
      user: 'Emma Wilson', 
      action: 'Completed milestone', 
      time: '1 hour ago', 
      type: 'milestone',
      icon: <TrendingUp size={16} />,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
  ];

  const popularRoutes = [
    { 
      from: 'New York', 
      to: 'Boston', 
      bookings: 245, 
      revenue: '$12,450',
      trend: '+15%',
      gradient: 'from-[#E10600]/20 to-red-500/20'
    },
    { 
      from: 'Los Angeles', 
      to: 'San Francisco', 
      bookings: 189, 
      revenue: '$9,850',
      trend: '+8%',
      gradient: 'from-blue-500/20 to-cyan-500/20'
    },
    { 
      from: 'Chicago', 
      to: 'Detroit', 
      bookings: 167, 
      revenue: '$8,230',
      trend: '+12%',
      gradient: 'from-green-500/20 to-emerald-500/20'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E10600] via-red-500 to-orange-500 p-8"
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Good morning, Admin! 👋</h2>
              <p className="text-white/90 mt-2">Your platform is performing exceptionally well today.</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#FFFFFF] text-[#EF4444] font-bold rounded-xl hover:bg-[#FFFFFF]/90 transition-colors"
              >
                View Detailed Report
              </motion.button>
            </div>
          </div>
        </div>
        <div className="absolute right-8 top-8 w-32 h-32 bg-[#FFFFFF]/10 rounded-full blur-xl"></div>
        <div className="absolute left-8 bottom-8 w-24 h-24 bg-[#FFFFFF]/10 rounded-full blur-xl"></div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5]/50 shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center ${stat.trend === 'up' ? 'text-[#10B981]' : 'text-[#DC2626]'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={20} /> : <TrendingDown size={20} />}
                  <span className="ml-1 font-bold">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-[#111111] mt-4">{stat.value}</h3>
              <p className="text-[#111111] font-medium mt-1">{stat.title}</p>
              <p className="text-[#555555]/70 text-sm mt-1">{stat.description}</p>
              <div className="mt-4 h-2 bg-[#F7F7F7] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`h-full bg-gradient-to-r ${stat.gradient}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5]/50 shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#111111]">Recent Activities</h2>
              <p className="text-[#555555]/70 text-sm">Latest platform interactions</p>
            </div>
            <button className="text-[#EF4444] hover:text-red-700 font-medium">
              View All →
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-center p-4 rounded-xl border border-[#E5E5E5]/30 hover:border-[#E5E5E5]/50 transition-all"
              >
                <div className={`p-3 rounded-xl ${activity.color} text-white`}>
                  {activity.icon}
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-semibold text-[#111111]">
                    <span className="font-bold">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-[#555555]/70">{activity.time}</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-2 hover:bg-[#F7F7F7] rounded-lg"
                >
                  <Activity size={16} className="text-[#555555]" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Popular Routes */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5]/50 shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#111111]">Top Routes</h2>
              <p className="text-[#555555]/70 text-sm">Most popular journeys</p>
            </div>
            <MapPin className="text-[#555555]" size={20} />
          </div>
          
          <div className="space-y-4">
            {popularRoutes.map((route, index) => (
              <motion.div
                key={route.from + route.to}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl bg-gradient-to-r ${route.gradient} border border-[#E5E5E5]/30`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#111111]">
                      {route.from} → {route.to}
                    </p>
                    <p className="text-sm text-[#555555]">{route.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#111111]">{route.revenue}</p>
                    <div className="flex items-center justify-end text-[#10B981] text-sm">
                      <ArrowUpRight size={14} />
                      <span className="ml-1">{route.trend}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-[#FFFFFF]/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(route.bookings / 300) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="h-full bg-gradient-to-r from-white to-white/70"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 w-full py-3 bg-gradient-to-r from-[#111111] to-[#333333] text-white font-bold rounded-xl text-center cursor-pointer"
          >
            View All Routes
          </motion.div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[
          {
            title: 'Average Rating',
            value: '4.8',
            icon: <Star className="text-amber-500" size={24} />,
            gradient: 'from-amber-50 to-yellow-50',
            change: '+0.2'
          },
          {
            title: 'Response Time',
            value: '2.4min',
            icon: <Clock className="text-blue-500" size={24} />,
            gradient: 'from-blue-50 to-cyan-50',
            change: '-0.3min'
          },
          {
            title: 'Support Tickets',
            value: '18',
            icon: <MessageSquare className="text-purple-500" size={24} />,
            gradient: 'from-purple-50 to-pink-50',
            change: '-5'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`p-6 rounded-2xl bg-gradient-to-br ${stat.gradient} border border-[#E5E5E5]/30`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[#111111]">{stat.value}</p>
                <p className="text-[#555555] mt-1">{stat.title}</p>
              </div>
              <div className="p-3 bg-[#FFFFFF] rounded-xl">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-[#10B981]">
              <ArrowUpRight size={16} />
              <span className="ml-1 text-sm font-medium">{stat.change}</span>
              <span className="ml-2 text-[#555555]/70 text-sm">from yesterday</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Dashboard;