import express from "express";
import session from "express-session";
const app = express();
import configRoutes from "./routes/index.js";

app.use(
  session({
    name: "AuthCookie",
    secret: "some secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());
configRoutes(app);
app.listen(4000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:4000");
});
