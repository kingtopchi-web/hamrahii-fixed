import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CreditCard, CheckCircle2, Coins, AlertTriangle, AlertCircle, PlusCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Axios from "../../services/axios";
import { api } from "../../services/endpoints";
import { setUserDetails } from "../../store/userReducer";

const PaymentPopup = ({
  onClose,
  onConfirm,
  amount = 0,
  isSubmitting,
  isVirtualMoneyUsed,
  setIsVirtualMoneyUsed,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const virtualMoneyBalance = Number(user?.virtualMoney?.balance || 0);
  const walletBalance = Number(user?.wallet?.balance || 0);

  // Always fetch latest authoritative user & wallet details on mount
  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const res = await Axios.post(api.user.getFullDetails);
        if (res?.data?.success && res?.data?.user) {
          dispatch(setUserDetails(res.data.user));
        }
      } catch (err) {
        console.error("Failed to refresh user wallet balance:", err);
      }
    };
    fetchLatestUser();
  }, [dispatch]);
  
  // First ride rule: ₹250 minimum balance is mandatory for the user's first ride.
  const isFirstRide = user?.isFirstRide !== false;
  const MINIMUM_BALANCE_REQUIRED = 250;
  const isBelowMinimumBalance = isFirstRide && walletBalance < MINIMUM_BALANCE_REQUIRED;
  const deficitAmount = Math.max(0, MINIMUM_BALANCE_REQUIRED - walletBalance);
  
  const numericAmount = Math.max(0, Math.round(Number(amount) || 0));

  // Calculate 20% of amount for virtual money discount
  const TWENTY_PERCENT = Math.round(numericAmount * 0.2);
  
  // Check if virtual money has enough for 20% discount
  const canUseVirtualMoney = virtualMoneyBalance >= TWENTY_PERCENT && TWENTY_PERCENT > 0;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  // Calculate deductions
  const calculateDeductions = () => {
    let virtualDeducted = 0;
    let walletDeducted = numericAmount;
    
    if (isVirtualMoneyUsed && canUseVirtualMoney) {
      virtualDeducted = TWENTY_PERCENT;
      walletDeducted = Math.max(0, numericAmount - TWENTY_PERCENT);
    }
    
    const finalAmount = walletDeducted;

    return {
      original: numericAmount,
      twentyPercent: TWENTY_PERCENT,
      virtualDeducted: virtualDeducted,
      walletDeducted: walletDeducted,
      final: finalAmount,
      remainingWallet: walletBalance - walletDeducted,
      remainingVirtual: virtualMoneyBalance - virtualDeducted,
      canUseVirtualMoney: canUseVirtualMoney,
    };
  };

  const amountDetails = calculateDeductions();

  // Handle toggle - only allow if virtual money is sufficient
  const handleToggle = () => {
    if (canUseVirtualMoney) {
      setIsVirtualMoneyUsed(!isVirtualMoneyUsed);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm"
        >
          <div className="bg-[var(--bg-surface)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-subtle)]">

            {/* HEADER */}
            <div className="p-5 bg-gradient-to-r from-[#E10600] to-[#FF3B30]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)]/20 backdrop-blur-sm flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Ride Payment</h2>
                    <p className="text-xs text-white/80">Complete to publish your ride</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 bg-[var(--bg-surface)]/20 rounded-full hover:bg-[var(--bg-surface)]/30 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-4">

              {/* MAIN AMOUNT DISPLAY */}
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Ride Amount</div>
                <div className="text-3xl font-bold text-gray-800">{formatCurrency(numericAmount)}</div>
              </div>

              {/* VIRTUAL MONEY DISCOUNT OPTION */}
              {numericAmount > 0 && (
                <div className={`p-3 rounded-lg border ${canUseVirtualMoney ? 'bg-amber-50 border-amber-200' : 'bg-gray-100 border-gray-300'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${canUseVirtualMoney ? 'bg-amber-100' : 'bg-gray-200'}`}>
                        <Coins className={`w-4 h-4 ${canUseVirtualMoney ? 'text-amber-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">Get 20% Discount</div>
                        <div className="text-xs text-gray-600">
                          Use virtual money: {formatCurrency(virtualMoneyBalance)} available
                        </div>
                      </div>
                    </div>
                    
                    {/* TOGGLE */}
                    <div
                      onClick={handleToggle}
                      className={`relative inline-flex items-center h-6 w-11 cursor-pointer transition-opacity ${!canUseVirtualMoney ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isVirtualMoneyUsed && canUseVirtualMoney}
                        onChange={handleToggle}
                        disabled={!canUseVirtualMoney}
                        className="sr-only"
                      />
                      <span className={`
                        absolute inset-0 rounded-full transition-colors duration-200
                        ${isVirtualMoneyUsed && canUseVirtualMoney ? 'bg-green-500' : 'bg-gray-300'}
                      `} />
                      <span className={`
                        absolute left-0.5 top-0.5 bg-[var(--bg-surface)] w-5 h-5 rounded-full
                        transition-transform duration-200 transform
                        ${isVirtualMoneyUsed && canUseVirtualMoney ? 'translate-x-5' : ''}
                        shadow-sm
                      `} />
                    </div>
                  </div>
                  
                  {canUseVirtualMoney ? (
                    <>
                      {isVirtualMoneyUsed ? (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          You save {formatCurrency(TWENTY_PERCENT)}! Wallet pays {formatCurrency(numericAmount - TWENTY_PERCENT)} only
                        </div>
                      ) : (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                          Toggle ON to save {formatCurrency(TWENTY_PERCENT)} with virtual money
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                      Need {formatCurrency(TWENTY_PERCENT)} virtual money for discount (have {formatCurrency(virtualMoneyBalance)})
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENT BREAKDOWN */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-gray-700 mb-1">Payment Breakdown</div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ride Amount:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(numericAmount)}</span>
                </div>
                
                {isVirtualMoneyUsed && canUseVirtualMoney && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Virtual Discount:</span>
                    <span className="text-green-600">-{formatCurrency(TWENTY_PERCENT)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-300 pt-2 mt-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-700">Pay from Wallet:</span>
                    <span className="text-blue-600">{formatCurrency(amountDetails.final)}</span>
                  </div>
                </div>
              </div>

              {/* WALLET INFO */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">Wallet Balance</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">
                    Current: <span className="font-bold text-gray-900">{formatCurrency(walletBalance)}</span>
                  </div>
                  <div className="text-xs font-semibold">
                    After payment: <span className={amountDetails.remainingWallet < 0 ? "text-red-600" : "text-gray-900"}>{formatCurrency(amountDetails.remainingWallet)}</span>
                  </div>
                </div>
                
                {walletBalance < amountDetails.final && (
                  <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Insufficient wallet balance! Need {formatCurrency(amountDetails.final - walletBalance)} more.</span>
                  </div>
                )}
              </div>

              {/* ₹250 MINIMUM BALANCE REQUIREMENT ALERT (First Ride) */}
              {isBelowMinimumBalance && (
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-[#E10600] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-800">
                        ₹250 minimum balance required (First Ride)
                      </p>
                      <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                        Your wallet balance is {formatCurrency(walletBalance)}. A minimum balance of ₹250 is required to offer your first ride.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/my-profile/wallet", {
                        state: {
                          redirect: "prefrences",
                          amount: Math.max(250, deficitAmount),
                          type: "first-ride",
                        },
                      });
                    }}
                    className="w-full py-2 px-3 bg-[#E10600] hover:bg-[#c40500] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add {formatCurrency(Math.max(250, deficitAmount))} to Wallet
                  </button>
                </div>
              )}

              {/* INSUFFICIENT BALANCE FOR RIDE PAYMENT */}
              {!isBelowMinimumBalance && walletBalance < amountDetails.final && (
                <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-[#E10600] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-800">
                        Insufficient Balance
                      </p>
                      <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                        Required payment is {formatCurrency(amountDetails.final)}, but your wallet only has {formatCurrency(walletBalance)}.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/my-profile/wallet", {
                        state: {
                          redirect: "prefrences",
                          amount: amountDetails.final - walletBalance,
                          type: "recharge",
                        },
                      });
                    }}
                    className="w-full py-2 px-3 bg-[#E10600] hover:bg-[#c40500] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add {formatCurrency(amountDetails.final - walletBalance)} to Wallet
                  </button>
                </div>
              )}

              {/* PAY BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (isBelowMinimumBalance || walletBalance < amountDetails.final) return;
                  onConfirm({
                    walletDeduction: amountDetails.walletDeducted,
                    virtualDeduction: amountDetails.virtualDeducted,
                    finalAmount: amountDetails.final,
                  });
                }}
                disabled={isSubmitting || isBelowMinimumBalance || walletBalance < amountDetails.final}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  isSubmitting || isBelowMinimumBalance || walletBalance < amountDetails.final
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300 shadow-none"
                    : "bg-gradient-to-r from-[#E10600] to-[#FF3B30] text-white hover:shadow-red-glow font-bold rounded-xl transform hover:-translate-y-0.5 cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  "Processing..."
                ) : isBelowMinimumBalance ? (
                  `₹250 Minimum Balance Required`
                ) : walletBalance < amountDetails.final ? (
                  `Insufficient Balance - Need ${formatCurrency(amountDetails.final)}`
                ) : amountDetails.final === 0 ? (
                  `Publish Ride (Free)`
                ) : isVirtualMoneyUsed && canUseVirtualMoney ? (
                  `Pay ${formatCurrency(amountDetails.final)} (Save ${formatCurrency(TWENTY_PERCENT)})`
                ) : (
                  `Pay ${formatCurrency(amountDetails.final)} from Wallet`
                )}
              </button>

              {/* SECURITY NOTE */}
              <div className="text-center text-xs text-gray-500">
                Payment secured with encryption
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentPopup;