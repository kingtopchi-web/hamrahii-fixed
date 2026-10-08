import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Car } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center">
            <Car className="text-white" />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-red-600">Ham</span>
            <span className="text-gray-900">Rahi</span>
          </span>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-bold bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-red-300 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Go Home
          </button>
        </div>
        
        {/* Links */}
        <div className="mt-8 pt-8 border-t border-[var(--border-subtle)]">
          <p className="text-gray-500 text-sm mb-3">Quick links:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {["/rides", "/offer-ride", "/login", "/register"].map((path) => (
              <Link
                key={path}
                to={path}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                {path}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;