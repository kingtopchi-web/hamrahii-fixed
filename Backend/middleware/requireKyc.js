import User from '../models/user.model.js';

export const requireKyc = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                code: "AUTH_REQUIRED",
                message: "Authentication required to perform this action."
            });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                code: "USER_NOT_FOUND",
                message: "User not found."
            });
        }

        if (!user.kyc || user.kyc.status !== 'VERIFIED') {
            const status = user.kyc?.status || 'NOT_SUBMITTED';
            let message = "Please complete Aadhaar KYC verification to use this service.";
            let code = "KYC_REQUIRED";

            if (status === 'PENDING') {
                message = "Your KYC verification is still pending.";
                code = "KYC_PENDING";
            } else if (status === 'REJECTED') {
                message = "Your KYC verification was rejected. Please complete KYC again.";
                code = "KYC_REJECTED";
            }

            return res.status(403).json({
                success: false,
                code,
                message
            });
        }

        // KYC is VERIFIED, attach updated KYC to req if needed, and continue
        req.userKyc = user.kyc;
        next();
    } catch (error) {
        console.error("Error in requireKyc middleware:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while verifying KYC."
        });
    }
};
