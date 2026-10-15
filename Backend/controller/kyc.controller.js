import User from '../models/user.model.js';
import crypto from 'crypto';

// Submit KYC details for Admin verification
export const submitKycDetails = async (req, res) => {
    try {
        const { documentType, documentNumber, fullName, dob, frontImage, backImage } = req.body;

        if (!documentNumber || !documentNumber.trim()) {
            return res.status(400).json({ success: false, message: "Aadhaar / Document number is required." });
        }

        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ success: false, message: "Full Name (as per document) is required." });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.kyc?.status === 'VERIFIED') {
            return res.status(400).json({ success: false, message: "Your KYC is already verified." });
        }

        const reference = crypto.randomUUID();

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    kyc: {
                        status: 'PENDING',
                        documentType: documentType || 'Aadhaar Card',
                        documentNumber: documentNumber.trim(),
                        fullName: fullName.trim(),
                        dob: dob || null,
                        frontImage: frontImage || null,
                        backImage: backImage || null,
                        provider: 'manual_admin',
                        verificationReference: reference,
                        submittedAt: new Date(),
                        verifiedAt: null,
                        rejectionReason: null
                    },
                    isVerified: 'pending'
                }
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "KYC submitted successfully. Awaiting Admin verification.",
            kyc: updatedUser.kyc
        });
    } catch (error) {
        console.error("Error submitting KYC:", error);
        return res.status(500).json({ success: false, message: error.message || "Internal server error." });
    }
};

export const startKycSession = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user.kyc?.status === 'VERIFIED') {
            return res.status(400).json({ success: false, message: "KYC is already verified." });
        }

        const reference = crypto.randomUUID();

        // Update status to PENDING awaiting Admin approval
        await User.findByIdAndUpdate(req.userId, {
            $set: {
                kyc: {
                    ...(user.kyc?.toObject ? user.kyc.toObject() : (user.kyc || {})),
                    status: 'PENDING',
                    provider: 'manual_admin',
                    verificationReference: reference,
                    submittedAt: new Date(),
                    rejectionReason: null
                },
                isVerified: 'pending'
            }
        });

        res.status(200).json({
            success: true,
            message: "KYC verification request submitted. Awaiting Admin review.",
            reference: reference
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
            kyc: user.kyc || { status: 'NOT_SUBMITTED' }
        });
    } catch (error) {
        console.error("Error fetching KYC status:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// Webhook for external provider to call if integrated
export const kycCallback = async (req, res) => {
    try {
        const { reference, status, reason } = req.body;

        const user = await User.findOne({ "kyc.verificationReference": reference });
        if (!user) {
            return res.status(404).json({ success: false, message: "Session not found." });
        }

        if (status === 'VERIFIED') {
            user.kyc.status = 'VERIFIED';
            user.kyc.verifiedAt = new Date();
            user.kyc.rejectionReason = null;
            user.isVerified = 'verified';
        } else if (status === 'REJECTED') {
            user.kyc.status = 'REJECTED';
            user.kyc.rejectionReason = reason || "Verification failed.";
            user.isVerified = 'rejected';
        } else {
            user.kyc.status = 'PENDING';
            user.isVerified = 'pending';
        }

        await user.save();

        res.status(200).json({ success: true, message: "Callback processed successfully." });
    } catch (error) {
        console.error("Error in KYC callback:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
