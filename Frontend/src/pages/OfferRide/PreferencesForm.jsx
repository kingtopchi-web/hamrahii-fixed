import { motion } from "framer-motion";
import {
  Music,
  PawPrint,
  Luggage,
  ChevronLeft,
  ChevronRight,
  Check,
  Settings,
  Cigarette,
  Package,
} from "lucide-react";
import { useRef } from "react";
import { useEffect, useState } from "react";

// PreferencesForm.jsx
export const PreferencesForm = ({ data, setFormData }) => {
  const [preferences, setPreferences] = useState(
    data?.preferences || {
      musicAllowed: false,
      petsAllowed: false,
      smokingAllowed: false,
      luggageSpace: "medium",
      conversation : "either"
    },
  );


  const handleToggle = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: prev[field] === true ? false : true,
    }));
  };

  const handleSelect = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setFormData((prev) => ({
      ...prev,
      preferences,
    }));
  }, [preferences]);

  const luggageOptions = [
    {
      value: "small",
      label: "Small",
      desc: "Backpacks only",
      icon: <Package size={16} className="text-blue-600" />,
      color: "border-blue-200 bg-blue-50",
    },
    {
      value: "medium",
      label: "Medium",
      desc: "1 suitcase",
      icon: <Luggage size={16} className="text-purple-600" />,
      color: "border-purple-200 bg-purple-50",
    },
    {
      value: "large",
      label: "Large",
      desc: "Multiple suitcases",
      icon: <Package size={16} className="text-amber-600" />,
      color: "border-amber-200 bg-amber-50",
    },
  ];

  const preferenceOptions = [
    {
      id: "musicAllowed",
      label: "Music",
      description: "Allow music",
      icon: <Music size={18} />,
      activeColor: "border-blue-500 bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: "petsAllowed",
      label: "Pets",
      description: "Allow pets",
      icon: <PawPrint size={18} />,
      activeColor: "border-green-500 bg-green-50",
      iconColor: "text-green-600",
    },
    {
      id: "smokingAllowed",
      label: "Smoking",
      description: "Allow smoking",
      icon: <Cigarette size={18} />,
      activeColor: "border-gray-500 bg-gray-50",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-2xl mx-auto px-4 sm:px-6"
    >
      {/* Main Content */}
      <div className="space-y-6">
        {/* Preferences Toggles */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Settings className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Car Rules
              </h3>
              <p className="text-xs text-gray-500">
                What's allowed during ride
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {preferenceOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleToggle(option.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  preferences[option.id]
                    ? `${option.activeColor} shadow-sm`
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      preferences[option.id]
                        ? "bg-gradient-to-br from-gray-900 to-gray-800"
                        : "bg-gray-100"
                    }`}
                  >
                    <div
                      className={
                        preferences[option.id] ? "text-white" : option.iconColor
                      }
                    >
                      {option.icon}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {option.description}
                    </div>
                  </div>
                </div>

                <div
                  className={`relative w-12 h-6 flex items-center rounded-full p-1 ${
                    preferences[option.id] ? "bg-gray-900" : "bg-gray-200"
                  }`}
                >
                  <motion.div
                    layout
                    className={`w-4 h-4 bg-white rounded-full shadow-sm ${
                      preferences[option.id] ? "ml-6" : "ml-0"
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Luggage Selection */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Luggage className="text-white" size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Luggage Space
              </h3>
              <p className="text-xs text-gray-500">
                Available storage capacity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {luggageOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect("luggageSpace", option.value)}
                className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  preferences.luggageSpace === option.value
                    ? `${option.color} border-gray-400 shadow-sm`
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="mb-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      preferences.luggageSpace === option.value
                        ? "bg-gradient-to-br from-gray-900 to-gray-800"
                        : "bg-gray-100"
                    }`}
                  >
                    {option.icon}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-sm mb-1">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">{option.desc}</div>
                </div>
                {preferences.luggageSpace === option.value && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                    <Check className="text-white" size={10} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 p-4 sm:p-6"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Your Preferences
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Allowed Items */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Allowed Items
              </div>
              <div className="space-y-1.5">
                {preferenceOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${preferences[option.id] ? "bg-green-500" : "bg-red-500"}`}
                      ></div>
                      <span className="text-xs text-gray-700">
                        {option.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${preferences[option.id] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {preferences[option.id] ? "Yes" : "No"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Luggage Info */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Luggage
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                    {
                      luggageOptions.find(
                        (o) => o.value === preferences.luggageSpace,
                      )?.icon
                    }
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {
                        luggageOptions.find(
                          (o) => o.value === preferences.luggageSpace,
                        )?.label
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {
                        luggageOptions.find(
                          (o) => o.value === preferences.luggageSpace,
                        )?.desc
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
