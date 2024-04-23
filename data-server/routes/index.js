import userRoutes from "./user.js";
import loginRoute from"./login.js"
import logoutRoute from "./logout.js";
import signupRoute from "./signup.js";
const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/login", loginRoute);
  app.use("/logout", logoutRoute);
  app.use("/signup", signupRoute);
  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route Not found" });
  });
};

export default constructorMethod;
