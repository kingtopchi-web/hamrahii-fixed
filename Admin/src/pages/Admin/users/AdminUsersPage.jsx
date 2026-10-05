import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Shield,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  X,
  Users,
  PlusCircle,
  Wallet,
  Coins,
} from 'lucide-react';
import { api } from '../../../services/api';
import Axios from '../../../services/axios';
import { formatUserName, formatUserEmail } from '../../../utils/formatters';
import AddWalletMoneyModal from './AddWalletMoneyModal';

export const getUserAvatarUrl = (photoUrl) => {
  if (!photoUrl || typeof photoUrl !== "string" || !photoUrl.trim()) {
    return "/default-avatar.jpg";
  }
  const clean = photoUrl.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
    return clean;
  }
  const baseUrl = (import.meta.env.VITE_ASSETS_URL || "http://localhost:9898").trim().replace(/\/$/, "");
  const normalized = clean.startsWith("/") ? clean : `/${clean}`;
  return `${baseUrl}${normalized}`;
};

const AdminUsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserForWallet, setSelectedUserForWallet] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(20);
  
  // User counts state
  const [verifiedUsersCount, setVerifiedUsersCount] = useState(0);
  const [unverifiedUsersCount, setUnverifiedUsersCount] = useState(0);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isVerifiedFilter, setIsVerifiedFilter] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await Axios.post(
        api.user.getWithPagination,
        {
          query: debouncedQuery,
          isVerified: isVerifiedFilter || undefined,
          page: currentPage,
          limit
        }
      );
      
      if (response.data.success) {
        setUsers(response.data.users || []);
        setTotalUsers(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
        if (typeof response.data.verifiedCount === 'number') {
          setVerifiedUsersCount(response.data.verifiedCount);
          setUnverifiedUsersCount(response.data.unverifiedCount ?? Math.max(0, (response.data.total || 0) - response.data.verifiedCount));
        } else {
          const v = (response.data.users || []).filter(u => u.isVerified === 'verified' || u.isVerified === true).length;
          setVerifiedUsersCount(v);
          setUnverifiedUsersCount(Math.max(0, (response.data.total || 0) - v));
        }
      }
    } catch (err) {
      // console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, isVerifiedFilter, currentPage, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle filter changes
  const handleFilterChange = (value) => {
    setIsVerifiedFilter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setIsVerifiedFilter('');
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`min-w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentPage === i
              ? 'bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white shadow-sm'
              : 'bg-[#FFFFFF] text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0]/80 shadow-xs'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="min-w-9 h-9 rounded-xl bg-[#FFFFFF] text-[#0F172A] border border-[#E2E8F0]/80 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFC] transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => goToPage(1)}
              className="min-w-9 h-9 rounded-xl bg-[#FFFFFF] text-[#0F172A] border border-[#E2E8F0]/80 shadow-xs hover:bg-[#F8FAFC] transition-all text-xs font-bold cursor-pointer"
            >
              1
            </button>
            {startPage > 2 && <span className="text-[#94A3B8] px-1 font-bold">...</span>}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-[#94A3B8] px-1 font-bold">...</span>}
            <button
              onClick={() => goToPage(totalPages)}
              className="min-w-9 h-9 rounded-xl bg-[#FFFFFF] text-[#0F172A] border border-[#E2E8F0]/80 shadow-xs hover:bg-[#F8FAFC] transition-all text-xs font-bold cursor-pointer"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="min-w-9 h-9 rounded-xl bg-[#FFFFFF] text-[#0F172A] border border-[#E2E8F0]/80 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFC] transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get verification badge
  const getVerificationBadge = (status) => {
    switch(status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
            <Shield className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        );
      case 'unverified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-amber-700 border border-amber-200">
            <UserX className="w-3 h-3 text-[#F59E0B]" />
            Unverified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0]">
            <UserCheck className="w-3 h-3 text-[#64748B]" />
            {status || 'Pending'}
          </span>
        );
    }
  };

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
                  USER DIRECTORY
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
                Users Management
              </h1>
              <p className="text-[#64748B] text-xs sm:text-sm font-medium mt-1">
                Monitor registered passengers, drivers, verification statuses, and wallet accounts
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-card-subtle hover:shadow-card-hover transition-all flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-xs font-bold uppercase tracking-wider">Total Registered</p>
              <p className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 tracking-tight">{totalUsers.toLocaleString()}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5 font-medium">Platform accounts</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center border border-[#FCA5A5]">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-card-subtle hover:shadow-card-hover transition-all flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-xs font-bold uppercase tracking-wider">Verified Users</p>
              <p className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 tracking-tight">{verifiedUsersCount.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 mt-0.5 font-semibold">Government ID / KYC OK</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#E2E8F0] shadow-card-subtle hover:shadow-card-hover transition-all flex items-center justify-between">
            <div>
              <p className="text-[#64748B] text-xs font-bold uppercase tracking-wider">Unverified</p>
              <p className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 tracking-tight">{unverifiedUsersCount.toLocaleString()}</p>
              <p className="text-xs text-[#F59E0B] mt-0.5 font-semibold">Pending verification</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center border border-amber-100">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#FFFFFF] rounded-3xl p-5 mb-6 border border-[#E2E8F0] shadow-card-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#94A3B8]" />
                <select
                  value={isVerifiedFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition-all cursor-pointer"
                >
                  <option value="">All Verification Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified Only</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {(searchQuery || isVerifiedFilter) && (
                <button
                  onClick={clearFilters}
                  className="px-3.5 py-2.5 bg-[#F8FAFC] hover:bg-gray-200 text-[#0F172A] rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Grid - Card Layout */}
        <div className="mb-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E2E8F0] shadow-card-subtle animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2 py-3 border-y border-[#E2E8F0] mb-3">
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-9 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-[#FFFFFF] rounded-3xl p-12 text-center border border-[#E2E8F0] shadow-card-subtle">
              <div className="text-[#EF4444] mb-3">
                <X className="w-10 h-10 mx-auto" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">Error Loading Users</h3>
              <p className="text-xs text-[#64748B] mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-5 py-2.5 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white rounded-xl text-xs font-bold hover:from-[#c50500] hover:to-[#e6352b] transition-all shadow-sm cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-[#FFFFFF] rounded-3xl p-14 text-center border border-[#E2E8F0] shadow-card-subtle">
              <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center mx-auto mb-3 border border-[#FCA5A5]">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">No Users Found</h3>
              <p className="text-xs text-[#64748B]">
                {debouncedQuery || isVerifiedFilter
                  ? 'Try adjusting your search keywords or filter options'
                  : 'No users in the system yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#E2E8F0] shadow-card-subtle hover:shadow-card-hover hover:border-[#FCA5A5]/80 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* User Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      {user.profilePhotos?.[0]?.url || user.profilePhoto ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xs bg-[#F8FAFC] flex-shrink-0">
                          <img
                            src={getUserAvatarUrl(user.profilePhotos?.[0]?.url || user.profilePhoto)}
                            alt={formatUserName(user)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-avatar.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-tr from-[#E10600] to-rose-500 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-xs">
                          {(user.firstName?.[0] || user.name?.[0] || "U").toUpperCase()}{(user.lastName?.[0] || "").toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-[#0F172A] truncate" title={formatUserName(user)}>
                          {formatUserName(user)}
                        </h3>
                        <div className="mt-1">
                          {getVerificationBadge(user.isVerified)}
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2 py-3 border-y border-[#E2E8F0] mb-3 text-xs text-[#475569]">
                      <div className="flex items-center text-[#475569]">
                        <Mail className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-[#94A3B8]" />
                        <span className="truncate">{formatUserEmail(user.email)}</span>
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center text-[#475569]">
                          <Phone className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-[#94A3B8]" />
                          <span className="truncate">{user.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center text-[#64748B] text-[11px]">
                        <Calendar className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-[#94A3B8]" />
                        <span>Joined {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* Balances Box */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F8FAFC]/80 rounded-2xl border border-[#E2E8F0]">
                      <div className="min-w-0">
                        <span className="text-[#94A3B8] font-bold block text-[10px] uppercase tracking-wider">
                          Wallet
                        </span>
                        <p className="font-bold text-[#0F172A] text-xs sm:text-sm truncate mt-0.5" title={`₹${(user.wallet?.balance || 0).toLocaleString("en-IN")}`}>
                          ₹{(user.wallet?.balance || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="border-l border-[#E2E8F0]/80 pl-2.5 min-w-0">
                        <span className="text-purple-600 font-bold block text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Coins className="w-3 h-3 shrink-0" />
                          Virtual
                        </span>
                        <p className="font-black text-purple-700 text-xs sm:text-sm truncate mt-0.5" title={`₹${(user.virtualMoney?.balance || 0).toLocaleString("en-IN")}`}>
                          ₹{(user.virtualMoney?.balance || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserForWallet(user);
                        }}
                        className="py-2.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer hover:shadow-sm"
                        title="Add Virtual Money"
                      >
                        <PlusCircle className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                        <span className="truncate">Add Virtual</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/admin/users-details", {
                          state: { user }
                        })}
                        className="py-2.5 px-2 bg-[#F8FAFC]/80 hover:bg-[#FEF2F2] text-[#0F172A] hover:text-[#EF4444] border border-[#E2E8F0]/80 hover:border-[#FCA5A5] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer hover:shadow-sm"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0 text-[#64748B]" />
                        <span className="truncate">View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && users.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-xs text-[#64748B]">
                Showing <span className="font-bold text-[#0F172A]">
                  {Math.min((currentPage - 1) * limit + 1, totalUsers)}
                </span> to <span className="font-bold text-[#0F172A]">
                  {Math.min(currentPage * limit, totalUsers)}
                </span> of <span className="font-bold text-[#0F172A]">
                  {totalUsers.toLocaleString()}
                </span> users
              </div>
              {renderPagination()}
            </div>
          </div>
        )}
      </div>

      {selectedUserForWallet && (
        <AddWalletMoneyModal
          isOpen={!!selectedUserForWallet}
          onClose={() => setSelectedUserForWallet(null)}
          user={selectedUserForWallet}
          onSuccess={(updatedUser, newBalance) => {
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u._id === selectedUserForWallet._id
                  ? {
                      ...u,
                      ...(updatedUser || {}),
                      virtualMoney: {
                        ...(u.virtualMoney || {}),
                        ...(updatedUser?.virtualMoney || {}),
                        balance: newBalance,
                      },
                    }
                  : u
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default AdminUsersList;