const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { getAllSkills, searchMentors } = require("../controllers/skillController");

router.get("/", getAllSkills);                        // Get all skills
router.get("/mentors", verifyToken, searchMentors);   // Search mentors (excludes self)

module.exports = router;
