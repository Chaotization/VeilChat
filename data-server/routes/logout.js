import { Router } from "express";
import {loginUser, logoutUser} from "../data/users.js";

const router = Router();

router.route("/").get(async (req, res) => {
    if (req.session) {
        req.session.loggedIn = false;
        await logoutUser(req.session.user.userId);
        console.log()
        return res.status(200).json({"message": "logged out"})

    } else {
        res.status(400).json({"message": "User not logged in"})
    }
});

export default router;