import { Router } from "express";
import usersData from "../data/index.js";
import jwt from "jsonwebtoken";
const router = Router();

router.route("/").post(async (req, res) => {
	if (req.session && req.session.loggedIn) {
		return res
			.status(400)
			.json({ message: "User already logged in, logout first" });
	}
	let email = req.body.email;
	let password = req.body.password;

	try {
		const [user, result] = await usersData.loginUser(email, password);
		if (result) {
			const userId = user._id;
			const accessToken = jwt.sign(
				{ userId },
				(process.env.JWT_SECRET = "someSecret"),
				{ expiresIn: "60m" }
			);
			req.session.user = user;
			req.session.loggedIn = true;
			res.cookie("sessionToken", accessToken, { httpOnly: true });
			return res
				.status(200)
				.json({ message: "success", loggedInFromServer: req.session.loggedIn });
		} else {
			return res.status(404).json({ message: "Records not found..." });
		}
	} catch (e) {
		return res.status(400).json({ message: e });
	}
});

router.route("/:uid").post(async (req, res) => {
	try {
		const email = req.body.email;
		const uid = req.params.uid;
		const result = await usersData.addUid(uid, email);

		return res.json(result);
	} catch (e) {
		return res.json(e);
	}
});

export default router;
