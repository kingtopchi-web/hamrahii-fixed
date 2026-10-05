import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Users,
  Globe,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  UserCheck,
  Eye,
  Database,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Car,
  Cookie
} from "lucide-react";
import data from "../assets/data.json"

const PrivacyPolicy = () => {
  const [openSections, setOpenSections] = useState({
    dataCollection: true,
    dataUse: false,
    dataSharing: false,
    dataProtection: false,
    cookies: false,
    changes: false,
    contact: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const privacyPoints = [
    {
      icon: <ShieldCheck className="text-[#E10600]" size={24} />,
      title: "Your Privacy Matters",
      description: "We value and protect your personal data"
    },
    {
      icon: <Database className="text-[#E10600]" size={24} />,
      title: "Clear Data Collection",
      description: "Transparent information about data we collect"
    },
    {
      icon: <Eye className="text-[#E10600]" size={24} />,
      title: "Secure Data Handling",
      description: "Security measures to protect your information"
    },
    {
      icon: <UserCheck className="text-[#E10600]" size={24} />,
      title: "User Control",
      description: "Update or delete your data via your account"
    }
  ];

  const dataWeCollect = [
    { item: "Personal Information", purpose: "Name, phone, email for account creation" },
    { item: "Location Data", purpose: "To provide location-based services" },
    { item: "Vehicle Details", purpose: "For driver registration and verification" },
    { item: "Payment Information", purpose: "For processing transactions" },
    { item: "Usage Data", purpose: "Ride history and device information" },
    { item: "Technical Data", purpose: "Browser type, OS, page view times" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F7F7F7] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#E10600]/10 to-[#E10600]/5 mb-8"
            >
              <Shield className="text-[#E10600]" size={48} />
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-[#111111] mb-4"
            >
              HumRahii.com Privacy Policy
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-[#555555] max-w-3xl mx-auto mb-8"
            >
              This policy explains how we collect, use, and protect your data when you visit our website or application.
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center space-x-2 text-sm text-[#555555]"
            >
              <Calendar size={16} />
              <span>Effective Date: January 15, 2024</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Privacy Points */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-[#111111] mb-8 text-center">
            Our Privacy Commitment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {privacyPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {point.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111] mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-[#555555]">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data Collection Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E5E5] bg-gradient-to-r from-[#F7F7F7] to-white">
              <h3 className="text-xl font-bold text-[#111111] flex items-center gap-3">
                <Database className="text-[#E10600]" size={24} />
                1. Data We Collect
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F7F7]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111] border-r border-[#E5E5E5]">
                      Information Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {dataWeCollect.map((item, index) => (
                    <tr key={index} className="hover:bg-[#F7F7F7] transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-[#111111] border-r border-[#E5E5E5] font-medium">
                        {item.item}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#555555]">
                        {item.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-[#F7F7F7] border-t border-[#E5E5E5]">
              <p className="text-sm text-[#555555]">
                <strong>Note:</strong> Personal data is "all data with which you can be personally identified" by law. 
                We collect data when you provide it through forms and automatically through our IT systems when you visit our website.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Expandable Sections */}
        <div className="space-y-4">
          {/* Data Use Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleSection('dataUse')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#F7F7F7] to-white hover:from-[#E5E5E5] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Users className="text-[#E10600]" size={24} />
                <h3 className="text-xl font-bold text-[#111111] text-left">
                  2. Data Use
                </h3>
              </div>
              {openSections.dataUse ? (
                <ChevronUp className="text-[#555555]" size={24} />
              ) : (
                <ChevronDown className="text-[#555555]" size={24} />
              )}
            </button>
            
            {openSections.dataUse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4"
              >
                <div className="space-y-4 text-[#555555]">
                  <p>We use your data for the following purposes:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#F7F7F7] rounded-lg">
                      <h4 className="font-semibold text-[#111111] mb-2">Service Delivery</h4>
                      <p className="text-sm">To provide, improve, and personalize our ride-sharing services</p>
                    </div>
                    
                    <div className="p-4 bg-[#F7F7F7] rounded-lg">
                      <h4 className="font-semibold text-[#111111] mb-2">Support</h4>
                      <p className="text-sm">For customer support and communication regarding your rides</p>
                    </div>
                    
                    <div className="p-4 bg-[#F7F7F7] rounded-lg">
                      <h4 className="font-semibold text-[#111111] mb-2">Safety</h4>
                      <p className="text-sm">For safety and security of our platform and users</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Data Sharing Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleSection('dataSharing')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#F7F7F7] to-white hover:from-[#E5E5E5] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Globe className="text-[#E10600]" size={24} />
                <h3 className="text-xl font-bold text-[#111111] text-left">
                  3. Data Sharing
                </h3>
              </div>
              {openSections.dataSharing ? (
                <ChevronUp className="text-[#555555]" size={24} />
              ) : (
                <ChevronDown className="text-[#555555]" size={24} />
              )}
            </button>
            
            {openSections.dataSharing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4"
              >
                <div className="space-y-4 text-[#555555]">
                  <div className="p-4 bg-gradient-to-r from-[#E10600]/5 to-transparent rounded-lg border border-[#E10600]/20">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="text-[#E10600]" size={20} />
                      <h4 className="font-bold text-[#111111]">Limited Data Sharing</h4>
                    </div>
                    <p className="text-sm">
                      We only share your data when necessary for service operation or as required by law.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#111111]">We share data with:</h4>
                    
                    <div className="pl-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-[#E10600] mt-1 flex-shrink-0" size={18} />
                        <span><strong className="text-[#111111]">Drivers/Passengers:</strong> For ride coordination and communication</span>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-[#E10600] mt-1 flex-shrink-0" size={18} />
                        <span><strong className="text-[#111111]">Payment Gateways:</strong> For processing your transactions securely</span>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-[#E10600] mt-1 flex-shrink-0" size={18} />
                        <span><strong className="text-[#111111]">Legal Authorities:</strong> When required by law or legal process</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Data Protection Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleSection('dataProtection')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#F7F7F7] to-white hover:from-[#E5E5E5] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Lock className="text-[#E10600]" size={24} />
                <h3 className="text-xl font-bold text-[#111111] text-left">
                  4. Data Protection
                </h3>
              </div>
              {openSections.dataProtection ? (
                <ChevronUp className="text-[#555555]" size={24} />
              ) : (
                <ChevronDown className="text-[#555555]" size={24} />
              )}
            </button>
            
            {openSections.dataProtection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4"
              >
                <div className="space-y-4 text-[#555555]">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#E10600] flex items-center justify-center">
                        <ShieldCheck className="text-white" size={24} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111111] mb-2">Security Measures</h4>
                      <p>We implement security measures to protect your personal data from unauthorized access and misuse.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F7F7F7] rounded-lg">
                      <div className="font-semibold text-[#111111] mb-2">User Control</div>
                      <p className="text-sm">You can update or delete your data through your account settings</p>
                    </div>
                    
                    <div className="p-4 bg-[#F7F7F7] rounded-lg">
                      <div className="font-semibold text-[#111111] mb-2">Technical Security</div>
                      <p className="text-sm">We use industry-standard security protocols and measures</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Cookies Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleSection('cookies')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#F7F7F7] to-white hover:from-[#E5E5E5] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Cookie className="text-[#E10600]" size={24} />
                <h3 className="text-xl font-bold text-[#111111] text-left">
                  5. Cookies
                </h3>
              </div>
              {openSections.cookies ? (
                <ChevronUp className="text-[#555555]" size={24} />
              ) : (
                <ChevronDown className="text-[#555555]" size={24} />
              )}
            </button>
            
            {openSections.cookies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4"
              >
                <div className="space-y-4 text-[#555555]">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#E10600]/10 flex items-center justify-center">
                        <Cookie className="text-[#E10600]" size={24} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111111] mb-2">Cookie Usage</h4>
                      <p>We use cookies to enhance your experience on our platform:</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F7F7F7] rounded-lg">
                      <div className="font-semibold text-[#111111] mb-2">Analytics</div>
                      <p className="text-sm">To understand how users interact with our website and app</p>
                    </div>
                    
                    <div className="p-4 bg-[#F7F7F7] rounded-lg">
                      <div className="font-semibold text-[#111111] mb-2">User Experience</div>
                      <p className="text-sm">To improve and personalize your experience on our platform</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Changes to Policy Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleSection('changes')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-[#F7F7F7] to-white hover:from-[#E5E5E5] transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-[#E10600]" size={24} />
                <h3 className="text-xl font-bold text-[#111111] text-left">
                  6. Changes to This Policy
                </h3>
              </div>
              {openSections.changes ? (
                <ChevronUp className="text-[#555555]" size={24} />
              ) : (
                <ChevronDown className="text-[#555555]" size={24} />
              )}
            </button>
            
            {openSections.changes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 py-4"
              >
                <div className="space-y-4 text-[#555555]">
                  <div className="p-4 bg-gradient-to-r from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                    <p className="text-sm">
                      <strong>Policy Updates:</strong> We may update this privacy policy from time to time. 
                      Any changes will be posted on this page, and we encourage you to review this policy periodically.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="text-[#555555]" size={16} />
                    <span>Last updated: January 15, 2024</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 bg-gradient-to-r from-[#F7F7F7] to-white rounded-xl border border-[#E5E5E5] p-8 shadow-sm"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#111111] mb-2">7. Contact Us</h3>
            <p className="text-[#555555]">For any questions about our Privacy Policy</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E10600] flex items-center justify-center">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111111]">Email Support</h4>
                  <p className="text-[#555555]">{data.supportMail}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E10600] flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111111]">Responsible Body</h4>
                  <p className="text-[#555555]">24/7 Customer Support Center</p>
                  <p className="text-sm text-[#777777] mt-1">(Data controller for personal data processing)</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E10600] flex items-center justify-center">
                  <Phone className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111111]">Phone Numbers</h4>
                  <p className="text-[#555555]">+91-{data.mob1}</p>
                  <p className="text-[#555555]">+91-{data.mob2}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E10600] flex items-center justify-center">
                  <Globe className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#111111]">Website</h4>
                  <p className="text-[#555555]">{data.website}</p>
                  <p className="text-sm text-[#777777] mt-1">(Also accessible as HumRahii.com)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
            <p className="text-sm text-[#555555] text-center">
              <strong>Note:</strong> The responsible body decides on the purposes and means of processing personal data 
              on this website, either alone or jointly with others.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;