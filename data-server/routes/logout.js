import { Router } from "express";
import {logoutUser} from "../data/users.js";
import jwt from "jsonwebtoken";

const router = Router();

router.route("/").post(async (req, res) => {
    try {

        const result = await logoutUser(req.body.email, req.body.uid);
        if (!result.logoutUser) {
            throw new Error("Logout process failed unexpectedly.");
        }
        res.status(200).json({ message: "Logged out successfully." });
    } catch (e) {
        console.error(e);
            res.status(400).json({ message: "User can't be logged out, sign in first." });
        }
});

export default router;