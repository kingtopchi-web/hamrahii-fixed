import React, { useState } from "react";
import { X, Coins, PlusCircle, Loader, CheckCircle, Gift, Info } from "lucide-react";
import { toast } from "react-toastify";
import Axios from "../../../services/axios";
import { api } from "../../../services/api";

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000];

const AddWalletMoneyModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const currentVirtualBalance = Number(user.virtualMoney?.balance || 0);
  const currentWalletBalance = Number(user.wallet?.balance || 0);
  const numericAmount = Number(amount) || 0;
  const newVirtualBalance = currentVirtualBalance + numericAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!note || !note.trim()) {
      toast.error("Please enter a reason or note (Mandatory)");
      return;
    }

    try {
      setLoading(true);
      const res = await Axios.post(api.user.addWalletMoney, {
        targetUserId: user._id,
        amount: numericAmount,
        note: note.trim(),
      });

      if (res.data?.success) {
        toast.success(res.data.message || `₹${numericAmount} Virtual Money added successfully!`);
        if (onSuccess) {
          onSuccess(res.data.user, res.data.newBalance);
        }
        onClose();
        setAmount("");
        setNote("");
      } else {
        toast.error(res.data?.message || "Failed to add virtual money");
      }
    } catch (err) {
      console.error("Error adding virtual money:", err);
      toast.error(err.response?.data?.message || "Failed to add virtual money. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const userName = user.firstName 
    ? `${user.firstName} ${user.lastName || ""}`.trim() 
    : (user.name || user.phone || "User");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-md overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFFFFF]/20 flex items-center justify-center backdrop-blur-sm">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Add Virtual Money</h3>
              <p className="text-xs text-purple-200 truncate max-w-[240px]">
                Target: <span className="font-semibold text-white">{userName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Balance Preview Card */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-center">
            <div>
              <p className="text-[11px] text-purple-700 font-medium">Virtual Balance</p>
              <p className="text-base font-bold text-[#0F172A] mt-0.5">₹{currentVirtualBalance.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <PlusCircle className="w-4 h-4 text-purple-600 mb-0.5" />
              <p className="text-xs font-bold text-purple-600">
                +₹{numericAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-[#FFFFFF] rounded-lg p-1.5 border border-purple-200 shadow-xs">
              <p className="text-[11px] text-purple-700 font-semibold">New Virtual</p>
              <p className="text-base font-extrabold text-purple-700 mt-0.5">₹{newVirtualBalance.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* Context Notice */}
          <div className="flex items-start gap-2 p-2.5 bg-[#FFFBEB]/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed">
            <Info className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <p>
              Virtual money is promotional credits that provide up to a <strong>20% discount</strong> on ride creation and bookings.
              <span className="block mt-0.5 text-[11px] text-[#64748B]">
                Current Real Wallet: ₹{currentWalletBalance.toLocaleString("en-IN")} (unaffected)
              </span>
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              Virtual Amount to Add (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="Enter amount (e.g. 500)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-base font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all"
                autoFocus
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              <span className="text-[11px] text-[#94A3B8] font-medium mr-1">Quick:</span>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    numericAmount === amt
                      ? "bg-purple-50 text-purple-700 border-purple-600"
                      : "bg-[#F8FAFC] hover:bg-gray-200 text-[#0F172A] border-[#E2E8F0]"
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Mandatory Note / Reason */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Reason / Note <span className="text-purple-600 font-bold">* (Mandatory)</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter mandatory reason (e.g. Promotional credits, goodwill bonus)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
              className={`w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-xs text-[#0F172A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all ${
                !note.trim() && numericAmount > 0 
                  ? "border-amber-300 focus:border-amber-400" 
                  : "border-[#E2E8F0] focus:border-purple-600"
              }`}
            />
            {!note.trim() && numericAmount > 0 && (
              <p className="text-[11px] text-[#F59E0B] mt-1 font-medium">
                * Please enter a reason to proceed
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-[#F8FAFC] hover:bg-gray-200 text-[#0F172A] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || numericAmount <= 0 || !note.trim()}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                loading || numericAmount <= 0 || !note.trim()
                  ? "bg-gray-200 text-[#94A3B8] cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-md"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Add ₹{numericAmount > 0 ? numericAmount.toLocaleString("en-IN") : 0} Virtual</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWalletMoneyModal;
