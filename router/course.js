const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}

router.get("/api/courses", (req, res) => {
  Course.find()
    .then((courses) => {
      res.json({
        success: true,
        count: courses.length,
        data: courses,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Error fetching courses",
        error: err,
      });
    });
});

router.post("/api/courses", verifyToken, async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        success: false,
        error: "Title and price are required",
      });
    }

    const course = new Course({
      title: title,
      description: description,
      price: Number(price),
      category: category,
    });

    await course.save();

    // ⚠️ الواجهة مستنية 201 بالظبط
    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* DELETE — حذف كورس (محتاج توكن) */
router.delete("/api/courses/:id", verifyToken, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    res.json({
      success: true,
      message: "Course deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
