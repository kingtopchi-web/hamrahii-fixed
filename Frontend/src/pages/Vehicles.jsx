import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Car, CheckCircle, Shield, ArrowRight, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Vehicles = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Our Vehicles | Humrahii";
    window.scrollTo(0, 0);
  }, []);

  const vehicleTypes = [
    {
      id: "hatchback",
      name: "Hatchback",
      subtitle: "Economical & Compact",
      description: "Perfect for city rides and daily commutes. Nimble, comfortable, and budget-friendly for solo or couple travels.",
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80",
      passengerBadge: "Up to 3 Passengers",
      features: [
        "Up to 3 Passengers",
        "Full AC Comfort",
        "Compact & quick city rides",
        "Optimal boot space for small bags"
      ],
      color: "bg-blue-500/90 text-white"
    },
    {
      id: "sedan",
      name: "Sedan",
      subtitle: "Comfort & Style",
      description: "Comfortable rides for longer journeys and outstation trips with extra legroom, plush seating, and generous luggage space.",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
      passengerBadge: "Up to 4 Passengers",
      features: [
        "Up to 4 Passengers",
        "Premium Air Conditioning",
        "Ample Boot Space for luggage",
        "Maximum legroom for highway comfort"
      ],
      color: "bg-emerald-600/90 text-white"
    },
    {
      id: "suv",
      name: "SUV",
      subtitle: "Spacious & Powerful",
      description: "Spacious vehicles ideal for family trips, group travels, and heavy luggage. High ground clearance and robust road presence.",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      passengerBadge: "Up to 6 Passengers",
      features: [
        "Up to 6 Passengers",
        "Extra Large Luggage Capacity",
        "High Ground Clearance",
        "Best for family trips & outstations"
      ],
      color: "bg-orange-500/90 text-white"
    },
    {
      id: "bike",
      name: "Bike / Scooter",
      subtitle: "Fast & Economical",
      description: "Fastest way to beat rush hour traffic for solo commuters. Highly economical, doorstep pickups, and quick travel.",
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
      passengerBadge: "1 Passenger",
      features: [
        "1 Passenger",
        "Zero Traffic Hassle",
        "Most Affordable Rate",
        "Fastest city commute"
      ],
      color: "bg-purple-600/90 text-white"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto px-4 max-w-7xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-red-300 text-sm font-semibold mb-4 border border-white/10"
          >
            <Sparkles size={16} /> Verified Fleets Across India
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
          >
            Vehicles We Provide
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you're travelling solo or with a group, we have the perfect ride for you. All vehicles are verified for your safety and comfort.
          </motion.p>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="container mx-auto px-4 max-w-7xl mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {vehicleTypes.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group"
            >
              {/* Full width vehicle image - perfectly framed */}
              <div className="relative h-60 sm:h-72 w-full bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${vehicle.color}`}>
                  {vehicle.name}
                </div>
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white flex items-center gap-1.5 shadow-sm">
                  <Users size={13} />
                  <span>{vehicle.passengerBadge}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{vehicle.name}</h3>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{vehicle.subtitle}</span>
                  </div>
                  <p className="text-gray-600 mb-5 text-sm sm:text-base leading-relaxed">{vehicle.description}</p>
                  
                  <div className="border-t border-gray-100 pt-4 mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Key Features</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {vehicle.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <CheckCircle size={16} className="text-emerald-500 mr-2 flex-shrink-0" />
                          <span className="font-medium text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/rides")}
                    className="flex-1 py-3 px-5 bg-[#E10600] hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-red-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Find {vehicle.name} Rides</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => navigate("/offer-ride")}
                    className="py-3 px-5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-all text-sm text-center"
                  >
                    Offer Ride
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Safety Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between border border-blue-100 shadow-sm"
        >
          <div className="flex items-center mb-6 md:mb-0">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-6 flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">100% Verified Vehicles & Drivers</h4>
              <p className="text-gray-600 max-w-xl text-sm sm:text-base">Every vehicle on Humrahii undergoes thorough verification including RC validation, fitness checks, and insurance verification before offering rides.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/offer-ride")}
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shadow-md hover:shadow-blue-500/20"
          >
            Offer a Ride
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Vehicles;
