const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, forgotPassword, resetPassword } = require("../controllers/authController");
const verifyToken = require("../middleware/auth");

// Public routes (no login required)
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected route (login required)
router.get("/me", verifyToken, getMe);

module.exports = router;
