import { Router } from "express";
import usersData from "../data/users.js";

const router = Router();

router.route("/").post(async (req, res) => {
  let {
    first_name,
    last_name,
    user_name,
    email,
    password,
    repeat_password,
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
      city,
      state,
      country
    );
    if (result) {
      return res.redirect("/login");
    } else {
      throw "Couldn't add user";
    }

  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

export default router;
