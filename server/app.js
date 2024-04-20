import express from "express";
import session from "express-session";
import configRoutes from "./routes/index.js";
import cors from "cors";

const app = express();

app.use(cors({
  origin: ['http://localhost:3000']})); 
app.use(
  session({
    name: "AuthCookie",
    secret: "someSecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());
configRoutes(app);

const PORT = 4000;
app.listen(PORT, () => {
  console.log("Server is running...");
  console.log(`Routes are available at http://localhost:${PORT}`);
});
