import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldAlert, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Axios from '../services/axios';
import { api } from '../services/endpoints';

const KycGuard = ({ children, fallback, className = "" }) => {
    const user = useSelector((state) => state.user);
    const reduxLoggedIn = !!(user?._id || user?.phone);

    const [isLoggedIn, setIsLoggedIn] = useState(reduxLoggedIn);
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (reduxLoggedIn) {
            setIsLoggedIn(true);
        }
    }, [reduxLoggedIn]);

    useEffect(() => {
        let isMounted = true;

        const fetchStatus = async () => {
            try {
                const res = await Axios.get(api.kyc.status);

                if (isMounted && res.data?.success && res.data?.kyc) {
                    setIsLoggedIn(true);
                    setKycStatus(res.data.kyc.status);
                }
            } catch (error) {
                if (isMounted) {
                    if (error?.response?.status === 401) {
                        setIsLoggedIn(false);
                        setKycStatus(null);
                    } else if (reduxLoggedIn) {
                        setIsLoggedIn(true);
                        setKycStatus('NOT_SUBMITTED');
                    } else {
                        setIsLoggedIn(false);
                        setKycStatus(null);
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchStatus();

        return () => {
            isMounted = false;
        };
    }, [reduxLoggedIn]);

    const handleClickCapture = (e) => {
        // 1. Agar login nahi hai, toh pehle login mange
        if (!isLoggedIn) {
            e.preventDefault();
            e.stopPropagation();
            toast.info("Please login first to continue");
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        // 2. Agar login ho chuka hai, tab check kare ki KYC verified hai ya nahi
        if (kycStatus !== 'VERIFIED') {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
        }
    };

    if (loading) {
        return <div className={`relative ${className}`}>{children}</div>;
    }

    // Agar user logged in hai aur KYC verified hai -> normal render bina kisi restriction ke
    if (isLoggedIn && kycStatus === 'VERIFIED') {
        return <div className={`relative ${className}`}>{children}</div>;
    }

    // Agar user logged in NAHI hai -> normal button bina KYC shield badge ke, click karne par login mange
    if (!isLoggedIn) {
        return (
            <div onClickCapture={handleClickCapture} className={`relative group cursor-pointer ${className}`}>
                {children}
            </div>
        );
    }

    // Agar user logged in HAI lekin KYC verified nahi hai -> KYC restriction badge show kare aur modal open kare
    return (
        <>
            {/* The wrapped element that triggers the modal if unverified */}
            <div onClickCapture={handleClickCapture} className={`relative group cursor-pointer ${className}`}>
                {children}
                <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-red-500 z-10 pointer-events-none" title="KYC Required">
                    <ShieldAlert size={16} />
                </div>
            </div>

            {/* The Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">Verification Required</h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldAlert size={32} className="text-red-500" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2">Aadhaar KYC Mandatory</h4>
                            <p className="text-gray-600 mb-6 text-sm">
                                To ensure the safety of all our users, you must verify your identity before you can offer rides, book rides, or send parcels.
                            </p>
                            
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    navigate('/my-profile/kyc');
                                }}
                                className="w-full bg-[#E10600] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-red-500/20"
                            >
                                Complete KYC Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KycGuard;
