const express = require("express");
const router = express.Router();
const { bookSession, getMySessions, updateSessionStatus } = require("../controllers/sessionController");
const verifyToken = require("../middleware/auth");

router.post("/book", verifyToken, bookSession);         // Book a session
router.get("/my", verifyToken, getMySessions);           // Get my sessions
router.put("/:id/status", verifyToken, updateSessionStatus); // Update status

module.exports = router;
