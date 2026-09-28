/* =========================
   حارس الأدمن
   لازم يتنده بعد verifyToken
========================= */

module.exports = function (req, res, next) {
  if (!req.userData || !req.userData.isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Admin only!",
    });
  }

  next();
};
