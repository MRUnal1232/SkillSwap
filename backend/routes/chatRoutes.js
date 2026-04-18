const express = require("express");
const router = express.Router();
const { getChatHistory, getChatContacts } = require("../controllers/chatController");
const verifyToken = require("../middleware/auth");

router.get("/contacts", verifyToken, getChatContacts);       // Get chat contacts
router.get("/history/:other_user_id", verifyToken, getChatHistory); // Get chat history

module.exports = router;
