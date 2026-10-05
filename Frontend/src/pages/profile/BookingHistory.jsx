import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Car,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock4,
  Filter,
  Download,
  Search,
  ChevronDown,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MessageCircle
} from "lucide-react";
import { toast } from "react-toastify";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import ShowBookingDetails from "../ShowBookingDetails";
import * as XLSX from "xlsx";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, scheduled, completed, cancelled
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10
  });
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [allBookingsLoaded, setAllBookingsLoaded] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // For API calls

  // Map UI filter to API status parameter
  const getApiStatusFilter = (uiFilter) => {
    switch (uiFilter) {
      case "scheduled": return "scheduled";
      case "completed": return "completed";
      case "cancelled": return "cancelled";
      case "ongoing": return "ongoing";
      default: return ""; // "all" returns empty string
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter, pagination.currentPage, pagination.limit]);

  // Fetch bookings with pagination
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId") || "696e1d66de3cf9b1654ce165";
      
      // Build query parameters
      const params = {
        userId,
        page: pagination.currentPage,
        limit: pagination.limit,
      };
      
      // Add status filter if not "all"
      const apiStatusFilter = getApiStatusFilter(filter);
      if (apiStatusFilter) {
        params.status = apiStatusFilter;
      }
      
      // Add search query if present
      if (searchQuery.trim() !== "") {
        params.search = searchQuery;
      }
      
 
      
      const res = await Axios.get(api.user.getRidesBookingHistory, { params });
      

      
      if (res?.data?.success) {
        // Handle different response formats
        let bookingsData = [];
        
        if (Array.isArray(res.data.data)) {
          bookingsData = res.data.data;
        } else if (res.data.data?.bookings) {
          bookingsData = res.data.data.bookings;
        } else if (res.data.data) {
          bookingsData = res.data.data;
        } else {
          bookingsData = res.data.bookings || [];
        }
        
      
        
        setBookings(bookingsData);
        
        // Set pagination data
        if (res.data.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: res.data.pagination.totalPages || 1,
            totalRecords: res.data.pagination.totalRecords || bookingsData.length
          }));
        } else if (res.data.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: res.data.data.pagination.totalPages || 1,
            totalRecords: res.data.data.pagination.totalRecords || bookingsData.length
          }));
        } else {
          // Fallback calculation
          setPagination(prev => ({
            ...prev,
            totalRecords: res.data.totalRecords || bookingsData.length,
            totalPages: Math.ceil((res.data.totalRecords || bookingsData.length) / pagination.limit) || 1
          }));
        }
      } else {
        // Handle unsuccessful response
        setBookings([]);
        setPagination(prev => ({
          ...prev,
          totalPages: 1,
          totalRecords: 0
        }));
      }
    } catch (error) {

      toast.error("Failed to fetch bookings");
      setBookings([]);
      setPagination(prev => ({
        ...prev,
        totalPages: 1,
        totalRecords: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  // Process booking data from API response
  const processBookingData = (ride) => {
    console.log(ride , "these are rides")
    try {
      // Find the passenger info for current user
      const userId = localStorage.getItem("userId") || "696e1d66de3cf9b1654ce165";
      const passengerInfo = ride.passengers?.find(p => 
        p.user?._id === userId || 
        p.user?.toString() === userId ||
        p.user === userId
      );

      // Calculate total amount
      const passengerCount = passengerInfo ? 1 : 0;
      const totalAmount = ride.pricePerSeat ? ride.pricePerSeat * passengerCount : 0;

      // Get ride status - prioritize passenger status if available
      let status = ride.status || "unknown";
      if (passengerInfo?.status) {
        status = passengerInfo.status;
      }

      // Format date and time
      let date = "";
      let time = "";
      if (ride.departureTime) {
        const departureDate = new Date(ride.departureTime);
        date = departureDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        time = departureDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (ride.departureDate) {
        date = new Date(ride.departureDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }

      return {
        _id: ride._id,
        rideId: ride._id,
        from: ride.from?.address || ride.fromLocation?.address || ride.from?.city || "Not specified",
        to: ride.to?.address || ride.toLocation?.address || ride.to?.city || "Not specified",
        fromCity: ride.from?.city || ride.from?.address?.split(',')[0] || "",
        toCity: ride.to?.city || ride.to?.address?.split(',')[0] || "",
        date: ride.departureDate,
        time: time,
        departureDateTime: ride.departureTime,
        status: status,
        amount: passengerInfo?.fare || totalAmount,
        pricePerSeat: ride.pricePerSeat,
        passanger: ride?.passengers || [],
        passengers: ride.availableSeats || ride.totalSeats || 1,
        carName: ride.car?.model || ride.carDetails?.model || "Car",
        carBrand: ride.car?.brand || ride.carDetails?.brand || "",
        carType: ride.car?.type || ride.carDetails?.type || "Vehicle",
        distance: ride.distance ? `${ride.distance} km` : "N/A",
        driver: ride.driver,
        driverName: ride.driver?.name || ride.driver?.firstName || "Driver",
        driverPhone: ride.driver?.phone,
        passengerStatus: passengerInfo?.status,
        rideStatus: ride.status,
        preferences: ride.preferences,
        stops: ride.stops || [],
        availableSeats: ride.availableSeats,
        totalSeats: ride.totalSeats,
        chatRoomId: ride.chatRoomId,
        createdAt: ride.createdAt,
        updatedAt: ride.updatedAt,
        isFullSharing :ride?.isFullSharing
      };
    } catch (error) {
      // console.error("Error processing booking data:", error);
      return {
        _id: ride._id || "unknown",
        rideId: ride._id,
        from: "Error processing data",
        to: "Error processing data",
        status: "error",
        amount: 0
      };
    }
  };

  const processedBookings = bookings.map(processBookingData);

  // Filter bookings based on search query (client-side for better UX)
  const filteredBookings = processedBookings.filter((booking) => {
    if (searchQuery.trim() === "") return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (booking.from && booking.from.toLowerCase().includes(query)) ||
      (booking.to && booking.to.toLowerCase().includes(query)) ||
      (booking.fromCity && booking.fromCity.toLowerCase().includes(query)) ||
      (booking.toCity && booking.toCity.toLowerCase().includes(query)) ||
      (booking.carName && booking.carName.toLowerCase().includes(query)) ||
      (booking.carBrand && booking.carBrand.toLowerCase().includes(query)) ||
      (booking.driverName && booking.driverName.toLowerCase().includes(query))
    );
  });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Calculate stats from processed bookings
  const calculateStats = () => {
    const totalBookings = processedBookings.length;
    const totalSpent = processedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const completedRides = processedBookings.filter((b) => 
      b.status?.toLowerCase() === "completed"
    ).length;
    const scheduledRides = processedBookings.filter((b) => 
      b.status?.toLowerCase() === "scheduled"
    ).length;
    const cancelledRides = processedBookings.filter((b) => 
      b.status?.toLowerCase() === "cancelled"
    ).length;

    return {
      totalBookings,
      totalSpent,
      completedRides,
      scheduledRides,
      cancelledRides
    };
  };

  const stats = calculateStats();

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      currentPage: 1 // Reset to first page
    }));
  };

  // Get pagination numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (pagination.totalPages <= maxPagesToShow) {
      // Show all pages if total pages is small
      for (let i = 1; i <= pagination.totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage > pagination.totalPages) {
        endPage = pagination.totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < pagination.totalPages) {
        if (endPage < pagination.totalPages - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(pagination.totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Handle search with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // We'll fetch new data when the user stops typing (useEffect will handle)
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  // Load all bookings for export
  const loadAllBookingsForExport = async () => {
    try {
      setExportLoading(true);
      const userId = localStorage.getItem("userId") || "696e1d66de3cf9b1654ce165";
      
      // Fetch all bookings without pagination
      const params = {
        userId,
        page: 1,
        limit: 1000, // Large limit to get most data
      };
      
      // Add filter if not "all"
      const apiStatusFilter = getApiStatusFilter(filter);
      if (apiStatusFilter) {
        params.status = apiStatusFilter;
      }
      
      // Add search query if present
      if (searchQuery.trim() !== "") {
        params.search = searchQuery;
      }
      
      const res = await Axios.get(api.user.getRidesBookingHistory, { params });
      
      if (res?.data?.success) {
        let allBookingsData = [];
        
        if (Array.isArray(res.data.data)) {
          allBookingsData = res.data.data;
        } else if (res.data.data?.bookings) {
          allBookingsData = res.data.data.bookings;
        } else {
          allBookingsData = res.data.data || [];
        }
        
        setAllBookings(allBookingsData);
        setAllBookingsLoaded(true);
        return allBookingsData;
      }
      return [];
    } catch (error) {
      // console.error("Error loading all bookings:", error);
      toast.error("Failed to load all bookings");
      return [];
    } finally {
      setExportLoading(false);
    }
  };

  // Export to Excel function
  const exportToExcel = async (exportAll = false) => {
    try {
      setExportLoading(true);
      
      let exportData = [];
      let exportTitle = "";
      
      if (exportAll) {
        // Export all data
        const allData = await loadAllBookingsForExport();
        exportData = allData.map(processBookingData);
        exportTitle = filter === "all" ? "All Bookings" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`;
      } else {
        // Export current page data
        exportData = processedBookings;
        exportTitle = filter === "all" 
          ? "Current Bookings" 
          : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`;
      }
      
      if (exportData.length === 0) {
        toast.warning("No data to export");
        setExportLoading(false);
        return;
      }
      
      // Prepare data for Excel
      const excelData = exportData.map((booking, index) => ({
        "S.No": index + 1,
        "Booking ID": booking.rideId?.slice(-8) || booking._id?.slice(-8) || "N/A",
        "From": booking.fromCity || booking.from?.split(',')[0] || "N/A",
        "To": booking.toCity || booking.to?.split(',')[0] || "N/A",
        "Departure Date": booking.date ? new Date(booking.date).toLocaleDateString('en-IN') : "N/A",
        "Departure Time": booking.time || "N/A",
        "Distance": booking.distance || "N/A",
        "Vehicle": `${booking.carBrand || ""} ${booking.carName || ""}`.trim() || "N/A",
        "Vehicle Type": booking.carType || "N/A",
        "Driver": booking.driverName || "N/A",
        "Driver Phone": booking.driverPhone || "N/A",
        "Total Seats": booking.totalSeats || 0,
        "Available Seats": booking.availableSeats || 0,
        "Price Per Seat": booking.pricePerSeat ? `₹${booking.pricePerSeat}` : "N/A",
        "Total Amount": booking.amount ? `₹${booking.amount}` : "N/A",
        "Booking Status": booking.status || "N/A",
        "Passenger Status": booking.passengerStatus || "N/A",
        "Chat Room": booking.chatRoomId ? "Available" : "Not Available",
        "Booking Date": booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-IN') : "N/A",
        "Last Updated": booking.updatedAt ? new Date(booking.updatedAt).toLocaleDateString('en-IN') : "N/A"
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 5 },   // S.No
        { wch: 15 },  // Booking ID
        { wch: 25 },  // From
        { wch: 25 },  // To
        { wch: 15 },  // Departure Date
        { wch: 15 },  // Departure Time
        { wch: 10 },  // Distance
        { wch: 20 },  // Vehicle
        { wch: 15 },  // Vehicle Type
        { wch: 20 },  // Driver
        { wch: 15 },  // Driver Phone
        { wch: 10 },  // Total Seats
        { wch: 12 },  // Available Seats
        { wch: 12 },  // Price Per Seat
        { wch: 12 },  // Total Amount
        { wch: 15 },  // Booking Status
        { wch: 15 },  // Passenger Status
        { wch: 15 },  // Chat Room
        { wch: 15 },  // Booking Date
        { wch: 15 },  // Last Updated
      ];
      worksheet['!cols'] = colWidths;
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
      
      // Add statistics sheet
      const statsData = [
        ["Booking Statistics", ""],
        ["Total Bookings", exportData.length],
        ["Total Spent", `₹${exportData.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString('en-IN')}`],
        ["Completed Rides", exportData.filter(b => b.status?.toLowerCase() === "completed").length],
        ["Scheduled Rides", exportData.filter(b => b.status?.toLowerCase() === "scheduled").length],
        ["Cancelled Rides", exportData.filter(b => b.status?.toLowerCase() === "cancelled").length],
        ["", ""],
        ["Export Details", ""],
        ["Export Type", exportTitle],
        ["Filter Applied", filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)],
        ["Search Query", searchQuery || "None"],
        ["Export Date", new Date().toLocaleDateString('en-IN')],
        ["Export Time", new Date().toLocaleTimeString('en-IN')],
        ["Records Exported", exportData.length]
      ];
      
      const statsWorksheet = XLSX.utils.aoa_to_sheet(statsData);
      statsWorksheet['!cols'] = [{ wch: 25 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, "Statistics");
      
      // Generate file name
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const fileName = `${exportTitle.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
      
      // Write and download file
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`Exported ${exportData.length} records to Excel`);
    } catch (error) {
      // console.error("Export error:", error);
      toast.error("Failed to export data to Excel");
    } finally {
      setExportLoading(false);
    }
  };

  // Handle export button click with options
  const handleExportClick = () => {
    // Show options modal
    const exportAll = window.confirm(
      "Export Options:\n\n" +
      "OK: Export ALL bookings (may take longer)\n" +
      "Cancel: Export current page only"
    );
    
    exportToExcel(exportAll);
  };

  // Get status config
  const getStatusConfig = (status) => {
    if (!status) {
      return {
        color: "bg-gray-100 text-gray-800 border border-gray-200",
        icon: <Clock size={16} />,
        label: "Unknown"
      };
    }
    
    switch (status.toLowerCase()) {
      case "scheduled":
        return {
          color: "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/20",
          icon: <Clock size={16} />,
          label: "Scheduled"
        };
      case "ongoing":
      case "started":
      case "in progress":
        return {
          color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          icon: <Clock4 size={16} />,
          label: "Ongoing"
        };
      case "completed":
      case "finished":
      case "ended":
        return {
          color: "bg-green-100 text-green-800 border border-green-200",
          icon: <CheckCircle size={16} />,
          label: "Completed"
        };
      case "cancelled":
      case "canceled":
        return {
          color: "bg-red-100 text-red-800 border border-red-200",
          icon: <XCircle size={16} />,
          label: "Cancelled"
        };
      case "pending":
        return {
          color: "bg-blue-100 text-blue-800 border border-blue-200",
          icon: <Clock4 size={16} />,
          label: "Pending"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border border-gray-200",
          icon: <Clock size={16} />,
          label: status
        };
    }
  };

  const handleCancelBooking = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      // Add your cancel booking API call here
      // await Axios.post(api.booking.cancelBooking, { rideId });
      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh the list
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  const handleContactDriver = (driverPhone) => {
    if (driverPhone) {
      window.open(`tel:${driverPhone}`, '_blank');
    } else {
      toast.error("Driver phone number not available");
    }
  };

  const handleOpenChat = (chatRoomId) => {
    if (chatRoomId) {
      // Navigate to chat or open chat modal
      // console.log("Open chat room:", chatRoomId);
      toast.info("Chat feature coming soon!");
    } else {
      toast.error("Chat not available for this ride");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    // Fetch will be triggered by useEffect
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-4 md:p-6"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#111111]">Booking History</h2>
          <p className="text-[#555555] mt-1">
            View and manage all your past and upcoming rides
          </p>
        </div>
      </div>

 

      {!loading && filteredBookings.length > 0 && (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {
              Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)
            } of {pagination.totalRecords} bookings
            {filter !== "all" && ` (Filtered: ${filter})`}
            {searchQuery && ` (Search: "${searchQuery}")`}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={pagination.limit}
                onChange={handleItemsPerPageChange}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E10600] text-sm bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#F7F7F7] rounded-xl p-4 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ backgroundColor: '#F7F7F7', border: '1px solid #E5E5E5' }}>
          <div className="w-20 h-20 mx-auto bg-[#FFFFFF] rounded-full flex items-center justify-center mb-4"
            style={{ border: '1px solid #E5E5E5' }}
          >
            <Calendar className="w-10 h-10 text-[#B8B8B8]" />
          </div>
          <h3 className="text-xl font-semibold text-[#111111] mb-2">
            {searchQuery ? "No bookings found" : `No ${filter} bookings found`}
          </h3>
          <p className="text-[#555555] max-w-md mx-auto mb-6">
            {searchQuery 
              ? `No bookings match your search "${searchQuery}". Try different keywords.`
              : filter === "all" 
                ? "You haven't made any bookings yet."
                : `You don't have any ${filter} bookings.`}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                setSearchQuery("");
                setFilter("all");
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className="px-6 py-3 border border-[#E5E5E5] rounded-xl font-medium hover:bg-[#F7F7F7] transition-colors"
            >
              {searchQuery ? "Clear Search" : "View All Bookings"}
            </button>
            {filter !== "all" && (
              <button 
                onClick={() => setFilter("all")}
                className="px-6 py-3 bg-[#E10600] hover:bg-[#C10500] text-white rounded-xl font-medium"
              >
                View All Bookings
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => {
            const statusConfig = getStatusConfig(booking.status);
            const isScheduled = booking.status?.toLowerCase() === "scheduled";

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-[#E5E5E5] rounded-xl p-4 md:p-5 hover:shadow-md transition-shadow"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#111111]">
                        {booking.fromCity ? `${booking.fromCity} → ${booking.toCity}` : `${booking.from} → ${booking.to}`}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color} w-fit`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 md:gap-4 text-sm text-[#555555]">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : "Date not set"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {booking.time || "Time not set"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        {booking.availableSeats !== undefined ? 
                          `${booking.availableSeats} seat${booking.availableSeats !== 1 ? 's' : ''} available` : 
                          "Seats info"}
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <span className="text-[#111111] font-medium">Driver:</span>
                      <span className="text-[#555555]">{booking.driverName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    
                    <div className="text-sm text-[#555555]">
                      {booking.pricePerSeat ? `₹${booking.pricePerSeat}/seat` : "Total Amount"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#E5E5E5]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#E10600', color: '#FFFFFF' }}>
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-[#111111]">
                        {booking.carBrand} {booking.carName}
                      </div>
                      <div className="text-sm text-[#555555]">
                        {booking.carType} • {booking.distance}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#F7F7F7' }}>
                      <MapPin className="w-5 h-5 text-[#111111]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#111111] truncate max-w-[200px]">
                        {booking.from.split(',')[0]}
                      </div>
                      <div className="text-sm text-[#555555] truncate max-w-[200px]">
                        → {booking.to.split(',')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-3">
                   
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowBookingDetail(booking)}
                        className="px-3 py-2 border border-[#E5E5E5] rounded-lg hover:border-[#555555] transition-colors text-sm"
                      >
                        Details
                      </button>
                      {/* {isScheduled && booking.passengerStatus?.toLowerCase() !== 'cancelled' && (
                        <button 
                          onClick={() => handleCancelBooking(booking.rideId)}
                          className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )} */}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls - Bottom */}
      {!loading && filteredBookings.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
              {filter !== "all" && ` • Filter: ${filter}`}
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft size={18} />
              </button>
              
              {/* Previous Page Button */}
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pagination.currentPage === page
                          ? "bg-[#E10600] text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              {/* Next Page Button */}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight size={18} />
              </button>
              
              {/* Last Page Button */}
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
            
            {/* Go to Page */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Go to page:</label>
              <input
                type="number"
                min="1"
                max={pagination.totalPages}
                value={pagination.currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= pagination.totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E10600] text-center bg-white"
              />
            </div>
          </div>
        </div>
      )}

   
      {showBookingDetail && (
        <ShowBookingDetails 
          showBookingDetail={showBookingDetail} 
          setShowBookingDetail={setShowBookingDetail}
          booking={selectedBooking}
        />
      )}
    </motion.div>
  );
};

export default BookingHistory;