import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Cookie,
  Settings,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Globe,
  Lock,
  Database,
  Share2,
  Bell,
  BarChart3,
  Users,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  FileText,
  HelpCircle,
  Mail,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Download
} from 'lucide-react'

const CookiesPolicy = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  })

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const cookieTypes = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'Required for basic site functionality. Cannot be disabled.',
      purpose: 'Authentication, security, session management',
      duration: 'Session / 30 days',
      icon: Shield,
      color: 'text-[#E10600]',
      bgColor: 'bg-[#E10600]/10',
      required: true
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      purpose: 'Traffic analysis, performance monitoring',
      duration: '1-2 years',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      required: false
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements and track campaigns.',
      purpose: 'Advertising, campaign measurement',
      duration: '1 year',
      icon: Bell,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      required: false
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced features and personalization.',
      purpose: 'Preferences, language settings',
      duration: '1 year',
      icon: Settings,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      required: false
    }
  ]

  const cookieDetails = [
    {
      name: 'session_id',
      type: 'Essential',
      purpose: 'Maintain user session',
      provider: 'HumRahii',
      duration: 'Session',
      domain: '.humrahii.com'
    },
    {
      name: '_ga',
      type: 'Analytics',
      purpose: 'Google Analytics tracking',
      provider: 'Google',
      duration: '2 years',
      domain: '.humrahii.com'
    },
    {
      name: '_fbp',
      type: 'Marketing',
      purpose: 'Facebook pixel tracking',
      provider: 'Meta',
      duration: '90 days',
      domain: '.facebook.com'
    },
    {
      name: 'language',
      type: 'Functional',
      purpose: 'Store language preference',
      provider: 'HumRahii',
      duration: '1 year',
      domain: '.humrahii.com'
    },
    {
      name: 'preferences',
      type: 'Functional',
      purpose: 'User interface preferences',
      provider: 'HumRahii',
      duration: '1 year',
      domain: '.humrahii.com'
    }
  ]

  const sections = [
    { id: 'overview', title: 'Overview' },
    { id: 'types', title: 'Cookie Types' },
    { id: 'manage', title: 'Manage Cookies' },
    { id: 'details', title: 'Detailed List' },
    { id: 'rights', title: 'Your Rights' },
    { id: 'updates', title: 'Updates' }
  ]

  const handleCookieToggle = (cookieId) => {
    if (cookieId === 'essential') return // Essential cookies cannot be disabled
    
    setCookiePreferences(prev => ({
      ...prev,
      [cookieId]: !prev[cookieId]
    }))
  }

  const handleAcceptAll = () => {
    setCookiePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    })
  }

  const handleRejectAll = () => {
    setCookiePreferences({
      essential: true, // Cannot disable essential
      analytics: false,
      marketing: false,
      functional: false
    })
  }

  const handleSavePreferences = () => {
    // In a real app, this would save to localStorage or send to backend
    // console.log('Cookie preferences saved:', cookiePreferences)
    alert('Your cookie preferences have been saved.')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-[#E10600]" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#111111]">Cookie Policy</h1>
                  <p className="text-[#555555]">Last updated: December 15, 2023</p>
                </div>
              </div>
            </div>
            
          
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="sticky top-8">
              <div className="bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] p-6 mb-6">
                <h3 className="font-bold text-[#111111] mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Quick Navigation
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                        activeSection === section.id
                          ? 'bg-white border border-[#E10600] text-[#E10600] font-semibold'
                          : 'text-[#555555] hover:bg-white hover:border hover:border-[#E5E5E5]'
                      }`}
                    >
                      <span>{section.title}</span>
                      {activeSection === section.id && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Settings */}
              <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
                <h3 className="font-bold text-[#111111] mb-4 flex items-center gap-2">
                  <Cookie className="w-4 h-4 text-[#E10600]" />
                  Quick Settings
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={handleAcceptAll}
                    className="w-full px-4 py-3 bg-[#E10600] text-white rounded-lg font-semibold hover:bg-[#C10500] transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept All Cookies
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="w-full px-4 py-3 bg-white border-2 border-[#E5E5E5] text-[#111111] rounded-lg font-semibold hover:border-[#111111] transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Non-Essential
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-[#E10600]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#111111] mb-2">What Are Cookies?</h2>
                      <p className="text-[#555555]">
                        Cookies are small text files that are stored on your device when you visit our website. 
                        They help us provide you with a better experience by remembering your preferences and 
                        understanding how you use our services.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-[#F7F7F7] rounded-lg p-6">
                      <div className="w-12 h-12 rounded-lg bg-[#E10600] flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-[#111111] mb-2">Safe & Secure</h3>
                      <p className="text-sm text-[#555555]">
                        We only use cookies to improve your experience. Your privacy is protected.
                      </p>
                    </div>
                    <div className="bg-[#F7F7F7] rounded-lg p-6">
                      <div className="w-12 h-12 rounded-lg bg-[#111111] flex items-center justify-center mb-4">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-[#111111] mb-2">Transparent</h3>
                      <p className="text-sm text-[#555555]">
                        We clearly explain what each cookie does and why we use it.
                      </p>
                    </div>
                    <div className="bg-[#F7F7F7] rounded-lg p-6">
                      <div className="w-12 h-12 rounded-lg bg-[#B8B8B8] flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold text-[#111111] mb-2">Your Control</h3>
                      <p className="text-sm text-[#555555]">
                        You can manage or disable non-essential cookies at any time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-xl border border-[#E5E5E5] p-8">
                  <h3 className="text-xl font-bold text-[#111111] mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-[#E10600]" />
                    Important Notice
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-[#111111] font-medium">Essential cookies cannot be disabled</p>
                        <p className="text-[#555555] text-sm">
                          These are required for the website to function properly
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#E10600] mt-0.5" />
                      <div>
                        <p className="text-[#111111] font-medium">Your preferences are saved for 1 year</p>
                        <p className="text-[#555555] text-sm">
                          You can update your cookie settings at any time
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-[#111111] font-medium">Third-party cookies</p>
                        <p className="text-[#555555] text-sm">
                          Some cookies are set by our trusted partners to provide additional services
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cookie Types Section */}
            {activeSection === 'types' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
                  <h2 className="text-2xl font-bold text-[#111111] mb-8">Types of Cookies We Use</h2>
                  
                  <div className="space-y-6">
                    {cookieTypes.map((cookie) => (
                      <div 
                        key={cookie.id}
                        className={`p-6 rounded-xl border ${
                          cookie.required 
                            ? 'border-[#E10600] bg-[#E10600]/5' 
                            : 'border-[#E5E5E5] bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg ${cookie.bgColor} flex items-center justify-center`}>
                              <cookie.icon className={`w-6 h-6 ${cookie.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-[#111111]">{cookie.name}</h3>
                                {cookie.required && (
                                  <span className="px-2 py-1 bg-[#E10600] text-white text-xs font-semibold rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-[#555555] mt-2">{cookie.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {!cookie.required && (
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  id={cookie.id}
                                  checked={cookiePreferences[cookie.id]}
                                  onChange={() => handleCookieToggle(cookie.id)}
                                  className="sr-only"
                                />
                                <label
                                  htmlFor={cookie.id}
                                  className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                                    cookiePreferences[cookie.id] ? 'bg-[#E10600]' : 'bg-gray-300'
                                  }`}
                                >
                                  <span className={`block w-4 h-4 rounded-full bg-white transform transition-transform ${
                                    cookiePreferences[cookie.id] ? 'translate-x-7' : 'translate-x-1'
                                  } mt-1`} />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#E5E5E5]/50">
                          <div>
                            <h4 className="text-sm font-semibold text-[#111111] mb-1">Purpose</h4>
                            <p className="text-sm text-[#555555]">{cookie.purpose}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#111111] mb-1">Duration</h4>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-[#555555]" />
                              <span className="text-sm text-[#555555]">{cookie.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Manage Cookies Section */}
            {activeSection === 'manage' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
                  <h2 className="text-2xl font-bold text-[#111111] mb-6">Manage Your Cookie Preferences</h2>
                  
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#111111]">Current Settings</h3>
                      <button
                        onClick={handleSavePreferences}
                        className="px-4 py-2 bg-[#E10600] text-white rounded-lg font-semibold hover:bg-[#C10500] transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Save Preferences
                      </button>
                    </div>
                    
                    <div className="bg-[#F7F7F7] rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {cookieTypes.map((cookie) => (
                          <div key={cookie.id} className="text-center">
                            <div className={`w-16 h-16 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                              cookiePreferences[cookie.id] 
                                ? cookie.id === 'essential' ? 'bg-[#E10600]/20' : 'bg-green-100' 
                                : 'bg-gray-100'
                            }`}>
                              <cookie.icon className={`w-8 h-8 ${
                                cookiePreferences[cookie.id] 
                                  ? cookie.id === 'essential' ? 'text-[#E10600]' : 'text-green-600' 
                                  : 'text-gray-400'
                              }`} />
                            </div>
                            <div className="text-sm font-semibold text-[#111111]">{cookie.name}</div>
                            <div className={`text-xs font-medium ${
                              cookiePreferences[cookie.id] ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {cookiePreferences[cookie.id] ? 'Enabled' : 'Disabled'}
                            </div>
                            {cookie.required && (
                              <div className="text-xs text-[#555555] mt-1">Always enabled</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-[#F7F7F7] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#111111] mb-4">Browser Settings</h3>
                      <p className="text-[#555555] mb-4">
                        You can also manage cookies through your browser settings. Here's how:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-[#111111] mb-2">Google Chrome</div>
                          <p className="text-sm text-[#555555]">
                            Settings → Privacy and security → Cookies and other site data
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-[#111111] mb-2">Safari</div>
                          <p className="text-sm text-[#555555]">
                            Preferences → Privacy → Cookies and website data
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-[#111111] mb-2">Firefox</div>
                          <p className="text-sm text-[#555555]">
                            Options → Privacy & Security → Cookies and Site Data
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F7F7F7] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#111111] mb-4">Clear Existing Cookies</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[#555555] mb-2">
                            Clear all cookies stored by HumRahii in your browser
                          </p>
                          <p className="text-sm text-[#555555]">
                            Note: This will log you out and reset your preferences
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-white border-2 border-[#E5E5E5] text-[#111111] rounded-lg font-semibold hover:border-[#E10600] transition-colors flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Detailed List Section */}
            {activeSection === 'details' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
                  <h2 className="text-2xl font-bold text-[#111111] mb-6">Detailed Cookie List</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#F7F7F7]">
                          <th className="text-left p-4 font-semibold text-[#111111]">Cookie Name</th>
                          <th className="text-left p-4 font-semibold text-[#111111]">Type</th>
                          <th className="text-left p-4 font-semibold text-[#111111]">Purpose</th>
                          <th className="text-left p-4 font-semibold text-[#111111]">Provider</th>
                          <th className="text-left p-4 font-semibold text-[#111111]">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5]">
                        {cookieDetails.map((cookie, index) => (
                          <tr key={index} className="hover:bg-[#F7F7F7]">
                            <td className="p-4">
                              <div className="font-medium text-[#111111]">{cookie.name}</div>
                              <div className="text-sm text-[#555555]">{cookie.domain}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                cookie.type === 'Essential'
                                  ? 'bg-[#E10600]/10 text-[#E10600]'
                                  : cookie.type === 'Analytics'
                                  ? 'bg-blue-100 text-blue-600'
                                  : cookie.type === 'Marketing'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-green-100 text-green-600'
                              }`}>
                                {cookie.type}
                              </span>
                            </td>
                            <td className="p-4 text-[#555555]">{cookie.purpose}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {cookie.provider === 'HumRahii' ? (
                                  <>
                                    <div className="w-6 h-6 rounded bg-[#E10600] flex items-center justify-center">
                                      <Shield className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-[#111111]">{cookie.provider}</span>
                                  </>
                                ) : (
                                  <span className="text-[#555555]">{cookie.provider}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 text-[#555555]">
                                <Clock className="w-4 h-4" />
                                {cookie.duration}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 p-6 bg-[#F7F7F7] rounded-lg">
                    <h3 className="text-lg font-semibold text-[#111111] mb-4">Third-Party Cookies</h3>
                    <p className="text-[#555555] mb-4">
                      Some cookies are set by our trusted partners to provide additional services:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-[#555555]" />
                        <span className="text-[#555555]">Google Analytics - Website traffic analysis</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-[#555555]" />
                        <span className="text-[#555555]">Facebook Pixel - Advertising measurement</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Lock className="w-4 h-4 text-[#555555]" />
                        <span className="text-[#555555]">Payment processors - Secure transaction processing</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Your Rights Section */}
            {activeSection === 'rights' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
                  <h2 className="text-2xl font-bold text-[#111111] mb-6">Your Privacy Rights</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-[#F7F7F7] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#E10600]" />
                        GDPR & Privacy Regulations
                      </h3>
                      <p className="text-[#555555] mb-4">
                        Under GDPR and other privacy regulations, you have specific rights regarding your data:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-[#111111] mb-2">Right to Access</h4>
                          <p className="text-sm text-[#555555]">
                            Request a copy of your personal data we process
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-[#111111] mb-2">Right to Rectification</h4>
                          <p className="text-sm text-[#555555]">
                            Correct inaccurate or incomplete personal data
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-[#111111] mb-2">Right to Erasure</h4>
                          <p className="text-sm text-[#555555]">
                            Request deletion of your personal data
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-[#111111] mb-2">Right to Object</h4>
                          <p className="text-sm text-[#555555]">
                            Object to processing of your personal data
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-[#111111]">How to Exercise Your Rights</h3>
                      
                      <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                        <h4 className="font-semibold text-[#111111] mb-4 flex items-center gap-2">
                          <Mail className="w-5 h-5 text-[#E10600]" />
                          Contact Our Privacy Team
                        </h4>
                        <div className="space-y-3">
                          <p className="text-[#555555]">
                            Email: <span className="font-semibold text-[#111111]">privacy@humrahii.com</span>
                          </p>
                          <p className="text-[#555555]">
                            Phone: <span className="font-semibold text-[#111111]">+91 1800-XXX-XXXX</span>
                          </p>
                          <p className="text-[#555555]">
                            Address: Privacy Office, HumRahii Technologies, Bangalore, India
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                        <h4 className="font-semibold text-[#111111] mb-4 flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-[#E10600]" />
                          Through Our App
                        </h4>
                        <p className="text-[#555555] mb-4">
                          You can manage your privacy settings directly in the HumRahii app:
                        </p>
                        <div className="flex items-center gap-4">
                          <button className="px-4 py-2 bg-[#E10600] text-white rounded-lg font-semibold hover:bg-[#C10500] transition-colors flex items-center gap-2">
                            Go to Settings
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button className="px-4 py-2 bg-white border-2 border-[#E5E5E5] text-[#111111] rounded-lg font-semibold hover:border-[#E10600] transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Updates Section */}
            {activeSection === 'updates' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-8">
                  <h2 className="text-2xl font-bold text-[#111111] mb-6">Policy Updates</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-[#F7F7F7] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#111111] mb-4">Update History</h3>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-[#111111]">December 15, 2023</span>
                            <span className="px-2 py-1 bg-[#E10600]/10 text-[#E10600] text-xs font-semibold rounded">
                              Current
                            </span>
                          </div>
                          <p className="text-sm text-[#555555]">
                            Added detailed cookie descriptions and enhanced user control options
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-[#111111] mb-2">September 1, 2023</div>
                          <p className="text-sm text-[#555555]">
                            Updated third-party cookie information and compliance requirements
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="font-semibold text-[#111111] mb-2">June 15, 2023</div>
                          <p className="text-sm text-[#555555]">
                            Initial cookie policy published with basic cookie information
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#111111] mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-[#E10600]" />
                        Stay Updated
                      </h3>
                      <p className="text-[#555555] mb-4">
                        We may update this Cookie Policy from time to time. We will notify you of any significant 
                        changes by:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-[#E10600]" />
                          <span className="text-[#555555]">Email notification to registered users</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <ExternalLink className="w-4 h-4 text-[#E10600]" />
                          <span className="text-[#555555]">Banner notice on our website</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-[#E10600]" />
                          <span className="text-[#555555]">Updated "Last updated" date on this page</span>
                        </li>
                      </ul>
                    </div>

                    <div className="text-center pt-8 border-t border-[#E5E5E5]">
                      <h3 className="text-lg font-semibold text-[#111111] mb-4">Questions About Our Cookie Policy?</h3>
                      <p className="text-[#555555] mb-6">
                        If you have any questions about how we use cookies or your privacy rights, 
                        please contact our privacy team.
                      </p>
                      <button className="px-6 py-3 bg-[#E10600] text-white rounded-lg font-semibold hover:bg-[#C10500] transition-colors flex items-center gap-2 mx-auto">
                        <Mail className="w-4 h-4" />
                        Contact Privacy Team
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookiesPolicy