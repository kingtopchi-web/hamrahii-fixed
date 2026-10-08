import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';
import Axios from '../services/axios';
import { api } from '../services/endpoints';

const KycGuard = ({ children, fallback }) => {
    const [kycStatus, setKycStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await Axios.get(api.kyc.status);

                if (res.data.success && res.data.kyc) {
                    setKycStatus(res.data.kyc.status);
                }
            } catch (error) {
                console.error("Error fetching KYC status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const handleClickCapture = (e) => {
        if (kycStatus !== 'VERIFIED') {
            e.preventDefault();
            e.stopPropagation();
            setShowModal(true);
        }
    };

    if (loading) {
        return <div className="opacity-50 pointer-events-none">{children}</div>;
    }

    if (kycStatus === 'VERIFIED') {
        return <>{children}</>;
    }

    return (
        <>
            {/* The wrapped element that triggers the modal if unverified */}
            <div onClickCapture={handleClickCapture} className="relative group cursor-pointer">
                {children}
                <div className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm text-red-500 z-10" title="KYC Required">
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
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-200"
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
