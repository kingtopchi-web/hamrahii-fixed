import React, { useEffect, useState } from 'react';
import { 
  Handshake,
  Building2,
  Car,
  Users,
  Shield,
  TrendingUp,
  Award,
  Globe,
  Target,
  CheckCircle,
  ArrowRight,
  Search,
  Filter,
  ExternalLink,
  Star,
  Award as Trophy,
  Briefcase,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Zap,
  Leaf,
  DollarSign,
  BarChart3,
  Network,
  Rocket,
  Lightbulb,
  Lock,
  ThumbsUp,
  Building,
  Factory,
  GraduationCap,
  Hotel,
  Store
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Partners = () => {

  const navigate = useNavigate()
  const colors = {
    primary: '#E10600',
    background: '#FFFFFF',
    surface: '#F7F7F7',
    textPrimary: '#111111',
    textSecondary: '#555555',
    border: '#E5E5E5',
    accent: '#B8B8B8'
  };

  useEffect(() => {
    document.title = "Our Partners"
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const fadeInUp = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  // Partner Categories
  const partnerTypes = [
    { 
      name: 'All Partners', 
      count: 45, 
      icon: <Handshake className="w-5 h-5" />,
      color: 'bg-red-100 text-red-600'
    },
    { 
      name: 'Corporate', 
      count: 18, 
      icon: <Building2 className="w-5 h-5" />,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      name: 'Government', 
      count: 8, 
      icon: <Building className="w-5 h-5" />,
      color: 'bg-green-100 text-green-600'
    },
    { 
      name: 'Automotive', 
      count: 12, 
      icon: <Car className="w-5 h-5" />,
      color: 'bg-orange-100 text-orange-600'
    },
    { 
      name: 'Technology', 
      count: 7, 
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  // Featured Partners
  const featuredPartners = [
    {
      id: 1,
      name: 'Tata Motors',
      logo: 'TM',
      description: 'Leading automotive manufacturer providing electric vehicles for carpool fleets',
      type: 'Automotive',
      since: '2022',
      initiatives: ['Electric Fleet', 'Maintenance Support', 'Special Discounts'],
      impact: '5K+ EVs deployed',
      tier: 'Platinum',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Infosys',
      logo: 'IN',
      description: 'Corporate partnership enabling employee commuting across 15 campuses',
      type: 'Corporate',
      since: '2021',
      initiatives: ['Employee Commute', 'Campus Shuttles', 'Sustainability Goals'],
      impact: '50K+ employees',
      tier: 'Platinum',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600'
    },
    {
      id: 3,
      name: 'Delhi Metro',
      logo: 'DM',
      description: 'Integrated first-last mile connectivity with metro stations',
      type: 'Government',
      since: '2023',
      initiatives: ['Station Connectivity', 'Integrated Tickets', 'Park & Ride'],
      impact: '100+ stations',
      tier: 'Gold',
      color: 'bg-gradient-to-r from-green-500 to-green-600'
    }
  ];

  // All Partners
  const partners = [
    {
      id: 4,
      name: 'Mahindra Electric',
      type: 'Automotive',
      category: 'Strategic',
      since: '2023',
      projects: 3,
      logoColor: 'bg-red-100 text-red-600'
    },
    {
      id: 5,
      name: 'Wipro',
      type: 'Corporate',
      category: 'Enterprise',
      since: '2022',
      projects: 5,
      logoColor: 'bg-blue-100 text-blue-600'
    },
    {
      id: 6,
      name: 'Bangalore Traffic Police',
      type: 'Government',
      category: 'Public Service',
      since: '2023',
      projects: 2,
      logoColor: 'bg-green-100 text-green-600'
    },
    {
      id: 7,
      name: 'Google India',
      type: 'Technology',
      category: 'Technology',
      since: '2022',
      projects: 4,
      logoColor: 'bg-purple-100 text-purple-600'
    },
    {
      id: 8,
      name: 'TCS',
      type: 'Corporate',
      category: 'Enterprise',
      since: '2021',
      projects: 6,
      logoColor: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 9,
      name: 'Maruti Suzuki',
      type: 'Automotive',
      category: 'Strategic',
      since: '2023',
      projects: 3,
      logoColor: 'bg-orange-100 text-orange-600'
    },
    {
      id: 10,
      name: 'IIT Delhi',
      type: 'Education',
      category: 'Academic',
      since: '2022',
      projects: 3,
      logoColor: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 11,
      name: 'Amazon India',
      type: 'Corporate',
      category: 'Enterprise',
      since: '2023',
      projects: 2,
      logoColor: 'bg-teal-100 text-teal-600'
    },
    {
      id: 12,
      name: 'Hyundai Motors',
      type: 'Automotive',
      category: 'Strategic',
      since: '2023',
      projects: 2,
      logoColor: 'bg-pink-100 text-pink-600'
    }
  ];

  // Partnership Benefits
  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Business Growth',
      description: 'Access to 500K+ user base and new market opportunities',
      color: 'bg-blue-50 border-blue-100'
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: 'Sustainability Goals',
      description: 'Achieve ESG targets through reduced carbon emissions',
      color: 'bg-green-50 border-green-100'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Employee Benefits',
      description: 'Improved commute experience for your workforce',
      color: 'bg-purple-50 border-purple-100'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Cost Savings',
      description: 'Reduce transportation and parking infrastructure costs',
      color: 'bg-yellow-50 border-yellow-100'
    }
  ];

  // Success Stories
  const successStories = [
    {
      partner: 'Infosys',
      metric: '65%',
      description: 'reduction in employee commute costs',
      duration: '12 months'
    },
    {
      partner: 'Tata Motors',
      metric: '10K',
      description: 'electric vehicle test drives through platform',
      duration: '8 months'
    },
    {
      partner: 'Delhi Metro',
      metric: '40%',
      description: 'increase in last-mile connectivity',
      duration: '6 months'
    }
  ];

  // Partnership Tiers
  const partnershipTiers = [
    {
      name: 'Platinum',
      description: 'Strategic long-term partnerships',
      benefits: ['Co-branding', 'Joint R&D', 'Exclusive Features', 'Priority Support'],
      partnersCount: 8,
      color: 'from-gray-400 to-gray-300'
    },
    {
      name: 'Gold',
      description: 'Major implementation partners',
      benefits: ['API Access', 'Analytics Dashboard', 'Dedicated Support', 'Marketing Support'],
      partnersCount: 15,
      color: 'from-yellow-500 to-yellow-400'
    },
    {
      name: 'Silver',
      description: 'Standard partnership program',
      benefits: ['Integration Support', 'Standard Support', 'Partner Portal', 'Case Studies'],
      partnersCount: 22,
      color: 'from-gray-300 to-gray-200'
    }
  ];

  const [activeType, setActiveType] = useState('All Partners');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPartners = partners.filter(partner => {
    if (activeType !== 'All Partners' && partner.type !== activeType) return false;
    if (searchQuery && !partner.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen w-full md:w-[80%] flex justify-center items-center mx-auto" style={{ backgroundColor: colors.background }}>
      <div>

      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden pt-24 pb-20"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ backgroundColor: colors.primary }}
            >
              <Handshake className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{ color: colors.textPrimary }}
            >
              Partnerships & <span style={{ color: colors.primary }}>Alliances</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl mb-8"
              style={{ color: colors.textSecondary }}
            >
              Building the future of mobility through strategic collaborations and innovative partnerships
            </motion.p>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="inline-flex items-center gap-4 bg-[var(--bg-surface)] rounded-full px-6 py-3 shadow-sm"
              style={{ border: `1px solid ${colors.border}` }}
            >
              <Network className="w-5 h-5" style={{ color: colors.primary }} />
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                45+ Trusted Partners • 100+ Successful Projects
              </span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-12"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '45+', label: 'Strategic Partners', icon: <Handshake className="w-6 h-6" /> },
              { value: '100+', label: 'Joint Projects', icon: <Target className="w-6 h-6" /> },
              { value: '₹50Cr+', label: 'Value Created', icon: <DollarSign className="w-6 h-6" /> },
              { value: '1M+', label: 'Users Impacted', icon: <Users className="w-6 h-6" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="rounded-xl p-4 text-center"
                style={{ 
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 mx-auto"
                  style={{ backgroundColor: colors.primary }}
                >
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className="text-2xl font-bold mb-1"
                  style={{ color: colors.textPrimary }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Partnership Benefits */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              Why Partner With <span style={{ color: colors.primary }}>HamRahi?</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
              Create mutual value through innovative mobility solutions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={`p-6 rounded-xl border ${benefit.color}`}
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6"
                  style={{ backgroundColor: colors.background, border: `1px solid ${colors.border}` }}
                >
                  <div style={{ color: colors.primary }}>
                    {benefit.icon}
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                  {benefit.title}
                </h3>
                <p className="leading-relaxed" style={{ color: colors.textSecondary }}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Partners */}
      <motion.section 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Featured <span style={{ color: colors.primary }}>Partners</span>
              </h2>
              <p style={{ color: colors.textSecondary }}>Our strategic collaborations driving innovation</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: colors.background,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`
              }}
            >
              <Award className="w-4 h-4" />
              Awards & Recognition
            </motion.button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredPartners.map((partner) => (
              <motion.div
                key={partner.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="rounded-xl overflow-hidden group"
                style={{ 
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold ${partner.color}`}>
                        {partner.logo}
                      </div>
                      <div>
                        <div className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                          {partner.name}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          Partner since {partner.since}
                        </div>
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ 
                        backgroundColor: partner.tier === 'Platinum' ? colors.accent : 
                                      partner.tier === 'Gold' ? '#FFD700' : '#C0C0C0',
                        color: partner.tier === 'Platinum' ? colors.textPrimary : 
                              partner.tier === 'Gold' ? '#000' : colors.textPrimary
                      }}
                    >
                      <Star className="w-3 h-3" />
                      {partner.tier}
                    </motion.span>
                  </div>

                  <p className="mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                    {partner.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2" style={{ color: colors.textPrimary }}>
                        Key Initiatives
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {partner.initiatives.map((initiative, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{ 
                              backgroundColor: colors.surface,
                              color: colors.textSecondary,
                              border: `1px solid ${colors.border}`
                            }}
                          >
                            {initiative}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm" style={{ color: colors.textSecondary }}>
                            Impact Created
                          </div>
                          <div className="font-bold" style={{ color: colors.primary }}>
                            {partner.impact}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ x: 3 }}
                          className="flex items-center gap-1 text-sm font-medium"
                          style={{ color: colors.primary }}
                        >
                          Case Study
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Partners Directory */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Partners <span style={{ color: colors.primary }}>Directory</span>
              </h2>
              <p style={{ color: colors.textSecondary }}>Browse our network of trusted partners</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                  style={{ color: colors.textSecondary }} 
                />
                <input
                  type="text"
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border w-full"
                  style={{ 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: 'white'
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Join as Partner
                </motion.button>
              </div>
            </div>
          </div>

          {/* Partner Types */}
          <div className="flex flex-wrap gap-2 mb-8">
            {partnerTypes.map((type) => (
              <motion.button
                key={type.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveType(type.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeType === type.name ? '' : ''}`}
                style={{
                  backgroundColor: activeType === type.name ? colors.primary : colors.surface,
                  color: activeType === type.name ? 'white' : colors.textPrimary,
                  border: `1px solid ${activeType === type.name ? colors.primary : colors.border}`
                }}
              >
                {type.icon}
                {type.name}
                <span className="text-xs opacity-80">({type.count})</span>
              </motion.button>
            ))}
          </div>

          {/* Partners Grid */}
          {filteredPartners.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPartners.map((partner) => (
                <motion.div
                  key={partner.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-xl group cursor-pointer"
                  style={{ 
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${partner.logoColor}`}>
                        {partner.name.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold" style={{ color: colors.textPrimary }}>
                          {partner.name}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          {partner.type}
                        </div>
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: colors.surface,
                        color: colors.textSecondary
                      }}
                    >
                      {partner.category}
                    </motion.span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1" style={{ color: colors.textSecondary }}>
                        <Clock className="w-3 h-3" />
                        Since {partner.since}
                      </div>
                      <div className="flex items-center gap-1" style={{ color: colors.textSecondary }}>
                        <Briefcase className="w-3 h-3" />
                        {partner.projects} projects
                      </div>
                    </div>

                    <div className="pt-3 border-t" style={{ borderColor: colors.border }}>
                      <div className="flex justify-between items-center">
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          Partnership Status
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              variants={fadeInUp}
              className="text-center py-12 rounded-xl"
              style={{ 
                backgroundColor: colors.surface,
                border: `2px dashed ${colors.border}`
              }}
            >
              <Handshake className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textSecondary }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                No partners found
              </h3>
              <p style={{ color: colors.textSecondary }}>
                Try a different search term or category
              </p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Partnership Tiers */}
      <motion.section 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              Partnership <span style={{ color: colors.primary }}>Tiers</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
              Choose the partnership level that aligns with your business goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnershipTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="rounded-xl overflow-hidden"
                style={{ 
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                <div className={`h-2 bg-gradient-to-r ${tier.color}`}></div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                      {tier.name}
                    </h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {tier.description}
                    </p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                        {tier.partnersCount}
                      </span>
                      <span className="text-sm ml-1" style={{ color: colors.textSecondary }}>
                        partners
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {tier.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />
                        <span style={{ color: colors.textSecondary }}>{benefit}</span>
                      </div>
                    ))}
                  </div>

                 
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Success Stories */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              Success <span style={{ color: colors.primary }}>Stories</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
              Real impact created through strategic partnerships
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl text-center"
                style={{ 
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
                  {story.metric}
                </div>
                <div className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  {story.description}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
                  <span className="font-medium">{story.partner}</span>
                  <span>•</span>
                  <span>{story.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20"
        style={{ backgroundColor: colors.primary, backgroundImage: 'linear-gradient(135deg, #E10600 0%, #C10500 100%)' }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Handshake className="w-16 h-16 mx-auto mb-6 text-white" />
            
            <h2 className="text-4xl font-bold mb-6 text-white">
              Become Our Partner
            </h2>
            
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join our network of innovative partners and together, let's revolutionize urban mobility in India
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
              onClick={() => navigate("/contact")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center gap-2 bg-[var(--bg-surface)]"
                style={{ color: colors.primary }}
              >
                <MessageCircle className="w-5 h-5" />
                Contact Partnership Team
              </motion.button>
              
              
            </div>
            
            <p className="mt-6 text-white/80">
              Response within 24 hours • Custom partnership proposals
            </p>
          </motion.div>
        </div>
      </motion.section>

  </div>
    </div>
  );
};

export default Partners;