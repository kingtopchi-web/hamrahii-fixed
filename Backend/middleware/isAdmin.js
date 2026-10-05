import { validateField, validateObjectId } from "../utils/validator/validateFields.js";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
    try {
        let token = req?.cookies?.adminAccessToken;

        if (!token && req?.headers?.authorization) {
            token = req.headers.authorization.replace(/^Bearer\s+/i, "").trim();
        }

        if (!token && req?.headers?.["x-access-token"]) {
            token = req.headers["x-access-token"];
        }

        if (!token && req?.headers?.["admin-token"]) {
            token = req.headers["admin-token"];
        }

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized: Please Login",
                error: true,
                success: false
            });
        }

        let data;
        try {
            data = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(401).json({
                message: "Unauthorized: Invalid or expired token",
                error: true,
                success: false
            });
        }

        if (!data || !validateObjectId(data?.adminId, "Invalid Admin id", res, 401)) return;

        const adminUser = await userModel.findOne({ _id: data.adminId, role: "admin" });
        if (!adminUser) {
            return res.status(401).json({
                message: "Unauthorized: Admin privileges required",
                error: true,
                success: false
            });
        }

        req.adminId = data?.adminId;
        req.body = { ...req.body, adminId: data?.adminId };

        next();
    } catch (error) {
        next(error);
    }
}