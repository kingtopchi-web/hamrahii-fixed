import User from '../models/user.model.js';
import crypto from 'crypto';

// This is a mocked provider abstraction.
// In production, this would call a real Aadhaar KYC provider API.
export const startKycSession = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.kyc?.status === 'VERIFIED') {
            return res.status(400).json({ success: false, message: "KYC is already verified." });
        }

        // Mock generating a session reference
        const reference = crypto.randomUUID();

        // Update status to PENDING using findByIdAndUpdate to avoid validation errors on other fields
        await User.findByIdAndUpdate(req.userId, {
            $set: {
                kyc: {
                    status: 'PENDING',
                    provider: 'mock_aadhaar_provider',
                    verificationReference: reference,
                    rejectionReason: null
                }
            }
        });

        // In a real scenario, you would return a session URL or token for the frontend to open
        res.status(200).json({
            success: true,
            message: "KYC session started.",
            reference: reference,
            // For testing purposes, we provide a mock webhook url.
            // In reality the user completes this in a provider modal.
        });
    } catch (error) {
        console.error("Error starting KYC session:", error);
        res.status(500).json({ success: false, message: error.message || "Internal server error." });
    }
};

export const getKycStatus = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({
            success: true,
            kyc: user.kyc
        });
    } catch (error) {
        console.error("Error fetching KYC status:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// Webhook for provider to call
export const kycCallback = async (req, res) => {
    try {
        const { reference, status, reason } = req.body; // Mock payload

        // In production:
        // 1. Verify webhook signature (e.g. HMAC with KYC_WEBHOOK_SECRET)
        // 2. Validate payload

        const user = await User.findOne({ "kyc.verificationReference": reference });
        if (!user) {
            return res.status(404).json({ success: false, message: "Session not found." });
        }

        if (status === 'VERIFIED') {
            user.kyc.status = 'VERIFIED';
            user.kyc.verifiedAt = new Date();
            user.kyc.rejectionReason = null;
        } else if (status === 'REJECTED') {
            user.kyc.status = 'REJECTED';
            user.kyc.rejectionReason = reason || "Verification failed by provider.";
        } else {
            user.kyc.status = 'PENDING';
        }

        await user.save();

        res.status(200).json({ success: true, message: "Callback processed successfully." });
    } catch (error) {
        console.error("Error in KYC callback:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// FOR MOCK TESTING PURPOSES ONLY - allows frontend to simulate completion since there's no real provider modal
export const mockCompleteKyc = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.kyc?.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: "No pending session." });
        }

        // Simulate success or fail based on body
        const { action } = req.body; 

        if (action === 'fail') {
             await User.findByIdAndUpdate(req.userId, {
                 $set: {
                     "kyc.status": 'REJECTED',
                     "kyc.rejectionReason": "Name mismatch on Aadhaar."
                 }
             });
        } else {
             await User.findByIdAndUpdate(req.userId, {
                 $set: {
                     "kyc.status": 'VERIFIED',
                     "kyc.verifiedAt": new Date(),
                     "kyc.rejectionReason": null
                 }
             });
        }

        const updatedUser = await User.findById(req.userId);

        res.status(200).json({ success: true, kyc: updatedUser.kyc });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};
