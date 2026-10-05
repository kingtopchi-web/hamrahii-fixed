import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { 
  Car, 
  ChevronLeft, 
  ChevronRight, 
  Palette, 
  FileText, 
  Users,
  Fuel,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings
} from "lucide-react";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import {toast} from "react-toastify"
import {useNavigate} from "react-router-dom"
import { getCarImageUrl } from "../../utils/profileImageHelper";

// CarDetailsForm.jsx
export const CarDetailsForm = ({ data, updateData, nextStep, prevStep }) => {
  const [selectedCar, setSelectedCar] = useState(data?._id ? data : null);
  const [userCars, setUserCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await Axios.get(api.car.getByUser); 
      
      if (res?.data?.success && Array.isArray(res?.data?.cars)) {
        setUserCars(res.data.cars);
        // Only keep selected if data is a valid car that exists in the user's current car list
        if (data?._id) {
          const matchingCar = res.data.cars.find((c) => c._id === data._id);
          if (matchingCar) {
            setSelectedCar(matchingCar);
          } else {
            setSelectedCar(null);
            updateData({});
          }
        } else {
          setSelectedCar(null);
        }
      }
    } catch (error) {
      if (error?.response?.data?.message === "Please Login") {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (!data?._id) {
      setSelectedCar(null);
    } else if (data?._id !== selectedCar?._id) {
      setSelectedCar(data);
    }
  }, [data]);

  const handleCarSelect = (car) => {
    setSelectedCar(car);
    updateData(car);
  };


  // Format plate number for display
  const formatPlateNumber = (plate) => {
    return plate?.replace(/(\w{2}) (\d{2}) (\w{2}) (\d{4})/, '$1 $2 $3 $4') || plate;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="car-details-form"
    >
      {/* Header */}
      {/* <div className="text-center mb-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#E10600]/10 to-[#E10600]/5 mb-6"
        >
          <Car className="text-[#E10600]" size={36} />
        </motion.div>
        <h2 className="text-3xl font-bold text-[#111111] mb-2">Select Your Car</h2>
        <p className="text-[#555555] text-lg">Choose one of your registered cars for this ride</p>
      </div> */}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-xl bg-gradient-to-r from-[#E10600]/10 to-[#E10600]/5 border border-[#E10600]/20 p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="text-[#E10600] flex-shrink-0" size={20} />
              <p className="text-[#E10600] font-medium text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Loading State */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center py-16 bg-white rounded-2xl border border-[#E5E5E5] shadow-lg"
          >
            <Loader2 className="w-12 h-12 text-[#E10600] animate-spin mb-4" />
            <p className="text-[#555555]">Loading your cars...</p>
          </motion.div>
        ) : userCars.length > 0 ? (
          <div className="space-y-6">
            {/* Cars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCars.map((car, index) => {
                  console.log(car , "this is car")
                  if(car?.status != "approved") return
                return (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                    selectedCar?._id === car._id
                      ? 'border-[#E10600] shadow-lg shadow-[#E10600]/10'
                      : 'border-[#E5E5E5] hover:border-[#B8B8B8]'
                  }`}
                  onClick={() => handleCarSelect(car)}
                >
                  {/* Car Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[#F7F7F7] to-[#E5E5E5]">
                    <img 
                      src={getCarImageUrl(car)} 
                      alt={car.model || "Car"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/default-car.svg";
                      }}
                    />
                    
                    {/* Selected Indicator */}
                    {selectedCar?._id === car._id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-10 h-10 rounded-full bg-[#E10600] flex items-center justify-center shadow-lg">
                          <CheckCircle className="text-white" size={20} />
                        </div>
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-[#111111]/90 text-white text-xs font-semibold rounded-full">
                        {car.seats} Seats
                      </span>
                    </div>
                  </div>
                  
                  {/* Car Details */}
                  <div className="p-5 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#111111]">{car.brand} {car.model}</h3>
                        <p className="text-sm text-[#555555]">{car.year}</p>
                      </div>
                    </div>
                    
                    {/* Car Specs */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#555555]" />
                        <span className="text-sm text-[#111111] font-medium">
                          {formatPlateNumber(car.plateNumber)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-[#555555]" />
                        <span className="text-sm text-[#111111] font-medium">
                          {car.fuelType}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#555555]" />
                        <span className="text-sm text-[#111111] font-medium">
                          {car.seats} seats
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[#555555]" />
                        <span className="text-sm text-[#111111] font-medium">
                          {car.transmission}
                        </span>
                      </div>
                    </div>
                    
                    {/* Select Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                        selectedCar?._id === car._id
                          ? 'bg-[#E10600] text-white'
                          : 'bg-[#F7F7F7] text-[#111111] hover:bg-[#E5E5E5]'
                      }`}
                      onClick={() => handleCarSelect(car)}
                    >
                      {selectedCar?._id === car._id ? 'Selected' : 'Select Car'}
                    </motion.button>
                  </div>
                </motion.div>
              )})}
            </div>


          </div>
        ) : (
          /* No Cars State */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-[#E5E5E5] p-12 text-center shadow-lg"
          >
            <div className="w-24 h-24 rounded-full bg-[#F7F7F7] flex items-center justify-center mx-auto mb-6">
              <Car className="w-12 h-12 text-[#B8B8B8]" />
            </div>
            <h3 className="text-2xl font-bold text-[#111111] mb-3">No Cars Found</h3>
            <p className="text-[#555555] mb-8 max-w-md mx-auto">
              You haven't registered any cars yet. Please add a car to your profile before offering a ride.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-[#E10600] text-white rounded-lg font-semibold hover:bg-[#C10500] transition-colors duration-200"
              onClick={() => navigate("/my-profile/add-car")} // Update with your add car route
            >
              Add New Car
            </motion.button>
          </motion.div>
        )}

        {/* Action Buttons */}

      </div>
    </motion.div>
  );
};