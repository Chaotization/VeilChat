import { Router } from "express";
import {loginUser} from "../data/users.js";
import jwt from "jsonwebtoken";
const router = Router();

router.route("/").post(async (req, res) => {

	let email = req.body.email;
	let password = req.body.password;
	try {
		const user = await loginUser(email, password);

		if (user) {
			const userId = user.uId;
			const accessToken = jwt.sign(
				{ userId },
				(process.env.JWT_SECRET = "someSecret"),
				{ expiresIn: "60m" }
			);

			res.cookie("sessionToken", accessToken, { httpOnly: true });
			return res.status(200).json({ message: "success" });
		} else {
			return res.status(404).json({ message: "Records not found..." });
		}
	} catch (e) {
		return res.status(400).json({ message: e });
	}
});



export default router;
