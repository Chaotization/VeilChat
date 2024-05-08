import { Router } from "express";
import {logoutUser} from "../data/users.js";
import jwt from "jsonwebtoken";

const router = Router();

router.route("/").get(async (req, res) => {
    try {
        if (!req.cookies.sessionToken) {
            return res
                .status(401)
                .json({ message: "Unauthorized access, sign in first." });
        }
        const decode = jwt.verify(req.cookies.sessionToken, process.env.JWT_SECRET || "someSecret");

        const result = await logoutUser(decode.userId);
        if (!result.logoutUser) {
            throw new Error("Logout process failed unexpectedly.");
        }
        res.clearCookie("sessionToken", {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });
        if (req.session) {
            req.session.destroy(err => {
                if (err) {
                    console.error("Session destruction error:", err);
                    return res.status(500).json({ message: "Failed to destroy session." });
                }
                res.status(200).json({ message: "Logged out successfully." });
            });
        } else {
            res.status(200).json({ message: "Logged out successfully." });
        }
    } catch (e) {
        console.error(e);
        if (e instanceof jwt.JsonWebTokenError) {
            res.status(403).json({ message: "Invalid token, unable to process." });
        } else {
            res.status(400).json({ message: "User can't be logged out, sign in first." });
        }
    }
});

export default router;