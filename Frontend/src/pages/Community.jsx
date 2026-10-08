import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Star, 
  Shield, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Car, 
  Filter,
  Search,
  ThumbsUp,
  Award,
  Clock,
  ChevronRight,
  CheckCircle,
  UserCheck,
  ShieldCheck,
  StarHalf
} from 'lucide-react';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Community members data
  const communityMembers = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Frequent Rider",
      rating: 4.9,
      rides: 142,
      joined: "2022",
      badges: ["Verified", "Top Rated", "Punctual"],
      vehicle: "Honda City",
      route: "Delhi to Chandigarh",
      nextTrip: "Tomorrow, 8:00 AM"
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "Premium Driver",
      rating: 4.95,
      rides: 256,
      joined: "2021",
      badges: ["Premium", "Super Host", "Verified"],
      vehicle: "Hyundai Creta",
      route: "Mumbai to Pune",
      nextTrip: "Friday, 6:30 AM"
    },
    {
      id: 3,
      name: "Amit Kumar",
      role: "Community Veteran",
      rating: 4.8,
      rides: 189,
      joined: "2020",
      badges: ["Veteran", "Verified", "Conversationalist"],
      vehicle: "Maruti Suzuki Ertiga",
      route: "Bangalore to Chennai",
      nextTrip: "Sunday, 7:00 AM"
    },
    {
      id: 4,
      name: "Neha Singh",
      role: "New Member",
      rating: 4.7,
      rides: 23,
      joined: "2024",
      badges: ["Verified", "Friendly"],
      vehicle: "Toyota Innova",
      route: "Jaipur to Delhi",
      nextTrip: "Monday, 9:00 AM"
    },
    {
      id: 5,
      name: "Vikram Mehta",
      role: "Business Traveler",
      rating: 4.85,
      rides: 167,
      joined: "2022",
      badges: ["Business", "Verified", "Punctual"],
      vehicle: "Kia Seltos",
      route: "Hyderabad to Bangalore",
      nextTrip: "Wednesday, 5:30 AM"
    },
    {
      id: 6,
      name: "Sanya Verma",
      role: "Women-Only Driver",
      rating: 4.92,
      rides: 134,
      joined: "2023",
      badges: ["Women-Only", "Verified", "Safe Driver"],
      vehicle: "Tata Nexon",
      route: "Delhi to Jaipur",
      nextTrip: "Saturday, 10:00 AM"
    }
  ];
  
  // Community posts data
  const communityPosts = [
    {
      id: 1,
      user: "TravelLover42",
      time: "2 hours ago",
      content: "Just had the most amazing ride with Priya from Mumbai to Pune! Great conversation, safe driving, and even stopped for coffee ☕. Highly recommend!",
      tags: ["Positive Experience", "Mumbai-Pune Route"]
    },
    {
      id: 2,
      user: "RoadTripper99",
      time: "1 day ago",
      content: "Looking for fellow travelers for a weekend trip from Delhi to Rishikesh this Friday. I have 2 seats available in my SUV. DM if interested!",
      tags: ["Seats Available", "Weekend Trip"]
    },
    {
      id: 3,
      user: "EcoCommuter",
      time: "3 days ago",
      content: "Shared a ride with 3 other people today and we calculated we saved about 12kg of CO2 emissions by carpooling! Feeling good about reducing our carbon footprint 🌱",
      tags: ["Eco-Friendly", "Carpooling Benefits"]
    }
  ];
  
  // Community stats
  const communityStats = [
    { label: "Total Members", value: "125,847", icon: <Users size={24} /> },
    { label: "Trips Completed", value: "2.8M", icon: <Car size={24} /> },
    { label: "Average Rating", value: "4.82", icon: <StarHalf size={24} /> },
    { label: "Verified Users", value: "98.3%", icon: <ShieldCheck size={24} /> }
  ];
  
  // Safety features
  const safetyFeatures = [
    { title: "ID Verification", icon: <UserCheck size={20} />, description: "All members verify their identity" },
    { title: "Ratings & Reviews", icon: <Star size={20} />, description: "Rate your trip companions after each ride" },
    { title: "Secure Payments", icon: <ShieldCheck size={20} />, description: "In-app payments for safety" },
    { title: "24/7 Support", icon: <MessageSquare size={20} />, description: "Our team is always here to help" }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] w-full md:w-[80%] flex justify-center items-center mx-auto">
      <div>
      {/* Header Section */}
      <motion.header 
        className="py-6 px-4 md:px-8 border-b border-[var(--border-subtle)]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Hamrahi Community</h1>
              <p className="text-[#555555] mt-1">Connect with fellow travelers, share experiences, and ride together</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-8">
        {/* Stats Section */}
        <motion.section 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {communityStats.map((stat, index) => (
            <motion.div 
              key={index}
              className="bg-[#F7F7F7] p-6 rounded-xl border border-[var(--border-subtle)]"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[var(--bg-surface)] rounded-lg">
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-[#555555] text-sm">{stat.label}</div>
                </div>
              </div>
              <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#E10600] rounded-full" 
                  style={{ width: `${Math.min(100, 70 + index * 10)}%` }}
                ></div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Community Members */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="flex border-b border-[var(--border-subtle)] mb-8 overflow-x-auto">
              {['all', 'drivers', 'riders', 'premium'].map((tab) => (
                <button
                  key={tab}
                  className={`px-6 py-3 font-medium whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-[#E10600] text-[#E10600]' : 'text-[#555555]'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              <div className="ml-auto flex items-center px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555555]" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search members..." 
                    className="pl-10 pr-4 py-2 bg-[#F7F7F7] rounded-lg border border-[var(--border-subtle)] focus:outline-none focus:ring-2 focus:ring-[#E10600]/20"
                  />
                </div>
                <button className="ml-3 p-2 bg-[#F7F7F7] rounded-lg border border-[var(--border-subtle)]">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            {/* Members Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {communityMembers.map((member) => (
                <motion.div 
                  key={member.id}
                  className="bg-[#F7F7F7] rounded-xl border border-[var(--border-subtle)] overflow-hidden"
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{member.name}</h3>
                          <ShieldCheck className="text-[#E10600]" size={16} />
                        </div>
                        <p className="text-[#555555] text-sm">{member.role}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-[var(--bg-surface)] px-2 py-1 rounded">
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                        <span className="font-bold">{member.rating}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Car size={16} className="text-[#555555]" />
                        <span>{member.vehicle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-[#555555]" />
                        <span>{member.route}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-[#555555]" />
                        <span>Next trip: <strong>{member.nextTrip}</strong></span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {member.badges.map((badge, index) => (
                        <span 
                          key={index} 
                          className={`px-2 py-1 text-xs rounded ${badge === 'Premium' || badge === 'Super Host' ? 'bg-[#B8B8B8] text-white' : 'bg-[var(--bg-surface)] text-[#555555]'}`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-[#555555]">
                      <div className="flex items-center gap-4">
                        <span>{member.rides} rides</span>
                        <span>Joined {member.joined}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Community Posts */}
            <motion.section 
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Community Stories</h2>
               
              </div>
              
              <div className="space-y-6">
                {communityPosts.map((post) => (
                  <motion.div 
                    key={post.id}
                    className="bg-[#F7F7F7] p-6 rounded-xl border border-[var(--border-subtle)]"
                    whileHover={{ boxShadow: "0 5px 15px rgba(0,0,0,0.05)" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E10600] rounded-full flex items-center justify-center text-white font-bold">
                          {post.user.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold">{post.user}</div>
                          <div className="text-sm text-[#555555]">{post.time}</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mb-4">{post.content}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-[var(--bg-surface)] text-[#555555] text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right Column - Safety & Features */}
          <div className="lg:w-1/3">
            {/* Safety Features */}
            <motion.div 
              className="bg-[#F7F7F7] rounded-xl border border-[var(--border-subtle)] p-6 mb-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-6">Your Safety First</h2>
              <div className="space-y-5">
                {safetyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-[var(--bg-surface)] rounded-lg">
                      <div className="text-[#E10600]">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold">{feature.title}</h3>
                      <p className="text-sm text-[#555555]">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <Award className="text-[#E10600]" size={24} />
                  <div>
                    <div className="font-bold">Trust & Safety</div>
                    <div className="text-sm text-[#555555]">Verified community with 99.7% positive experiences</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Upcoming Events */}
            <motion.div 
              className="bg-gradient-to-br from-[#F7F7F7] to-white rounded-xl border border-[var(--border-subtle)] p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6">Community Events</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#E10600]">15</div>
                    <div className="text-sm">MAR</div>
                  </div>
                  <div>
                    <div className="font-bold">Delhi Carpool Meetup</div>
                    <div className="text-sm text-[#555555]">Connect with fellow commuters</div>
                  </div>
                  <button className="ml-auto text-[#E10600] hover:underline text-sm font-medium">
                    Join
                  </button>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#E10600]">22</div>
                    <div className="text-sm">MAR</div>
                  </div>
                  <div>
                    <div className="font-bold">Safety Workshop</div>
                    <div className="text-sm text-[#555555]">Tips for safe ridesharing</div>
                  </div>
                  <button className="ml-auto text-[#E10600] hover:underline text-sm font-medium">
                    Join
                  </button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">Need help?</div>
                    <div className="text-sm text-[#555555]">Our community moderators are here</div>
                  </div>
                  <button className="px-4 py-2 bg-[#E10600] text-white rounded-lg hover:bg-[#C10500] transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

  </div>
    </div>
  );
};

export default CommunityPage;