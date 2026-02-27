import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./src/lib/db.js";

import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import { app, server } from "./src/lib/socket.js";

// Load `.env` intelligently:
// 1) Try loading from the current working directory (this handles `node index.js` run from repo root)
// 2) If important keys are missing (e.g. when running from `backend` folder), fall back to parent `.env`
dotenv.config();
if (!process.env.MONGODB_URI || !process.env.PORT) {
  dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
}

const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

// app.use(
//   cors({
//     origin: ["http://localhost:5173","https://chatappv2-1-dzy1.onrender.com"],
//     credentials: true,
//   })
// );

// Allow frontend origins (no trailing slashes) and enable credentials for cookies
app.use(
  cors({
    origin: ["http://localhost:5173", "https://chatappv2-1-dzy1.onrender.com"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
