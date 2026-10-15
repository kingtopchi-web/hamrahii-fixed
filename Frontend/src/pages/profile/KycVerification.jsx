import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle, Clock, Upload, FileText, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';
import { uploadImage } from '../../services/uploadImage';
import { useSelector } from 'react-redux';

const KycVerification = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();

    const [status, setStatus] = useState('NOT_SUBMITTED');
    const [kycData, setKycData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Form state
    const [documentType, setDocumentType] = useState('Aadhaar Card');
    const [fullName, setFullName] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [dob, setDob] = useState('');
    const [frontFile, setFrontFile] = useState(null);
    const [backFile, setBackFile] = useState(null);
    const [frontPreview, setFrontPreview] = useState(null);
    const [backPreview, setBackPreview] = useState(null);

    const fetchStatus = async (showToast = false) => {
        try {
            if (showToast) setRefreshing(true);
            const res = await Axios.get(api.kyc.status);

            if (res.data.success && res.data.kyc) {
                setStatus(res.data.kyc.status || 'NOT_SUBMITTED');
                setKycData(res.data.kyc);
                if (showToast) toast.info(`Status: ${res.data.kyc.status}`);
            }
        } catch (error) {
            console.error("Error fetching KYC status:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // Prefill name from user profile
    useEffect(() => {
        if (user?.name) {
            setFullName(user.name);
        } else if (user?.firstName) {
            setFullName(`${user.firstName} ${user.lastName || ''}`.trim());
        }
    }, [user]);

    const handleFrontChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFrontFile(file);
            setFrontPreview(URL.createObjectURL(file));
        }
    };

    const handleBackChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setBackFile(file);
            setBackPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmitKyc = async (e) => {
        e.preventDefault();

        if (!fullName.trim()) {
            toast.warning("Please enter your full name as per your document.");
            return;
        }

        if (!documentNumber.trim()) {
            toast.warning("Please enter your document / Aadhaar number.");
            return;
        }

        setSubmitting(true);
        try {
            let frontImageUrl = null;
            let backImageUrl = null;

            if (frontFile) {
                frontImageUrl = await uploadImage(frontFile, "kyc");
            }
            if (backFile) {
                backImageUrl = await uploadImage(backFile, "kyc");
            }

            const payload = {
                documentType,
                documentNumber: documentNumber.trim(),
                fullName: fullName.trim(),
                dob: dob || null,
                frontImage: frontImageUrl,
                backImage: backImageUrl,
            };

            const res = await Axios.post(api.kyc.submit, payload);

            if (res.data.success) {
                toast.success(res.data.message || "KYC submitted successfully. Awaiting Admin verification.");
                setStatus('PENDING');
                setKycData(res.data.kyc);
            }
        } catch (error) {
            console.error("KYC submission error:", error);
            toast.error(error.response?.data?.message || "Failed to submit KYC details.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-12 text-center">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Checking verification status...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 my-6 bg-white rounded-3xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-[#E10600] rounded-2xl">
                        <Shield size={26} />
                    </div>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Identity Verification (KYC)</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Government ID verification for trusted travel</p>
                    </div>
                </div>
                {status === 'PENDING' && (
                    <button
                        onClick={() => fetchStatus(true)}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                    >
                        <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                )}
            </div>

            {/* STATUS: VERIFIED */}
            {status === 'VERIFIED' && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={48} />
                    </div>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                        Verified by Admin
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verified Successfully</h2>
                    <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                        Aapki identity verification complete ho chuki hai. Aap Hamrahii ki sabhi services (Rides, Offer Ride, Parcel) bina kisi rukawat ke use kar sakte hain.
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 border border-gray-200 text-xs sm:text-sm mb-6">
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">Document:</span>
                            <span className="font-semibold text-gray-800">{kycData?.documentType || "Aadhaar Card"}</span>
                        </div>
                        {kycData?.fullName && (
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Verified Name:</span>
                                <span className="font-semibold text-gray-800">{kycData.fullName}</span>
                            </div>
                        )}
                        {kycData?.documentNumber && (
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Document Number:</span>
                                <span className="font-semibold text-gray-800">
                                    **** **** {kycData.documentNumber.slice(-4)}
                                </span>
                            </div>
                        )}
                        {kycData?.verifiedAt && (
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-medium">Verified On:</span>
                                <span className="font-semibold text-gray-800">
                                    {new Date(kycData.verifiedAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-[#E10600] text-white font-bold rounded-xl shadow-lg hover:bg-[#c00500] transition"
                    >
                        Explore Services
                    </button>
                </div>
            )}

            {/* STATUS: PENDING */}
            {status === 'PENDING' && (
                <div className="py-6">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Clock size={44} />
                        </div>
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                            Under Admin Review
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification in Progress</h2>
                        <p className="text-gray-600 text-sm max-w-md mx-auto">
                            Aapki KYC details Admin verification ke liye submit ho chuki hain. Jaise hi Admin approve karenge, aapka account activate ho jayega.
                        </p>
                    </div>

                    <div className="bg-[#FFFBEB] border border-amber-200 rounded-2xl p-5 max-w-lg mx-auto mb-6 text-sm">
                        <div className="flex items-center gap-2 mb-3 text-amber-900 font-bold">
                            <AlertCircle size={18} />
                            <span>Submitted Details</span>
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                            <div className="flex justify-between py-1 border-b border-amber-200/50">
                                <span className="text-gray-500">Document Type:</span>
                                <span className="font-semibold">{kycData?.documentType || "Aadhaar Card"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-amber-200/50">
                                <span className="text-gray-500">Name:</span>
                                <span className="font-semibold">{kycData?.fullName || fullName}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-amber-200/50">
                                <span className="text-gray-500">Document Number:</span>
                                <span className="font-semibold">
                                    {kycData?.documentNumber ? `**** **** ${kycData.documentNumber.slice(-4)}` : "Submitted"}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500">Submitted At:</span>
                                <span className="font-semibold">
                                    {kycData?.submittedAt ? new Date(kycData.submittedAt).toLocaleString() : "Recently"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-4">
                            Verification aamtaur par kuch hi ghanton me complete ho jaati hai.
                        </p>
                        <button
                            onClick={() => fetchStatus(true)}
                            disabled={refreshing}
                            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition text-sm inline-flex items-center gap-2"
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                            <span>Check Approval Status</span>
                        </button>
                    </div>
                </div>
            )}

            {/* STATUS: NOT_SUBMITTED or REJECTED */}
            {(status === 'NOT_SUBMITTED' || status === 'REJECTED') && (
                <div>
                    {status === 'REJECTED' && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="text-sm font-bold text-red-800">KYC Verification Rejected by Admin</h3>
                                <p className="text-xs text-red-700 mt-1">
                                    {kycData?.rejectionReason || "Aapke documents verify nahi ho paye. Kripya sahi aur clear details dobara submit karein."}
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmitKyc} className="space-y-5">
                        {/* Document Type */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Document Type *
                            </label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition"
                            >
                                <option value="Aadhaar Card">Aadhaar Card</option>
                                <option value="PAN Card">PAN Card</option>
                                <option value="Voter ID">Voter ID</option>
                                <option value="Driving License">Driving License</option>
                                <option value="Passport">Passport</option>
                            </select>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Full Name (as per document) *
                            </label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter full name as printed on ID"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition"
                            />
                        </div>

                        {/* Document Number */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                {documentType} Number *
                            </label>
                            <input
                                type="text"
                                required
                                value={documentNumber}
                                onChange={(e) => setDocumentNumber(e.target.value)}
                                placeholder={documentType === 'Aadhaar Card' ? "Enter 12-digit Aadhaar number" : "Enter document ID number"}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                Date of Birth (Optional)
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#E10600] transition"
                            />
                        </div>

                        {/* Document Uploads */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {/* Front Image */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Document Front Photo (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-red-300 transition bg-gray-50 relative">
                                    {frontPreview ? (
                                        <div className="relative">
                                            <img
                                                src={frontPreview}
                                                alt="Front Preview"
                                                className="w-full h-32 object-cover rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setFrontFile(null); setFrontPreview(null); }}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs shadow"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block py-4">
                                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                            <span className="text-xs font-semibold text-gray-600 block">Upload Front Side</span>
                                            <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFrontChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Back Image */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Document Back Photo (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-red-300 transition bg-gray-50 relative">
                                    {backPreview ? (
                                        <div className="relative">
                                            <img
                                                src={backPreview}
                                                alt="Back Preview"
                                                className="w-full h-32 object-cover rounded-xl"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setBackFile(null); setBackPreview(null); }}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs shadow"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block py-4">
                                            <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                            <span className="text-xs font-semibold text-gray-600 block">Upload Back Side</span>
                                            <span className="text-[10px] text-gray-400">PNG, JPG up to 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleBackChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Security notice */}
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                            <FileText size={16} className="shrink-0 mt-0.5" />
                            <span>
                                Aapki details secure hain aur sirf Hamrahii Admin verification ke liye use hongi. Admin verification ke baad aapki KYC verify ho jayegi.
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-[#E10600] text-white font-bold rounded-2xl hover:bg-[#c00500] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Submitting KYC to Admin...</span>
                                </>
                            ) : (
                                <span>Submit KYC for Admin Verification</span>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default KycVerification;
