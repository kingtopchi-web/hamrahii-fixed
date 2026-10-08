import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Wallet,
  Plus,
  History,
  IndianRupee,
  ArrowUp,
  ArrowDown,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Shield,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Clock,
  Filter,
  Download,
  Smartphone,
  Receipt,
  Sparkles,
} from "lucide-react";
import AddMoneyModal from "./AddMoneyModal";
import { toast } from "react-toastify";
import Axios from "../../../services/axios";
import { api } from "../../../services/endpoints";
import { useLocation, useNavigate } from "react-router-dom";

const WalletPage = () => {
  const user = useSelector((state) => state.user);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [virtualTransactions, setVirtualTransactions] = useState([]);
  const [virtualBalance, setVirtualBalance] = useState(0);
  const [showVirtualBalance, setShowVirtualBalance] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCredits: 0,
    totalDebits: 0,
    totalTransactions: 0,
    lastTransactionDate: null,
  });

  const exportToExcel = () => {
    if (transactions.length === 0) return;

    // Prepare data
    const data = transactions.map((transaction) => [
      formatDate(transaction.createdAt),
      getRelativeTime(transaction.createdAt),
      getTransactionDescription(transaction),
      transaction.type.toUpperCase(),
      transaction.amount,
      transaction.status,
      transaction.referenceId || "N/A",
      transaction.balanceAfter || "N/A",
      transaction.source || "Wallet",
    ]);

    // Add headers
    const headers = [
      "Date",
      "Time",
      "Description",
      "Type",
      "Amount",
      "Status",
      "Reference ID",
      "Balance After",
      "Source",
    ];

    // Combine headers and data
    const worksheetData = [headers, ...data];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns
    const maxWidths = headers.map((header, colIndex) => {
      const maxLength = Math.max(
        header.length,
        ...data.map((row) => String(row[colIndex]).length),
      );
      return { wch: Math.min(maxLength, 50) }; // Cap at 50 chars
    });
    worksheet["!cols"] = maxWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction History");

    // Generate file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `transaction_history_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(dataBlob, fileName); // Using file-saver
    // OR without file-saver:
    // const fileName = `transaction_history_${new Date().toISOString().split('T')[0]}.xlsx`;
    // XLSX.writeFile(workbook, fileName);
  };

  // Fetch real wallet transactions
  const fetchTransactions = async () => {
    try {
      const res = await Axios.get(api.user.getTransactionDetails);

      console.log(res, "this is transaction history")

      if (res?.data?.success) {
        const transactionData = res.data.transactions || [];
        setTransactions(transactionData);

        // Calculate stats from real data
        const credits = transactionData
          .filter((t) => t.type === "credit")
          .reduce((sum, t) => sum + t.amount, 0);
        const debits = transactionData
          .filter((t) => t.type === "debit")
          .reduce((sum, t) => sum + t.amount, 0);

        setStats({
          totalCredits: credits,
          totalDebits: debits,
          totalTransactions: transactionData.length,
          lastTransactionDate: transactionData[0]?.createdAt || null,
        });

        setError(null);
      }
    } catch (error) {
      // console.error("Transaction fetch error:", error);
      setError(error?.response?.data?.message || "Failed to load transactions");
      setTransactions([]);
      setStats({
        totalCredits: 0,
        totalDebits: 0,
        totalTransactions: 0,
        lastTransactionDate: null,
      });
    }
  };

  // Fetch virtual transactions
  const handleGetVirtualTransaction = async () => {
    try {
      const res = await Axios.get(api.user.getVirtualTransaction);
      // console.log(res, "this is virtual transactions response");

      if (res?.data?.success) {
        // Set virtual transactions and balance from API response
        setVirtualTransactions(res.data.virtualTransaction?.transactions || []);
        setVirtualBalance(res.data.virtualTransaction?.balance || 0);
      }
    } catch (error) {
      toast.info(
        error?.response?.data?.message || "Failed to load virtual transactions",
      );
      // console.log(error);
      setVirtualTransactions([]);
      setVirtualBalance(0);
    }
  };

  // Fetch both real and virtual transactions
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTransactions(), handleGetVirtualTransaction()]);
    } catch (error) {
      // console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddMoney = async (amount) => {
    try {
      const res = await Axios.post(api.user.addMoney, { amount });

      if (res?.data?.success) {
        toast.success(`₹${amount} added to your wallet successfully!`);

        if (location?.state?.redirect === "prefrences") {
          navigate("/offer-ride", { state: { redirect: "prefrences" } });
        }

        // Refresh both real and virtual transactions
        fetchAllData();
        return true;
      }
    } catch (error) {
      // console.log(error, "this is error");
      toast.error(error?.response?.data?.message || "Failed to add money");
      return false;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: user?.wallet?.currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getTransactionIcon = (type, source) => {
    switch (source?.toLowerCase()) {
      case "upi":
      case "card":
        return "💳";
      case "ride":
        return "🚗";
      case "refund":
        return "↩️";
      case "referral":
        return "👥";
      case "system":
        return "⚙️";
      default:
        return type === "credit" ? "➕" : "➖";
    }
  };

  const getTransactionDescription = (transaction, isVirtual = false) => {
    if (transaction.description) return transaction.description;

    if (isVirtual) {
      if (transaction.source === "referral") {
        return "Referral Bonus";
      } else if (transaction.source === "system") {
        return "System Adjustment";
      }
    }

    if (transaction.type === "credit") {
      return `Added via ${transaction.source || "wallet"}`;
    } else {
      return `Payment via ${transaction.source || "wallet"}`;
    }
  };

  // Calculate total available balance (real + virtual)
  const totalAvailableBalance = user?.wallet?.balance || 0;

  // Loading State (same as before)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-100 border-t-[#E10600] rounded-full animate-spin mb-6"></div>
            <Wallet className="w-10 h-10 text-[#E10600] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Loading Wallet
          </h3>
          <p className="text-gray-500 text-sm">Fetching your wallet details...</p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[var(--bg-surface)] rounded-3xl shadow-card-hover p-8 text-center border border-[var(--border-subtle)]"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <AlertTriangle className="w-8 h-8 text-[#E10600]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white font-bold text-sm rounded-xl hover:shadow-red-glow transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Wallet Summary */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-red-50 text-[#E10600] border border-red-100 rounded-2xl shadow-sm">
                  <Wallet className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-[#111111]">
                    My Wallet
                  </h1>
                  <p className="text-[#555555] text-sm">
                    Manage your balance, ride payments & transactions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-[var(--bg-surface)] hover:bg-gray-50 rounded-2xl border border-[var(--border-subtle)] shadow-sm hover:shadow transition-all disabled:opacity-50"
                title="Refresh Wallet"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-600 ${refreshing ? "animate-spin text-[#E10600]" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Main Wallet Balance Card (Carbon & Brand Red Aesthetic) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-[#1c1c1e] via-[#141414] to-[#0a0a0a] rounded-3xl shadow-card-hover overflow-hidden mb-6 border border-gray-800"
          >
            {/* Ambient Red Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#E10600]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="p-6 md:p-8 text-white relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                        Available Balance
                      </p>
                      <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                        {formatCurrency(totalAvailableBalance)}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-6">
                    <div className="flex items-center gap-2 bg-[var(--bg-surface)]/5 border border-white/10 px-3 py-1.5 rounded-xl">
                      <ArrowUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-gray-300 font-medium">
                        Credits: <strong className="text-emerald-400">{formatCurrency(stats.totalCredits)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--bg-surface)]/5 border border-white/10 px-3 py-1.5 rounded-xl">
                      <ArrowDown className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-gray-300 font-medium">
                        Debits: <strong className="text-red-400">{formatCurrency(stats.totalDebits)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--bg-surface)]/5 border border-white/10 px-3 py-1.5 rounded-xl">
                      <History className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-300 font-medium">
                        {stats.totalTransactions} transactions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:w-48 shrink-0">
                  <button
                    onClick={() => setOpenModal(true)}
                    className="w-full bg-[#E10600] hover:bg-[#C70500] text-white font-bold py-3.5 px-5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-red-glow"
                  >
                    <Plus className="w-5 h-5" />
                    Add Money
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Virtual Balance Card */}
          {showVirtualBalance && virtualBalance > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl shadow-xl overflow-hidden mb-6"
            >
              <div className="p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[var(--bg-surface)]/20 rounded-xl">
                      <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-amber-100 text-sm">
                          Virtual Balance
                        </p>
                        <span className="text-xs bg-[var(--bg-surface)]/30 px-2 py-0.5 rounded-full">
                          Bonus
                        </span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold">
                        {formatCurrency(virtualBalance)}
                      </h3>
                      <p className="text-amber-100 text-sm mt-1">
                        Available for your next rides
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowVirtualBalance(false)}
                    className="p-2 hover:bg-[var(--bg-surface)]/20 rounded-lg transition-colors"
                    title="Hide virtual balance"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>

                {virtualTransactions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-amber-100">
                        From {virtualTransactions.length} virtual transaction
                        {virtualTransactions.length !== 1 ? "s" : ""}
                      </p>
                      <button
                        onClick={() => {
                          const element = document.getElementById(
                            "virtual-transactions",
                          );
                          element?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-sm font-medium hover:underline"
                      >
                        View details ↓
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Stats Cards */}
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--bg-surface)] rounded-2xl shadow-card-subtle p-5 border border-[var(--border-subtle)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <ArrowUp className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Credits
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">
                {formatCurrency(stats.totalCredits)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[var(--bg-surface)] rounded-2xl shadow-card-subtle p-5 border border-[var(--border-subtle)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-100">
                  <ArrowDown className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Debits
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-red-600">
                {formatCurrency(stats.totalDebits)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--bg-surface)] rounded-2xl shadow-card-subtle p-5 border border-[var(--border-subtle)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-[var(--border-subtle)]">
                  <Receipt className="w-4 h-4 text-gray-700" />
                </div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Transactions
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-[#111111]">
                {stats.totalTransactions}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[var(--bg-surface)] rounded-2xl shadow-card-subtle p-5 border border-[var(--border-subtle)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Virtual Bonus
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-amber-600">
                {virtualTransactions.length}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Virtual Transactions Section */}
        {virtualTransactions.length > 0 && (
          <motion.div
            id="virtual-transactions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg overflow-hidden border border-amber-100 mb-6"
          >
            <div className="p-4 md:p-6 border-b border-amber-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Virtual Transactions
                    </h2>
                    <p className="text-sm text-gray-600">
                      Bonus credits from referrals and promotions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-amber-100 text-amber-700 text-xs md:text-sm font-medium px-3 py-1.5 rounded-full">
                    {virtualTransactions.length} transaction
                    {virtualTransactions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Virtual Transaction List */}
            <div className="divide-y divide-amber-100">
              {virtualTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 md:p-6 hover:bg-[var(--bg-surface)]/50 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`p-3 rounded-xl flex-shrink-0 ${
                          transaction.type === "credit"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <span className="text-xl">
                          {getTransactionIcon(
                            transaction.type,
                            transaction.source,
                          )}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {getTransactionDescription(transaction, true)}
                          </h4>
                          <div
                            className={`flex items-center gap-1 font-semibold ${
                              transaction.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "credit" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            )}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              Virtual
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {transaction.source}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {getRelativeTime(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:w-auto">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium self-start ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {transaction.status === "completed" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {transaction.status}
                        </div>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 md:p-6 border-t border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Note:</span> Virtual
                      balance can be used for rides but cannot be withdrawn. It
                      will be deducted first when making payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Real Transaction History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[var(--bg-surface)] rounded-2xl shadow-lg overflow-hidden border border-[var(--border-subtle)]"
        >
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-[var(--border-subtle)] bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <History className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    Real Transaction History
                  </h2>
                  <p className="text-sm text-gray-600">
                    All your actual wallet transactions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {transactions.length > 0 && (
                  <>
                    <button
                      onClick={exportToExcel}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export 
                    </button>
                  </>
                )}
                <span className="bg-purple-100 text-purple-700 text-xs md:text-sm font-medium px-3 py-1.5 rounded-full">
                  {transactions.length}{" "}
                  {transactions.length === 1 ? "transaction" : "transactions"}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div>
            <AnimatePresence>
              {transactions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No real transactions found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by adding money to your wallet
                  </p>
                  <button
                    onClick={() => setOpenModal(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Money
                  </button>
                </motion.div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 md:p-6 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Icon and Main Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`p-3 rounded-xl flex-shrink-0 ${
                              transaction.type === "credit"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            <span className="text-xl">
                              {getTransactionIcon(
                                transaction.type,
                                transaction.source,
                              )}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {getTransactionDescription(transaction)}
                              </h4>
                              <div
                                className={`flex items-center gap-1 font-semibold ${
                                  transaction.type === "credit"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.type === "credit" ? (
                                  <ArrowUp className="w-4 h-4" />
                                ) : (
                                  <ArrowDown className="w-4 h-4" />
                                )}
                                {formatCurrency(transaction.amount)}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(transaction.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {getRelativeTime(transaction.createdAt)}
                                </span>
                              </div>
                              {transaction.balanceAfter !== undefined && (
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                  Balance:{" "}
                                  {formatCurrency(transaction.balanceAfter)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status and Reference ID */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:w-auto">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium self-start ${
                              transaction.status === "success"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {transaction.status === "success" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {transaction.status}
                            </div>
                          </span>

                          {transaction.referenceId && (
                            <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
                              {transaction.referenceId}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {transactions.length > 0 && (
            <div className="p-4 md:p-6 border-t border-[var(--border-subtle)] bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Tip:</span> Keep a minimum
                      balance for seamless payments. Add more funds when needed.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenModal(true)}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline whitespace-nowrap"
                >
                  Add more funds →
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Money Modal */}
      <AddMoneyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAddMoney={handleAddMoney}
        currency={user?.wallet?.currency || "INR"}
        location={location}
        fetchTransactions={fetchTransactions}
      />
    </div>
  );
};

export default WalletPage;
