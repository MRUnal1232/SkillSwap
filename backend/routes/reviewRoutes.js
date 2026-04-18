const express = require("express");
const router = express.Router();
const { addReview, getMentorReviews } = require("../controllers/reviewController");
const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, addReview);               // Add a review
router.get("/mentor/:mentor_id", getMentorReviews);     // Get mentor reviews

module.exports = router;
