import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Car, CheckCircle, Shield } from "lucide-react";

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
      description: "Perfect for city rides and daily commutes. Economical and compact.",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
      features: ["Up to 3 Passengers", "AC Available", "Great for short distances"],
      color: "bg-blue-50 text-blue-700"
    },
    {
      id: "sedan",
      name: "Sedan",
      description: "Comfortable rides for longer journeys and outstation trips with extra legroom.",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80",
      features: ["Up to 4 Passengers", "Premium Comfort", "Ample Boot Space"],
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      id: "suv",
      name: "SUV",
      description: "Spacious vehicles ideal for family trips, group travels, and heavy luggage.",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
      features: ["Up to 6 Passengers", "Extra Luggage Space", "High Ground Clearance"],
      color: "bg-orange-50 text-orange-700"
    },
    {
      id: "bike",
      name: "Bike / Scooter",
      description: "Fastest way to beat the traffic for solo travelers. Highly economical.",
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80",
      features: ["1 Passenger", "Zero Traffic Hassle", "Most Affordable"],
      color: "bg-purple-50 text-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Vehicles We Provide
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Whether you're travelling solo or with a group, we have the perfect ride for you. All vehicles are verified for your safety.
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
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col sm:flex-row"
            >
              <div className="w-full sm:w-2/5 h-48 sm:h-auto relative">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name} 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${vehicle.color}`}>
                  {vehicle.name}
                </div>
              </div>
              <div className="w-full sm:w-3/5 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{vehicle.description}</p>
                
                <ul className="space-y-2">
                  {vehicle.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Safety Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 bg-blue-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between border border-blue-100"
        >
          <div className="flex items-center mb-6 md:mb-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6 flex-shrink-0">
              <Shield size={32} className="text-blue-600" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">100% Verified Vehicles</h4>
              <p className="text-gray-600 max-w-lg">Every vehicle on Humrahii goes through a strict verification process including RC and Insurance checks before they can offer rides.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/offer-ride")}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Offer a Ride
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Vehicles;
