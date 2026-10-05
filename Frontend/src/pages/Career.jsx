import React, { useEffect, useState } from 'react';
import { 
  Rocket, Users, MapPin, Car, TrendingUp, Award, Zap, Globe,
  Heart, Shield, Coffee, Briefcase, Search, Filter, ChevronRight,
  Calendar, DollarSign, Home, Leaf, MessageCircle, Star, Play,
  CheckCircle, ExternalLink, Clock, Target, Cpu, Network
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Career = () => {


  const navigate = useNavigate()
  // Your existing color scheme
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
    document.title = "Life at Humrahii"
  }, [])

  // ======================= 1. HERO SECTION (Inspired by BlaBlaCar) =======================
  // const HeroSection = () => (
  //   <motion.section 
  //     initial={{ opacity: 0 }}
  //     animate={{ opacity: 1 }}
  //     className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
  //     style={{ backgroundColor: colors.surface }}
  //   >
  //     <div className="container mx-auto px-4 text-center relative z-10">
  //       <motion.div
  //         initial={{ y: 30, opacity: 0 }}
  //         animate={{ y: 0, opacity: 1 }}
  //         transition={{ duration: 0.8 }}
  //         className="max-w-4xl mx-auto"
  //       >
  //         <motion.h1 
  //           initial={{ y: 20, opacity: 0 }}
  //           animate={{ y: 0, opacity: 1 }}
  //           transition={{ delay: 0.2 }}
  //           className="text-5xl md:text-7xl font-black mb-6"
  //           style={{ color: colors.textPrimary }}
  //         >
  //           Ready for the <span style={{ color: colors.primary }}>next ride</span>?
  //         </motion.h1>
          
  //         <motion.p 
  //           initial={{ y: 20, opacity: 0 }}
  //           animate={{ y: 0, opacity: 1 }}
  //           transition={{ delay: 0.3 }}
  //           className="text-2xl mb-10"
  //           style={{ color: colors.textSecondary }}
  //         >
  //           Let's drive your career and the future of mobility together.
  //         </motion.p>

  //       </motion.div>
  //     </div>
      
  //     {/* Animated background elements */}
  //     <div className="absolute inset-0 overflow-hidden">
  //       <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
  //         style={{ backgroundColor: colors.primary }}
  //       ></div>
  //       <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10"
  //         style={{ backgroundColor: colors.primary }}
  //       ></div>
  //     </div>
  //   </motion.section>
  // );

  // ======================= 2. MISSION & IMPACT (Like BlaBlaCar's "Your chance to make a change") =======================
  const MissionImpact = () => (
    <motion.section 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-20"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-black mb-8"
                style={{ color: colors.textPrimary }}
              >
                Your chance to <span style={{ color: colors.primary }}>make a change</span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-xl leading-relaxed mb-10"
                style={{ color: colors.textSecondary }}
              >
                Be part of a team that's building an affordable and sustainable mobility network 
                that <strong>saves 1M+ tons of CO2 annually</strong>, enables <strong>50M+ human connections</strong>, 
                and helps commuters save <strong>₹100+ crores every year</strong> across India.
              </motion.p>

              {/* Impact Stats */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-3 gap-6"
              >
                {[
                  { value: '1M+', label: 'Tons of CO2 Saved' },
                  { value: '50M+', label: 'Connections Made' },
                  { value: '₹100Cr+', label: 'Saved by Users' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
                      {stat.value}
                    </div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden"
                style={{ 
                  backgroundColor: colors.primary,
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #C10500 100%)`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <Car className="w-32 h-32 text-white opacity-20" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl font-black text-white mb-4">500K+</div>
                    <div className="text-xl text-white/90">Happy Riders Across India</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );

  // ======================= 3. WORK CULTURE (Like "Flexibility like no one else" & "Feel our culture") =======================
  const WorkCulture = () => (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-20"
      style={{ backgroundColor: colors.surface }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Flexibility Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl"
              style={{ 
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.05)'
              }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Home className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-2xl font-black mb-4" style={{ color: colors.textPrimary }}>
                Flexibility like no one else
              </h3>
              <p className="text-lg leading-relaxed mb-6" style={{ color: colors.textSecondary }}>
                <strong>40% of our India team works fully remotely</strong> – either from home or from 
                comfortable coworking spaces. Our hybrid team members split their time between our 
                modern offices in Bangalore, Mumbai, and Delhi. We believe great work happens anywhere.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                  <span style={{ color: colors.textSecondary }}>Remote-first culture</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                  <span style={{ color: colors.textSecondary }}>Flexible hours</span>
                </div>
              </div>
            </motion.div>

            {/* Culture Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl"
              style={{ 
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.05)'
              }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Users className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-2xl font-black mb-4" style={{ color: colors.textPrimary }}>
                Feel our culture
              </h3>
              <p className="text-lg leading-relaxed mb-6" style={{ color: colors.textSecondary }}>
                It's easy to talk about culture, but ours is built on putting <strong>people first</strong>. 
                With team members from across India's diverse cultures, we celebrate wins together 
                and support each other through challenges. There's a real sense of belonging here.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                  <span style={{ color: colors.textSecondary }}>People-first approach</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                  <span style={{ color: colors.textSecondary }}>Inclusive environment</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );

  // ======================= 4. COMPANY MISSION (Like "Our mission: Be the go-to market for shared travel") =======================
  const CompanyMission = () => (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-20"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 rounded-full mb-8"
            style={{ 
              backgroundColor: `${colors.primary}15`,
              color: colors.primary,
              border: `1px solid ${colors.primary}30`
            }}
          >
            <span className="font-bold">Our mission</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-10"
            style={{ color: colors.textPrimary }}
          >
            Be the go-to platform for <span style={{ color: colors.primary }}>shared travel in India</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                A mobility platform like no other
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
                We use smart technology to fill empty seats on the road, enabling millions of Indians 
                to share rides, making daily commutes more affordable, social, and sustainable.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                Yeah, we're passionate about innovation
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: colors.textSecondary }}>
                We're 200+ people across India, including 80+ engineers in our tech hubs. 
                We all bring unique perspectives with one common goal: to bring <strong>Smarter, Greener, 
                and More Social travel</strong> to every Indian commute.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );

  // ======================= 5. STATS SECTION (Like "Numbers that speak for themselves") =======================
  const StatsSection = () => (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-20"
      style={{ backgroundColor: colors.surface }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-black text-center mb-16"
            style={{ color: colors.textPrimary }}
          >
            Numbers that speak for themselves
          </motion.h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '200+', label: 'Talented Employees', icon: <Users className="w-8 h-8" /> },
              { number: '6', label: 'Cities with Offices', icon: <MapPin className="w-8 h-8" /> },
              { number: '20+', label: 'Diverse Cultures', icon: <Globe className="w-8 h-8" /> },
              { number: '500K+', label: 'Active Members', icon: <Car className="w-8 h-8" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 mx-auto"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <div style={{ color: colors.primary }}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl font-black mb-2" style={{ color: colors.textPrimary }}>
                  {stat.number}
                </div>
                <div className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );

  // ======================= 6. TEAM TESTIMONIALS (Like "Don't take our word for it") =======================
  const TeamTestimonials = () => (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-20"
      id="jobs"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-black mb-6"
              style={{ color: colors.textPrimary }}
            >
              Don't take our word for it
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl"
              style={{ color: colors.textSecondary }}
            >
              Here's what the team is saying
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya Sharma',
                role: 'Senior Product Manager',
                quote: 'What excites me most is solving real problems for millions of commuters. The impact is visible and immediate.',
                tenure: '2.5 years at HumRahii',
                avatar: 'PS'
              },
              {
                name: 'Rahul Verma',
                role: 'Tech Lead',
                quote: 'The technical challenges of scaling to millions of rides are what get me up every morning. Best engineering culture I\'ve been part of.',
                tenure: '3 years at HumRahii',
                avatar: 'RV'
              },
              {
                name: 'Anjali Mehta',
                role: 'Growth Marketing',
                quote: 'Watching our community grow from thousands to half a million has been incredible. We\'re truly changing how India travels.',
                tenure: '1.5 years at HumRahii',
                avatar: 'AM'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl"
                style={{ 
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: colors.primary, color: 'white' }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: colors.textPrimary }}>
                      {testimonial.name}
                    </div>
                    <div className="text-sm" style={{ color: colors.textSecondary }}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                
                <p className="text-lg italic mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
                  "{testimonial.quote}"
                </p>
                
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  {testimonial.tenure}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );

  // ======================= 7. FINAL CTA (Like "Just come as you are") =======================
  const FinalCTA = () => (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-24"
      style={{ 
        backgroundColor: colors.primary,
        background: `linear-gradient(135deg, ${colors.primary} 0%, #C10500 100%)`
      }}
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
            className="text-4xl md:text-5xl font-black mb-8 text-white"
          >
            Just come as you are
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl mb-12 text-white/90"
          >
            At HumRahii, we like people for who they are. So bring yourself, your expertise, 
            and your energy. Together, let's build more sustainable, affordable, and social 
            travel for every Indian.
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-xl font-bold border-2 border-white text-lg text-white hover:bg-white/10 transition-colors"
            >
              <button  onClick={() => navigate("/contact")} className="flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contact our team
              </button>
            </motion.button>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-white/80"
          >
            We're stronger together.
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );

  // Main Component Render
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* <HeroSection /> */}
      <MissionImpact />
      <WorkCulture />
      <CompanyMission />
      <StatsSection />
      <TeamTestimonials />
      <FinalCTA />
      
  
    </div>
  );
};

export default Career;