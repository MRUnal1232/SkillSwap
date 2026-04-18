const express = require("express");
const router = express.Router();
const { getUserProfile, addUserSkill, removeUserSkill, getCreditHistory } = require("../controllers/userController");
const verifyToken = require("../middleware/auth");

router.get("/profile/:id", getUserProfile);          // Public: view any profile
router.post("/skills", verifyToken, addUserSkill);    // Protected: add skill to my profile
router.delete("/skills", verifyToken, removeUserSkill); // Protected: remove skill
router.get("/credits", verifyToken, getCreditHistory);  // Protected: my credit history

module.exports = router;
