import React, { useEffect, useState } from "react";
import {
  Search,
  MoreVertical,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Ticket,
} from "lucide-react";
import Axios from "../../services/axios";
import { api } from "../../services/api";
import { toast } from "react-toastify";

const Message = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 5,
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    rideId: "",
  });

  // Safe avatar URL resolver with backend assets url and fallback
  const getUserAvatarUrl = (photoUrl) => {
    if (!photoUrl || typeof photoUrl !== "string" || !photoUrl.trim()) {
      return "/default-avatar.jpg";
    }
    const clean = photoUrl.trim();
    if (clean.includes("res.cloudinary.com/hamrahi") || clean.length < 5) {
      return "/default-avatar.jpg";
    }
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
      return clean;
    }
    const baseUrl = (import.meta.env.VITE_ASSETS_URL || "http://localhost:9898").trim().replace(/\/$/, "");
    const normalized = clean.startsWith("/") ? clean : `/${clean}`;
    return `${baseUrl}${normalized}`;
  };

  // Helper function to generate avatar initials
  const getAvatarInitials = (name) => {
    if (!name) return "UU";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return "Unknown date";

    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Determine priority from API data
  const determinePriority = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "high";
      case "medium":
        return "medium";
      case "low":
        return "low";
      default:
        return "low";
    }
  };

  // Determine status from API data
  const determineStatus = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "unread";
      case "pending":
        return "unread";
      case "resolved":
        return "read";
      default:
        return "unread";
    }
  };

  // Transform backend data to frontend format
  const transformMessages = (backendMessages) => {
    return backendMessages
      .filter((msg) => msg.userId) // remove messages with no user
      .map((msg) => {
        const user = msg.userId;
        const rideDetails = msg.rideId || {};
        const rawPhoto = user?.profilePhotos?.[0]?.url;
        const hasValidPhoto =
          rawPhoto &&
          typeof rawPhoto === "string" &&
          rawPhoto.trim().length > 5 &&
          !rawPhoto.includes("res.cloudinary.com/hamrahi");

        const avatarUrl = hasValidPhoto ? getUserAvatarUrl(rawPhoto) : null;
        const initials = getAvatarInitials(user?.firstName || "Unknown User");

        // Parse any ticket attachments or photos
        const rawAttachments =
          msg.attachments ||
          (msg.image ? [msg.image] : []) ||
          (msg.photos ? msg.photos : []);
        const attachments = Array.isArray(rawAttachments)
          ? rawAttachments
              .map((att) => {
                const url = typeof att === "string" ? att : att?.url || att?.path;
                return url ? getUserAvatarUrl(url) : null;
              })
              .filter(Boolean)
          : [];

        return {
          id: msg._id,
          user: {
            name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown User",
            email: user.email || "No email provided",
            phone: user.phone || "No phone provided",
            avatarUrl,
            initials,
            rawAvatar: rawPhoto,
          },
          subject: msg.subject || "No Subject",
          message: msg.description || "No message content",
          attachments,
          timestamp: msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "Unknown time",
          date: formatDate(msg.createdAt),
          status: determineStatus(msg.status),
          priority: determinePriority(msg.priority),
          category: msg.category?.toLowerCase() || "general",
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
          rideDetails: {
            id: rideDetails._id,
            from: rideDetails.from?.address,
            to: rideDetails.to?.address,
            date: rideDetails.departureDate,
            amount: rideDetails.pricePerSeat,
          },
          apiStatus: msg.status,
          originalData: msg,
        };
      });
  };

  // Fetch messages from backend
  const fetchMessages = async (page = 1) => {
    setIsLoading(true);
    try {
      // Build query based on selected tab
      let queryParams = {
        page,
        limit: pagination.limit,
      };

      // Apply filters based on selected tab
      switch (selectedTab) {
        case "unread":
          queryParams.status = "open";
          break;
        case "high":
          queryParams.priority = "high";
          break;
        case "feedback":
          queryParams.category = "feedback";
          break;
        case "pending":
          queryParams.status = "pending";
          break;
        case "resolved":
          queryParams.status = "resolved";
          break;
      }

      // Apply additional filters
      if (filters.status) queryParams.status = filters.status;
      if (filters.priority) queryParams.priority = filters.priority;
      if (filters.category) queryParams.category = filters.category;
      if (filters.rideId) queryParams.rideId = filters.rideId;

      // console.log('Fetching messages with params:', queryParams);
      const res = await Axios.post(api.support.getSupport, queryParams);

      // console.log(res, "this is res of supoort")

      if (res.data.success && res.data.data) {
        const transformedMessages = transformMessages(res.data.data);
        setMessages(transformedMessages);

        // Update pagination info
        if (res.data.pagination) {
          setPagination({
            ...pagination,
            currentPage: res.data.pagination.currentPage || page,
            totalPages: res.data.pagination.totalPages || 1,
            totalRecords: res.data.pagination.totalRecords || 0,
          });
        }

        // Select first message if none selected
        if (transformedMessages.length > 0 && !selectedMessage) {
          setSelectedMessage(transformedMessages[0]);
        }

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(res.data.data.map((msg) => msg.category)),
        ];
        setCategories([
          { id: "all", label: "All Categories" },
          ...uniqueCategories.map((cat) => ({
            id: cat,
            label: cat?.charAt(0).toUpperCase() + cat?.slice(1) || "Unknown",
          })),
        ]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error?.response?.data?.message || "Error fetching messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and when tab/filter changes
  useEffect(() => {
    fetchMessages(1);
  }, [selectedTab, filters]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMessages(newPage);
    }
  };

  // Tabs configuration
  const tabs = [
    {
      id: "all",
      label: "All Messages",
      count: pagination.totalRecords,
    },
    {
      id: "unread",
      label: "Open",
      count: messages.filter((m) => m.apiStatus === "open").length,
    },
    {
      id: "pending",
      label: "Pending",
      count: messages.filter((m) => m.apiStatus === "pending").length,
    },
    {
      id: "resolved",
      label: "Resolved",
      count: messages.filter((m) => m.apiStatus === "resolved").length,
    },
    {
      id: "high",
      label: "High Priority",
      count: messages.filter((m) => m.priority === "high").length,
    },
  ];

  // Colors for priority and status badges
  const priorityColors = {
    high: "bg-rose-50 text-rose-700 border border-rose-200 font-semibold",
    medium: "bg-[#FFFBEB] text-amber-700 border border-amber-200 font-semibold",
    low: "bg-[#EFF6FF] text-blue-700 border border-blue-200 font-semibold",
  };

  const statusColors = {
    unread: "bg-[#EFF6FF] text-blue-700 border border-blue-200 font-semibold",
    read: "bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] font-semibold",
  };

  const apiStatusColors = {
    open: "bg-[#FFFBEB] text-amber-700 border border-amber-200 font-semibold",
    pending: "bg-yellow-50 text-yellow-800 border border-yellow-200 font-semibold",
    resolved: "bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0] font-semibold",
  };

  // Filter messages client-side for search (only on current page)
  const filteredMessages = messages.filter((message) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.user.name.toLowerCase().includes(query) ||
      message.subject.toLowerCase().includes(query) ||
      message.message.toLowerCase().includes(query) ||
      message.user.email.toLowerCase().includes(query)
    );
  });

  // Calculate average response time
  const calculateAvgResponseTime = () => {
    const resolvedMessages = messages.filter(
      (msg) => msg.apiStatus === "resolved",
    );
    if (resolvedMessages.length === 0) return "0h";

    const responseTimes = resolvedMessages
      .filter((msg) => msg.createdAt && msg.updatedAt)
      .map((msg) => {
        const created = new Date(msg.createdAt);
        const updated = new Date(msg.updatedAt);
        return (updated - created) / (1000 * 60 * 60); // Hours
      });

    if (responseTimes.length === 0) return "0h";

    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    return `${avg.toFixed(1)}h`;
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle search with debounce
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMarkAsResolved = async (messageId) => {
    try {
      // Update status to resolved
      await Axios.post(api.support.markResolved, {
        ticketId: messageId,
        status: "resolved",
      });

      // Refresh messages
      fetchMessages(pagination.currentPage);
      toast.success("Ticket marked as resolved");
    } catch (error) {
      console.log(error);
      toast.info(
        error?.response?.data?.message || "Failed to update ticket status",
      );
    }
  };

  // Loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center p-8 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]/80 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E10600] mx-auto"></div>
          <p className="mt-3 text-xs font-semibold text-[#0F172A]">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="pt-4 pb-5">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-2 rounded-xl bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
                Support & Messages
              </h1>
              <p className="text-[#64748B] text-xs">
                Manage, review, and resolve customer support tickets and rider inquiries
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0]/80 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#64748B]">Total Tickets</p>
                <p className="text-2xl font-black text-[#0F172A] mt-0.5">
                  {pagination.totalRecords}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0]/80 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#64748B]">Open Tickets</p>
                <p className="text-2xl font-black text-[#0F172A] mt-0.5">
                  {messages.filter((m) => m.apiStatus === "open").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0]/80 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#64748B]">High Priority</p>
                <p className="text-2xl font-black text-[#0F172A] mt-0.5">
                  {messages.filter((m) => m.priority === "high").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0]/80 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#64748B]">Avg Resolution</p>
                <p className="text-2xl font-black text-[#0F172A] mt-0.5">
                  {calculateAvgResponseTime()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Messages List */}
          <div className="lg:w-2/5 xl:w-1/3 space-y-4">
            <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0]/90 overflow-hidden">
              {/* Search and Filter */}
              <div className="p-4 border-b border-[#E2E8F0] space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs focus:ring-2 focus:ring-red-100 focus:border-[#E10600] outline-none transition-all"
                  />
                </div>

                {/* Quick Filters */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      handleFilterChange("priority", e.target.value)
                    }
                    className="px-2.5 py-1.5 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] outline-none focus:border-[#E10600]"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>

                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="px-2.5 py-1.5 bg-[#F8FAFC]/60 border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] outline-none focus:border-[#E10600]"
                  >
                    <option value="">All Categories</option>
                    {categories.slice(1).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabs */}
              <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC]/40">
                <div className="flex space-x-1.5 overflow-x-auto hide-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSelectedTab(tab.id);
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        selectedTab === tab.id
                          ? "bg-[#EF4444] text-white shadow-sm"
                          : "text-[#475569] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          selectedTab === tab.id ? "bg-[#FFFFFF]/20 text-white" : "bg-gray-200 text-[#0F172A]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages List */}
              <div className="max-h-[580px] overflow-y-auto divide-y divide-gray-100">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#E10600] mx-auto mb-3"></div>
                    <p className="text-xs text-[#64748B]">Loading tickets...</p>
                  </div>
                ) : filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => {
                    const isSelected = selectedMessage?.id === message.id;
                    return (
                      <div
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className={`p-4 hover:bg-[#F8FAFC]/80 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#FEF2F2]/40 border-l-4 border-l-[#E10600]"
                            : "border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F8FAFC] flex items-center justify-center flex-shrink-0 border border-[#E2E8F0]">
                              {message.user.avatarUrl ? (
                                <img
                                  src={message.user.avatarUrl}
                                  alt={message.user.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/default-avatar.jpg";
                                  }}
                                />
                              ) : (
                                <span className="font-bold text-[#EF4444] text-xs">
                                  {message.user.initials}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-xs text-[#0F172A] truncate">
                                {message.user.name}
                              </h3>
                              <p className="text-[11px] text-[#64748B] line-clamp-1">
                                {message.subject}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1 shrink-0">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${priorityColors[message.priority]}`}
                            >
                              {message.priority}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${apiStatusColors[message.apiStatus] || "bg-[#F8FAFC] text-[#0F172A]"}`}
                            >
                              {message.apiStatus}
                            </span>
                          </div>
                        </div>

                        <p className="text-[#475569] text-xs line-clamp-2 mb-2">
                          {message.message}
                        </p>

                        <div className="flex justify-between items-center text-[11px] text-[#94A3B8]">
                          <span>{message.date} • {message.timestamp}</span>
                          <span className="capitalize text-[#64748B] font-medium">
                            {message.category}
                          </span>
                        </div>

                        {/* Ride Details if available */}
                        {message.rideDetails?.id && (
                          <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                            <div className="flex items-center text-[11px] text-[#475569]">
                              <Ticket className="w-3 h-3 mr-1 text-[#EF4444]" />
                              <span className="truncate">
                                Ride: {message.rideDetails.from} → {message.rideDetails.to}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-[#0F172A]">No tickets found</p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-[#EF4444] hover:underline text-xs font-semibold"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC]/40">
                  <div className="flex justify-between items-center text-xs">
                    <div className="text-[#64748B] text-[11px]">
                      {(pagination.currentPage - 1) * pagination.limit + 1}-
                      {Math.min(
                        pagination.currentPage * pagination.limit,
                        pagination.totalRecords,
                      )}{" "}
                      of {pagination.totalRecords}
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1}
                        className="p-1.5 border border-[#E2E8F0] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFC]"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-semibold text-[#0F172A]">
                        {pagination.currentPage} / {pagination.totalPages}
                      </span>
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        className="p-1.5 border border-[#E2E8F0] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFC]"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Filter List */}
            {categories.length > 1 && (
              <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0]/90 p-4">
                <h3 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2.5">Filter by Category</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() =>
                        handleFilterChange(
                          "category",
                          category.id === "all" ? "" : category.id,
                        )
                      }
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs transition-all ${
                        filters.category ===
                        (category.id === "all" ? "" : category.id)
                          ? "bg-[#FEF2F2] text-[#EF4444] font-semibold"
                          : "hover:bg-[#F8FAFC] text-[#0F172A]"
                      }`}
                    >
                      <span className="capitalize">{category.label}</span>
                      <span className="text-[11px] text-[#94A3B8]">
                        {category.id === "all"
                          ? pagination.totalRecords
                          : messages.filter((m) => m.category === category.id)
                              .length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Message Details */}
          <div className="lg:w-3/5 xl:w-2/3">
            <div className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E2E8F0]/90 h-full overflow-hidden flex flex-col">
              {selectedMessage ? (
                <div className="h-full flex flex-col justify-between">
                  <div>
                    {/* Message Header */}
                    <div className="p-6 border-b border-[#E2E8F0]">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F8FAFC] text-[#475569] uppercase font-mono">
                              #{selectedMessage.id?.slice(-8)}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs ${priorityColors[selectedMessage.priority]}`}
                            >
                              {selectedMessage.priority} Priority
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs ${apiStatusColors[selectedMessage.apiStatus] || "bg-[#F8FAFC] text-[#0F172A]"}`}
                            >
                              {selectedMessage.apiStatus}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-[#0F172A]">
                            {selectedMessage.subject}
                          </h2>

                          {/* Customer info card */}
                          <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-[#E2E8F0]">
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-[#F8FAFC] flex items-center justify-center flex-shrink-0 border border-[#E2E8F0]">
                              {selectedMessage.user.avatarUrl ? (
                                <img
                                  src={selectedMessage.user.avatarUrl}
                                  alt={selectedMessage.user.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/default-avatar.jpg";
                                  }}
                                />
                              ) : (
                                <span className="font-bold text-[#EF4444] text-sm">
                                  {selectedMessage.user.initials}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-[#0F172A] leading-tight">
                                {selectedMessage.user.name}
                              </p>
                              <div className="flex items-center space-x-3 text-xs text-[#64748B] mt-1 flex-wrap gap-1">
                                <span className="flex items-center">
                                  <Mail className="w-3.5 h-3.5 mr-1 text-[#94A3B8]" />
                                  {selectedMessage.user.email}
                                </span>
                                {selectedMessage.user.phone && (
                                  <span className="flex items-center">
                                    <Phone className="w-3.5 h-3.5 mr-1 text-[#94A3B8]" />
                                    {selectedMessage.user.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message Content Body */}
                    <div className="p-6 space-y-5 overflow-y-auto max-h-[600px]">
                      <div>
                        <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                          Inquiry Description
                        </p>
                        <div className="bg-[#F8FAFC]/90 rounded-2xl p-4 border border-[#E2E8F0]">
                          <p className="text-[#0F172A] text-sm whitespace-pre-wrap leading-relaxed">
                            {selectedMessage.message}
                          </p>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] mt-1.5">
                          Received: {selectedMessage.date} at {selectedMessage.timestamp}
                        </div>
                      </div>

                      {/* Ticket Meta Details */}
                      <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/70">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-[#94A3B8] text-[11px] font-medium">Category</p>
                            <p className="font-bold text-[#0F172A] capitalize mt-0.5">
                              {selectedMessage.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#94A3B8] text-[11px] font-medium">Ticket ID</p>
                            <p className="font-mono text-[11px] font-bold text-[#0F172A] truncate mt-0.5" title={selectedMessage.id}>
                              {selectedMessage.id}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#94A3B8] text-[11px] font-medium">Created</p>
                            <p className="font-semibold text-[#0F172A] text-[11px] mt-0.5">
                              {new Date(selectedMessage.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#94A3B8] text-[11px] font-medium">Last Update</p>
                            <p className="font-semibold text-[#0F172A] text-[11px] mt-0.5">
                              {new Date(selectedMessage.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Related Ride Details */}
                        {selectedMessage.rideDetails?.id && (
                          <div className="mt-3 pt-3 border-t border-[#E2E8F0]/80">
                            <div className="flex items-center text-[#0F172A] mb-1.5">
                              <Ticket className="w-3.5 h-3.5 mr-1.5 text-[#EF4444]" />
                              <span className="text-xs font-bold">Related Ride Reference</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-[#FFFFFF] p-2.5 rounded-xl border border-[#E2E8F0]/70">
                              <div>
                                <span className="text-[#94A3B8] text-[10px]">Route</span>
                                <p className="font-semibold text-[#0F172A] truncate">
                                  {selectedMessage.rideDetails.from} → {selectedMessage.rideDetails.to}
                                </p>
                              </div>
                              <div>
                                <span className="text-[#94A3B8] text-[10px]">Departure Date</span>
                                <p className="font-semibold text-[#0F172A]">
                                  {new Date(selectedMessage.rideDetails.date).toLocaleDateString()}
                                </p>
                              </div>
                              {selectedMessage.rideDetails.amount && (
                                <div>
                                  <span className="text-[#94A3B8] text-[10px]">Fare</span>
                                  <p className="font-bold text-[#EF4444]">
                                    ₹{selectedMessage.rideDetails.amount}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Attachments Section */}
                        {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#E2E8F0]/80">
                            <p className="text-xs font-bold text-[#0F172A] mb-2">Attachments ({selectedMessage.attachments.length})</p>
                            <div className="flex flex-wrap gap-2.5">
                              {selectedMessage.attachments.map((attUrl, idx) => (
                                <a
                                  key={idx}
                                  href={attUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative block w-20 h-20 rounded-xl overflow-hidden border border-[#E2E8F0] hover:border-red-400 transition-all shadow-sm bg-[#FFFFFF]"
                                  title="Click to view full attachment"
                                >
                                  <img
                                    src={attUrl}
                                    alt={`Attachment ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = "/default-avatar.jpg";
                                    }}
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="p-4 px-6 border-t border-[#E2E8F0] bg-[#F8FAFC]/40 flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8]">
                      Ticket status: <strong className="text-[#0F172A] capitalize">{selectedMessage.apiStatus}</strong>
                    </span>

                    {selectedMessage.apiStatus !== "resolved" ? (
                      <button
                        onClick={() => handleMarkAsResolved(selectedMessage.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>Mark as Resolved</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981] bg-[#ECFDF5] px-3 py-1 rounded-xl border border-[#A7F3D0]">
                        Resolved Ticket
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[450px] flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mb-3 border border-[#FCA5A5]">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-1">
                    No Ticket Selected
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-sm">
                    Choose a support ticket from the list on the left to inspect conversation details, attached screenshots, and resolution actions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
