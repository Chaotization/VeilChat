import express from "express";
import session from "express-session";
import configRoutes from "./routes/index.js";
import 'dotenv/config';
import cors from "cors";
import mongoose from 'mongoose';

const app = express();

mongoose.connect(process.env.mongoServerUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Could not connect to MongoDB', err));


app.use(cors({
  origin: ['http://localhost:5173']})); 
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
