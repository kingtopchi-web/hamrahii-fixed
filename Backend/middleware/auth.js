import jwt from "jsonwebtoken"
import userModel from "../models/user.model.js"
export const auth = async (req, res, next) => {
    try {
        // console.log(req?.cookies , "these are cookies")
        let token = req?.cookies?.accessToken



        if (!token) {
            token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({
                    message: "Please Login",
                    error: true,
                    success: false
                });
            }
            if (token.startsWith("Bearer ")) {
                token = token.slice(7).trim();
            }
        }

        let data;
        try {
            data = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            data = jwt.decode(token);
        }

        if (!data || !data.userId) {
            return res.status(401).json({
                message: "Please Login",
                error: true,
                success: false
            });
        }

        await userModel.findByIdAndUpdate(data.userId, {
            $set: { lastActive: new Date() }
        });

        req.userId = data.userId;
        req.body = { ...req.body, userId: data.userId };
        next();

    } catch (error) {
        next(error)
    }
}