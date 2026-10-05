import React, { useEffect } from 'react';
import { 
  Newspaper, 
  Tv, 
  Radio, 
  Globe, 
  Award, 
  TrendingUp,
  Calendar,
  Quote,
  Users,
  Star,
  ExternalLink,
  PlayCircle,
  FileText,
  Download,
  Share2,
  Filter,
  Search,
  ChevronRight,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import data from '../assets/data.json'

const Press = () => {
  // Color constants
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
   document.title = "Press & Media"
  }, [])

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

  // Press coverage data
  const featuredCoverage = [
    {
      id: 1,
      title: "HumRahii Revolutionizes Urban Commuting in India",
      source: "Economic Times",
      date: "March 15, 2024",
      excerpt: "How carpooling is solving traffic woes and reducing carbon footprint across major Indian cities...",
      type: "Article",
      logo: "ET",
      views: "45K",
      category: "Business"
    },
    {
      id: 2,
      title: "The Rise of Shared Mobility: HumRahii's Success Story",
      source: "Forbes India",
      date: "February 28, 2024",
      excerpt: "Interview with founders discussing growth from 100 to 500K users in just 3 years...",
      type: "Feature",
      logo: "FI",
      views: "38K",
      category: "Entrepreneurship"
    },
    {
      id: 3,
      title: "Startup of the Year: HumRahii Wins Tech Innovation Award",
      source: "YourStory",
      date: "January 20, 2024",
      excerpt: "Recognized for innovative AI-powered ride matching and sustainable transportation solutions...",
      type: "News",
      logo: "YS",
      views: "52K",
      category: "Technology"
    }
  ];

  const mediaMentions = [
    {
      outlet: "Times of India",
      count: 24,
      icon: <Newspaper className="w-5 h-5" />
    },
    {
      outlet: "NDTV",
      count: 18,
      icon: <Tv className="w-5 h-5" />
    },
    {
      outlet: "Business Standard",
      count: 15,
      icon: <FileText className="w-5 h-5" />
    },
    {
      outlet: "Inc42",
      count: 12,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      outlet: "BBC India",
      count: 8,
      icon: <Globe className="w-5 h-5" />
    },
    {
      outlet: "CNBC TV18",
      count: 6,
      icon: <PlayCircle className="w-5 h-5" />
    }
  ];

  const awards = [
    {
      title: "Best Mobility Startup 2024",
      organizer: "Startup India Awards",
      date: "2024",
      category: "Innovation"
    },
    {
      title: "Green Tech Pioneer",
      organizer: "Sustainable Mobility Summit",
      date: "2023",
      category: "Sustainability"
    },
    {
      title: "User Experience Excellence",
      organizer: "India App Awards",
      date: "2023",
      category: "Technology"
    },
    {
      title: "Community Impact Award",
      organizer: "Social Innovation Forum",
      date: "2023",
      category: "Social Impact"
    }
  ];

  const pressReleases = [
    {
      title: "HumRahii Reaches 500K User Milestone",
      date: "March 1, 2024",
      summary: "Announcing major growth milestone and expansion plans to 100+ cities",
      downloads: 2450
    },
    {
      title: "Series B Funding Round Success",
      date: "February 15, 2024",
      summary: "$25M funding to accelerate AI development and pan-India expansion",
      downloads: 3120
    },
    {
      title: "Partnership with State Transport Departments",
      date: "January 30, 2024",
      summary: "Collaboration with government bodies to promote sustainable commuting",
      downloads: 1890
    },
    {
      title: "Safety Certification Achievement",
      date: "January 10, 2024",
      summary: "ISO 27001 certification for data security and user protection",
      downloads: 1560
    }
  ];

  const stats = [
    { icon: <Newspaper className="w-6 h-6" />, value: "150+", label: "Press Features" },
    { icon: <Tv className="w-6 h-6" />, value: "45+", label: "TV Appearances" },
    { icon: <Award className="w-6 h-6" />, value: "12+", label: "Industry Awards" },
    { icon: <Globe className="w-6 h-6" />, value: "20+", label: "Countries Coverage" },
    { icon: <MessageSquare className="w-6 h-6" />, value: "5K+", label: "Media Mentions" }
  ];

  return (
    <div className="min-h-screen w-full md:w-[80%] flex justify-center items-center mx-auto" style={{ backgroundColor: colors.background }}>
      <div>

      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden pt-8 pb-10"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ backgroundColor: colors.primary }}
            >
              <Newspaper className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{ color: colors.textPrimary }}
            >
              Press & <span style={{ color: colors.primary }}>Media</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl mb-8"
              style={{ color: colors.textSecondary }}
            >
              Latest news, media coverage, and official announcements from India's #1 Carpooling Platform
            </motion.p>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-sm"
              style={{ border: `1px solid ${colors.border}` }}
            >
              <Quote className="w-5 h-5" style={{ color: colors.primary }} />
              <span className="font-semibold" style={{ color: colors.textPrimary }}>
                In the news: Revolutionizing urban mobility
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.map((stat, index) => (
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

      {/* Featured Coverage Section */}
      <motion.section 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Featured <span style={{ color: colors.primary }}>Coverage</span>
              </h2>
              <p style={{ color: colors.textSecondary }}>Recent highlights from top publications</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ 
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`
              }}
            >
              <Filter className="w-4 h-4" />
              Filter
            </motion.button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredCoverage.map((article) => (
              <motion.article
                key={article.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="rounded-xl overflow-hidden group cursor-pointer"
                style={{ 
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold"
                        style={{ 
                          backgroundColor: colors.surface,
                          color: colors.textPrimary,
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        {article.logo}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: colors.textPrimary }}>
                          {article.source}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          {article.date}
                        </div>
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary
                      }}
                    >
                      {article.type}
                    </motion.span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 group-hover:underline" style={{ color: colors.textPrimary }}>
                    {article.title}
                  </h3>
                  <p className="mb-4 leading-relaxed" style={{ color: colors.textSecondary }}>
                    {article.excerpt}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm" style={{ color: colors.textSecondary }}>
                        <Eye className="w-4 h-4" />
                        {article.views} views
                      </div>
                      <span className="text-sm px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: colors.surface,
                          color: colors.textSecondary
                        }}
                      >
                        {article.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Media Mentions & Awards Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-8"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Media Mentions */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Tv className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                    Media Mentions
                  </h3>
                  <p style={{ color: colors.textSecondary }}>Covered by leading publications</p>
                </div>
              </div>

              <div className="space-y-4">
                {mediaMentions.map((media, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ 
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-600">
                        {media.icon}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: colors.textPrimary }}>
                          {media.outlet}
                        </div>
                        <div className="text-sm flex items-center gap-2" style={{ color: colors.textSecondary }}>
                          <CheckCircle className="w-3 h-3" />
                          Verified coverage
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                        {media.count}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        mentions
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                    Awards & Recognition
                  </h3>
                  <p style={{ color: colors.textSecondary }}>Industry accolades and achievements</p>
                </div>
              </div>

              <div className="space-y-4">
                {awards.map((award, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ x: 5 }}
                    className="p-4 rounded-lg group cursor-pointer"
                    style={{ 
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${colors.primary}20` }}
                        >
                          <Star className="w-4 h-4" style={{ color: colors.primary }} />
                        </div>
                        <h4 className="font-bold group-hover:underline" style={{ color: colors.textPrimary }}>
                          {award.title}
                        </h4>
                      </div>
                      <span className="text-sm px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: colors.surface,
                          color: colors.textSecondary
                        }}
                      >
                        {award.date}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div style={{ color: colors.textSecondary }}>
                        {award.organizer}
                      </div>
                      <div className="text-sm px-3 py-1 rounded-full"
                        style={{ 
                          backgroundColor: `${colors.primary}10`,
                          color: colors.primary
                        }}
                      >
                        {award.category}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Press Releases Section */}
      <motion.section 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Official <span style={{ color: colors.primary }}>Press Releases</span>
              </h2>
              <p style={{ color: colors.textSecondary }}>Latest announcements and updates</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pressReleases.map((release, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl group"
                style={{ 
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" style={{ color: colors.primary }} />
                    <div className="font-semibold" style={{ color: colors.textPrimary }}>
                      {release.date}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:underline" style={{ color: colors.textPrimary }}>
                  {release.title}
                </h3>
                <p className="mb-4" style={{ color: colors.textSecondary }}>
                  {release.summary}
                </p>

              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-8"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 mx-auto"
              style={{ backgroundColor: colors.primary }}
            >
              <MessageSquare className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              Media <span style={{ color: colors.primary }}>Contact</span>
            </h2>
            
            <p className="text-lg mb-8" style={{ color: colors.textSecondary }}>
              For press inquiries, interview requests, or media partnerships
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <motion.div
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl text-center"
                style={{ 
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  Press Inquiries
                </div>
                <div style={{ color: colors.primary }} className="font-bold">
                  {data.supportMail}
                </div>
                <div className="text-sm mt-2" style={{ color: colors.textSecondary }}>
                  Response within 24 hours
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl text-center"
                style={{ 
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div className="font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  Media Relations
                </div>
                <div style={{ color: colors.primary }} className="font-bold">
                  +91 {data.mob1}
                </div>
                <div className="text-sm mt-2" style={{ color: colors.textSecondary }}>
                  Mon-Fri, 9AM-6PM IST
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              Stay Updated with HumRahii
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>
              Subscribe to our press mailing list for the latest news, updates, and announcements
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.textPrimary
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-lg font-bold whitespace-nowrap"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: 'white'
                  }}
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-sm mt-4" style={{ color: colors.textSecondary }}>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

    </div>
    </div>
  );
};

export default Press;