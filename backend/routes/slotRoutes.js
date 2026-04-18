const express = require("express");
const router = express.Router();
const { createSlot, getMentorSlots, getMySlots, deleteSlot } = require("../controllers/slotController");
const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, createSlot);              // Create a new slot
router.get("/my", verifyToken, getMySlots);             // Get my slots
router.get("/mentor/:mentor_id", getMentorSlots);       // Get available slots for a mentor
router.delete("/:id", verifyToken, deleteSlot);         // Delete a slot

module.exports = router;
