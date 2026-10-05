import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  UserCheck,
  Camera,
  AlertCircle,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  Users,
  Car,
  Lock,
  Bell,
  Heart,
  Award,
  FileCheck,
  Fingerprint,
  MessageSquare,
  Battery,
  Zap,
  ChevronRight,
  TrendingUp,
  Smartphone,
  Headphones,
  Route
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Safety = () => {

  const navigate  = useNavigate()
  

  const user = useSelector(stats => stats.user)
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Verified Users Only",
      description: "Every user undergoes mandatory government ID verification",
      details: ["Aadhaar verification", "Driving license check", "Police verification"],
      color: "bg-[#E10600]"
    },
    {
      icon: UserCheck,
      title: "Driver Screening",
      description: "Comprehensive background checks for all drivers",
      details: ["Criminal record check", "Driving history review", "Vehicle verification"],
      color: "bg-[#111111]"
    },
    {
      icon: Camera,
      title: "Ride Tracking",
      description: "Real-time GPS tracking with SOS integration",
      details: ["Live location sharing", "Emergency alerts", "Route monitoring"],
      color: "bg-[#E10600]"
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "End-to-end encrypted payment system",
      details: ["PCI DSS compliant", "SSL encryption", "Fraud detection"],
      color: "bg-[#111111]"
    }
  ]

  const safetySteps = [
    {
      step: "01",
      title: "Before You Ride",
      items: [
        "Verify user profiles and ratings",
        "Check vehicle details and photos",
        "Review trip route and timing",
        "Share trip details with family"
      ]
    },
    {
      step: "02",
      title: "During Your Ride",
      items: [
        "Live GPS tracking active",
        "Emergency SOS button available",
        "In-app chat with co-travellers",
        "Real-time ride updates"
      ]
    },
    {
      step: "03",
      title: "After Your Ride",
      items: [
        "Rate your experience",
        "Report any concerns",
        "Share feedback",
        "Build your safety score"
      ]
    }
  ]

  const emergencyFeatures = [
    {
      icon: AlertCircle,
      title: "Emergency SOS",
      description: "One-tap emergency alert to local authorities and emergency contacts",
      response: "Under 2 minutes"
    },
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Round-the-clock customer support team for immediate assistance",
      response: "Available 24/7"
    },
    {
      icon: MapPin,
      title: "Live Location",
      description: "Real-time location sharing with trusted contacts during rides",
      response: "Real-time updates"
    },
    {
      icon: Bell,
      title: "Safety Check-ins",
      description: "Automated check-ins during long rides to ensure safety",
      response: "Every 30 minutes"
    }
  ]

  const stats = [
    { value: "99.8%", label: "Safe Rides", description: "Incident-free rides completed", icon: Star },
    { value: "500K+", label: "Verified Users", description: "Thoroughly screened community", icon: UserCheck },
    { value: "10K+", label: "Safety Reports", description: "Issues resolved within hours", icon: Shield },
    { value: "4.9/5", label: "Safety Rating", description: "Based on user reviews", icon: Award }
  ]

  const testimonials = [
    {
      name: "Anjali Mehta",
      role: "Marketing Manager, Delhi",
      quote: "As a woman travelling late at night, the safety features give me complete peace of mind. The emergency SOS is a game-changer.",
      rides: "67 safe rides",
      rating: 5
    },
    {
      name: "Rahul Verma",
      role: "IT Professional, Bangalore",
      quote: "The verification process is thorough. Knowing everyone is verified makes all the difference for daily commuting.",
      rides: "45 safe rides",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Student, Mumbai",
      quote: "The live tracking and emergency features helped me feel secure during my late-night college rides.",
      rides: "32 safe rides",
      rating: 5
    }
  ]

  const verificationSteps = [
    "Submit Government ID",
    "Background Check",
    "Vehicle Inspection",
    "Safety Training",
    "Final Approval"
  ]

    useEffect(() => {
         document.title = "Safety Guidelines"
      }, []) 

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#F7F7F7] to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#F7F7F7] to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-[#111111] mb-6 leading-tight flex flex-wrap justify-center gap-3">
              <span>Travel with</span>
              <span className="text-[#E10600]">
                Complete Confidence
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-[#555555] max-w-3xl mx-auto mb-10">
              At HumRahii, safety isn't just a feature—it's our foundation. We've built multiple layers of protection to ensure every ride is secure.
            </p>
            
            {/* Stats Grid */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-xl border border-[#E5E5E5] p-5 hover:border-[#E10600]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-[#E10600]" />
                    </div>
                    <div className="text-3xl font-bold text-[#111111]">{stat.value}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#111111] mb-1">{stat.label}</div>
                  <div className="text-xs text-[#555555]">{stat.description}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Safety Features Section */}
      <div className="bg-[#F7F7F7] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#111111] mb-6">
              Multi-Layer Safety System
            </h2>
            <p className="text-lg text-[#555555] max-w-2xl mx-auto">
              We've implemented comprehensive safety measures at every stage of your journey
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl border border-[#E5E5E5] p-8 hover:border-[#E10600] hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-[#111111] mb-3">{feature.title}</h3>
                <p className="text-[#555555] mb-4 leading-relaxed">{feature.description}</p>
                
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-[#555555]">
                      <CheckCircle className="w-4 h-4 text-[#E10600]" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Safety Steps */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 md:p-8">
            <h3 className="text-3xl font-bold text-[#111111] text-center mb-12">
              Safety at Every Step
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {safetySteps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-[#E10600] text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                  
                  <div className="bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] p-8 pt-12">
                    <h4 className="text-xl font-bold text-[#111111] mb-6 text-center">{step.title}</h4>
                    
                    <ul className="space-y-4">
                      {step.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#E10600]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-[#E10600]" />
                          </div>
                          <span className="text-[#555555]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Process */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#111111] mb-6">
              Rigorous Verification Process
            </h2>
            <p className="text-[#555555] max-w-2xl mx-auto">
              Every user goes through our 5-step verification before they can join the community
            </p>
          </div>

          {/* Verification Steps */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-[#E5E5E5] transform -translate-y-1/2" />
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative">
              {verificationSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-[#E5E5E5] flex items-center justify-center mx-auto relative">
                      <div className="w-12 h-12 rounded-full bg-[#F7F7F7] flex items-center justify-center">
                        <div className="text-lg font-bold text-[#111111]">{index + 1}</div>
                      </div>
                      {index === verificationSteps.length - 1 && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-8 h-8 rounded-full bg-[#E10600] flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-[#111111] mb-2">{step}</h4>
                  <div className="text-sm text-[#555555]">Step {index + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Details */}
          <div className="mt-16 bg-[#F7F7F7] rounded-2xl p-8 border border-[#E5E5E5]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-[#111111] mb-6">What We Verify</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-[#E10600]" />
                    <div>
                      <div className="font-semibold text-[#111111]">Identity Verification</div>
                      <div className="text-sm text-[#555555]">Government ID cross-checking</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-[#E10600]" />
                    <div>
                      <div className="font-semibold text-[#111111]">Background Check</div>
                      <div className="text-sm text-[#555555]">Criminal and driving record</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-[#E10600]" />
                    <div>
                      <div className="font-semibold text-[#111111]">Vehicle Inspection</div>
                      <div className="text-sm text-[#555555]">Document and condition check</div>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-[#111111] mb-6">Safety Training</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#E10600]" />
                    <div>
                      <div className="font-semibold text-[#111111]">Community Guidelines</div>
                      <div className="text-sm text-[#555555]">Respectful behavior training</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-[#E10600]" />
                    <div>
                      <div className="font-semibold text-[#111111]">Emergency Protocols</div>
                      <div className="text-sm text-[#555555]">Handling emergency situations</div>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-[#E10600]" />
                    <div>
                      <div className="font-semibold text-[#111111]">Communication Etiquette</div>
                      <div className="text-sm text-[#555555]">Safe and respectful communication</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Features */}
      <div className="bg-[#F7F7F7] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#111111] mb-6">
              Emergency & Support Features
            </h2>
            <p className="text-[#555555] max-w-2xl mx-auto">
              Immediate assistance when you need it most
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {emergencyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl border border-[#E5E5E5] p-8 hover:border-[#E10600] hover:shadow-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-[#E10600] flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-[#111111] mb-3">{feature.title}</h3>
                <p className="text-[#555555] text-sm mb-4 leading-relaxed">{feature.description}</p>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-[#E10600]">
                  <Clock className="w-4 h-4" />
                  <span>Response: {feature.response}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Safety Tools */}
          <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-[#111111] mb-6">Built-in Safety Tools</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5 text-[#E10600]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#111111] mb-1">In-app Safety Kit</h4>
                      <p className="text-[#555555] text-sm">Quick access to emergency contacts, ride details, and SOS</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-5 h-5 text-[#E10600]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#111111] mb-1">Safety Helpline</h4>
                      <p className="text-[#555555] text-sm">Dedicated safety team available 24/7 for assistance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                      <Route className="w-5 h-5 text-[#E10600]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#111111] mb-1">Route Monitoring</h4>
                      <p className="text-[#555555] text-sm">AI-powered route deviation alerts and monitoring</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F7F7F7] rounded-xl p-8 border border-[#E5E5E5]">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-[#E10600] flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-[#111111] mb-3">Safety First Guarantee</h4>
                  <p className="text-[#555555] mb-6">
                    We continuously monitor and improve our safety systems based on real user feedback and data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] text-sm font-semibold mb-4">
              <Heart className="w-4 h-4 mr-2 text-[#E10600]" />
              Trusted by Thousands
            </div>
            <h2 className="text-4xl font-bold text-[#111111] mb-4">
              What Our Community Says
            </h2>
            <p className="text-[#555555]">
              Real stories from riders who feel safe with HumRahii
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-[#E5E5E5] p-8 hover:border-[#E10600] hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-[#111111]">{testimonial.name}</h4>
                    <p className="text-sm text-[#555555]">{testimonial.role}</p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-[#F7F7F7] text-[#111111] rounded-lg text-xs font-medium">
                    <Car className="w-3 h-3" />
                    <span>{testimonial.rides}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-[#555555] italic mb-4">"{testimonial.quote}"</p>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#E10600] text-[#E10600]" />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-6 border-t border-[#E5E5E5]">
                  <UserCheck className="w-4 h-4 text-[#E10600]" />
                  <span className="text-sm text-[#555555]">Verified Safety Review</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-[#111111] to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              Your Safety Journey Starts Here
            </h2>
            <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto">
              Join India's safest carpooling community and travel with complete peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {
                  user.phone ? "" :  <button onClick={() => navigate("/register")} className="px-8 py-4 bg-[#E10600] text-white rounded-xl font-semibold hover:bg-[#C10500] transition-all duration-300 flex items-center gap-3">
                <Shield className="w-5 h-5" />
                Join Safely
                <ChevronRight className="w-5 h-5" />
              </button>
              }
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-12 pt-12 border-t border-white/10">
              <div className="flex items-center gap-2 text-gray-300">
                <Battery className="w-4 h-4" />
                <span>Multiple safety layers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Zap className="w-4 h-4" />
                <span>Instant emergency response</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <TrendingUp className="w-4 h-4" />
                <span>Continuous safety improvements</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Safety