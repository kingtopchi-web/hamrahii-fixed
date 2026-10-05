import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, Phone, Mail, MessageSquare, 
  FileText, Shield, Clock, Globe,
  ChevronDown, ChevronUp, Send, CheckCircle,
  AlertCircle, User, Calendar, MapPin,
  Smartphone, CreditCard, Car, Users,
  PlusCircle, Ticket, Search, Filter,
  XCircle, AlertTriangle, Info,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';

const Support = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [activeFaq, setActiveFaq] = useState(null);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    category: 'booking',
    priority: 'medium',
    description: '',
    rideId: '',
  });

  // Fetch user support tickets
  const fetchSupportTickets = async (page = 1, filter = ticketFilter, search = searchQuery) => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      
      // Prepare API parameters
      const params = {
        userId,
        page: page,
        limit: itemsPerPage,
      };
      
      // Add search query if present
      if (search && search.trim() !== '') {
        params.search = search.trim();
      }
      
      // Add status filter if not 'all'
      if (filter !== 'all') {
        params.status = filter;
      }
      
      // console.log('Fetching tickets with params:', params); // Debug log
      
      // console.log(api.support.getSupport , "this si url ")
      const response = await Axios.post(api.support.getSupport, params);
      
      // console.log('API Response:', response.data); // Debug log
      
      // Handle API response structure
      if (response.data.success) {
        const ticketsData = response.data.data || [];
        const paginationData = response.data.pagination || {};
        
        setSupportTickets(ticketsData);
        setTotalTickets(paginationData.totalRecords || ticketsData.length);
        setTotalPages(paginationData.totalPages || Math.ceil(ticketsData.length / itemsPerPage) || 1);
        setCurrentPage(paginationData.currentPage || page);
      } else {
        // Handle empty response
        setSupportTickets([]);
        setTotalTickets(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
      
      setLoading(false);
    } catch (error) {
      // console.error('Error fetching support tickets:', error);
      toast.error('Failed to load support tickets');
      setLoading(false);
      // Reset on error
      setSupportTickets([]);
      setTotalTickets(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  // Initial fetch and when items per page changes
  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchSupportTickets(1);
    }
  }, [activeTab, itemsPerPage]);

  // Handle filter changes
  useEffect(() => {
    if (activeTab === 'tickets') {
      // Reset to page 1 when filter or search changes
      setCurrentPage(1);
      fetchSupportTickets(1, ticketFilter, searchQuery);
    }
  }, [ticketFilter, searchQuery]);

  // Handle page changes
  useEffect(() => {
    if (activeTab === 'tickets' && currentPage > 1) {
      fetchSupportTickets(currentPage, ticketFilter, searchQuery);
    }
  }, [currentPage]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null);
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    setSearchTimeout(
      setTimeout(() => {
        if (activeTab === 'tickets') {
          setCurrentPage(1);
          fetchSupportTickets(1, ticketFilter, value);
        }
      }, 500) // 500ms delay
    );
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const userId = localStorage.getItem("userId");
      
      const response = await Axios.post(api.support.createSupport, {
        ...newTicketForm,
        userId,
        status: 'open'
      });

      if(response.data.success){
        toast.success(response.data.message);
        // Reset form and switch to tickets tab
        setNewTicketForm({
          subject: '',
          category: 'booking',
          priority: 'medium',
          description: '',
          rideId: '',
        });
        setActiveTab('tickets');
        // Refresh tickets list
        fetchSupportTickets(1);
      } else {
        toast.error(response.data.message || 'Failed to create ticket');
      }
      setIsSubmitting(false);
    } catch (error) {
      // console.error('Error creating support ticket:', error);
      toast.error(error.response?.data?.message || 'Failed to create support ticket');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTicketForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open':
        return { color: 'bg-red-100 text-red-800', icon: <AlertCircle size={14} />, label: 'Open' };
      case 'resolved':
        return { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} />, label: 'Resolved' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} />, label: 'Pending' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Info size={14} />, label: status };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'high':
        return { color: 'text-red-600', label: 'High' };
      case 'medium':
        return { color: 'text-yellow-600', label: 'Medium' };
      case 'low':
        return { color: 'text-green-600', label: 'Low' };
      default:
        return { color: 'text-gray-600', label: priority };
    }
  };

  const getCategoryConfig = (category) => {
    const categories = {
      booking: { icon: <Calendar size={14} />, label: 'Booking' },
      payment: { icon: <CreditCard size={14} />, label: 'Payment' },
      refund: { icon: <CreditCard size={14} />, label: 'Refund' },
      'ride-issue': { icon: <Car size={14} />, label: 'Ride Issue' },
      ride_issue: { icon: <Car size={14} />, label: 'Ride Issue' },
      general: { icon: <HelpCircle size={14} />, label: 'General' },
      account: { icon: <User size={14} />, label: 'Account' },
      safety: { icon: <Shield size={14} />, label: 'Safety' }
    };
    return categories[category] || { icon: <HelpCircle size={14} />, label: category };
  };

  // Filter tickets client-side only for quick filtering (optional)
  const filteredTickets = supportTickets.filter(ticket => {
    // Additional client-side filtering if needed
    if (searchQuery.trim() && ticketFilter !== 'all') {
      const query = searchQuery.toLowerCase();
      return (
        (ticket.subject?.toLowerCase().includes(query) ||
         ticket.description?.toLowerCase().includes(query) ||
         ticket._id?.toLowerCase().includes(query)) &&
        ticket.status === ticketFilter
      );
    }
    return true;
  });

  // Pagination functions
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Don't call fetch here, useEffect will handle it
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = Number(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when items per page changes
    // fetchSupportTickets will be triggered by useEffect
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      pageNumbers.push(1);
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  const handleFilterClick = (filterType) => {
    setTicketFilter(filterType);
    // Reset to page 1 and fetch will be triggered by useEffect
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTicketFilter('all');
    setCurrentPage(1);
    fetchSupportTickets(1, 'all', '');
  };

  const faqs = [
    {
      id: 1,
      question: "How do I raise a support ticket?",
      answer: "Click on 'Raise New Ticket' button, fill in the required details including subject, category, priority, and description. You can also reference a specific ride if applicable. Our support team will respond within 24 hours.",
      category: "ticket"
    },
    {
      id: 2,
      question: "What is the response time for support tickets?",
      answer: "High priority tickets: 2-4 hours, Medium priority: 8-12 hours, Low priority: 24 hours. You can track your ticket status in the 'My Tickets' section.",
      category: "ticket"
    },
    {
      id: 3,
      question: "Can I update an existing support ticket?",
      answer: "Yes, you can reply to existing tickets. Our support team will continue the conversation and update the ticket status accordingly.",
      category: "ticket"
    }
  ];

  const contactInfo = [
    {
      icon: <Phone size={24} />,
      title: "24/7 Helpline",
      details: ["+91-9876543210", "+91-9876543211"],
      description: "Call us anytime for urgent assistance"
    },
    {
      icon: <Mail size={24} />,
      title: "Email Support",
      details: ["support@carpoolapp.com", "help@carpoolapp.com"],
      description: "Response within 24 hours"
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Live Chat",
      details: ["Available 9 AM - 9 PM"],
      description: "Chat with our support agents"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-6 max-w-7xl mx-auto"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Support Center</h1>
        <p className="text-[#555555]">Get help with bookings, payments, or report issues</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('new')}
          className="p-6 rounded-xl border border-[#E10600] bg-[#E10600]/5 hover:bg-[#E10600]/10 transition-colors flex flex-col items-center justify-center"
        >
          <PlusCircle size={32} className="text-[#E10600] mb-3" />
          <h3 className="text-lg font-semibold text-[#111111] mb-1">Raise New Ticket</h3>
          <p className="text-sm text-[#555555] text-center">Create a new support request</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('tickets')}
          className="p-6 rounded-xl border border-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center"
        >
          <Ticket size={32} className="text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-[#111111] mb-1">My Tickets</h3>
          <p className="text-sm text-[#555555] text-center">View all your support requests</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('faq')}
          className="p-6 rounded-xl border border-green-600 bg-green-50 hover:bg-green-100 transition-colors flex flex-col items-center justify-center"
        >
          <HelpCircle size={32} className="text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-[#111111] mb-1">FAQs</h3>
          <p className="text-sm text-[#555555] text-center">Find quick answers</p>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'tickets' ? 'border-[#E10600] text-[#E10600]' : 'border-transparent text-[#555555] hover:text-[#111111]'}`}
        >
          <span className="flex items-center gap-2">
            <Ticket size={18} />
            My Tickets ({totalTickets})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'new' ? 'border-[#E10600] text-[#E10600]' : 'border-transparent text-[#555555] hover:text-[#111111]'}`}
        >
          <span className="flex items-center gap-2">
            <PlusCircle size={18} />
            Raise New Ticket
          </span>
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${activeTab === 'faq' ? 'border-[#E10600] text-[#E10600]' : 'border-transparent text-[#555555] hover:text-[#111111]'}`}
        >
          <span className="flex items-center gap-2">
            <HelpCircle size={18} />
            FAQs
          </span>
        </button>
      </div>

      {/* Tickets Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'tickets' && (
          <motion.div
            key="tickets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#555555]" size={20} />
                <input
                  type="text"
                  placeholder="Search tickets by subject or ID..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#E10600] w-full"
                />
              </div>
              
              <div className="flex gap-2">
                {['all', 'open', 'pending', 'resolved'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => handleFilterClick(filterType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      ticketFilter === filterType
                        ? "bg-[#E10600] text-white"
                        : "bg-[#F7F7F7] text-[#555555] hover:bg-[#E5E5E5]"
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
                
                {(searchQuery || ticketFilter !== 'all') && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Tickets Count and Items Per Page Selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="text-sm text-gray-600">
                Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, totalTickets)} to {
                  Math.min(currentPage * itemsPerPage, totalTickets)
                } of {totalTickets} tickets
                {(searchQuery || ticketFilter !== 'all') && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Filtered
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E10600] text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Tickets List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#F7F7F7] rounded-xl p-4 animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12 rounded-xl bg-gray-50">
                <Ticket size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchQuery || ticketFilter !== 'all' ? 'No matching tickets found' : 'No support tickets yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || ticketFilter !== 'all'
                    ? 'Try changing your search or filter criteria'
                    : 'Create your first support ticket to get help'}
                </p>
                <div className="flex gap-3 justify-center">
                  {!searchQuery && ticketFilter === 'all' ? (
                    <button
                      onClick={() => setActiveTab('new')}
                      className="bg-[#E10600] hover:bg-[#C10500] text-white px-6 py-3 rounded-xl font-medium"
                    >
                      Create New Ticket
                    </button>
                  ) : (
                    <button
                      onClick={handleClearFilters}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => {
                    const statusConfig = getStatusConfig(ticket.status);
                    const priorityConfig = getPriorityConfig(ticket.priority);
                    const categoryConfig = getCategoryConfig(ticket.category);

                    return (
                      <motion.div
                        key={ticket._id || ticket.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{ticket?.subject}</h3>
                              <span className="text-sm font-medium text-gray-500">#{ticket._id?.slice(-8) || ticket.id?.slice(-8)}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                              <span className={`text-sm font-medium ${priorityConfig.color}`}>
                                Priority: {priorityConfig.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                {categoryConfig.icon}
                                {categoryConfig.label}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {ticket?.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {ticket?.assignedTo || 'Unassigned'}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-4 line-clamp-2">{ticket?.description}</p>
                            
                            {ticket.rideId && typeof ticket.rideId === 'object' && (
                              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-2">
                                  <Car size={16} />
                                  Related Ride Details
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-600">Ride ID</p>
                                    <p className="font-medium">{ticket.rideId._id?.slice(-8) || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Route</p>
                                    <p className="font-medium">
                                      {ticket.rideId.from?.address || 'N/A'} → {ticket.rideId.to?.address || 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Date</p>
                                    <p className="font-medium">
                                      {ticket.rideId.departureDate ? new Date(ticket.rideId.departureDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Amount</p>
                                    <p className="font-medium">{ticket.rideId.pricePerSeat ? `₹${ticket.rideId.pricePerSeat}` : 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="font-medium text-gray-700 mb-1">Last Update</h4>
                              <p className="text-gray-600 text-sm">{ticket.lastMessage || 'No updates yet'}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                Updated: {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('en-IN') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          {/* <div className="flex flex-col gap-2">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              Reply
                            </button>
                          </div> */}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* First Page Button */}
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="First Page"
                      >
                        <ChevronsLeft size={18} />
                      </button>
                      
                      {/* Previous Page Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
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
                              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                currentPage === page
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Next Page"
                      >
                        <ChevronRight size={18} />
                      </button>
                      
                      {/* Last Page Button */}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Last Page"
                      >
                        <ChevronsRight size={18} />
                      </button>
                    </div>
                    
                    {/* Go to Page Input */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Go to page:</label>
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                          const page = parseInt(e.target.value);
                          if (page >= 1 && page <= totalPages) {
                            handlePageChange(page);
                          }
                        }}
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E10600] text-center"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* New Ticket Tab */}
        {activeTab === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Raise New Support Ticket</h2>
              <p className="text-gray-600 mb-6">Fill in the details below to create a new support request</p>
              
              <form onSubmit={handleSubmitTicket} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={newTicketForm.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E10600] focus:ring-2 focus:ring-[#E10600]/20"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={newTicketForm.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E10600] focus:ring-2 focus:ring-[#E10600]/20"
                    >
                      <option value="booking">Booking Issue</option>
                      <option value="payment">Payment Issue</option>
                      <option value="refund">Refund Request</option>
                      <option value="ride-issue">Ride Experience</option>
                      <option value="account">Account Issue</option>
                      <option value="safety">Safety Concern</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <div className="flex gap-4">
                      {['high', 'medium', 'low'].map((priority) => (
                        <label key={priority} className="flex items-center">
                          <input
                            type="radio"
                            name="priority"
                            value={priority}
                            checked={newTicketForm.priority === priority}
                            onChange={handleInputChange}
                            className="mr-2"
                          />
                          <span className="capitalize">{priority}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {newTicketForm.priority === 'high' ? 'Response within 2-4 hours' :
                       newTicketForm.priority === 'medium' ? 'Response within 8-12 hours' :
                       'Response within 24 hours'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ride ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="rideId"
                      value={newTicketForm.rideId}
                      onChange={handleInputChange}
                      placeholder="Enter ride ID if related to a specific booking"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E10600] focus:ring-2 focus:ring-[#E10600]/20"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={newTicketForm.description}
                    onChange={handleInputChange}
                    placeholder="Please provide detailed information about your issue..."
                    rows={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E10600] focus:ring-2 focus:ring-[#E10600]/20 resize-none"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Include relevant details like dates, amounts, error messages, etc.
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#E10600] hover:bg-[#C10500] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Ticket
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setActiveTab('tickets')}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <motion.div
            key="faq"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">Find quick answers to common questions about support tickets</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}
                    className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    {activeFaq === faq.id ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {activeFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-gray-100">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Information */}
      {(activeTab === 'faq' || activeTab === 'new') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Ways to Contact Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((contact, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-50">
                    {contact.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{contact.title}</h3>
                </div>
                
                <div className="space-y-2 mb-3">
                  {contact.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 font-medium">{detail}</p>
                  ))}
                </div>
                
                <p className="text-sm text-gray-500">{contact.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Support;