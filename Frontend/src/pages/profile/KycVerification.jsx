import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import Axios from '../../services/axios';
import { api } from '../../services/endpoints';

const KycVerification = () => {
    const [status, setStatus] = useState('NOT_SUBMITTED');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await Axios.get(api.kyc.status);

                if (res.data.success && res.data.kyc) {
                    setStatus(res.data.kyc.status || 'NOT_SUBMITTED');
                }
            } catch (error) {
                console.error("Error fetching KYC status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, []);

    const startVerification = async () => {
        setActionLoading(true);
        try {
            const res = await Axios.post(api.kyc.start, {});

            if (res.data.success) {
                toast.success("Verification started. Redirecting to provider...");
                // In a real scenario, you'd open the provider modal here
                // For mock, we'll just set it to PENDING and let them simulate completion
                setStatus('PENDING');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to start verification.");
        } finally {
            setActionLoading(false);
        }
    };

    const mockComplete = async (action) => {
        setActionLoading(true);
        try {
            const res = await Axios.post(api.kyc.mockComplete, { action });

            if (res.data.success) {
                toast.success(action === 'fail' ? "Verification failed." : "Verification successful!");
                setStatus(res.data.kyc.status);
            }
        } catch (error) {
            toast.error("Error completing mock verification.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Checking verification status...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Shield size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Identity Verification</h1>
                    <p className="text-sm text-gray-500">Verify your identity to unlock all Hamrahii services.</p>
                </div>
            </div>

            {status === 'NOT_SUBMITTED' && (
                <div className="text-center py-8">
                    <ShieldAlert size={48} className="mx-auto text-orange-400 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">KYC Not Completed</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Complete your Aadhaar verification to unlock finding rides, offering rides, and parcel services.
                    </p>
                    <button 
                        onClick={startVerification}
                        disabled={actionLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                    >
                        {actionLoading ? 'Starting...' : 'Start Aadhaar Verification'}
                    </button>
                </div>
            )}

            {status === 'PENDING' && (
                <div className="text-center py-8">
                    <Clock size={48} className="mx-auto text-blue-400 mb-4 animate-pulse" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Verification in Progress</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        We are verifying your identity. Please check again shortly.
                    </p>
                    
                    {/* Mock testing buttons since we don't have a real modal */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-bold">Development Options</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => mockComplete('success')} className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium">Simulate Success</button>
                            <button onClick={() => mockComplete('fail')} className="text-sm bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium">Simulate Failure</button>
                        </div>
                    </div>
                </div>
            )}

            {status === 'VERIFIED' && (
                <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">KYC Verified</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Your identity has been successfully verified. You can now use all rides and parcel services.
                    </p>
                </div>
            )}

            {status === 'REJECTED' && (
                <div className="text-center py-8">
                    <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Your KYC verification was rejected. Please ensure your details match your Aadhaar.
                    </p>
                    <button 
                        onClick={startVerification}
                        disabled={actionLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                    >
                        {actionLoading ? 'Starting...' : 'Try Again'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default KycVerification;
