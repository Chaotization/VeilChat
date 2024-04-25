import { Router } from "express";
import usersData from "../data/index.js";

const router = Router();

router.route("/").post(async (req, res) => {
  let {
    first_name,
    last_name,
    user_name,
    email,
    password,
    repeat_password,
    dob,
    gender,
    city,
    state,
    country,
  } = req.body;
  if (repeat_password !== password) throw "Passwords do not match";

  try {
    const result = await usersData.addUser(
      first_name,
      last_name,
      user_name,
      email,
      password,
      dob,
      gender,
      city,
      state,
      country
    );
    if (result) {
      return res.status(200).json({ message: "success" });
    } else {
      throw "Couldn't add user";
    }

  } catch (e) {
    return res.status(400).json({ message: e });
  }
});

export default router;
