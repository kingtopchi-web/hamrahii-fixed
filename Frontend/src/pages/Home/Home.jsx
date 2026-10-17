import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Calendar,
  Users,
  Shield,
  Star,
  Clock,
  ChevronLeft,
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
  ChevronDown,
  Headphones,
  Bell,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { getBlogImageUrl, getFallbackBlogImage, createSafeSlug } from "../../utils/blogImageHelper";
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
import { handlePlayStoreClick, handleAppStoreClick, handleSendAppLink } from "../../utils/appDownload";

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

// FAQ Data for SEO informational section
const faqList = [
  {
    question: "How do I find and book a ride on HamRahii?",
    answer:
      "Enter your departure city, destination, and planned travel date in the search bar. You can browse available carpools, check vehicle models, departure times, and transparent per-seat prices, then book your seat directly.",
  },
  {
    question: "How does offering a ride work for vehicle owners?",
    answer:
      "If you are driving between cities or commuting regularly, select 'Offer a Ride' or 'Become a Captain'. Enter your route, stops, departure schedule, empty seats, and price per seat to connect with passengers going your way and share fuel expenses.",
  },
  {
    question: "Can I send parcels or packages through HamRahii?",
    answer:
      "Yes. HamRahii facilitates parcel delivery along active vehicle routes. Enter your pickup location, drop address, and parcel details to coordinate convenient transport with traveling drivers heading toward your package's destination.",
  },
  {
    question: "How do I manage, modify, or cancel a booking?",
    answer:
      "Navigate to 'My Rides' from your profile dashboard. There you can check confirmed trip details, view driver/passenger information, review pickup instructions, or cancel reservations according to the platform's cancellation guidelines.",
  },
  {
    question: "What user verification processes are in place?",
    answer:
      "HamRahii verifies mobile numbers and email addresses for all members. For ride captains and drivers, driving licenses, vehicle registrations, and documentation are verified to cultivate an accountable and trusted travel community.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [date, setDate] = useState("");
  const { isLoaded } = useGoogleMaps();
  const [location, setLocation] = useState("")
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showDeliveryVehiclesModal, setShowDeliveryVehiclesModal] = useState(false);

  // Blog State
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogError, setBlogError] = useState(null);
  const blogSwiperRef = useRef(null);
  const [recentRides, setRecentRides] = useState([]);
  const [appMobileNumber, setAppMobileNumber] = useState("");
  const [sendingAppLink, setSendingAppLink] = useState(false);

  const onGetAppLink = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSendingAppLink(true);
    const success = await handleSendAppLink(appMobileNumber);
    if (success) {
      setAppMobileNumber("");
    }
    setSendingAppLink(false);
  };

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
      console.log(city, "this is city ")
      const res = await Axios.post(api.ride.getRecentRides, { city });
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

      const streetLocation = await getlocationFromCoords(lat, lng)
      console.log(streetLocation, "this is location")
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
      description: blog.description || blog.content || "",
      featured: blog.featured || false,
      slug: createSafeSlug(blog.slug || blog.title) || (blog._id ? String(blog._id) : ""),
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
      <section className="relative overflow-hidden lg:pt-8 pb-6 lg:pb-10">
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
          <div className="flex justify-center items-center min-h-[50vh] lg:min-h-[58vh] pt-4 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-5xl"
            >
              {/* Dynamic Ride Search Card */}
              <div className="mb-8 w-full">
                <RideSearchCard />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-8">
                <KycGuard className="w-full sm:w-72">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/user/send-parcel")}
                    className="btn-water btn-water-right btn-water-bg-red w-full h-[60px] px-6 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-red-glow transition-all duration-300 flex items-center justify-center gap-3 group border-2 border-transparent box-border"
                  >
                    <img
                      src="/icons/parcel.png"
                      alt="Send Parcel"
                      className="w-9 h-9 object-contain shrink-0 group-hover:scale-110 drop-shadow-md transition-transform"
                    />
                    <span className="whitespace-nowrap">Send Parcel</span>
                    <ArrowRight
                      size={20}
                      className="shrink-0 group-hover:translate-x-1 transition-transform ml-auto sm:ml-0"
                    />
                  </motion.button>
                </KycGuard>

                <KycGuard className="w-full sm:w-72">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/offer-ride")}
                    className="btn-water btn-water-up btn-water-bg-light-red w-full h-[60px] px-6 bg-[var(--bg-surface)]/95 backdrop-blur-md border-2 border-red-100 text-[#111111] font-bold text-lg rounded-2xl hover:border-red-400 hover:text-[#E10600] shadow-xl transition-all duration-300 flex items-center justify-center gap-3 group box-border"
                  >
                    <img
                      src="/icons/car.png"
                      alt="Offer a Ride"
                      className="w-10 h-10 object-contain shrink-0 group-hover:scale-110 drop-shadow-sm transition-transform"
                    />
                    <span className="whitespace-nowrap">Offer a Ride</span>
                    <ArrowRight
                      size={20}
                      className="shrink-0 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100 ml-auto sm:ml-0"
                    />
                  </motion.button>
                </KycGuard>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Services in Major Cities Section */}
      <section className="py-8 lg:py-10 bg-[var(--bg-surface)] relative overflow-hidden">
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
              { name: "Hyderabad", image: "/hyderabad.jpg" },
              { name: "Varanasi", image: "/varanasi.jpg" },
              { name: "Chandigarh", image: "/chandigarh.jpg" },
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
      <section className="py-6 lg:py-8 bg-white relative overflow-hidden border-y border-gray-100">
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

            {/* Vehicles Showcase Grid */}
            <div className="z-10 w-full md:w-1/2 grid grid-cols-2 gap-3 sm:gap-4">
              {[
                {
                  name: "Hatchback",
                  seats: "Up to 3 Seats",
                  img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80",
                  tag: "Economical"
                },
                {
                  name: "Sedan",
                  seats: "Up to 4 Seats",
                  img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80",
                  tag: "Comfort"
                },
                {
                  name: "SUV",
                  seats: "Up to 6 Seats",
                  img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80",
                  tag: "Spacious"
                },
                {
                  name: "Bike / Scooter",
                  seats: "1 Seat",
                  img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80",
                  tag: "Fastest"
                },
              ].map((vehicle, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/vehicles")}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 cursor-pointer group transition-all"
                >
                  <div className="h-28 sm:h-32 w-full overflow-hidden bg-gray-100 relative">
                    <img
                      src={vehicle.img}
                      alt={vehicle.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                      {vehicle.tag}
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#E10600] transition-colors truncate">
                      {vehicle.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">
                      {vehicle.seats}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog Section */}
      <section className="py-8 lg:py-10 bg-gradient-to-b from-gray-50/50 via-white to-gray-50/30 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-10 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-8 bg-[#E10600] rounded-full"></div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                    Latest Stories & Updates
                  </h2>
                </div>
                <p className="text-gray-500 text-sm sm:text-base ml-4.5">
                  Tips, guides, and stories to make your intercity travel smarter and affordable.
                </p>
              </div>

              {/* Slider Navigation Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => blogSwiperRef.current?.slidePrev()}
                  aria-label="Previous Slide"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-white hover:bg-[#E10600] hover:border-[#E10600] shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer group"
                >
                  <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => blogSwiperRef.current?.slideNext()}
                  aria-label="Next Slide"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-white hover:bg-[#E10600] hover:border-[#E10600] shadow-sm hover:shadow-md transition-all flex items-center justify-center cursor-pointer group"
                >
                  <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loadingBlogs && blogs.length === 0 ? (
              <div className="flex justify-center items-center py-16">
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
                {/* Blog Slider with Responsive Breakpoints */}
                <div className="relative w-full">
                  <Swiper
                    modules={[Autoplay, Navigation, Pagination]}
                    onBeforeInit={(swiper) => {
                      blogSwiperRef.current = swiper;
                    }}
                    slidesPerView={1}
                    spaceBetween={18}
                    loop={blogs.length > 3}
                    autoplay={{
                      delay: 3500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    pagination={{
                      clickable: true,
                      el: ".blog-swiper-pagination",
                    }}
                    navigation={false}
                    breakpoints={{
                      540: {
                        slidesPerView: 1.3,
                        spaceBetween: 20,
                      },
                      768: {
                        slidesPerView: 2,
                        spaceBetween: 24,
                      },
                      1024: {
                        slidesPerView: 3,
                        spaceBetween: 24,
                      },
                      1280: {
                        slidesPerView: 3,
                        spaceBetween: 28,
                      },
                    }}
                    className="!py-3"
                  >
                    {blogs.slice(0, 6).map((blog, index) => (
                      <SwiperSlide key={blog.id || index} className="!h-auto flex">
                        <motion.div
                          whileHover={{ y: -6 }}
                          onClick={() => navigate(blog.slug ? `/blog/${blog.slug}` : "/blog", { state: { blog } })}
                          className="group bg-[var(--bg-surface)] rounded-2xl overflow-hidden border border-gray-100/90 shadow-card-subtle hover:shadow-card-hover transition-all duration-300 w-full h-full flex flex-col justify-between cursor-pointer"
                        >
                          {/* Blog Image */}
                          <div className="relative overflow-hidden h-48 sm:h-52 bg-gray-100">
                            <img
                              src={getBlogImageUrl(blog.image, index, blog.category)}
                              alt={blog.title || "Blog Article"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src = getFallbackBlogImage(index, blog.category);
                              }}
                            />
                            <div className="absolute top-3.5 left-3.5">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${blogCategories.find((c) => c.id === blog.category)?.color || "bg-gray-100 text-gray-700"}`}
                              >
                                {blog.category.charAt(0).toUpperCase() +
                                  blog.category.slice(1)}
                              </span>
                            </div>
                          </div>

                          {/* Blog Content */}
                          <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                            <div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2.5">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Calendar size={13} className="text-gray-400" />
                                  {blog.date}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="flex items-center gap-1.5 font-medium">
                                  <Clock size={13} className="text-gray-400" />
                                  {blog.readTime}
                                </span>
                              </div>

                              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors line-clamp-2 leading-snug">
                                {blog.title}
                              </h3>

                              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {blog.excerpt}
                              </p>
                            </div>

                            <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-red-50 text-[#E10600] flex items-center justify-center font-bold text-xs shrink-0">
                                  <User size={13} />
                                </div>
                                <span className="text-xs font-semibold text-gray-700 truncate max-w-[130px]">
                                  {blog.author}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-[#E10600] flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0">
                                Read More <ArrowRight size={13} />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Clean Pagination Dots */}
                  <div className="blog-swiper-pagination flex justify-center items-center gap-1.5 mt-6 mb-8"></div>
                </div>

                {/* View All Blogs Button */}
                <div className="text-center mt-2">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/blog")}
                    className="px-8 py-3 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-red-glow transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen size={18} />
                    <span>View All Articles</span>
                    <ArrowRight size={16} />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
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
            className="text-center mb-6"
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
      <section className="pt-6 pb-2 lg:pt-8 lg:pb-3 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-10 bg-[#FFD700]"></div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
              What Makes Humrahii Unique?
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div
              onClick={() => navigate("/offer-ride")}
              className="flex items-center gap-5 bg-[#FCFAEE] px-6 py-4.5 rounded-2xl w-full md:w-1/3 shadow-sm hover:shadow-md border border-yellow-100/70 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                <img
                  src="/icons/car.png"
                  alt="Ride Offered"
                  className="w-full h-full object-contain group-hover:scale-110 drop-shadow-md transition-transform duration-300"
                />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg group-hover:text-[#E10600] transition-colors">
                Ride Offered
              </h3>
            </div>

            <div
              onClick={() => navigate("/user/send-parcel")}
              className="flex items-center gap-5 bg-[#FCFAEE] px-6 py-4.5 rounded-2xl w-full md:w-1/3 shadow-sm hover:shadow-md border border-yellow-100/70 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                <img
                  src="/icons/parcel.png"
                  alt="Parcel Delivery"
                  className="w-full h-full object-contain group-hover:scale-110 drop-shadow-md transition-transform duration-300"
                />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg group-hover:text-[#E10600] transition-colors">
                Parcel Delivery
              </h3>
            </div>

            <div
              className="flex items-center gap-5 bg-[#FCFAEE] px-6 py-4.5 rounded-2xl w-full md:w-1/3 shadow-sm hover:shadow-md border border-yellow-100/70 transition-all duration-300 group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                <img
                  src="/icons/verified.png"
                  alt="Verified Users"
                  className="w-full h-full object-contain group-hover:scale-110 drop-shadow-md transition-transform duration-300"
                />
              </div>
              <h3 className="text-gray-900 font-semibold text-lg group-hover:text-[#E10600] transition-colors">
                Verified Users
              </h3>
            </div>

          </div>
        </div>
      </section>

      {/* Ride Sharing Platform & Why Humrahii Section (Inspired by Brand Mockup) */}
      <section className="pt-2 pb-8 lg:pt-4 lg:pb-12 bg-white">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          {/* 1. Top Ride Sharing Platform Banner */}
          <div className="flex flex-col lg:flex-row items-center justify-between bg-gradient-to-br from-slate-50 via-white to-red-50/40 rounded-3xl p-6 sm:p-10 lg:p-12 border border-gray-100 shadow-sm mb-8 lg:mb-10">
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mb-8 lg:mb-0">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#E10600] tracking-tight uppercase leading-tight">
                RIDE SHARING
              </h2>
              <p className="text-lg sm:text-xl font-bold text-gray-800 tracking-[0.25em] uppercase mt-1 mb-8">
                PLATFORM SERVICES
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  to="/offer-ride"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#E10600] hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase shadow-md shadow-red-500/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  BECOME A CAPTAIN
                </Link>
                <Link
                  to="/rides"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-sm tracking-wider uppercase shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  FIND A RIDE
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center">
              <img
                src="/landing/hero_banner.jpg"
                alt="Ride Sharing Platform Services"
                className="w-full max-w-md lg:max-w-lg object-contain rounded-2xl drop-shadow-sm hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>

          {/* 3. Why Humrahii Section */}
          <div>
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E10600] tracking-wide uppercase">
                WHY HUMRAHII
              </h2>
              <div className="w-16 h-1 bg-[#E10600] mx-auto mt-3 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-40 h-40 sm:w-48 sm:h-48 mb-6 flex items-center justify-center bg-red-50/40 rounded-3xl p-4 border border-red-100/50 group-hover:border-red-200 transition-all duration-300">
                  <img
                    src="/landing/freedom_choice.jpg"
                    alt="Freedom of Choice"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-wide uppercase mb-3 group-hover:text-[#E10600] transition-colors">
                  FREEDOM OF CHOICE
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                  Choose your ride from verified routes, trusted carpoolers, and preferred travel timings with clear upfront pricing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-40 h-40 sm:w-48 sm:h-48 mb-6 flex items-center justify-center bg-red-50/40 rounded-3xl p-4 border border-red-100/50 group-hover:border-red-200 transition-all duration-300">
                  <img
                    src="/landing/know_your_driver.jpg"
                    alt="Know Who Your Driver Will Be"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-wide uppercase mb-3 group-hover:text-[#E10600] transition-colors">
                  KNOW WHO YOUR DRIVER WILL BE
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                  View driver ratings, government-verified profiles, passenger reviews, and vehicle details before booking your shared ride.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-40 h-40 sm:w-48 sm:h-48 mb-6 flex items-center justify-center bg-red-50/40 rounded-3xl p-4 border border-red-100/50 group-hover:border-red-200 transition-all duration-300">
                  <img
                    src="/landing/schedule_ride.jpg"
                    alt="Schedule Your Ride"
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-wide uppercase mb-3 group-hover:text-[#E10600] transition-colors">
                  SCHEDULE YOUR RIDE
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                  Plan daily intercity trips or daily commutes ahead of time. Reliable seat reservations with hassle-free departure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEO Section 1: How Does HamRahii Ride Sharing & Parcel Delivery Work?
          ========================================================================= */}
      <section className="py-10 lg:py-14 bg-[#F8FAF9] border-t border-b border-gray-150/70" id="how-it-works" aria-label="How HamRahii Works">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-8 lg:mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              How Does <span className="text-[#E10600]">HamRahii</span> Ride Sharing & Parcel Delivery Work?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              HamRahii connects travelers and vehicle owners traveling along the same routes across India. Whether you want to share a car ride, offer vacant seats in your vehicle, or send parcels conveniently, our streamlined process makes your journey simple and transparent.
            </p>
          </div>

          {/* 6 Step Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 1: Finding a Ride */}
            <article className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-150/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-gray-200 group-hover:text-[#E10600]/30 transition-colors">01</span>
                  <div className="w-14 h-14 flex items-center justify-center">
                    <img
                      src="/icons/find-ride.png"
                      alt="Find a Ride"
                      className="w-full h-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                  Find a Ride on Your Route
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Enter your departure city, destination, and travel date. Filter verified carpools by vehicle type, seat availability, departure time, and upfront transparent fares.
                </p>
              </div>
              <Link to="/rides" className="inline-flex items-center text-xs font-bold text-[#E10600] hover:text-red-700 uppercase tracking-wider group-hover:translate-x-1 transition-all">
                Search Available Rides <ArrowRight size={14} className="ml-1" />
              </Link>
            </article>

            {/* Step 2: Offering a Ride */}
            <article className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-150/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-gray-200 group-hover:text-[#E10600]/30 transition-colors">02</span>
                  <div className="w-14 h-14 flex items-center justify-center">
                    <img
                      src="/icons/car.png"
                      alt="Offer a Ride"
                      className="w-full h-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                  Offer a Ride & Split Costs
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Traveling by car? Publish your trip itinerary in minutes. Specify pickup points, available passenger seats, luggage room, and share fuel costs with verified co-travelers.
                </p>
              </div>
              <Link to="/offer-ride" className="inline-flex items-center text-xs font-bold text-[#E10600] hover:text-red-700 uppercase tracking-wider group-hover:translate-x-1 transition-all">
                Publish a Ride <ArrowRight size={14} className="ml-1" />
              </Link>
            </article>

            {/* Step 3: Sending Parcels */}
            <article className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-150/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-gray-200 group-hover:text-[#E10600]/30 transition-colors">03</span>
                  <div className="w-14 h-14 flex items-center justify-center">
                    <img
                      src="/icons/parcel.png"
                      alt="Send Parcels"
                      className="w-full h-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                  Send Parcels Between Cities
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Need urgent courier or package transport? Connect with moving vehicles heading toward your destination for prompt, direct delivery without multi-day postal delays.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeliveryVehiclesModal(true)}
                className="inline-flex items-center text-xs font-bold text-[#E10600] hover:text-red-700 uppercase tracking-wider group-hover:translate-x-1 transition-all cursor-pointer bg-transparent border-0 p-0 text-left"
              >
                Explore Delivery Vehicles <ArrowRight size={14} className="ml-1" />
              </button>
            </article>

            {/* Step 4: Exploring Routes */}
            <article className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-150/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-gray-200 group-hover:text-[#E10600]/30 transition-colors">04</span>
                  <div className="w-14 h-14 flex items-center justify-center">
                    <img
                      src="/icons/map-route.png"
                      alt="Explore Routes"
                      className="w-full h-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                  Explore Routes & Schedules
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Discover popular commuter routes between major hubs like Lucknow, Delhi, Kanpur, Agra, Varanasi, and Hyderabad. Check scheduled stops and recurring departure times.
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                Connecting Top Indian Hubs
              </span>
            </article>

            {/* Step 5: Managing Bookings */}
            <article className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-150/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-gray-200 group-hover:text-[#E10600]/30 transition-colors">05</span>
                  <div className="w-14 h-14 flex items-center justify-center">
                    <img
                      src="/icons/calendar-booking.png"
                      alt="Manage Bookings"
                      className="w-full h-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                  Manage Bookings & Itineraries
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Access your personalized user dashboard anytime to monitor active bookings, verify passenger pickup points, view ride receipts, or make schedule adjustments.
                </p>
              </div>
              <Link to="/my-profile/bookings" className="inline-flex items-center text-xs font-bold text-[#E10600] hover:text-red-700 uppercase tracking-wider group-hover:translate-x-1 transition-all">
                View My Bookings <ArrowRight size={14} className="ml-1" />
              </Link>
            </article>

            {/* Step 6: Notifications & Support */}
            <article className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-150/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-gray-200 group-hover:text-[#E10600]/30 transition-colors">06</span>
                  <div className="w-14 h-14 flex items-center justify-center">
                    <img
                      src="/icons/customer-support.png"
                      alt="Live Notifications & Support"
                      className="w-full h-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                  Live Notifications & Support
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Stay updated with real-time status alerts when rides are confirmed, updated, or departing. Our responsive customer support is readily available for assistance.
                </p>
              </div>
              <Link to="/contact" className="inline-flex items-center text-xs font-bold text-[#E10600] hover:text-red-700 uppercase tracking-wider group-hover:translate-x-1 transition-all">
                Get Support <ArrowRight size={14} className="ml-1" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEO Section 2: Why Should You Choose HamRahii? (SEO Informational)
          ========================================================================= */}
      <section className="py-10 lg:py-14 bg-white" id="why-choose-us" aria-label="Why Choose HamRahii">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-8 lg:mb-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              Why Should You Choose <span className="text-[#E10600]">HamRahii</span>?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              HamRahii combines practical convenience, fair transparent pricing, and smart digital booking tools to transform how India travels and delivers parcels.
            </p>
          </div>

          {/* 6 Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* 1. Convenient Ride Search */}
            <div className="p-7 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-red-100 hover:bg-white hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 flex flex-col group">
              <div className="w-16 h-16 flex items-center justify-start mb-5">
                <img
                  src="/icons/find-ride.png"
                  alt="Convenient Ride Search"
                  className="max-h-full max-w-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                Convenient Ride Search
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Quickly discover rides with our location-aware search engine. Search by city, intermediate stops, date, or vehicle type to find matching travel plans in seconds.
              </p>
            </div>

            {/* 2. Economical Ride Sharing */}
            <div className="p-7 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-red-100 hover:bg-white hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 flex flex-col group">
              <div className="w-16 h-16 flex items-center justify-start mb-5">
                <img
                  src="/icons/money-savings.png"
                  alt="Affordable Ride Sharing"
                  className="max-h-full max-w-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                Affordable Ride Sharing
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Cut commuting and intercity travel costs significantly by sharing fuel expenses. Passengers enjoy comfortable car journeys at budget-friendly, fixed rates.
              </p>
            </div>

            {/* 3. Parcel Delivery Services */}
            <div className="p-7 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-red-100 hover:bg-white hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 flex flex-col group">
              <div className="w-16 h-16 flex items-center justify-start mb-5">
                <img
                  src="/icons/parcel.png"
                  alt="On-Route Parcel Services"
                  className="max-h-full max-w-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                On-Route Parcel Services
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Send documents, cartons, or personal parcels along active travel routes. Utilize available trunk capacity for direct transit without multi-day sorting delays.
              </p>
            </div>

            {/* 4. Booking Management */}
            <div className="p-7 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-red-100 hover:bg-white hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 flex flex-col group">
              <div className="w-16 h-16 flex items-center justify-start mb-5">
                <img
                  src="/icons/verified.png"
                  alt="Streamlined Booking Management"
                  className="max-h-full max-w-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                Streamlined Booking Management
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Keep complete control of your travel plans. Review confirmed passengers, driver credentials, pickup locations, and trip history in your intuitive account dashboard.
              </p>
            </div>

            {/* 5. Mobile-Friendly Access */}
            <div className="p-7 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-red-100 hover:bg-white hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 flex flex-col group">
              <div className="w-16 h-16 flex items-center justify-start mb-5">
                <img
                  src="/icons/smartphone.png"
                  alt="Mobile-Friendly Access"
                  className="max-h-full max-w-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                Mobile-Friendly Access
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Whether using our responsive web platform on a phone or desktop, or our dedicated mobile application, enjoy a fast, smooth booking experience anytime.
              </p>
            </div>

            {/* 6. Relevant Notifications & Support */}
            <div className="p-7 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-red-100 hover:bg-white hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 flex flex-col group">
              <div className="w-16 h-16 flex items-center justify-start mb-5">
                <img
                  src="/icons/customer-support.png"
                  alt="Timely Alerts & Dedicated Support"
                  className="max-h-full max-w-full object-contain group-hover:scale-110 drop-shadow-sm transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E10600] transition-colors">
                Timely Alerts & Dedicated Support
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Receive helpful notifications regarding your bookings, route updates, and trip reminders. Reach out to our dedicated support whenever you need assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          Compact FAQ Section (SEO Structured Q&A)
          ========================================================================= */}
      <section className="py-10 lg:py-12 bg-[#F8FAF9] border-t border-gray-150/70" id="faq" aria-label="Frequently Asked Questions">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Quick answers about ride sharing, offering seats, and sending parcels on HamRahii.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqList.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left px-5 sm:px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-gray-900 hover:text-[#E10600] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg">{item.question}</span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#E10600]" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="pt-2 pb-10 lg:pt-4 lg:pb-12 bg-[#F8FAF9] relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Text & Download Links */}
            <div className="w-full lg:w-1/2">
              <p className="text-sm font-semibold text-gray-500 tracking-wider mb-2 uppercase">MOST DOWNLOADED</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-4">
                Make Your Travel Easy with <br /> Humrahii
              </h2>
              <h3 className="text-4xl lg:text-5xl font-bold text-[#1877F2] mb-8">
                Download App Now
              </h3>

              <form onSubmit={onGetAppLink} className="flex flex-row items-center w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 sm:p-2 mb-8">
                <div className="flex flex-1 items-center bg-transparent min-w-0">
                  <span className="px-2 sm:px-4 text-gray-500 border-r border-gray-200 font-medium text-sm sm:text-base shrink-0">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={appMobileNumber}
                    onChange={(e) => setAppMobileNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 w-full min-w-0 px-2 sm:px-4 py-2 outline-none text-gray-700 bg-transparent text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingAppLink}
                  className="bg-[#1877F2] hover:bg-blue-600 disabled:opacity-60 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-center flex items-center justify-center text-xs sm:text-base shrink-0 cursor-pointer">
                  {sendingAppLink ? "Sending..." : "Get App Link"}
                </button>
              </form>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handlePlayStoreClick}
                  className="block hover:opacity-90 hover:scale-105 transition-all cursor-pointer bg-transparent border-0 p-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-[52px]" />
                </button>
                <button
                  type="button"
                  onClick={handleAppStoreClick}
                  className="block hover:opacity-90 hover:scale-105 transition-all cursor-pointer bg-transparent border-0 p-0">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-[52px]" />
                </button>
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

      {/* Delivery Vehicles Modal (Interactive Showcase for Step 3) */}
      {showDeliveryVehiclesModal && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md overflow-y-auto p-3 sm:p-6 md:p-8 flex items-start sm:items-center justify-center animate-in fade-in duration-200"
          onClick={() => setShowDeliveryVehiclesModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-5xl w-full my-auto shadow-2xl border border-gray-150 relative flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Modal Header */}
            <div className="sticky top-0 z-20 bg-white/98 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-gray-150 flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-[#E10600] border border-red-100 mb-1.5">
                  Parcel & Courier Fleet
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  HamRahii Delivery Vehicles
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Choose the right delivery vehicle according to your package weight, dimensions, and delivery urgency.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeliveryVehiclesModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 hover:text-[#E10600] flex items-center justify-center text-gray-500 transition-colors cursor-pointer shrink-0 ml-4"
                title="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Vehicles Grid */}
            <div className="overflow-y-auto px-6 sm:px-8 py-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Bike / Motorcycle */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200/80 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-32 flex items-center justify-center mb-3 bg-white rounded-xl p-2 border border-gray-100">
                      <img 
                        src="/landing/bike.jpg" 
                        alt="Delivery Bike" 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100 mb-2">
                      Express 2-Wheeler
                    </div>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#E10600] transition-colors">
                      Bike / Motorcycle
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5 mb-2">Max Capacity: Up to 10 KG</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Ideal for urgent documents, envelopes, keys, medicines, food, and small boxes. Fastest rush-hour transit.
                    </p>
                  </div>
                  <Link
                    to="/user/send-parcel"
                    onClick={() => setShowDeliveryVehiclesModal(false)}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-[#E10600] text-white text-xs font-bold text-center transition-colors"
                  >
                    Send with Bike
                  </Link>
                </div>

                {/* 2. E Loader */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200/80 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-32 flex items-center justify-center mb-3 bg-white rounded-xl p-2 border border-gray-100 overflow-hidden">
                      <img 
                        src="/vehicles/e-loader.jpg" 
                        alt="E Loader Cargo" 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 mb-2">
                      Eco Green Electric Loader
                    </div>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#E10600] transition-colors">
                      E Loader
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5 mb-2">Max Capacity: Up to 500 KG</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Zero-emission electric cargo vehicle. Best for city markets, wholesale deliveries, and multiple cartons.
                    </p>
                  </div>
                  <Link
                    to="/user/send-parcel"
                    onClick={() => setShowDeliveryVehiclesModal(false)}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-[#E10600] text-white text-xs font-bold text-center transition-colors"
                  >
                    Send with E Loader
                  </Link>
                </div>

                {/* 3. 3 Wheeler Loader Truck */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200/80 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-32 flex items-center justify-center mb-3 bg-white rounded-xl p-2 border border-gray-100">
                      <img 
                        src="/vehicles/3-wheeler-loader.png" 
                        alt="3 Wheeler Loader Truck" 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 mb-2">
                      Commercial 3-Wheeler Truck
                    </div>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#E10600] transition-colors">
                      3 Wheeler Loader Truck
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5 mb-2">Max Capacity: Up to 750 KG</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Heavy-duty loading tempo for retail stock, hardware materials, machinery parts, and bulk supplies.
                    </p>
                  </div>
                  <Link
                    to="/user/send-parcel"
                    onClick={() => setShowDeliveryVehiclesModal(false)}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-[#E10600] text-white text-xs font-bold text-center transition-colors"
                  >
                    Send with 3 Wheeler
                  </Link>
                </div>

                {/* 4. Tata Ace / Mini Truck */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200/80 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-32 flex items-center justify-center mb-3 bg-white rounded-xl p-2 border border-gray-100">
                      <img 
                        src="/vehicles/tata-ace.png" 
                        alt="Tata Ace Mini Truck" 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
                      Tata Ace (Chota Hathi)
                    </div>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#E10600] transition-colors">
                      Tata Ace Mini Truck
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5 mb-2">Max Capacity: Up to 1000 KG</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Most popular mini truck for house shifting, furniture, large electronics, and intercity commercial freight.
                    </p>
                  </div>
                  <Link
                    to="/user/send-parcel"
                    onClick={() => setShowDeliveryVehiclesModal(false)}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-[#E10600] text-white text-xs font-bold text-center transition-colors"
                  >
                    Send with Tata Ace
                  </Link>
                </div>

                {/* 5. Auto Rickshaw */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200/80 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-32 flex items-center justify-center mb-3 bg-white rounded-xl p-2 border border-gray-100">
                      <img 
                        src="/landing/auto.jpg" 
                        alt="Delivery Auto Rickshaw" 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 mb-2">
                      City Parcel Auto
                    </div>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#E10600] transition-colors">
                      Auto Rickshaw
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5 mb-2">Max Capacity: Up to 50 KG</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Convenient for small cartons, multiple shopping bags, books, and household packages across town.
                    </p>
                  </div>
                  <Link
                    to="/user/send-parcel"
                    onClick={() => setShowDeliveryVehiclesModal(false)}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-[#E10600] text-white text-xs font-bold text-center transition-colors"
                  >
                    Send with Auto
                  </Link>
                </div>

                {/* 6. Heavy Truck */}
                <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 border border-gray-200/80 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="w-full h-32 flex items-center justify-center mb-3 bg-white rounded-xl p-2 border border-gray-100">
                      <img 
                        src="/vehicles/truck.png" 
                        alt="Heavy Cargo Truck" 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
                      Heavy Logistics Truck
                    </div>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#E10600] transition-colors">
                      Full Size Truck
                    </h4>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5 mb-2">Max Capacity: Up to 2000 KG</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Maximum payload capacity for bulk cargo shipments, industrial transport, and outstation logistics.
                    </p>
                  </div>
                  <Link
                    to="/user/send-parcel"
                    onClick={() => setShowDeliveryVehiclesModal(false)}
                    className="mt-4 w-full py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-[#E10600] text-white text-xs font-bold text-center transition-colors"
                  >
                    Send with Truck
                  </Link>
                </div>
              </div>
            </div>

            {/* Sticky Modal Footer Controls */}
            <div className="sticky bottom-0 z-20 px-6 sm:px-8 py-4 border-t border-gray-150 bg-gray-50/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-gray-500 text-center sm:text-left">
                All vehicles verified for safe, punctual parcel transit with live tracking.
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/vehicles"
                  onClick={() => setShowDeliveryVehiclesModal(false)}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-bold text-center transition-colors"
                >
                  All Vehicles Fleet
                </Link>
                <Link
                  to="/user/send-parcel"
                  onClick={() => setShowDeliveryVehiclesModal(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#E10600] hover:bg-red-700 text-white text-xs font-bold text-center shadow-md shadow-red-500/20 transition-all"
                >
                  Send Parcel Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <DownloadPopup />
      <FloatingActionButtons whatsappNumber="918081333082" message="Hi Humrahii, I need some help!" />
    </div>
  );
};

export default Home;
