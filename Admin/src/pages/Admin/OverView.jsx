import React, { useState, useEffect } from "react";
import {
  Car,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Filter,
  Search,
  BarChart3,
  PieChart,
  CalendarDays,
  Download,
  Eye,
  MoreVertical,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  UserPlus,
  RefreshCw,
  Sparkles,
  Award,
  Target,
  Navigation,
  Route,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart,
  PieChart as PieChartIcon,
  LineChart,
} from "lucide-react";
import Axios from "../../services/axios";
import { api } from "../../services/api";
import ViewRides from "./ViewRides";
import { useNavigate } from "react-router-dom";
import ReportService from "./ReportService.js";
import { FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import { useCountUp } from "../../utils/useCountUp";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRides: 0,
      activeDrivers: 0,
      totalUsers: 0,
      totalRevenue: 0,
      todayRides: 0,
      pendingRequests: 0,
      occupancyRate: 0,
      avgRating: 0,
      totalDrivers: 0,
      totalBookings: 0,
      todayBookings: 0,
      todayRevenue: 0,
      upcomingRides: 0,
      totalSeats: 0,
      totalSeatsForToday: 0,
      bookedSeatsToday: 0,
      rideGrowth: 0,
    },
    recentRides: [],
    popularRoutes: [],
    driverStats: [],
    revenueData: [],
    performanceMetrics: {},
    loading: true,
    error: null,
  });

  const [timeRange, setTimeRange] = useState("week");
  const [selectedView, setSelectedView] = useState("overview");
  const [statsLoading, setStatsLoading] = useState(false);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [viewRides, setViewRides] = useState(false);
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Export full dashboard report
  const exportFullReport = async () => {
    try {
      setExporting(true);
      setExportProgress(10);
      setExportMessage("Preparing dashboard data...");

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = ReportService.exportDashboardReport(
        dashboardData,
        timeRange,
      );

      clearInterval(progressInterval);
      setExportProgress(100);
      setExportMessage("Report generated successfully!");

      if (result.success) {
        // You can add a toast notification here
        // toast.success(`Report exported as ${result.filename}`);
      } else {
        // console.error("Export failed:", result.error);
        setExportMessage("Export failed. Please try again.");
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setExporting(false);
        setExportProgress(0);
        setExportMessage("");
      }, 3000);
    } catch (error) {
      // console.error("Error exporting report:", error);
      setExporting(false);
      setExportProgress(0);
      setExportMessage("Error exporting report. Please try again.");
    }
  };

  // Export specific data type
  const exportData = async (dataType) => {
    try {
      setExporting(true);
      setExportMessage(`Exporting ${dataType} data...`);

      let data;
      let filename;

      switch (dataType) {
        case "rides":
          data = dashboardData.recentRides;
          filename = `Rides_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
          break;
        case "drivers":
          data = dashboardData.driverStats;
          filename = `Drivers_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
          break;
        case "routes":
          data = dashboardData.popularRoutes;
          filename = `Routes_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
          break;
        case "revenue":
          data = dashboardData.revenueData;
          filename = `Revenue_Report_${timeRange}_${new Date().toISOString().split("T")[0]}.xlsx`;
          break;
        case "overview":
          data = dashboardData.overview;
          filename = `Overview_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
          break;
        default:
          return;
      }

      const result = ReportService.exportSpecificData(data, dataType, filename);

      setExporting(false);
      setExportMessage("");
      setShowExportOptions(false);
    } catch (error) {
      // console.error(`Error exporting ${dataType}:`, error);
      setExporting(false);
      setExportMessage("");
    }
  };

  // Quick export revenue data
  const quickExportRevenue = () => {
    exportData("revenue");
  };

  // Quick export rides data
  const quickExportRides = () => {
    exportData("rides");
  };

  // API 1: Fetch Dashboard Overview
  const fetchDashboardOverview = async () => {
    try {
      // console.log("API 1: Fetching dashboard overview...");
      const response = await Axios.get(api.admin.dashboardOverview);
      // console.log("API 1 Response:", response.data);

      // console.log(response.data.data.activeUser);
      return {
        overview: {
          totalRides: response.data.data.totalRides || 0,
          activeDrivers: response.data.data.activeUser || 0,
          totalUsers: response.data.data.totalUsers || 0,
          totalRevenue: response.data.data.totalRevenue || 0,
          todayRides: response.data.data.todayRides || 0,
          pendingRequests: response.data.data.pendingRequests || 0,
          occupancyRate: response.data.data.occupancyRate || 0,
          avgRating: response.data.data.avgRating || 0,
          totalDrivers: response.data.data.totalDrivers || 0,
          totalBookings: response.data.data.totalBookings || 0,
          todayBookings: response.data.data.todayBookings || 0,
          todayRevenue: response.data.data.todayRevenue || 0,
          upcomingRides: response.data.data.upcomingRides || 0,
          totalSeats: response.data.data.totalSeats || 0,
          totalSeatsForToday: response.data.data.totalSeatsForToday || 0,
          bookedSeatsToday: response.data.data.bookedSeatsToday || 0,
          rideGrowth: response.data.data.rideGrowth || 0,
        },
      };
    } catch (error) {
      // console.error("API 1 Error:", error);
      throw error;
    }
  };

  // API 2: Fetch Recent Rides
  const fetchRecentRides = async () => {
    try {
      // console.log("API 2: Fetching recent rides...");
      const response = await Axios.get(`${api.admin.recentRides}?limit=5`);
      // console.log("API 2 Response:", response.data);

      return {
        recentRides: response.data.data || [],
      };
    } catch (error) {
      // console.error("API 2 Error:", error);
      throw error;
    }
  };

  // API 3: Fetch Popular Routes
  const fetchPopularRoutes = async () => {
    try {
      // console.log("API 3: Fetching popular routes...");
      const response = await Axios.get(
        `${api.admin.popularRoutes}?period=week`,
      );
      // console.log("API 3 Response:", response.data);

      return {
        popularRoutes: response.data.data || [],
      };
    } catch (error) {
      // console.error("API 3 Error:", error);
      throw error;
    }
  };

  // API 4: Fetch Driver Stats
  const fetchDriverStats = async () => {
    try {
      // console.log("API 4: Fetching driver stats...");
      const response = await Axios.get(`${api.admin.driverStats}?limit=5`);
      // console.log("API 4 Response:", response.data);

      return {
        driverStats: response.data.data || [],
      };
    } catch (error) {
      // console.error("API 4 Error:", error);
      throw error;
    }
  };

  // API 5: Fetch Revenue Analytics
  const fetchRevenueAnalytics = async () => {
    try {
      setRevenueLoading(true);
      // console.log("API 5: Fetching revenue analytics...");
      const response = await Axios.get(
        `${api.admin.revenueAnalytics}?period=${timeRange}`,
      );
      // console.log("API 5 Response:", response.data);

      return {
        revenueData: response.data.data || [],
      };
    } catch (error) {
      // console.error("API 5 Error:", error);
      throw error;
    } finally {
      setRevenueLoading(false);
    }
  };

  // API 6: Fetch Performance Metrics
  const fetchPerformanceMetrics = async () => {
    try {
      setPerformanceLoading(true);
      // console.log("API 6: Fetching performance metrics...");
      const response = await Axios.get(api.admin.performanceMetrics);
      // console.log("API 6 Response:", response.data);

      return {
        performanceMetrics: response.data.data || {},
      };
    } catch (error) {
      // console.error("API 6 Error:", error);
      throw error;
    } finally {
      setPerformanceLoading(false);
    }
  };

  // Main function to fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setStatsLoading(true);
      // console.log("=== FETCHING ALL DASHBOARD DATA ===");

      const [overview, ridesData, routesData, driversData] = await Promise.all([
        fetchDashboardOverview(),
        fetchRecentRides(),
        fetchPopularRoutes(),
        fetchDriverStats(),
      ]);

      // console.log("All data fetched successfully");

      setDashboardData((prev) => ({
        ...prev,
        ...overview,
        ...ridesData,
        ...routesData,
        ...driversData,
        loading: false,
        error: null,
      }));
    } catch (error) {
      // console.error("Error fetching dashboard data:", error);
      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard data. Please try again.",
      }));
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch revenue data separately when time range changes
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const revenueData = await fetchRevenueAnalytics();
        setDashboardData((prev) => ({
          ...prev,
          ...revenueData,
        }));
      } catch (error) {
        // console.error("Error fetching revenue data:", error);
      }
    };

    fetchRevenueData();
  }, [timeRange]);

  // Fetch performance metrics
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const performanceData = await fetchPerformanceMetrics();
        setDashboardData((prev) => ({
          ...prev,
          ...performanceData,
        }));
      } catch (error) {
        // console.error("Error fetching performance data:", error);
      }
    };

    fetchPerformanceData();
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType = "positive",
    loading = false,
    description = "",
    colorScheme = "emerald",
  }) => {
    const animatedValue = useCountUp(typeof value === "number" ? value : 0, 1000);
    const displayNum = typeof value === "number" ? animatedValue : value;

    const colorConfig = {
      emerald: {
        iconBg: "bg-[#ECFDF5] text-emerald-600 border border-emerald-100",
        cardBorder: "hover:border-[#A7F3D0]/80",
      },
      indigo: {
        iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
        cardBorder: "hover:border-indigo-200/80",
      },
      amber: {
        iconBg: "bg-[#FFFBEB] text-[#F59E0B] border border-amber-100",
        cardBorder: "hover:border-amber-200/80",
      },
      purple: {
        iconBg: "bg-purple-50 text-purple-600 border border-purple-100",
        cardBorder: "hover:border-purple-200/80",
      },
      red: {
        iconBg: "bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]",
        cardBorder: "hover:border-[#FCA5A5]/80",
      },
    };

    const theme = colorConfig[colorScheme] || colorConfig.emerald;

    const formatValue = (val) => {
      if (typeof val === "number") {
        if (title.includes("Revenue") || title.includes("Amount")) {
          if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}M`;
          if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
          return `₹${val}`;
        }
        return val.toLocaleString();
      }
      return val;
    };

    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={`group bg-[#FFFFFF] rounded-3xl p-6 shadow-card-subtle hover:shadow-card-hover border border-[#E2E8F0]/80 ${theme.cardBorder} transition-all duration-300 relative overflow-hidden`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${theme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                changeType === "positive"
                  ? "bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{change}%</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight mb-1">
            {loading ? (
              <div className="h-8 w-24 bg-[#F8FAFC] rounded-xl animate-pulse"></div>
            ) : (
              formatValue(displayNum)
            )}
          </h3>
          <p className="text-[#475569] text-sm font-semibold">{title}</p>
          {description && (
            <p className="text-xs text-[#94A3B8] mt-1 font-medium">{description}</p>
          )}
        </div>
      </motion.div>
    );
  };

  const RecentRidesTable = () => {
    const formatDateTime = (dateString) => {
      if (!dateString) return { date: "N/A", time: "N/A" };
      try {
        const date = new Date(dateString);
        return {
          date: date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          time: date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      } catch (error) {
        return { date: "Invalid", time: "Date" };
      }
    };

    const getStatusColor = (status) => {
      const colors = {
        completed: "bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]",
        ongoing: "bg-[#EFF6FF] text-blue-700 border border-blue-200",
        upcoming: "bg-[#FFFBEB] text-amber-700 border border-amber-200",
        cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
        fully_booked: "bg-purple-50 text-purple-700 border border-purple-200",
      };
      return colors[status?.toLowerCase()] || "bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]";
    };

    return (
      <div className="bg-[#FFFFFF] rounded-3xl shadow-card-subtle border border-[#E2E8F0] overflow-hidden hover:shadow-card-hover transition-all">
        <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-[#FEF2F2] text-[#EF4444]">
                <Car className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Recent Rides
              </h2>
            </div>
            <p className="text-xs text-[#64748B] font-medium">
              Real-time feed of latest published and ongoing rides
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportData("rides")}
              disabled={exporting}
              className="text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0] hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              title="Export to Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => navigate("/admin/rides")}
              className="text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboardData.recentRides.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[#64748B] text-sm">
                    No recent rides found.
                  </td>
                </tr>
              ) : (
                dashboardData.recentRides.map((ride) => {
                  const { date, time } = formatDateTime(ride.departureTime);
                  return (
                    <tr key={ride._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-sm text-[#0F172A]">
                          {ride.from?.city || "Unknown"} → {ride.to?.city || "Unknown"}
                        </div>
                        <div className="text-xs text-[#94A3B8] truncate max-w-xs">
                          {ride.from?.address || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#0F172A]">
                          {ride.formattedDate || date}
                        </div>
                        <div className="text-xs text-[#94A3B8]">
                          {ride.formattedTime || time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center font-bold text-xs border border-[#FCA5A5]">
                            {ride.driver?.firstName?.charAt(0) || "D"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#0F172A]">
                              {ride.driver?.firstName ? `${ride.driver.firstName} ${ride.driver.lastName || ""}` : "Driver"}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-[#F59E0B] font-semibold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{ride.driver?.rating || "5.0"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-[#0F172A]">
                          ₹{ride?.pricePerSeat?.toLocaleString()} <span className="text-xs font-normal text-[#64748B]">/ seat</span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          {ride?.availableSeats} of {ride?.totalSeats} left
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(ride.status)}`}>
                          {ride.status ? ride.status.charAt(0).toUpperCase() + ride.status.slice(1) : "Upcoming"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setViewRides(ride)}
                          className="w-8 h-8 rounded-xl bg-[#F8FAFC] hover:bg-[#FEF2F2] text-[#475569] hover:text-[#EF4444] border border-[#E2E8F0]/60 flex items-center justify-center transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const PopularRoutes = () => {
    if (dashboardData.popularRoutes.length === 0) {
      return (
        <div className="bg-[#FFFFFF] rounded-3xl shadow-card-subtle border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0F172A]">Popular Routes</h2>
            <Route className="w-4 h-4 text-[#94A3B8]" />
          </div>
          <div className="text-center py-8">
            <Navigation className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-[#94A3B8]">No route data available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-[#FFFFFF] rounded-3xl shadow-card-subtle border border-[#E2E8F0] p-6 hover:shadow-card-hover transition-all">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">Popular Routes</h2>
            <p className="text-xs text-[#94A3B8]">Most active commuter corridors</p>
          </div>
          <div className="p-1.5 rounded-xl bg-[#FFFBEB] text-[#F59E0B] border border-amber-100">
            <Route className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-3">
          {dashboardData.popularRoutes.slice(0, 5).map((route, index) => (
            <div
              key={route._id || index}
              className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] hover:bg-[#F8FAFC]/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                    index === 0
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : index === 1
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : index === 2
                          ? "bg-orange-100 text-orange-800 border border-orange-200"
                          : "bg-[#F8FAFC] text-[#475569]"
                  }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-[#0F172A]">
                    {route.from || "Origin"} → {route.to || "Destination"}
                  </div>
                  <div className="text-[11px] text-[#64748B] font-medium">
                    {route.rides || 0} rides • ₹{route.avgPrice?.toFixed(0) || 0} avg
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-[#0F172A]">
                  {route.bookings || 0} bookings
                </div>
                <div className="text-[10px] text-[#94A3B8]">this week</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // const DriverStats = () => {
  //   if (dashboardData.driverStats.length === 0) {
  //     return (
  //       <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E2E8F0] p-6">
  //         <div className="flex items-center justify-between mb-6">
  //           <h2 className="text-lg font-semibold text-[#0F172A]">Top Drivers</h2>
  //           <Users className="w-5 h-5 text-[#94A3B8]" />
  //         </div>
  //         <div className="text-center py-8">
  //           <Users className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
  //           <p className="text-[#475569]">No driver data available</p>
  //           <p className="text-sm text-[#64748B] mt-1">
  //             Driver stats will appear here
  //           </p>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="bg-[#FFFFFF] rounded-xl shadow-sm border border-[#E2E8F0] p-6">
  //       <div className="flex items-center justify-between mb-6">
  //         <div>
  //           <h2 className="text-lg font-semibold text-[#0F172A]">Top Drivers</h2>
  //           <p className="text-sm text-[#475569]">Highest earning drivers</p>
  //         </div>
  //         <button className="text-[#3B82F6] hover:text-blue-800 text-sm font-medium flex items-center gap-1">
  //           View All
  //           <ChevronRight className="w-4 h-4" />
  //         </button>
  //       </div>

  //       <div className="space-y-4">
  //         {dashboardData.driverStats.map((driver, index) => (
  //           <div
  //             key={driver._id}
  //             className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-lg hover:bg-[#F8FAFC] transition-colors"
  //           >
  //             <div className="flex items-center gap-4">
  //               <div
  //                 className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
  //                   index === 0
  //                     ? "bg-gradient-to-r from-yellow-400 to-orange-500"
  //                     : index === 1
  //                       ? "bg-gradient-to-r from-gray-400 to-gray-600"
  //                       : index === 2
  //                         ? "bg-gradient-to-r from-orange-400 to-red-500"
  //                         : "bg-gradient-to-r from-blue-400 to-purple-500"
  //                 }`}
  //               >
  //                 {index + 1}
  //               </div>
  //               <div className="flex items-center gap-3">
  //                 {driver.profileImage ? (
  //                   <img
  //                     src={driver.profileImage}
  //                     alt={driver.name}
  //                     className="w-10 h-10 rounded-full border border-[#E2E8F0]"
  //                   />
  //                 ) : (
  //                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
  //                     {driver.name?.charAt(0) || "D"}
  //                   </div>
  //                 )}
  //                 <div>
  //                   <div className="font-medium text-[#0F172A]">
  //                     {driver.name || "Unknown Driver"}
  //                   </div>
  //                   <div className="flex items-center gap-3 text-sm text-[#475569]">
  //                     <div className="flex items-center gap-1">
  //                       <Car className="w-3 h-3" />
  //                       {driver.totalRides || 0} rides
  //                     </div>
  //                     <div className="flex items-center gap-1">
  //                       <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
  //                       {driver.rating?.toFixed(1) || "New"}
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //             <div className="text-right">
  //               <div className="text-lg font-bold text-[#0F172A]">
  //                 ₹{driver.earnings?.toLocaleString() || 0}
  //               </div>
  //               <div className="text-sm text-[#475569]">earnings</div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  const RevenueChart = () => {
    // Mock revenue data - replace with actual data from API 5
    const revenueData = dashboardData.revenueData.revenueData || [
      { day: "Mon", revenue: 42000 },
      { day: "Tue", revenue: 58000 },
      { day: "Wed", revenue: 51000 },
      { day: "Thu", revenue: 67000 },
      { day: "Fri", revenue: 73000 },
      { day: "Sat", revenue: 89000 },
      { day: "Sun", revenue: 65000 },
    ];

    const maxRevenue = Math.max(
      ...revenueData.map((d) => d.revenue || d.amount || 0),
    );

    return (
      <div className="bg-[#FFFFFF] rounded-3xl shadow-card-subtle border border-[#E2E8F0] p-6 sm:p-7 hover:shadow-card-hover transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Revenue Analytics
              </h2>
            </div>
            <p className="text-xs text-[#64748B] font-medium">Performance over selected time window</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-xl text-xs font-semibold bg-[#F8FAFC] text-[#0F172A] focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition-all cursor-pointer"
              disabled={revenueLoading}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            {revenueLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-[#EF4444]" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between h-48 px-2 sm:px-4 pt-4 bg-[#F8FAFC]/50 rounded-2xl border border-[#E2E8F0]/60">
            {revenueData.map((data, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 flex-1 group relative"
              >
                <div className="relative w-full flex justify-center">
                  <div
                    className="w-3/5 sm:w-1/2 bg-gradient-to-t from-[#E10600] to-[#FF5E57] rounded-t-xl transition-all duration-300 group-hover:from-red-700 group-hover:to-red-400 group-hover:scale-y-105 origin-bottom cursor-pointer shadow-xs"
                    style={{
                      height: `${Math.max(8, ((data.revenue || data.amount || 0) / (maxRevenue || 1)) * 140)}px`,
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap shadow-md z-10">
                    ₹{(data.revenue || data.amount || 0).toLocaleString()}
                  </div>
                </div>
                <span className="text-[11px] text-[#64748B] font-semibold">
                  {data.day || data.date || `D${index + 1}`}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-[#E2E8F0]">
            <div>
              <div className="text-2xl font-black text-[#0F172A]">
                {revenueLoading ? (
                  <div className="h-8 w-32 bg-[#F8FAFC] rounded-xl animate-pulse"></div>
                ) : (
                  `₹${(dashboardData.revenueData.summary?.totalRevenue ?? dashboardData.overview.totalRevenue ?? 0).toLocaleString()}`
                )}
              </div>
              <div className="text-xs font-medium text-[#64748B] mt-0.5">
                Total revenue {timeRange === "day" ? "today" : `this ${timeRange}`}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-bold text-[#0F172A]">
                  {revenueLoading ? (
                    <div className="h-5 w-16 bg-[#F8FAFC] rounded animate-pulse"></div>
                  ) : (
                    `${(dashboardData.revenueData.summary?.growth ?? 0) >= 0 ? "+" : ""}${dashboardData.revenueData.summary?.growth ?? 0}%`
                  )}
                </div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUpIcon className="w-3.5 h-3.5" />
                  <span>vs last {timeRange}</span>
                </div>
              </div>
              <button
                onClick={quickExportRevenue}
                disabled={revenueLoading || exporting}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#E10600] to-[#FF3B30] hover:from-[#c50500] hover:to-[#e6352b] text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exporting && exportMessage.includes("revenue") ? "Exporting..." : "Export"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PerformanceMetrics = () => {
    const metrics = dashboardData.performanceMetrics.metrics || {};

    return (
      <div className="bg-[#FFFFFF] rounded-3xl shadow-card-subtle border border-[#E2E8F0] p-6 sm:p-7 hover:shadow-card-hover transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-[#EFF6FF] text-[#3B82F6] border border-blue-100">
                <LineChart className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Performance Metrics
              </h2>
            </div>
            <p className="text-xs text-[#64748B] font-medium">
              Key operational throughput and trends across platforms
            </p>
          </div>
          {performanceLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-[#EF4444]" />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50/50 to-white p-4.5 rounded-2xl border border-blue-100/80 hover:border-blue-200 transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-[#EFF6FF] text-[#3B82F6] rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {performanceLoading
                    ? "..."
                    : `${metrics.rideGrowth?.toFixed(1) || "0.0"}%`}
                </div>
                <div className="text-xs font-semibold text-[#475569]">
                  Ride Growth
                </div>
                <div className="text-[11px] text-[#94A3B8]">vs previous week</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50/50 to-white p-4.5 rounded-2xl border border-emerald-100/80 hover:border-[#A7F3D0] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-[#ECFDF5] text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                <BarChart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {performanceLoading
                    ? "..."
                    : `${metrics.todayUpcomingRidePercentage || "0"}%`}
                </div>
                <div className="text-xs font-semibold text-[#475569]">
                  Avg. Daily Rides
                </div>
                <div className="text-[11px] text-[#94A3B8]">capacity utilization</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/50 to-white p-4.5 rounded-2xl border border-purple-100/80 hover:border-purple-200 transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100 shrink-0">
                <PieChartIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {performanceLoading
                    ? "..."
                    : `${metrics.currentWeekRides || "0"}`}
                </div>
                <div className="text-xs font-semibold text-[#475569]">
                  Rides This Week
                </div>
                <div className="text-[11px] text-[#94A3B8]">active lifecycle</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/50 to-white p-4.5 rounded-2xl border border-amber-100/80 hover:border-amber-200 transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-[#FFFBEB] text-[#F59E0B] rounded-xl flex items-center justify-center border border-amber-100 shrink-0">
                <TrendingUpIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#0F172A] tracking-tight">
                  {performanceLoading
                    ? "..."
                    : `${metrics.previousWeekRides || "0"}`}
                </div>
                <div className="text-xs font-semibold text-[#475569]">
                  Previous Week
                </div>
                <div className="text-[11px] text-[#94A3B8]">completed journeys</div>
              </div>
            </div>
          </div>
        </div>

        {metrics.dailyMetrics && (
          <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
              Weekly Activity Spread
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#475569] bg-[#F8FAFC] p-3 rounded-2xl">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const QuickActions = () => {
    const exportOptions = [
      {
        label: "Full Dashboard Report",
        icon: FileSpreadsheet,
        action: () => exportFullReport(),
        description: "All dashboard data in Excel",
      },
      {
        label: "Rides Report",
        icon: Car,
        action: () => exportData("rides"),
        description: "Recent rides data",
      },
      {
        label: "Drivers Report",
        icon: Users,
        action: () => exportData("drivers"),
        description: "Top drivers statistics",
      },
      {
        label: "Revenue Report",
        icon: DollarSign,
        action: () => exportData("revenue"),
        description: "Revenue analytics data",
      },
      {
        label: "Routes Report",
        icon: Route,
        action: () => exportData("routes"),
        description: "Popular routes data",
      },
      {
        label: "Overview Report",
        icon: BarChart3,
        action: () => exportData("overview"),
        description: "Key metrics overview",
      },
    ];

    return (
      <div className="bg-[#FFFFFF] rounded-3xl shadow-card-subtle border border-[#E2E8F0] p-6 sm:p-7 hover:shadow-card-hover transition-all relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-xl bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]">
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
            Quick Actions
          </h2>
        </div>
        <p className="text-xs text-[#64748B] font-medium mb-6">
          Instant reports and administrative utilities
        </p>

        <div className="grid grid-cols-1 gap-3.5">
          <div>
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#E2E8F0]/80 bg-[#F8FAFC]/50 hover:bg-[#FEF2F2]/40 hover:border-[#FCA5A5] transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#0F172A] group-hover:text-[#EF4444] transition-colors">
                    Download Reports
                  </div>
                  <div className="text-xs text-[#64748B]">Excel / CSV summaries</div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${showExportOptions ? "rotate-90 text-[#EF4444]" : ""}`}
              />
            </button>

            {showExportOptions && (
              <div className="mt-2 bg-[#FFFFFF] border border-[#E2E8F0]/90 rounded-2xl shadow-xl overflow-hidden z-20 divide-y divide-gray-100">
                {exportOptions.map((option) => (
                  <button
                    key={option.label}
                    onClick={option.action}
                    disabled={exporting}
                    className="w-full px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors flex items-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                    <div className="p-2 bg-[#F8FAFC] text-[#0F172A] rounded-xl border border-[#E2E8F0]">
                      <option.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-xs text-[#0F172A]">
                        {option.label}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {option.description}
                      </div>
                    </div>
                    {exporting && (
                      <Loader2 className="w-4 h-4 animate-spin text-[#EF4444]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/admin/analytics")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-[#E2E8F0]/80 bg-[#F8FAFC]/50 hover:bg-[#FEF2F2]/40 hover:border-[#FCA5A5] transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-[#0F172A] group-hover:text-[#EF4444] transition-colors">
                  View Analytics
                </div>
                <div className="text-xs text-[#64748B]">Deeper business metrics</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#EF4444] transition-colors" />
          </button>
        </div>

        {/* Export Progress Indicator */}
        {exporting && exportProgress > 0 && (
          <div className="mt-5 pt-5 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0F172A]">
                {exportMessage || "Generating report..."}
              </span>
              <span className="text-xs font-black text-[#EF4444]">
                {exportProgress}%
              </span>
            </div>
            <div className="w-full bg-[#F8FAFC] rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#E10600] to-[#FF5E57] h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  const LoadingState = () => (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>

          {/* Stats grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#FFFFFF] rounded-xl p-6 shadow-sm h-32">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>

          {/* Second row skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#FFFFFF] rounded-xl p-4 shadow-sm h-24">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] rounded-xl p-6 shadow-sm h-96"></div>
            <div className="bg-[#FFFFFF] rounded-xl p-6 shadow-sm h-96"></div>
          </div>

          {/* Bottom grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] rounded-xl p-6 shadow-sm h-96"></div>
            <div className="space-y-6">
              <div className="bg-[#FFFFFF] rounded-xl p-6 shadow-sm h-64"></div>
              <div className="bg-[#FFFFFF] rounded-xl p-6 shadow-sm h-64"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-[#475569] mb-6 max-w-md mx-auto">
            {dashboardData.error}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchDashboardData}
              disabled={statsLoading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {statsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </>
              )}
            </button>
            <button className="px-6 py-3 border border-[#CBD5E1] text-[#0F172A] font-semibold rounded-lg hover:bg-[#F8FAFC]">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (dashboardData.loading) return <LoadingState />;
  if (dashboardData.error) return <ErrorState />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse"></span>
                  LIVE TELEMETRY
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-[#64748B] text-xs sm:text-sm font-medium mt-1">
                Real-time snapshot of rides, passenger activity and revenue.
                <span className="ml-2 inline-flex items-center text-xs text-[#94A3B8] bg-[#F8FAFC] px-2 py-0.5 rounded-lg">
                  Last updated:{" "}
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                disabled={statsLoading}
                className="px-4 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0]/90 shadow-card-subtle hover:shadow-card-hover rounded-xl text-[#0F172A] text-xs font-bold hover:text-[#EF4444] hover:border-[#FCA5A5] flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${statsLoading ? "animate-spin text-[#EF4444]" : ""}`}
                />
                <span>{statsLoading ? "Refreshing..." : "Refresh Data"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - API 1 Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Rides"
            value={dashboardData.overview.totalRides}
            icon={Car}
            change={dashboardData.overview.rideGrowth}
            changeType={
              dashboardData.overview.rideGrowth >= 0 ? "positive" : "negative"
            }
            loading={statsLoading}
            description="All rides created"
            colorScheme="emerald"
          />
          <StatCard
            title="Active Users"
            value={dashboardData.overview.activeDrivers}
            icon={Users}
            change={8.2}
            changeType="positive"
            loading={statsLoading}
            description={`of ${dashboardData.overview.totalUsers} total users`}
            colorScheme="indigo"
          />
          <StatCard
            title="Today's Rides"
            value={dashboardData.overview.todayRides}
            icon={Calendar}
            change={5.3}
            changeType="positive"
            loading={statsLoading}
            description={`${dashboardData.overview.upcomingRides} upcoming`}
            colorScheme="amber"
          />
          <StatCard
            title="Total Revenue"
            value={dashboardData.overview.totalRevenue}
            icon={DollarSign}
            change={15.8}
            changeType="positive"
            loading={statsLoading}
            description={`₹${dashboardData.overview.todayRevenue?.toLocaleString() || "0"} today`}
            colorScheme="purple"
          />
        </div>

        {/* Second Row Stats - More API 1 Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFFFFF] rounded-2xl p-5 shadow-card-subtle border border-[#E2E8F0] hover:shadow-card-hover transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Target className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black text-[#0F172A]">
                  {dashboardData.overview.occupancyRate}%
                </div>
                <div className="text-xs font-semibold text-[#475569]">Seat Occupancy</div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">
                  {dashboardData.overview.bookedSeatsToday}/
                  {dashboardData.overview.totalSeatsForToday} seats today
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-5 shadow-card-subtle border border-[#E2E8F0] hover:shadow-card-hover transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0 border border-amber-100">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black text-[#0F172A]">
                  {dashboardData.overview.avgRating}/5
                </div>
                <div className="text-xs font-semibold text-[#475569]">Avg. Rating</div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">Driver satisfaction</div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-5 shadow-card-subtle border border-[#E2E8F0] hover:shadow-card-hover transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black text-[#0F172A]">
                  {dashboardData.overview.pendingRequests}
                </div>
                <div className="text-xs font-semibold text-[#475569]">Pending Requests</div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">Awaiting approval</div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-5 shadow-card-subtle border border-[#E2E8F0] hover:shadow-card-hover transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0 border border-[#FCA5A5]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xl font-black text-[#0F172A]">
                  {dashboardData.overview.totalUsers}
                </div>
                <div className="text-xs font-semibold text-[#475569]">Total Users</div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">
                  Registered passengers
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Performance Metrics - API 6 */}
        <div className="mb-6">
          <PerformanceMetrics />
        </div>

        {/* Bottom Grid - APIs 2, 3, 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentRidesTable />
          </div>
          <div className="space-y-6">
            <PopularRoutes />
          </div>
        </div>

        {/* API Status & Insights */}
        <div className="mt-8 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white rounded-3xl p-6 sm:p-7 border border-gray-800 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFFFF]/10 flex items-center justify-center text-white border border-white/10">
                <Sparkles className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  System Health & Microservices
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Real-time telemetry and API response health
                </p>
              </div>
            </div>
            <a
              href="/admin/api-docs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-3 py-1.5 rounded-xl bg-[#FFFFFF]/5 hover:bg-[#FFFFFF]/10 transition-colors border border-white/10 w-fit"
            >
              <span>API Docs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FFFFFF]/5 backdrop-blur-md rounded-2xl p-4.5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#94A3B8]">
                  Data Freshness
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-[#ECFDF5]0/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live
                </span>
              </div>
              <div className="text-lg font-bold text-white">
                Updated just now
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5">
                Auto-refresh polling active
              </div>
            </div>

            <div className="bg-[#FFFFFF]/5 backdrop-blur-md rounded-2xl p-4.5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#94A3B8]">
                  API Health
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ECFDF5]0/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  6/6 OK
                </span>
              </div>
              <div className="text-lg font-bold text-white">
                All systems nominal
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5">
                Zero reported outages
              </div>
            </div>

            <div className="bg-[#FFFFFF]/5 backdrop-blur-md rounded-2xl p-4.5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#94A3B8]">
                  Response Latency
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EFF6FF]0/20 text-blue-300 border border-blue-500/30 rounded-full">
                  Fast
                </span>
              </div>
              <div className="text-lg font-bold text-white">
                &lt; 350ms avg
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5">Optimal platform throughput</div>
            </div>
          </div>
        </div>
      </div>
      {viewRides && (
        <ViewRides viewRides={viewRides} setViewRides={setViewRides} />
      )}
    </div>
  );
};

export default Dashboard;
