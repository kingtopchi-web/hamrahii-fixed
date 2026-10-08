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
  Package,
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
import KycGuard from "../../components/KycGuard";
import FloatingActionButtons from "../../components/FloatingActionButtons";

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
          <div className="absolute inset-0 bg-[var(--bg-surface)]/30" />
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
          <div className="flex justify-center items-center min-h-[75vh] lg:min-h-[85vh] pt-10 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-4xl"
            >




              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
                <KycGuard>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/rides")}
                    className="btn-water btn-water-right btn-water-bg-red px-10 py-4 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-red-glow transition-all duration-300 flex items-center justify-center gap-3 group w-full sm:w-64 mx-auto sm:mx-0"
                  >
                    <Car size={24} />
                    <span>Find a Ride Now</span>
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </motion.button>
                </KycGuard>

                <KycGuard>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/offer-ride")}
                    className="btn-water btn-water-up btn-water-bg-light-red px-10 py-4 bg-[var(--bg-surface)]/95 backdrop-blur-md border-2 border-red-100 text-[#111111] font-bold text-lg rounded-2xl hover:border-red-400 hover:text-[#E10600] shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group w-full sm:w-64 mx-auto sm:mx-0"
                  >
                  <Zap size={24} className="text-[#E10600]" />
                  <span>Offer a Ride</span>
                </motion.button>
                </KycGuard>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Bottom Marquee */}
        <div className="absolute bottom-0 left-0 w-full bg-[#1A1A1A] py-3 overflow-hidden border-t border-b border-[#333333] z-20">
          <div className="animate-marquee-horizontal flex items-center whitespace-nowrap">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex items-center">
                <span className="text-white text-xl md:text-2xl font-black uppercase tracking-wider">
                  HUMRA<span className="text-[#E10600]">HII</span>
                </span>
                <span className="text-white mx-6 md:mx-10 text-xl">✦</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services in Major Cities Section */}
      <section className="py-12 lg:py-16 bg-[var(--bg-surface)] relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-yellow-400 rounded-full"></div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Our Services in Major Cities
              </h2>
            </div>
            <Link to="/rides" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors hidden sm:block">
              EXPLORE MORE
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { name: "Hyderabad", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600" },
              { name: "Varanasi", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=600" },
              { name: "Chandigarh", image: "https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?q=80&w=600" },
              { name: "Lucknow", image: "/lucknow.jpg" },
              { name: "Bangalore", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=600" },
              { name: "Delhi", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=600" },
            ].map((city, index) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate("/rides", { state: { fromCity: city.name } })}
                className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${city.image})` }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                {/* Content */}
                <div className="absolute top-0 left-0 p-6 w-full h-full flex flex-col justify-start">
                  <h3 className="text-2xl font-bold text-white mb-2">{city.name}</h3>
                  <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-300">
                    <ArrowRight size={16} className="text-white group-hover:text-black" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/rides" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
              EXPLORE MORE
            </Link>
          </div>
        </div>
      </section>

      {/* Vehicle Type Banner Section */}
      <section className="py-8 lg:py-12 bg-white relative overflow-hidden border-y border-gray-100">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden border border-gray-200">
            {/* Background Accent */}
            <div className="absolute right-0 top-0 w-64 h-full bg-red-50/50 transform skew-x-12 translate-x-20 rounded-l-[100px] pointer-events-none"></div>
            
            {/* Text Content */}
            <div className="z-10 text-center md:text-left mb-8 md:mb-0 w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Vehicles type we provide
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto md:mx-0">
                Choose from our wide range of verified, comfortable, and well-maintained vehicles for your next journey.
              </p>
              <button
                onClick={() => navigate("/vehicles")}
                className="bg-[#E10600] text-white px-8 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/30"
              >
                View Vehicles
              </button>
            </div>

            {/* Images Group */}
            <div className="z-10 w-full md:w-1/2 flex justify-center md:justify-end items-end gap-2 md:gap-4 relative h-48 md:h-64">
              <motion.img 
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80" 
                alt="Sedan Car"
                className="w-32 md:w-48 h-auto object-contain drop-shadow-xl z-20 absolute left-0 md:left-10 bottom-0 rounded-lg"
              />
              <motion.img 
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=400&q=80" 
                alt="SUV Car"
                className="w-40 md:w-56 h-auto object-contain drop-shadow-2xl z-30 relative bottom-0 rounded-lg border-4 border-white shadow-lg"
              />
            </div>
          </div>
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
                      className="group cursor-pointer bg-[var(--bg-surface)] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
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
                          className="bg-[var(--bg-surface)] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 w-full max-w-sm mx-auto cursor-pointer"
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

      {/* Reviews Section */}
      <section className="py-10 bg-[#EAF5FE] relative overflow-hidden">
        {/* Grid Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(to right, #4a90e2 1px, transparent 1px), linear-gradient(to bottom, #4a90e2 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
        
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-16">
            
            {/* Google Reviews */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <img src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google.png" alt="Google" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-0">Google</h3>
                <div className="flex items-center text-amber-400 gap-1 my-1">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} className="text-gray-300" fill="currentColor" />
                </div>
                <p className="text-gray-900 font-bold text-sm">(12022 Review)</p>
              </div>
            </div>

            {/* Play Store Reviews */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <img src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google-play.png" alt="Play Store" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-0">Play Store</h3>
                <div className="flex items-center text-amber-400 gap-1 my-1">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} className="text-gray-300" fill="currentColor" />
                </div>
                <p className="text-gray-900 font-bold text-sm">(3222 Review)</p>
              </div>
            </div>

            {/* App Store Reviews */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" alt="App Store" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-0">App Store</h3>
                <div className="flex items-center text-amber-400 gap-1 my-1">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} className="text-gray-300" fill="currentColor" />
                </div>
                <p className="text-gray-900 font-bold text-sm">(5444 Review)</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Additional Benefits */}
      <section className="py-2 lg:py-4 bg-[var(--bg-surface)] relative overflow-hidden">
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
                className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-b from-gray-50/80 to-white/80 backdrop-blur-sm border border-[var(--border-subtle)]/50 hover:border-red-200 hover:shadow-lg transition-all duration-300"
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

      {/* What Makes Humrahii Unique */}
      <section className="py-8 lg:py-12 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1.5 h-10 bg-[#FFD700]"></div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
              What Makes Humrahii Unique?
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div className="flex items-center gap-5 bg-[#FCFAEE] px-6 py-5 rounded-2xl w-full md:w-1/3 shadow-sm border border-yellow-50">
              <div className="text-blue-500 bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                <Car size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">Ride Offered</h3>
            </div>

            <div className="flex items-center gap-5 bg-[#FCFAEE] px-6 py-5 rounded-2xl w-full md:w-1/3 shadow-sm border border-yellow-50">
              <div className="text-blue-500 bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                <Package size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">Parcel Delivery</h3>
            </div>

            <div className="flex items-center gap-5 bg-[#FCFAEE] px-6 py-5 rounded-2xl w-full md:w-1/3 shadow-sm border border-yellow-50">
              <div className="text-blue-500 bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                <ShieldCheck size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg">Verified Users</h3>
            </div>

          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-12 lg:py-16 bg-[#F8FAF9] relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Text & Download Links */}
            <div className="w-full lg:w-1/2">
              <p className="text-sm font-semibold text-gray-500 tracking-wider mb-2 uppercase">MOST DOWNLOADED</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-4">
                Make Your Travel Easy with <br/> Humrahii
              </h2>
              <h3 className="text-4xl lg:text-5xl font-bold text-[#1877F2] mb-8">
                Download App Now
              </h3>
              
              <div className="flex flex-row items-center w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 sm:p-2 mb-8">
                <div className="flex flex-1 items-center bg-transparent min-w-0">
                  <span className="px-2 sm:px-4 text-gray-500 border-r border-gray-200 font-medium text-sm sm:text-base shrink-0">+91</span>
                  <input 
                    type="text" 
                    placeholder="Enter mobile number" 
                    className="flex-1 w-full min-w-0 px-2 sm:px-4 py-2 outline-none text-gray-700 bg-transparent text-sm sm:text-base"
                  />
                </div>
                <button className="bg-[#1877F2] hover:bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-center flex items-center justify-center text-xs sm:text-base shrink-0">
                  Get App Link
                </button>
              </div>

              <div className="flex items-center gap-4">
                <a href="#" className="block hover:opacity-90 transition-opacity">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-[52px]" />
                </a>
                <a href="#" className="block hover:opacity-90 transition-opacity">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-[52px]" />
                </a>
              </div>
            </div>

            {/* Mockup Phones */}
            <div className="w-full lg:w-1/2 relative h-[500px] hidden md:block">
               {/* Phone 1 (Back/Left) */}
               <div className="absolute right-40 top-10 w-64 h-[450px] bg-white rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden transform -rotate-6">
                 <div className="bg-gray-50 h-full w-full p-4 relative flex flex-col">
                   <div className="bg-white rounded-xl shadow-sm p-3 mb-6 mt-8 flex items-center justify-between">
                     <div className="h-4 w-20 bg-gray-200 rounded"></div>
                     <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                       <User size={12} className="text-orange-500" />
                     </div>
                   </div>
                   <div className="space-y-4 flex-1">
                     <div className="h-16 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center px-4">
                        <MapPin className="text-blue-500 mr-3" size={20} />
                        <div className="h-2 w-32 bg-gray-200 rounded"></div>
                     </div>
                     <div className="h-16 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center px-4">
                        <Car className="text-blue-500 mr-3" size={20} />
                        <div className="h-2 w-32 bg-gray-200 rounded"></div>
                     </div>
                   </div>
                   <div className="absolute bottom-6 left-4 right-4 h-12 bg-[#FFD700] rounded-xl flex items-center justify-center shadow-sm">
                     <span className="font-bold text-sm text-gray-800">Search</span>
                   </div>
                 </div>
               </div>

               {/* Phone 2 (Front/Right) */}
               <div className="absolute right-10 top-0 w-64 h-[480px] bg-white rounded-[3rem] border-[8px] border-gray-800 shadow-2xl overflow-hidden transform rotate-12 z-10">
                 <div className="bg-gray-50 h-full w-full p-0 relative">
                   <div className="bg-white p-4 pt-10 shadow-sm flex items-center justify-between z-20 relative">
                     <span className="font-bold text-sm text-gray-800 flex items-center gap-2">
                       <ArrowRight size={16} className="rotate-180" /> My Rides
                     </span>
                     <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center">
                       <User size={12} className="text-orange-500" />
                     </div>
                   </div>
                   <div className="h-56 bg-[#f0f4f8] border-b border-gray-200 flex items-center justify-center relative overflow-hidden">
                      {/* Fake Map Route */}
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                      <div className="absolute inset-0 opacity-10 bg-blue-200"></div>
                      
                      {/* Dashed line */}
                      <div className="w-32 h-32 border-l-[3px] border-b-[3px] border-[#1877F2] border-dashed absolute top-10 left-12"></div>
                      
                      <div className="absolute bottom-10 right-16 z-10 bg-white rounded-full p-1 shadow-md">
                        <MapPin size={16} className="text-[#1877F2]" />
                      </div>
                      
                      <div className="absolute top-6 left-8 z-10 bg-white rounded-full p-1 shadow-md transform -translate-x-1/2 -translate-y-1/2">
                        <Car size={16} className="text-[#1877F2] transform rotate-45" />
                      </div>
                   </div>
                   <div className="p-4 space-y-4">
                     <div className="bg-[#FFF4E5] rounded-xl p-3 border border-orange-100">
                       <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-sm text-gray-800">Rajesh Sharma</span>
                         <span className="font-bold text-sm text-gray-800">₹ 1296</span>
                       </div>
                       <div className="text-[11px] text-gray-500 font-medium">120 km</div>
                     </div>
                     <div className="space-y-3">
                       <div className="text-[11px] text-gray-600 flex items-center font-medium">
                         <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-3 ring-2 ring-green-100"></div>
                         Indiranagar, Lucknow
                       </div>
                       <div className="h-6 w-px bg-gray-300 ml-1.5 -my-2"></div>
                       <div className="text-[11px] text-gray-600 flex items-center font-medium">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-3 ring-2 ring-red-100"></div>
                         Ashok Nagar, Kanpur
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <DownloadPopup />
      <FloatingActionButtons whatsappNumber="916688684504" message="Hi Humrahii, I need some help!" />
    </div>
  );
};

export default Home;
