const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

router.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // في بيانات ناقصة？
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // الإيميل مسجل قبل كده؟
    const existing = await User.findOne({ email: email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // أنشئ اليوزر — والباسورد متشفّر ⚠️
    const user = new User({
      name: name,
      email: email,
      password: await new User().hashPassword(password),
    });

    await user.save();

    // الواجهة مستنية 201 بالظبط
    res.status(201).json({
      success: true,
      message: "Registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // دوّر على اليوزر
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // قارن الباسورد
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // ✅ البيانات صح — اصدر التوكن (زي ما اتعلمت)
    const token = jwt.sign(
      {
        userid: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // ⚠️ الواجهة مستنية token و name بالأسماء دي بالظبط
    res.json({
      success: true,
      token: token,
      name: user.name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
