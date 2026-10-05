import React, { useState } from "react";
import Axios from "../services/axios";
import { api } from "../services/endpoints";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-toastify";
import data from "../assets/data.json";

const Contact = () => {
  // Form state with only three fields
  const [formData, setFormData] = useState({
    description: "",
    subject: "",
    category: "General Inquiry",
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const user = useSelector((state) => state.user);

  // Category options
  const categories = [
    "general",
    "booking",
    "payment",
    "refund",
    "ride-issue",
    "account",
    "safety",
    "contact",
  ];

  // Subject options
  const subjects = [
    "Website Issue",
    "Mobile App Problem",
    "Payment Concern",
    "Account Access",
    "Feature Request",
    "Bug Report",
    "Other",
  ];

  useEffect(() => {
    document.title = "Contact Us";
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Form validation
  const validateForm = () => {
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }

    if (formData.description.trim().length < 10) {
      setError("Description should be at least 10 characters");
      return false;
    }

    if (!formData.subject.trim()) {
      setError("Subject is required");
      return false;
    }

    if (!formData.category.trim()) {
      setError("Category is required");
      return false;
    }

    return true;
  };

  // Handle form submission with Axios
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset states
    setError("");
    setSuccess(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await Axios.post(api.support.createSupport, {
        ...formData,
        status: "open",
      });

      if (response.data.success) {
        toast.success(
          response?.data?.message || " form submitted successfully",
        );

        setFormData({
          description: "",
          subject: "",
          category: "General Inquiry",
        });

        setSuccess(false);
      }
    } catch (err) {
      // Check if error has response data
      if (err.response) {
        setError(err.response.data.message || "Server error occurred");
      } else if (err.request) {
        setError("No response from server. Please check your connection.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white w-full md:w-[80%] mx-auto flex justify-center items-center">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-5">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Get in <span className="text-orange-500">Touch</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions about carpooling? We're here to help you with your
            commuting needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Send us a Message
            </h3>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-green-800 font-medium">
                    Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Field */}
              <div>
                <label className="block text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-gray-700 mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="Please provide detailed description of your issue or inquiry..."
                  disabled={loading}
                  required
                ></textarea>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Minimum 10 characters</p>
                  <p
                    className={`text-xs ${
                      formData.description.length < 10
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {formData.description.length} characters
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${
                  loading
                    ? "bg-orange-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                } text-white py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">* Required fields</p>
                <p className="text-xs text-gray-400 mt-2">
                  We typically respond within 24 hours on business days
                </p>
              </div>
            </form>
          </div>

          {/* Contact Info & Stats */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Call Us</h4>
                    <p className="text-gray-600">+91 {data.mob1}</p>
                    <p className="text-gray-600 text-sm">
                      Mon-Fri from 8am to 6pm
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Email Us</h4>
                    <p className="text-gray-600">{data.supportMail}</p>
                    <p className="text-gray-600 text-sm">
                      We'll reply within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Visit Us</h4>
                    <p className="text-gray-600">{data.address}</p>
                    <p className="text-gray-600 text-sm">
                      {data.city} {data.pinCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Response Time Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Response Times
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • <span className="font-medium">Email:</span> Within 24
                    hours
                  </li>
                  <li>
                    • <span className="font-medium">Phone:</span> During
                    business hours
                  </li>
                  <li>
                    • <span className="font-medium">Emergency:</span> 24/7
                    safety line
                  </li>
                </ul>
              </div>
            </div>

            {/* Stats from About Page */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">HamRahi in Numbers</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-bold">500K+</p>
                  <p className="text-orange-100">Happy Riders</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">50K+</p>
                  <p className="text-orange-100">Daily Rides</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">10Cr+</p>
                  <p className="text-orange-100">Saved by Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">4.8*</p>
                  <p className="text-orange-100">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-800 mb-2">
                How do I start carpooling with HamRahi?
              </h4>
              <p className="text-gray-600">
                Download our app, create a profile, and either offer a ride or
                search for available rides in your route.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-800 mb-2">
                Is HamRahi safe?
              </h4>
              <p className="text-gray-600">
                Yes! We have a 99% safety score with verified profiles, in-app
                emergency features, and ride tracking.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-medium text-gray-800 mb-2">
                How are ride costs calculated?
              </h4>
              <p className="text-gray-600">
                Costs are shared based on distance and fuel prices, making it
                60-70% cheaper than driving alone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
