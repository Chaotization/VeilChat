import express from "express";
import session from "express-session";
import configRoutes from "./routes/index.js";
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true}));
app.use(session({
    name: "AuthCookie",
    secret: "someSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
}));
app.use(express.json());
configRoutes(app);


const PORT = 4000;
app.listen(PORT, () => {
    console.log("Server is running...");
    console.log(`Routes are available at http://localhost:${PORT}`);
});
