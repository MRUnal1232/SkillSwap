const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const {
  getStats,
  getLeaderboard,
  getRecentSessions,
  getUsers,
} = require("../controllers/adminController");

// Every admin route goes through verifyToken THEN adminOnly.
router.use(verifyToken, adminOnly);

router.get("/stats", getStats);
router.get("/leaderboard", getLeaderboard);
router.get("/recent-sessions", getRecentSessions);
router.get("/users", getUsers);

module.exports = router;
