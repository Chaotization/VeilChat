import userRoute from "./user.js";
import loginRoute from"./login.js"
import logoutRoute from "./logout.js";
import signupRoute from "./signup.js";
import searchRoute from "./search.js"
import conversationRoute from './conversations.js'
import friendRequestRoute from './friendRequests.js'
import sendRouter from "./notification.js"
const constructorMethod = (app) => {
  app.use("/user", userRoute);
  app.use("/login", loginRoute);
  app.use("/logout", logoutRoute);
  app.use("/signup", signupRoute);
  app.use("/search", searchRoute)
  app.use("/conversation", conversationRoute);
  app.use("/friendRequests", friendRequestRoute);
  app.use("/sendNotification", sendRouter);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route Not found" });
  });
};

export default constructorMethod;
