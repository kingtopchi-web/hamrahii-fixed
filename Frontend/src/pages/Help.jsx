
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Shield,
  CreditCard,
  Navigation,
  User,
  AlertTriangle,
  Settings,
  Globe,
  Download,
  ChevronRight,
  BookOpen,
  Headphones,
  Clock,
  Star,
  CheckCircle,
  MapPin,
  Wallet,
  Calendar,
  Users,
  Car,
  Smartphone,
  MessageSquare,
  ExternalLink,
  ArrowRight,
  Send,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Axios from '../services/axios.js';
import { api } from '../services/endpoints';
import { useNavigate } from 'react-router-dom';
import data from '../assets/data.json'

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate()
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: ''
  });

  // Contact form categories
  const contactCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'safety', label: 'Safety Concern' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle, count: 45 },
    { id: 'account', name: 'Account & Profile', icon: User, count: 12 },
    { id: 'booking', name: 'Booking & Rides', icon: Calendar, count: 15 },
    { id: 'payments', name: 'Payments & Refunds', icon: CreditCard, count: 8 },
    { id: 'safety', name: 'Safety & Security', icon: Shield, count: 6 },
    { id: 'technical', name: 'Technical Support', icon: Settings, count: 4 },
  ];

  const popularArticles = [
    {
      id: 1,
      title: 'How to book a ride on Humrahii',
      category: 'booking',
      views: 12543,
      icon: Navigation,
      content: 'Learn how to book a ride, choose vehicle type, and schedule rides in advance.'
    },
    {
      id: 2,
      title: 'Setting up your payment methods',
      category: 'payments',
      views: 8921,
      icon: Wallet,
      content: 'Add and manage your payment options including credit cards, UPI, and wallets.'
    },
    {
      id: 3,
      title: 'Understanding surge pricing',
      category: 'payments',
      views: 7543,
      icon: AlertTriangle,
      content: 'Learn how and why prices change during high demand periods.'
    },
    {
      id: 4,
      title: 'Safety features and SOS button',
      category: 'safety',
      views: 6890,
      icon: Shield,
      content: 'How to use our safety features including SOS, ride sharing, and emergency contacts.'
    },
    {
      id: 5,
      title: 'Cancellation policy and fees',
      category: 'booking',
      views: 6321,
      icon: Calendar,
      content: 'Understand our cancellation policy and when fees apply.'
    },
    {
      id: 6,
      title: 'Driver verification process',
      category: 'safety',
      views: 5210,
      icon: Users,
      content: 'Learn about our driver screening and vehicle inspection procedures.'
    },
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to Profile → Security → Reset Password. Enter your registered email to receive reset instructions.',
      category: 'account'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'Humrahii accepts Credit/Debit cards, UPI, Net Banking, and popular digital wallets.',
      category: 'payments'
    },
    {
      question: 'How long do refunds take?',
      answer: 'Refunds are processed within 5-7 business days and appear in your original payment method.',
      category: 'payments'
    },
    {
      question: 'How do I cancel a ride?',
      answer: 'Go to My Rides → Select ongoing ride → Tap Cancel. Free cancellation within 30 minutes of booking.',
      category: 'booking'
    },
    {
      question: 'What is the fare calculation method?',
      answer: 'Fares are based on distance, time, vehicle type, and demand. See fare breakdown in ride details.',
      category: 'payments'
    },
    {
      question: 'How do I contact my driver?',
      answer: 'Once ride is confirmed, use the in-app call or message feature to contact your driver.',
      category: 'booking'
    },
    {
      question: 'What if I left something in the vehicle?',
      answer: 'Use the Lost & Found feature in the app or contact support immediately with ride details.',
      category: 'booking'
    },
    {
      question: 'How do I become a Humrahii driver?',
      answer: 'Visit our Driver Portal, complete the application, and follow the verification process.',
      category: 'account'
    },
  ];

  const contactMethods = [
    {
      title: '24/7 Support Chat',
      icon: MessageCircle,
      description: 'Instant help via in-app chat',
      responseTime: 'Within 2 minutes',
      buttonText: 'Start Chat',
      color: 'bg-blue-50 text-blue-600',
      onClick: () => setShowContactForm(true)
    },
    {
      title: 'Phone Support',
      icon: Phone,
      description: 'Call our customer care',
      responseTime: '24/7 availability',
      buttonText: 'Call Now',
      color: 'bg-green-50 text-green-600',
      onClick: () => window.location.href = `tel:${data.mob1}`
    },
    {
      title: 'Email Support',
      icon: Mail,
      description: 'Send us an email',
      responseTime: 'Within 24 hours',
      buttonText: 'Send Email',
      color: 'bg-purple-50 text-purple-600',
      onClick: () => window.location.href = `mailto:${data?.supportMail}`
    },
    {
      title: 'Twitter Support',
      icon: MessageSquare,
      description: 'Tweet @HamrahiHelp',
      responseTime: 'Within 1 hour',
      buttonText: 'Tweet Now',
      color: 'bg-sky-50 text-sky-600',
      onClick: () => window.open('https://twitter.com/HamrahiHelp', '_blank')
    },
  ];

  const helpTopics = [
    {
      title: 'Getting Started',
      items: [
        'Creating your Humrahii account',
        'Verifying your phone number',
        'Setting up your profile',
        'Understanding the app interface'
      ]
    },
    {
      title: 'Booking & Riding',
      items: [
        'How to book a ride',
        'Scheduling rides in advance',
        'Choosing vehicle types',
        'Sharing ride details'
      ]
    },
    {
      title: 'Payments',
      items: [
        'Adding payment methods',
        'Using promo codes',
        'Understanding receipts',
        'Managing subscriptions'
      ]
    },
    {
      title: 'Safety',
      items: [
        'Using SOS feature',
        'Sharing live location',
        'Verifying drivers',
        'Reporting incidents'
      ]
    }
  ];

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

  // Handle contact form input changes
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit contact form
  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

  const  customer = {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        subject: contactForm.subject,
        category: contactForm.category,
        message: contactForm.message,
        
    }


    try {
      const response = await Axios.post(api.user.contact, {customer});
   

      if (response.data.success) {
        toast.success('Your message has been sent successfully! We\'ll get back to you soon.');
        
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          category: 'general',
          message: ''
        });
        
        // Close form
        setShowContactForm(false);
      } else {
        toast.error(response.data.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      // console.error('Contact form error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredArticles = activeCategory === 'all' 
    ? popularArticles 
    : popularArticles.filter(article => article.category === activeCategory);

  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="min-h-screen bg-white flex w-full md:w-[80%] justify-center items-center mx-auto">
      <div>

     
      {/* Header */}
      <header className="bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/10">
                <Headphones className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Help Center</h1>
                <p className="text-white/80">How can we help you today?</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>24/7 Support Available</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 shadow-lg"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#E10600] text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
                Search
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="text-white/80 text-sm">Popular searches:</span>
              {['cancel ride', 'refund', 'safety', 'payment', 'driver'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-[#F7F7F7] rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-4">
              <CheckCircle className="w-6 h-6 text-[#E10600]" />
            </div>
            <p className="text-2xl font-bold text-[#111111]">98%</p>
            <p className="text-sm text-[#555555]">Issue Resolution Rate</p>
          </div>
          <div className="bg-[#F7F7F7] rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-4">
              <Clock className="w-6 h-6 text-[#E10600]" />
            </div>
            <p className="text-2xl font-bold text-[#111111]">2 min</p>
            <p className="text-sm text-[#555555]">Avg. Response Time</p>
          </div>
          <div className="bg-[#F7F7F7] rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-4">
              <Star className="w-6 h-6 text-[#E10600]" />
            </div>
            <p className="text-2xl font-bold text-[#111111]">4.8/5</p>
            <p className="text-sm text-[#555555]">Customer Satisfaction</p>
          </div>
          <div className="bg-[#F7F7F7] rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-4">
              <Users className="w-6 h-6 text-[#E10600]" />
            </div>
            <p className="text-2xl font-bold text-[#111111]">24/7</p>
            <p className="text-sm text-[#555555]">Support Available</p>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-[#111111] mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'border-[#E10600] bg-red-50'
                      : 'border-[#E5E5E5] bg-[#F7F7F7] hover:border-[#B8B8B8]'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <Icon className={`w-8 h-8 mb-2 ${
                      activeCategory === category.id ? 'text-[#E10600]' : 'text-[#555555]'
                    }`} />
                    <span className={`font-medium text-center ${
                      activeCategory === category.id ? 'text-[#111111]' : 'text-[#555555]'
                    }`}>
                      {category.name}
                    </span>
                    <span className="text-xs text-[#B8B8B8] mt-1">{category.count} articles</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Popular Articles */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#111111]">Popular Help Articles</h2>
            <button className="text-[#E10600] font-medium flex items-center space-x-1 hover:text-red-700 transition-colors">
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const Icon = article.icon;
              return (
                <motion.div
                  key={article.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] p-6 hover:border-[#E10600] hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-white border border-[#E5E5E5]">
                      <Icon className="w-6 h-6 text-[#E10600]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#111111] mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[#555555] mb-4 line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#B8B8B8]">
                          {article.views.toLocaleString()} views
                        </span>
                        <button className="text-[#E10600] text-sm font-medium flex items-center space-x-1">
                          <span>Read more</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-[#111111] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-white">
                      <HelpCircle className="w-5 h-5 text-[#E10600]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#111111] mb-2">{faq.question}</h3>
                      <p className="text-[#555555]">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Methods */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-[#111111] mb-6">Get in Touch</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] p-6"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-lg ${method.color.split(' ')[0]}`}>
                      <Icon className={`w-6 h-6 ${method.color.split(' ')[1]}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#111111]">{method.title}</h3>
                      <p className="text-sm text-[#555555]">{method.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-sm text-[#555555]">
                      <Clock className="w-4 h-4" />
                      <span>{method.responseTime}</span>
                    </div>
                    <button 
                      onClick={method.onClick}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        method.buttonText === 'Call Now' 
                          ? 'bg-[#E10600] text-white hover:bg-red-700'
                          : 'bg-white border border-[#E5E5E5] text-[#111111] hover:border-[#E10600]'
                      } transition-colors`}
                    >
                      {method.buttonText}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-8 h-8 text-[#E10600]" />
                  <div>
                    <h2 className="text-2xl font-bold text-[#111111]">Contact Support</h2>
                    <p className="text-[#555555]">We'll get back to you within 24 hours</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="p-2 hover:bg-[#F7F7F7] rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-[#555555]" />
                </button>
              </div>

              <form onSubmit={handleContactFormSubmit} className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:border-[#E10600] focus:ring-2 focus:ring-red-100 outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:border-[#E10600] focus:ring-2 focus:ring-red-100 outline-none transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactFormChange}
                      className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:border-[#E10600] focus:ring-2 focus:ring-red-100 outline-none transition-colors"
                      placeholder="+1 (234) 567-8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={contactForm.category}
                      onChange={handleContactFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:border-[#E10600] focus:ring-2 focus:ring-red-100 outline-none transition-colors"
                    >
                      {contactCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:border-[#E10600] focus:ring-2 focus:ring-red-100 outline-none transition-colors"
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#111111] mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:border-[#E10600] focus:ring-2 focus:ring-red-100 outline-none transition-colors resize-none"
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#555555]">
                    <p>Fields marked with * are required</p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-6 py-3 rounded-lg border border-[#E5E5E5] text-[#111111] font-medium hover:border-[#E10600] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-lg bg-[#E10600] text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Help Topics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-[#F7F7F7] to-white rounded-xl border border-[#E5E5E5] p-8 mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#111111] mb-2">Quick Help Topics</h2>
              <p className="text-[#555555]">Find answers to common questions organized by topic</p>
            </div>
            <BookOpen className="w-8 h-8 text-[#E10600]" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {helpTopics.map((topic, index) => (
              <div key={index}>
                <h3 className="font-semibold text-[#111111] mb-4 pb-2 border-b border-[#E5E5E5]">
                  {topic.title}
                </h3>
                <ul className="space-y-3">
                  {topic.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <ChevronRight className="w-4 h-4 text-[#E10600] mr-2 mt-1 flex-shrink-0" />
                      <span className="text-[#555555] hover:text-[#111111] cursor-pointer transition-colors">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Additional Resources */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="border-t border-[#E5E5E5] pt-12"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F7F7F7] mb-4">
                <Download className="w-6 h-6 text-[#E10600]" />
              </div>
              <h3 className="font-semibold text-[#111111] mb-2">Download App</h3>
              <p className="text-[#555555] mb-4">Get the latest version of Humrahii app</p>
              <div className="flex justify-center space-x-3">
                <button className="px-4 py-2 bg-[#111111] text-white rounded-lg text-sm">
                  App Store
                </button>
                <button className="px-4 py-2 bg-[#111111] text-white rounded-lg text-sm">
                  Google Play
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F7F7F7] mb-4">
                <FileText className="w-6 h-6 text-[#E10600]" />
              </div>
              <h3 className="font-semibold text-[#111111] mb-2">Legal Documents</h3>
              <p className="text-[#555555] mb-4">Read our terms and policies</p>
              <div className="flex justify-center space-x-3">
                <button onClick={() => navigate("/terms")} className="px-4 py-2 border border-[#E5E5E5] text-[#111111] rounded-lg text-sm hover:border-[#E10600] transition-colors">
                  Terms & Conditions
                </button>
                <button onClick={() => navigate("/privacy")} className="px-4 py-2 border border-[#E5E5E5] text-[#111111] rounded-lg text-sm hover:border-[#E10600] transition-colors">
                  Privacy Policy
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F7F7F7] mb-4">
                <ExternalLink className="w-6 h-6 text-[#E10600]" />
              </div>
              <h3 className="font-semibold text-[#111111] mb-2">Community</h3>
              <p className="text-[#555555] mb-4">Join our community forums</p>
              <button onClick={() => navigate("/community")} className="px-6 py-2 bg-[#E10600] text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                Visit Community
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
 
    </div>
     </div>
  );
};

export default Help;