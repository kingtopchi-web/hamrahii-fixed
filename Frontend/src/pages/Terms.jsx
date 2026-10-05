import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Car,
  Bike,
  UserCheck,
  CreditCard,
  Shield,
  AlertCircle,
  RefreshCw,
  MessageCircle,
  Home,
  Calendar,
  Users,
  Navigation,
  DollarSign,
  Clock,
  Scale,
  Phone,
  Mail,
  Wallet,
  MapPin,
  Percent,
  IndianRupee
} from 'lucide-react';
import data from '../assets/data.json'

const sections = [
  {
    id: 'definitions',
    title: '1. Definitions',
    icon: FileText,
    content: `Understanding the terminology used in our platform.`,
    details: [
      { term: "Platform", definition: "Refers to the HumRahii.com vehicle sharing platform" },
      { term: "User", definition: "Individuals registered on the platform as drivers or passengers" },
      { term: "Ride", definition: "A journey booked through the platform" },
      { term: "Vehicle Types", definition: "Include Car, Bike, and Auto" }
    ]
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    icon: UserCheck,
    content: `Requirements for using HumRahii services.`,
    details: [
      "Users must be at least 18 years old",
      "Hold a valid driving license for the vehicle type",
      "Agree to these Terms & Conditions"
    ]
  },
  {
    id: 'booking-fare',
    title: '3. Ride Booking & Fare',
    icon: CreditCard,
    content: `How rides are booked and fares are calculated.`,
    details: [
      "Rides are booked through the HumRahii platform",
      "Fare is calculated based on the platform's fare structure for the chosen vehicle type",
      "Users agree to pay the fare as per the booking"
    ]
  },
  {
    id: 'responsibilities',
    title: '4. Responsibilities',
    icon: Users,
    content: `Duties of drivers and passengers.`,
    driverResponsibilities: [
      "Ensure vehicle is roadworthy and compliant with laws",
      "Follow traffic rules and regulations",
      "Ensure safety of passengers"
    ],
    passengerResponsibilities: [
      "Behave responsibly and follow driver instructions",
      "Respect the vehicle and belongings"
    ]
  },
  {
    id: 'commission',
    title: '5. Commission Structure & Payouts',
    icon: Wallet,
    content: `Our commission structure and fare details.`,
    commissionStructure: {
      localTrips: {
        title: "Local Trips (up to 50km)",
        car: "5% commission on total booking value",
        bikeAuto: "5% commission on total booking value"
      },
      longDistance: {
        title: "Long Distance Trips (Above 50km)",
        car: "₹80 per ride",
        bikeAuto: "₹50 per ride"
      }
    },
    fareStructure: {
      longRoute: {
        title: "Long Route Sharing",
        car: "₹2 per km",
        bikeAuto: "₹1.5 per km"
      },
      intercity: {
        title: "Intercity Sharing",
        bike: [
          "Upto 2.5 km: ₹25 (base) + ₹3/km",
          "2.5-5 km: ₹50 (base) + ₹3/km",
          "5-10 km: ₹80 (base) + ₹3/km",
          "10-20 km: ₹150 (base) + ₹3/km",
          "Above 20 km: ₹200 (base) + ₹3/km"
        ],
        auto: [
          "Upto 2.5 km: ₹50 (base) + ₹5/km",
          "2.5-5 km: ₹100 (base) + ₹5/km",
          "5-10 km: ₹150 (base) + ₹5/km",
          "10-20 km: ₹200 (base) + ₹5/km",
          "Above 20 km: ₹250 (base) + ₹5/km"
        ]
      },
      additionalCharges: [
        "Waiting charges: ₹5-₹10 per minute (applicable after 5 minutes of waiting)",
        "Tolls and parking charges: as applicable"
      ]
    }
  },
  {
    id: 'cancellation',
    title: '6. Cancellation Policy & No Show',
    icon: Clock,
    content: `Our cancellation policies for drivers and passengers.`,
    driverCancellation: "Without specific reason: charged as per commission rate",
    passengerCancellation: "Within 2 hours of booking: ₹100 penalty (Applies for all vehicle types)"
  },
  {
    id: 'payment',
    title: '7. Payment, Refunds',
    icon: DollarSign,
    content: `Payment processing and refund policies.`,
    details: [
      "Payment is via platform's payment gateway",
      "Refunds (if applicable) will be processed as per platform policy"
    ]
  },
  {
    id: 'liability',
    title: '8. Liability & Insurance',
    icon: Shield,
    content: `Our liability limitations and insurance information.`,
    details: [
      "HumRahii isn't liable for damages/losses during rides",
      "Users are responsible for their actions and liabilities"
    ]
  },
  {
    id: 'changes',
    title: '9. Changes to Terms',
    icon: RefreshCw,
    content: `How we update our terms and conditions.`,
    details: [
      "HumRahii reserves the right to modify these terms"
    ]
  },
  {
    id: 'governing',
    title: '10. Governing Law',
    icon: Scale,
    content: `The legal jurisdiction governing these terms.`,
    details: [
      "These terms are governed by laws of India"
    ]
  }
];

const Terms = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen bg-white w-full md:w-[80%] flex justify-center items-center mx-auto">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F7F7F7] mb-6">
            <FileText className="w-8 h-8 text-[#E10600]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] mb-2">
            HUMRAHII.COM TERMS AND CONDITIONS
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#F7F7F7] rounded-full">
              <Car className="w-4 h-4 text-[#555555]" />
              <span className="text-sm text-[#555555]">Vehicle Sharing Platform</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-[#F7F7F7] rounded-full">
              <Calendar className="w-4 h-4 text-[#555555]" />
              <span className="text-sm text-[#555555]">
                Last updated: January 15, 2024
              </span>
            </div>
          </div>
          <p className="text-lg text-[#555555] max-w-3xl mx-auto">
            Terms & Conditions with the cancellation policy for HumRahii Vehicle Sharing Platform
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-[#F7F7F7] to-white rounded-xl p-8 mb-12 border border-[#E5E5E5]"
        >
          <div className="flex items-start space-x-4">
            <Home className="w-8 h-8 text-[#E10600] mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-[#111111] mb-4">HumRahii Vehicle Sharing Terms & Conditions</h2>
              <p className="text-[#555555] leading-relaxed">
                Welcome to HumRahii.com, your trusted vehicle sharing platform. These terms govern your use of our services 
                for Car, Bike, and Auto rides across various destinations. Please read them carefully before using our platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-4 border border-[#E5E5E5]">
                    <Car className="w-6 h-6 text-[#E10600]" />
                  </div>
                  <h3 className="font-semibold text-[#111111] mb-1">Car Sharing</h3>
                  <p className="text-sm text-[#555555]">Comfortable car rides</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-4 border border-[#E5E5E5]">
                    <Bike className="w-6 h-6 text-[#E10600]" />
                  </div>
                  <h3 className="font-semibold text-[#111111] mb-1">Bike Sharing</h3>
                  <p className="text-sm text-[#555555]">Quick and affordable</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-4 border border-[#E5E5E5]">
                    <Navigation className="w-6 h-6 text-[#E10600]" />
                  </div>
                  <h3 className="font-semibold text-[#111111] mb-1">Auto Sharing</h3>
                  <p className="text-sm text-[#555555]">Traditional auto rides</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Terms Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 mb-12"
        >
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={section.id}
                variants={itemVariants}
                className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-sm"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#F7F7F7] to-white border border-[#E5E5E5]">
                      <div className="relative">
                        <IconComponent className="w-6 h-6 text-[#E10600]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#111111] mb-4">
                        {section.title}
                      </h3>
                      <p className="text-[#555555] leading-relaxed mb-4">
                        {section.content}
                      </p>
                      
                      {/* Definitions Section */}
                      {section.id === 'definitions' && (
                        <div className="mt-4">
                          <div className="space-y-3">
                            {section.details.map((item, idx) => (
                              <div key={idx} className="flex items-start">
                                <div className="w-2 h-2 rounded-full bg-[#E10600] mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-[#111111]">{item.term}:</span>
                                  <span className="text-[#555555] ml-2">{item.definition}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Eligibility Section */}
                      {section.id === 'eligibility' && (
                        <div className="mt-4">
                          <div className="space-y-2">
                            {section.details.map((item, idx) => (
                              <div key={idx} className="flex items-start">
                                <div className="w-2 h-2 rounded-full bg-[#E10600] mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-[#555555]">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Booking & Fare Section */}
                      {section.id === 'booking-fare' && (
                        <div className="mt-4">
                          <div className="space-y-2">
                            {section.details.map((item, idx) => (
                              <div key={idx} className="flex items-start">
                                <div className="w-2 h-2 rounded-full bg-[#E10600] mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-[#555555]">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Responsibilities Section */}
                      {section.id === 'responsibilities' && (
                        <div className="mt-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                              <h4 className="font-bold text-[#111111] mb-3 flex items-center">
                                <UserCheck className="w-5 h-5 mr-2 text-[#E10600]" />
                                Drivers
                              </h4>
                              <div className="space-y-2">
                                {section.driverResponsibilities.map((item, idx) => (
                                  <div key={idx} className="flex items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#E10600] mt-2 mr-2 flex-shrink-0"></div>
                                    <span className="text-sm text-[#555555]">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                              <h4 className="font-bold text-[#111111] mb-3 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-[#E10600]" />
                                Passengers
                              </h4>
                              <div className="space-y-2">
                                {section.passengerResponsibilities.map((item, idx) => (
                                  <div key={idx} className="flex items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#E10600] mt-2 mr-2 flex-shrink-0"></div>
                                    <span className="text-sm text-[#555555]">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Commission Structure Section */}
                      {section.id === 'commission' && (
                        <div className="mt-6 space-y-6">
                          {/* Commission Structure */}
                          <div>
                            <h4 className="font-bold text-[#111111] mb-3">Commission Structure</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-4 bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                                <h5 className="font-semibold text-[#111111] mb-2">{section.commissionStructure.localTrips.title}</h5>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <Car className="w-4 h-4 mr-2 text-[#555555]" />
                                    <span className="text-sm text-[#555555]">Car: {section.commissionStructure.localTrips.car}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Bike className="w-4 h-4 mr-2 text-[#555555]" />
                                    <span className="text-sm text-[#555555]">Bike/Auto: {section.commissionStructure.localTrips.bikeAuto}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                                <h5 className="font-semibold text-[#111111] mb-2">{section.commissionStructure.longDistance.title}</h5>
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <Car className="w-4 h-4 mr-2 text-[#555555]" />
                                    <span className="text-sm text-[#555555]">Car: {section.commissionStructure.longDistance.car}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Bike className="w-4 h-4 mr-2 text-[#555555]" />
                                    <span className="text-sm text-[#555555]">Bike/Auto: {section.commissionStructure.longDistance.bikeAuto}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Fare Structure */}
                          <div>
                            <h4 className="font-bold text-[#111111] mb-3">Fare Structure</h4>
                            
                            {/* Long Route Sharing */}
                            <div className="mb-4">
                              <h5 className="font-semibold text-[#111111] mb-2">{section.fareStructure.longRoute.title}</h5>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-3 bg-white rounded-lg border border-[#E5E5E5]">
                                  <div className="flex items-center">
                                    <Car className="w-4 h-4 mr-2 text-[#555555]" />
                                    <span className="text-sm text-[#555555]">{section.fareStructure.longRoute.car}</span>
                                  </div>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-[#E5E5E5]">
                                  <div className="flex items-center">
                                    <Bike className="w-4 h-4 mr-2 text-[#555555]" />
                                    <span className="text-sm text-[#555555]">{section.fareStructure.longRoute.bikeAuto}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Intercity Sharing */}
                            <div className="mb-4">
                              <h5 className="font-semibold text-[#111111] mb-2">{section.fareStructure.intercity.title}</h5>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                                  <h6 className="font-medium text-[#111111] mb-2 flex items-center">
                                    <Bike className="w-4 h-4 mr-2 text-[#E10600]" />
                                    Bike
                                  </h6>
                                  <div className="space-y-1">
                                    {section.fareStructure.intercity.bike.map((item, idx) => (
                                      <div key={idx} className="text-sm text-[#555555]">{item}</div>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                                  <h6 className="font-medium text-[#111111] mb-2 flex items-center">
                                    <Navigation className="w-4 h-4 mr-2 text-[#E10600]" />
                                    Auto
                                  </h6>
                                  <div className="space-y-1">
                                    {section.fareStructure.intercity.auto.map((item, idx) => (
                                      <div key={idx} className="text-sm text-[#555555]">{item}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Additional Charges */}
                            <div>
                              <h5 className="font-semibold text-[#111111] mb-2">Additional Charges</h5>
                              <div className="space-y-2">
                                {section.fareStructure.additionalCharges.map((item, idx) => (
                                  <div key={idx} className="flex items-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#E10600] mt-2 mr-2 flex-shrink-0"></div>
                                    <span className="text-sm text-[#555555]">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cancellation Policy Section */}
                      {section.id === 'cancellation' && (
                        <div className="mt-4">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                              <h4 className="font-bold text-[#111111] mb-2 flex items-center">
                                <UserCheck className="w-5 h-5 mr-2 text-[#E10600]" />
                                Driver Cancellation
                              </h4>
                              <p className="text-[#555555]">{section.driverCancellation}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-[#F7F7F7] to-white rounded-lg border border-[#E5E5E5]">
                              <h4 className="font-bold text-[#111111] mb-2 flex items-center">
                                <Users className="w-5 h-5 mr-2 text-[#E10600]" />
                                Passenger Cancellation/No Show
                              </h4>
                              <p className="text-[#555555]">{section.passengerCancellation}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Simple List Sections */}
                      {['payment', 'liability', 'changes', 'governing'].includes(section.id) && (
                        <div className="mt-4">
                          <div className="space-y-2">
                            {section.details.map((item, idx) => (
                              <div key={idx} className="flex items-start">
                                <div className="w-2 h-2 rounded-full bg-[#E10600] mt-2 mr-3 flex-shrink-0"></div>
                                <span className="text-[#555555]">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="border-2 border-[#E10600] rounded-xl p-8 mb-12 bg-red-50"
        >
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-[#E10600] flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-[#111111] mb-3">Important Notice</h3>
              <p className="text-[#555555] mb-4">
                By using HumRahii.com services, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms & Conditions. These terms constitute a legal 
                agreement between you and HumRahii.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg">
                  <span className="text-sm font-medium text-[#111111]">Applicable Law:</span>
                  <span className="text-sm text-[#555555] ml-2">Indian Laws</span>
                </div>
                <div className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg">
                  <span className="text-sm font-medium text-[#111111]">Vehicle Types:</span>
                  <span className="text-sm text-[#555555] ml-2">Car, Bike, Auto</span>
                </div>
                <div className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-lg">
                  <span className="text-sm font-medium text-[#111111]">Version:</span>
                  <span className="text-sm text-[#555555] ml-2">1.0</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center border-t border-[#E5E5E5] pt-12"
        >
          <h2 className="text-2xl font-bold text-[#111111] mb-8">For More Information</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#F7F7F7] to-white mb-4 border border-[#E5E5E5]">
                <Mail className="w-6 h-6 text-[#E10600]" />
              </div>
              <h3 className="font-medium text-[#111111] mb-1">Email Support</h3>
              <p className="text-[#555555]">{data.supportMail}</p>
              <p className="text-sm text-[#555555] mt-1">For inquiries and support</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#F7F7F7] to-white mb-4 border border-[#E5E5E5]">
                <Phone className="w-6 h-6 text-[#E10600]" />
              </div>
              <h3 className="font-medium text-[#111111] mb-1">Phone Support</h3>
              <p className="text-[#555555]">+91-{data.mob1} +91-{data.mob2}</p>
              <p className="text-sm text-[#555555] mt-1">24/7 customer support</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#F7F7F7] to-white rounded-xl p-8 max-w-2xl mx-auto border border-[#E5E5E5]">
            <h3 className="text-xl font-semibold text-[#111111] mb-4">Need Assistance?</h3>
            <p className="text-[#555555] mb-6">
              Our support team is available to help you with any questions regarding our Terms & Conditions, 
              booking process, or commission structure.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-medium text-[#111111]">Support Hours</p>
                <p className="text-[#555555]">24/7 Available</p>
              </div>
              <div>
                <p className="font-medium text-[#111111]">Response Time</p>
                <p className="text-[#555555]">Within 24 hours</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Terms;