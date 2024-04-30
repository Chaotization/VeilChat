import {Router} from "express";
import {createUser, getUserInfoByUserId} from "../data/users.js";

const router = Router();

router.route("/").post(async (req, res) => {
    let {
        firstName,
        lastName,
        email,
        password,
        dob,
        gender,
        languages,
        phoneNumber,
        profilePictureLocation,
    } = req.body;
    // if (repeat_password !== password) return res.status(401).json({ message: "Passwords do not match" });
    try {
        const result = await createUser(
            firstName,
            lastName,
            email,
            languages,
            gender,
            dob,
            phoneNumber,
            password,
            profilePictureLocation
        );
        if (result) {
            return res.status(200).json({message: "success"});
        } else {
          return res.status(400).json({message: "Couldn't add user"});
        }

    } catch (e) {
        return res.status(400).json({message: e});
    }
});

export default router;
