import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Calendar,
  Users,
  Shield,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Heart,
  Play,
  Phone,
  MessageCircle,
  Zap,
  DollarSign,
  Leaf,
  Target,
  Download,
  Globe,
  ShieldCheck,
  Percent,
  Smartphone,
  Sun,
  Moon,
  Coffee,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Plane,
  Search,
  BookOpen,
  User,
  Tag,
  PawPrint,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { getBlogImageUrl, getFallbackBlogImage } from "../../utils/blogImageHelper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import RideSearchCard from "./RideSearchCard";
import HeroCanvas from "./HeroCanvas";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { getBrowserCoords, getCityFromCoords, getlocationFromCoords } from "../../utils/GetLocation";
import { useGoogleMaps } from "../../components/maps/GoogleMapsProvider"
import DownloadPopup from "../../components/DownloadPopup";
import { useTypewriter } from "../../hooks/useTypewriter";

// Format helper for ride departure time
const formatRideTime = (timeStr) => {
  if (!timeStr) return "Flexible";
  if (timeStr.includes("T")) {
    const d = new Date(timeStr);
    return isNaN(d.getTime())
      ? timeStr.split("T")[1]?.slice(0, 5) || timeStr
      : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return timeStr.slice(0, 5);
};

// Format helper for ride departure date
const formatRideDate = (dateStr) => {
  if (!dateStr) return { isToday: false, formatted: "Date TBD" };
  try {
    const rideDate = new Date(dateStr);
    const today = new Date();
    const isToday =
      rideDate.getFullYear() === today.getFullYear() &&
      rideDate.getMonth() === today.getMonth() &&
      rideDate.getDate() === today.getDate();
    return {
      isToday,
      formatted: rideDate.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
    };
  } catch {
    return { isToday: false, formatted: dateStr };
  }
};

// Import background images
const heroBg =
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069";
const cityBg =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070";
const patternBg =
  "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2070";

const Home = () => {
  const navigate = useNavigate();
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [date, setDate] = useState("");
   const { isLoaded } = useGoogleMaps();
   const [location , setLocation] = useState("")

  // Blog State
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogError, setBlogError] = useState(null);
  const [recentRides, setRecentRides] = useState([]);

  // Typewriter effect for Hero section
  const typedHeadline = useTypewriter({
    words: [
      "Save Big Together",
      "Travel Smarter Everyday",
      "Cut Travel Costs by 70%",
      "Meet Verified Commuters",
      "Go Green, Reduce Traffic",
    ],
    typeSpeed: 80,
    deleteSpeed: 45,
    delaySpeed: 2200,
  });

  const ridesList = Array.isArray(recentRides)
    ? recentRides
    : (Array.isArray(recentRides?.data)
        ? recentRides.data
        : (Array.isArray(recentRides?.rides) ? recentRides.rides : []));

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
  ];

  useEffect(() => {
    document.title = "Find your ride with Humrahii";
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    handleGetRecentRides();
  }, [isLoaded]);

  const handleGetRecentRides = async () => {
    try {
      const city = await getCity();
      console.log(city , "this is city ")
      const res = await Axios.post(api.ride.getRecentRides , {city} );
      // console.log(res, "this is ride");
      setRecentRides(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCity = async () => {
    if (!isLoaded) return alert("Google not loaded yet");

    try {
      const { lat, lng } = await getBrowserCoords();

      const city = await getCityFromCoords(lat, lng);

      const streetLocation = await getlocationFromCoords(lat , lng)
      console.log(streetLocation , "this is location")
      setToLocation(streetLocation)
      console.log("User city:", city);
      return city;
    } catch (err) {
      console.log("Location error:", err);
    }
  };

  const MyComponent = () => {
  
  };

  // Fetch Blogs from API
  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true);
      setBlogError(null);

      const params = {
        page: 1,
        limit: 6,
      };

      const response = await Axios.get(api.blog.getAllBlog, { params });

      if (response.data.success) {
        const transformedBlogs = transformBlogs(response.data.data);
        setBlogs(transformedBlogs);
      } else {
        throw new Error(response.data.message || "Failed to fetch blogs");
      }
    } catch (err) {
      // console.error("Error fetching blogs:", err);
      setBlogError(err.response?.data?.message || "Failed to load blog posts");
      // Use mock data as fallback
      setBlogs(getMockBlogs());
    } finally {
      setLoadingBlogs(false);
    }
  };

  // Transform blog data from API to component format
  const transformBlogs = (apiBlogs) => {
    if (!apiBlogs || !Array.isArray(apiBlogs)) return [];

    return apiBlogs.map((blog) => ({
      id: blog._id || blog.id || Math.random(),
      title: blog.title || "Untitled",
      excerpt:
        blog.excerpt ||
        blog.description ||
        blog.content?.substring(0, 100) + "..." ||
        "Read more about this interesting topic",
      category: blog.category?.toLowerCase() || "general",
      author: blog.author?.name || blog.author || "HumRahii Team",
      date: formatDate(blog.createdAt || blog.date || blog.publishedDate),
      readTime: calculateReadTime(blog.content) || "3 min read",
      image:
        blog.image ||
        blog.featuredImage ||
        blog.thumbnail ||
        getDefaultImage(blog.category),
      featured: blog.featured || false,
      slug: blog.slug || blog.title?.toLowerCase().replace(/\s+/g, "-") || "",
    }));
  };

  // Helper functions for blogs
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Recently";
    }
  };

  const calculateReadTime = (content) => {
    if (!content) return "3 min read";
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const getDefaultImage = (category) => {
    const categoryImages = {
      safety:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400",
      travel:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w-400",
      sustainability:
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=400",
      community:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400",
      tips: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400",
      general:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400",
    };
    return (
      categoryImages[category] ||
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400"
    );
  };

  // Mock data for fallback
  const getMockBlogs = () => {
    return [
      {
        id: 1,
        title: "",
        excerpt:
          "Discover the financial benefits of shared commuting and how you can save up to 70% on travel costs.",
        category: "tips",
        author: "HumRahii Team",
        date: "Dec 15, 2023",
        readTime: "5 min read",
        image:
          "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400",
        featured: true,
      },
      {
        id: 2,
        title: "Safe Ride Sharing Guide",
        excerpt:
          "Essential safety tips for every rider. Learn how HumRahii ensures your safety on every journey.",
        category: "safety",
        author: "Safety Expert",
        date: "Dec 12, 2023",
        readTime: "8 min read",
        image:
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400",
        featured: true,
      },
      {
        id: 3,
        title: "Sustainable Travel Habits",
        excerpt:
          "Learn how carpooling contributes to reducing carbon footprint and creating eco-friendly communities.",
        category: "sustainability",
        author: "Eco Warrior",
        date: "Dec 10, 2023",
        readTime: "6 min read",
        image:
          "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=400",
      },
      {
        id: 4,
        title: "Building Communities Through Rides",
        excerpt:
          "How shared commuting helps build meaningful connections and stronger communities.",
        category: "community",
        author: "Community Manager",
        date: "Dec 8, 2023",
        readTime: "4 min read",
        image:
          "https://images.unsplash.com/photo-1551836026-d5c2c5af78e4?auto=format&fit=crop&w=400",
      },
      {
        id: 5,
        title: "Travel Hacks for Daily Commuters",
        excerpt:
          "Smart tips and tricks to make your daily commute more efficient and enjoyable.",
        category: "travel",
        author: "Travel Expert",
        date: "Dec 5, 2023",
        readTime: "7 min read",
        image:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400",
      },
      {
        id: 6,
        title: "The Future of Urban Mobility",
        excerpt:
          "How shared transportation is shaping the future of cities and urban living.",
        category: "general",
        author: "Urban Planner",
        date: "Dec 3, 2023",
        readTime: "9 min read",
        image:
          "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&w=400",
      },
    ];
  };

  const features = [
    {
      icon: <ShieldCheck />,
      title: "Verified & Safe",
      description: "All users verified with government ID",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-50/80 to-emerald-50/80",
      stat: "100% Safe",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1911",
    },
    {
      icon: <DollarSign />,
      title: "Save 70%+",
      description: "Share costs on daily commute",
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-amber-50/80 to-orange-50/80",
      stat: "₹10Cr+ Saved",
      image:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070",
    },
    {
      icon: <Clock />,
      title: "Real-time Tracking",
      description: "Live GPS tracking for all rides",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-gradient-to-br from-blue-50/80 to-cyan-50/80",
      stat: "On-time Rides",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070",
    },
    {
      icon: <Users />,
      title: "Smart Matching",
      description: "AI-powered compatible matches",
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-purple-50/80 to-pink-50/80",
      stat: "Perfect Matches",
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2084",
    },
  ];

  const stats = [
    {
      value: "500K+",
      label: "Happy Riders",
      icon: <Users />,
      color: "text-red-600",
      bgColor: "bg-red-50/90",
    },
    {
      value: "50K+",
      label: "Daily Rides",
      icon: <Car />,
      color: "text-blue-600",
      bgColor: "bg-blue-50/90",
    },
    {
      value: "₹10Cr+",
      label: "Money Saved",
      icon: <TrendingUp />,
      color: "text-green-600",
      bgColor: "bg-green-50/90",
    },
    {
      value: "95%+",
      label: "Satisfaction",
      icon: <Star />,
      color: "text-amber-600",
      bgColor: "bg-amber-50/90",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Enter Route",
      description: "Tell us your start and destination",
      icon: <MapPin />,
      bgColor: "bg-gradient-to-br from-red-50/80 to-pink-50/80",
      image:
        "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?q=80&w=2070",
    },
    {
      step: "02",
      title: "Find Match",
      description: "Browse verified riders on your route",
      icon: <Users />,
      bgColor: "bg-gradient-to-br from-blue-50/80 to-cyan-50/80",
      image:
        "https://images.unsplash.com/photo-1551836026-d5c2c5af78e4?q=80&w=2070",
    },
    {
      step: "03",
      title: "Book & Connect",
      description: "Secure booking & chat with co-travellers",
      icon: <MessageCircle />,
      bgColor: "bg-gradient-to-br from-green-50/80 to-emerald-50/80",
      image:
        "https://images.unsplash.com/photo-1588675636182-6d7c6c8e6b61?q=80&w=2070",
    },
    {
      step: "04",
      title: "Enjoy Ride",
      description: "Safe journey with significant savings",
      icon: <Car />,
      bgColor: "bg-gradient-to-br from-purple-50/80 to-pink-50/80",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070",
    },
  ];

  const appBenefits = [
    {
      icon: <Leaf />,
      title: "Eco-Friendly",
      desc: "Reduce carbon footprint",
      color: "text-green-600",
      bgColor: "bg-green-50/90",
    },
    {
      icon: <Zap />,
      title: "Time-Saving",
      desc: "Beat traffic, save hours",
      color: "text-amber-600",
      bgColor: "bg-amber-50/90",
    },
    {
      icon: <Coffee />,
      title: "Comfortable",
      desc: "Premium ride experience",
      color: "text-red-600",
      bgColor: "bg-red-50/90",
    },
    {
      icon: <Globe />,
      title: "Network",
      desc: "Connect with professionals",
      color: "text-blue-600",
      bgColor: "bg-blue-50/90",
    },
  ];

  // Blog categories for filtering
  const blogCategories = [
    { id: "all", name: "All", color: "bg-red-100 text-red-700" },
    { id: "safety", name: "Safety", color: "bg-blue-100 text-blue-700" },
    { id: "travel", name: "Travel", color: "bg-green-100 text-green-700" },
    {
      id: "sustainability",
      name: "Sustainability",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      id: "community",
      name: "Community",
      color: "bg-purple-100 text-purple-700",
    },
    { id: "tips", name: "Tips", color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/20 to-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden lg:pt-10 pb-12 lg:pb-20">
        {/* Hero Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute bg-none inset-0 md:bg-cover bg-center"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/80 to-red-50/40" />
          <HeroCanvas />
        </div>

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 80, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 -left-40 w-80 h-80 bg-gradient-to-br from-red-200/20 to-amber-200/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gradient-to-tr from-blue-200/10 to-red-200/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >


                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6 leading-[1.15] tracking-tight min-h-[140px] sm:min-h-[160px] lg:min-h-[180px]">
                  <span className="block text-[#111111]">Share Rides,</span>
                  <span className="inline-block bg-gradient-to-r from-[#E10600] via-[#FF4D30] to-[#FFA033] bg-clip-text text-transparent">
                    {typedHeadline || "\u00A0"}
                  </span>
                  <span className="inline-block w-[3px] sm:w-[4px] h-[0.82em] bg-[#E10600] ml-1.5 align-baseline animate-pulse rounded-full shadow-[0_0_8px_rgba(225,6,0,0.6)]"></span>
                </h1>

                <p className="text-base lg:text-lg text-[#555555] mb-8 leading-relaxed max-w-xl">
                  Join thousands of smart commuters sharing rides across India.
                  <span className="font-semibold text-[#E10600]">
                    {" "}Save up to 70%{" "}
                  </span>
                  on travel costs while reducing traffic and making meaningful connections.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {stats.slice(0, 2).map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-3 p-3.5 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/70 hover:border-red-200 shadow-card-subtle hover:shadow-md transition-all duration-300"
                    >
                      <div
                        className={`p-2.5 rounded-xl ${stat.bgColor} border border-white/40 shadow-sm`}
                      >
                        <div className={stat.color}>{stat.icon}</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-[#111111]">
                          {stat.value}
                        </div>
                        <div className="text-xs text-[#555555] font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/rides")}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white font-bold rounded-xl shadow-md hover:shadow-red-glow transition-all duration-300 flex items-center justify-center gap-2.5 group flex-1"
                  >
                    <Car size={19} />
                    <span>Find a Ride Now</span>
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/offer-ride")}
                    className="px-8 py-3.5 bg-white/90 backdrop-blur-md border border-gray-200 text-[#111111] font-semibold rounded-xl hover:border-red-300 hover:bg-red-50/40 hover:text-[#E10600] shadow-sm transition-all duration-300 flex items-center justify-center gap-2.5 group flex-1"
                  >
                    <Zap size={19} className="text-[#E10600]" />
                    <span>Offer a Ride</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <RideSearchCard cityBg={cityBg} location={location} />
          </div>
        </div>
      </section>

      {/* Recent Rides Section */}
      <section className="py-8 lg:py-12 bg-gradient-to-b from-white to-gray-50/30 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/50 mb-4">
              <Car size={16} className="text-red-500" />
              <span className="text-sm font-semibold text-red-700">
                Available Rides
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-red-600">Recent</span> & Upcoming Rides
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join these verified rides happening soon. Book your seat and
              travel smart!
            </p>
          </motion.div>

          {/* Rides Display - Updated to handle recentRides properly */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {ridesList && ridesList.length > 0 ? (
              ridesList.slice(0, 6).map((ride, index) => {
                const { isToday, formatted: formattedDate } = formatRideDate(ride?.departureDate);
                const seatsCount = ride.availableSeats ?? ride.seatsAvailable ?? 1;

                return (
                  <motion.div
                    key={ride._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-3xl shadow-card-subtle hover:shadow-card-hover transition-all duration-300 border border-gray-100 overflow-hidden group"
                  >
                    {/* Ride Header */}
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 via-white to-red-50/20">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-[#111111] mb-1">
                            {ride.from?.city || "Location"} → {ride.to?.city || "Destination"}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium flex-wrap">
                            {isToday && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] uppercase tracking-wide">
                                Today
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar size={13} className="text-[#E10600]" />
                              <span>{formattedDate}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1">
                              <Clock size={13} className="text-[#E10600]" />
                              <span>{formatRideTime(ride?.departureTime)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-red-50 border border-red-100 rounded-full shrink-0">
                          <span className="text-sm font-bold text-[#E10600]">
                            ₹{ride.pricePerSeat || "0"}
                            <span className="text-xs font-normal text-gray-500">/seat</span>
                          </span>
                        </div>
                      </div>

                      {/* Driver Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E10600] to-[#FF5A36] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                          {(ride.driver?.firstName?.[0] || "U").toUpperCase()}
                          {(ride.driver?.lastName?.[0] || "").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#111111]">
                            {ride.driver?.firstName
                              ? `${ride.driver.firstName} ${ride.driver.lastName || ""}`.trim()
                              : "Verified Driver"}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Car size={12} />
                            <span>{ride?.carDetails?.model || "Standard Car"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ride Details */}
                    <div className="p-5">
                      {/* Route Info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100"></div>
                          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-emerald-400 my-0.5"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-[#111111] truncate" title={ride.from?.address || ride.from?.city}>
                            {ride.from?.address || ride.from?.city || "Pickup Location"}
                          </div>
                          <div className="text-xs text-gray-400 mb-3 truncate">
                            {ride.from?.city || "City"}
                          </div>
                          <div className="font-semibold text-sm text-[#111111] truncate" title={ride.to?.location || ride.to?.address || ride.to?.city}>
                            {ride.to?.location || ride.to?.address || ride.to?.city || "Drop Location"}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {ride.to?.city || "City"}
                          </div>
                        </div>
                      </div>

                      {/* Seats & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Users size={15} className="text-gray-400" />
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            seatsCount <= 1
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {seatsCount <= 1 ? "🔥 Only " : "✓ "}
                            {seatsCount} seat{seatsCount !== 1 ? "s" : ""} left
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() =>
                            navigate("/view-ride-details", {
                              state: { rideId: ride?._id },
                            })
                          }
                          className="px-4 py-2 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-red-glow transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Book Now</span>
                          <ArrowRight size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Show message when no rides are available
              <div className="col-span-full text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-50 to-orange-50 mb-4">
                  <Car size={24} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No rides available at the moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to offer a ride and help others travel smarter!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/offer-ride")}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-200 transition-all duration-300 flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Zap size={20} />
                  <span>Offer a Ride Now</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* View All Rides Button - Only show if there are rides */}
          {ridesList && ridesList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center mt-10"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/rides")}
                className="px-8 py-3.5 bg-white border-2 border-red-200 text-[#E10600] font-bold rounded-2xl hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 mx-auto group cursor-pointer"
              >
                <Car size={19} />
                <span>View All Available Rides</span>
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>
      {/* Features Section */}
      <section className="py-2 lg:py-5 bg-gradient-to-b from-white to-gray-50/30 relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "cover",
            }}
          />
        </div>
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/50 mb-4">
              <Zap size={16} className="text-red-500" />
              <span className="text-sm font-semibold text-red-700">
                Why Choose HumRahii
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Smarter Commute,{" "}
              <span className="text-red-600">Better Experience</span>
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Experience premium carpooling with features designed for safety,
              comfort, and maximum savings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group relative overflow-hidden rounded-xl"
              >
                {/* Feature Background Image */}
                <div
                  className="absolute inset-0 opacity-10 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${feature.image})` }}
                />

                <div
                  className={`relative ${feature.bgColor} backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 hover:border-red-200 hover:shadow-xl transition-all duration-300`}
                >
                  {/* Feature Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>

                  {/* Feature Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    {feature.description}
                  </p>

                  {/* Feature Stat */}
                  <div className="text-sm font-semibold text-gray-700">
                    {feature.stat}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-2 lg:py-5 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/50 mb-4">
                <Play size={16} className="text-red-500" />
                <span className="text-sm font-semibold text-red-700">
                  Simple & Easy
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                How <span className="text-red-600">HumRahii</span> Works
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get started in just 4 simple steps and experience smart
                commuting
              </p>
            </div>

            {/* Steps */}
            <div className="relative">
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-red-100 via-orange-100 to-red-100 -translate-y-1/2"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                {howItWorks.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Step Background Image */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-5 bg-cover bg-center"
                      style={{ backgroundImage: `url(${step.image})` }}
                    />

                    <div
                      className={`relative ${step.bgColor} backdrop-blur-sm rounded-2xl p-5 text-center border border-gray-200/50`}
                    >
                      {/* Step Number */}
                      <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {step.step}
                      </div>

                      {/* Step Icon */}
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/80 border border-gray-200/50 flex items-center justify-center">
                        <div className="text-red-600">{step.icon}</div>
                      </div>

                      {/* Step Content */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest Blog Section */}
      <section className="py-2 lg:py-5 bg-gradient-to-b from-gray-50/30 to-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-100/50 mb-4">
                <BookOpen size={16} className="text-red-500" />
                <span className="text-sm font-semibold text-red-700">
                  Latest Insights
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Latest <span className="text-red-600">Blogs</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Read our latest articles on travel, safety, sustainability, and
                community
              </p>
            </div>

            {/* Loading State */}
            {loadingBlogs && blogs.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : blogError ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{blogError}</p>
                <button
                  onClick={fetchBlogs}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Blog Posts Grid for larger screens */}
                {/* <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
                  {blogs.slice(0, 3).map((blog, index) => (
                    <motion.article
                      key={blog.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate(`/blog/${blog.slug}`)}
                    >
                     
                      <div className="relative overflow-hidden h-48">
                        <img 
                          src={blog.image} 
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = getDefaultImage(blog.category);
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${blogCategories.find(c => c.id === blog.category)?.color || 'bg-gray-100 text-gray-700'}`}>
                            {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {blog.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {blog.readTime}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {blog.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                              <User size={16} className="text-red-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{blog.author}</span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div> */}

                {/* Blog Slider for mobile/tablet */}
                <div className="overflow-hidden mb-8 w-full max-w-full">
                  <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    slidesPerView={3} // ✅ FIX
                    spaceBetween={24}
                    centeredSlides={false} // ✅ FIX
                    loop={true}
                    autoplay={{
                      delay: 2000,
                      disableOnInteraction: false,
                    }}
                    pagination={{ clickable: true }}
                    navigation
                    breakpoints={{
                      640: { slidesPerView: 1 },
                      768: { slidesPerView: 2 },
                      1024: { slidesPerView: 3 },
                    }}
                  >
                    {blogs.slice(0, 6).map((blog, index) => (
                      <SwiperSlide key={blog.id || index} className="!w-auto !mx-2">
                        <motion.div
                          whileHover={{ y: -5 }}
                          onClick={() => navigate("/blog")}
                          className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-sm mx-auto cursor-pointer"
                        >
                          {/* Blog Image */}
                          <div className="relative overflow-hidden h-48">
                            <img
                              src={getBlogImageUrl(blog.image, index, blog.category)}
                              alt={blog.title || "Blog Article"}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = getFallbackBlogImage(index, blog.category);
                              }}
                            />
                            <div className="absolute top-4 left-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${blogCategories.find((c) => c.id === blog.category)?.color || "bg-gray-100 text-gray-700"}`}
                              >
                                {blog.category.charAt(0).toUpperCase() +
                                  blog.category.slice(1)}
                              </span>
                            </div>
                          </div>

                          {/* Blog Content */}
                          <div className="p-5">
                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                {blog.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                {blog.readTime}
                              </div>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {blog.title}
                            </h3>

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {blog.excerpt}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                  <User size={12} className="text-red-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">
                                  {blog.author}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* View All Blogs Button */}
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/blog")}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-200 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                  >
                    <BookOpen size={20} />
                    <span>View All Blogs</span>
                    <ArrowRight size={18} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 lg:py-13 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${patternBg})`,
              backgroundSize: "cover",
            }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <div className="text-sm font-medium text-white/90">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Additional Benefits */}
      <section className="py-2 lg:py-4 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              More Than Just <span className="text-red-600">Rides</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover additional benefits that make HumRahii the smart choice
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {appBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-b from-gray-50/80 to-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-red-200 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${benefit.bgColor} flex items-center justify-center mb-3`}
                >
                  <div className={benefit.color}>{benefit.icon}</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {benefit.title}
                </h3>
                <p className="text-xs text-gray-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-4 lg:pb-5">
        <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 lg:p-8 text-center relative overflow-hidden"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url(${cityBg})`,
                backgroundSize: "cover",
              }}
            />

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 mb-4">
                <Sparkles size={16} className="text-red-300" />
                <span className="text-sm font-semibold text-white">
                  Start Your Journey Today
                </span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Ready to Travel Smarter?
              </h2>

              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Join India's fastest-growing carpool community. Save money,
                reduce emissions, and turn every commute into an opportunity.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/register")}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Download size={18} />
                  <span>Get Started Free</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/blog")}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <BookOpen size={18} />
                  <span>Read Our Blog</span>
                </motion.button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <CheckCircle size={12} className="text-green-400" />
                  <span>No credit card needed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield size={12} className="text-blue-400" />
                  <span>100% secure signup</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-amber-400" />
                  <span>Quick setup</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <DownloadPopup />
    </div>
  );
};

export default Home;
