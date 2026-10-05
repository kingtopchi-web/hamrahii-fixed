import React, { useEffect } from 'react';
import { 
  Leaf, Trees, Droplets, Wind, Zap, BarChart3, Target, 
  Users, Car, Globe, TrendingUp, Award, CheckCircle, 
  Play, ArrowRight, ExternalLink, Shield, Heart,
  MapPin, Calendar, Star, Coffee, Clock, BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sustainability = () => {
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
    document.title = "Our Sustainability"
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

  // Sustainability Stats
  const sustainabilityStats = [
    { 
      value: '1.2M+', 
      label: 'Tons of CO₂ Saved', 
      icon: <Leaf className="w-8 h-8" />,
      description: 'Equivalent to planting 20 million trees'
    },
    { 
      value: '50M+', 
      label: 'Empty Seats Filled', 
      icon: <Car className="w-8 h-8" />,
      description: 'Reducing traffic congestion across India'
    },
    { 
      value: '₹150Cr+', 
      label: 'Fuel Savings', 
      icon: <Droplets className="w-8 h-8" />,
      description: 'Money saved by our community'
    },
    { 
      value: '500K+', 
      label: 'Eco-Conscious Riders', 
      icon: <Users className="w-8 h-8" />,
      description: 'Making sustainable travel choices'
    }
  ];

  // Environmental Impact Sections
  const impactSections = [
    {
      title: "Our Carbon Footprint Reduction",
      description: "Every shared ride on HamRahi reduces carbon emissions by up to 75% compared to single-occupancy vehicles. We're committed to making every journey count for the planet.",
      metrics: [
        { value: "2.5", unit: "kg", label: "CO₂ saved per ride" },
        { value: "75%", label: "Lower emissions" },
        { value: "500+", label: "Tons saved daily" }
      ],
      icon: <Trees className="w-12 h-12" />
    },
    {
      title: "Smart Mobility for Cleaner Cities",
      description: "By reducing the number of vehicles on the road, we're helping Indian cities combat air pollution and traffic congestion, creating healthier urban environments.",
      metrics: [
        { value: "3.8M", label: "Fewer km driven" },
        { value: "15%", label: "Traffic reduction" },
        { value: "100+", label: "Cities impacted" }
      ],
      icon: <Wind className="w-12 h-12" />
    }
  ];

  // Sustainability Goals
  const sustainabilityGoals = [
    {
      year: "2024",
      title: "Net Zero Operations",
      target: "Achieve carbon neutrality for our corporate operations",
      progress: 65,
      initiatives: ["Green office spaces", "Renewable energy", "Waste reduction"]
    },
    {
      year: "2025",
      title: "Electric Fleet Expansion",
      target: "20% of rides in electric vehicles by 2025",
      progress: 40,
      initiatives: ["EV partnerships", "Charging infrastructure", "Incentive programs"]
    },
    {
      year: "2030",
      title: "Full Sustainability",
      target: "100% carbon neutral across entire platform",
      progress: 25,
      initiatives: ["Carbon offset programs", "Green technology", "Sustainable partnerships"]
    }
  ];

  // Green Initiatives
  const greenInitiatives = [
    {
      title: "Green Rides Program",
      description: "Special recognition and rewards for drivers using electric or hybrid vehicles",
      icon: <Zap className="w-10 h-10" />,
      impact: "5,000+ Green Rides monthly"
    },
    {
      title: "Tree Planting Partnership",
      description: "We plant trees for every 100 rides completed on our platform",
      icon: <Trees className="w-10 h-10" />,
      impact: "50,000+ trees planted"
    },
    {
      title: "Carbon Offset Integration",
      description: "Optional carbon offset contribution for every ride booked",
      icon: <Leaf className="w-10 h-10" />,
      impact: "Offset 100K+ tons CO₂"
    }
  ];

  // Community Impact
  const communityImpact = [
    {
      title: "Clean Air Advocacy",
      description: "Partnering with environmental NGOs to promote clean air initiatives",
      partners: ["Clean Air Fund", "Environmental NGOs", "Government Bodies"]
    },
    {
      title: "Sustainable Education",
      description: "Awareness campaigns and educational programs about eco-friendly commuting",
      partners: ["Schools & Colleges", "Corporate CSR", "Community Groups"]
    },
    {
      title: "Green Technology",
      description: "Investing in R&D for sustainable mobility solutions",
      partners: ["Tech Startups", "Research Institutes", "Innovation Labs"]
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-[80vh] flex items-center overflow-hidden"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8"
                  style={{ 
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <Leaf className="w-5 h-5" />
                  <span className="font-bold">Sustainable Mobility</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-6xl font-black mb-6"
                  style={{ color: colors.textPrimary }}
                >
                  Driving <span style={{ color: colors.primary }}>Greener</span> Futures
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl mb-8"
                  style={{ color: colors.textSecondary }}
                >
                  Every shared ride on HamRahi makes travel more sustainable, affordable, and connected.
                </motion.p>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-4"
                >
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden"
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface
                  }}
                >
                  <div className="aspect-[4/3] flex items-center justify-center p-8">
                    <div className="text-center p-12">
                      <div className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${colors.primary}15` }}
                      >
                        <Globe className="w-16 h-16" style={{ color: colors.primary }} />
                      </div>
                      <div className="text-6xl font-black mb-4" style={{ color: colors.textPrimary }}>
                        1.2M+
                      </div>
                      <div className="text-2xl" style={{ color: colors.textSecondary }}>
                        Tons of CO₂ Saved
                      </div>
                      <div className="text-lg mt-2" style={{ color: colors.textSecondary }}>
                        and counting...
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Stats */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="absolute -bottom-6 -left-6 rounded-2xl p-6 shadow-lg"
                  style={{ 
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}15` }}
                    >
                      <Users className="w-6 h-6" style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                        500K+
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        Eco-Conscious Riders
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
            style={{ backgroundColor: `${colors.primary}05` }}
          ></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
            style={{ backgroundColor: `${colors.accent}05` }}
          ></div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 relative z-10"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sustainabilityStats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="p-8 rounded-2xl text-center"
                  style={{ 
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto"
                    style={{ 
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-4xl font-black mb-2"
                    style={{ color: colors.textPrimary }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>
                    {stat.label}
                  </div>
                  <div className="text-sm" style={{ color: colors.textSecondary }}>
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Our Environmental Impact */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-20"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black mb-6" style={{ color: colors.textPrimary }}>
                Our <span style={{ color: colors.primary }}>Environmental</span> Impact
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.textSecondary }}>
                See how shared mobility creates real, measurable change for our planet
              </p>
            </motion.div>

            <div className="space-y-12">
              {impactSections.map((section, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="grid lg:grid-cols-2 gap-12 items-center"
                >
                  <div className="p-12 rounded-3xl"
                    style={{ 
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 mx-auto"
                        style={{ backgroundColor: `${colors.primary}15` }}
                      >
                        <div style={{ color: colors.primary }}>
                          {section.icon}
                        </div>
                      </div>
                      <h3 className="text-3xl font-black mb-6" style={{ color: colors.textPrimary }}>
                        {section.title}
                      </h3>
                      <p className="text-lg mb-8" style={{ color: colors.textSecondary }}>
                        {section.description}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4">
                        {section.metrics.map((metric, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-3xl font-black mb-2" style={{ color: colors.textPrimary }}>
                              {metric.value}
                            </div>
                            <div className="text-sm" style={{ color: colors.textSecondary }}>
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-black mb-6" style={{ color: colors.textPrimary }}>
                      How We Make a Difference
                    </h3>
                    <ul className="space-y-4">
                      {[
                        "Reducing single-occupancy vehicles on the road",
                        "Optimizing routes to minimize fuel consumption",
                        "Promoting electric and hybrid vehicle adoption",
                        "Implementing smart carpooling algorithms",
                        "Educating riders about sustainable choices"
                      ].map((item, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1" 
                            style={{ color: colors.primary }} 
                          />
                          <span style={{ color: colors.textSecondary }}>{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Sustainability Goals Timeline */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black mb-6" style={{ color: colors.textPrimary }}>
                Our <span style={{ color: colors.primary }}>Sustainability</span> Roadmap
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.textSecondary }}>
                Clear targets and ambitious goals for a greener tomorrow
              </p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 hidden lg:block"
                style={{ backgroundColor: colors.border }}
              ></div>
              
              {sustainabilityGoals.map((goal, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`relative mb-12 lg:flex items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  <div className="lg:w-1/2 lg:px-12">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-8 rounded-3xl"
                      style={{ 
                        backgroundColor: colors.surface,
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="text-2xl font-black mb-2" style={{ color: colors.textPrimary }}>
                            {goal.year} - {goal.title}
                          </div>
                          <div className="text-sm font-semibold mb-4 px-3 py-1 rounded-full inline-block"
                            style={{ 
                              backgroundColor: `${colors.primary}15`,
                              color: colors.primary
                            }}
                          >
                            Target: {goal.target}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black" style={{ color: colors.primary }}>
                            {goal.progress}%
                          </div>
                          <div className="text-sm" style={{ color: colors.textSecondary }}>
                            Progress
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="h-2 rounded-full w-full mb-2"
                          style={{ backgroundColor: colors.border }}
                        >
                          <div className="h-2 rounded-full"
                            style={{ 
                              width: `${goal.progress}%`,
                              backgroundColor: colors.primary
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                          Key Initiatives:
                        </div>
                        {goal.initiatives.map((initiative, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                            <span className="text-sm" style={{ color: colors.textSecondary }}>
                              {initiative}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 hidden lg:block"
                    style={{ 
                      backgroundColor: colors.primary,
                      borderColor: colors.background
                    }}
                  ></div>
                  
                  <div className="lg:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Green Initiatives */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-20"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black mb-6" style={{ color: colors.textPrimary }}>
                Green <span style={{ color: colors.primary }}>Initiatives</span>
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.textSecondary }}>
                Programs and partnerships driving sustainable change
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {greenInitiatives.map((initiative, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="p-8 rounded-3xl"
                  style={{ 
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                    style={{ 
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary
                    }}
                  >
                    {initiative.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4" style={{ color: colors.textPrimary }}>
                    {initiative.title}
                  </h3>
                  <p className="mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                    {initiative.description}
                  </p>
                  <div className="text-sm font-semibold px-4 py-2 rounded-full inline-block"
                    style={{ 
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary
                    }}
                  >
                    {initiative.impact}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Community & Partnerships */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-black mb-6" style={{ color: colors.textPrimary }}>
                Community <span style={{ color: colors.primary }}>Impact</span>
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: colors.textSecondary }}>
                Working together for a sustainable future
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {communityImpact.map((impact, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-3xl"
                  style={{ 
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <h3 className="text-2xl font-black mb-6" style={{ color: colors.textPrimary }}>
                    {impact.title}
                  </h3>
                  <p className="mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                    {impact.description}
                  </p>
                  
                  <div>
                    <div className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
                      Key Partners:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {impact.partners.map((partner, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs"
                          style={{ 
                            backgroundColor: colors.background,
                            color: colors.textSecondary,
                            border: `1px solid ${colors.border}`
                          }}
                        >
                          {partner}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-24"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black mb-8"
              style={{ color: colors.background }}
            >
              Join the <span style={{ color: colors.surface }}>Green Revolution</span>
            </motion.h2>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl mb-12"
              style={{ color: colors.background }}
            >
              Every ride you share makes a difference. Together, we can build a cleaner, 
              greener, and more connected India.
            </motion.p>
            
        
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12"
              style={{ color: colors.background }}
            >
              Travel smarter. Live greener.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

  
    </div>
  );
};

export default Sustainability;