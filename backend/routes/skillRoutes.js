const express = require("express");
const router = express.Router();
const { getAllSkills, searchMentors } = require("../controllers/skillController");

router.get("/", getAllSkills);           // Get all skills
router.get("/mentors", searchMentors);   // Search mentors by skill/category/rating

module.exports = router;
