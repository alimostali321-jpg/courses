const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/User");
const courseRoutes = require("./router/course");
const userRoutes = require("./router/users");

const app = express();

app.use(cors());
app.use(express.json());
app.use(courseRoutes);
app.use(userRoutes);

// راوت تجريبي — بس عشان نعرف إن السيرفر عايش
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "pong!" });
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB error ❌", err));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
