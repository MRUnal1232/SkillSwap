const pool = require("../config/db");

// GET user profile by ID (public)
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user basic info
    const [users] = await pool.query(
      "SELECT id, name, email, credits, created_at FROM users WHERE id = ?",
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get skills this user offers
    const [offeredSkills] = await pool.query(
      `SELECT s.id, s.skill_name, s.category
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = ? AND us.type = 'offer'`,
      [id]
    );

    // Get skills this user wants to learn
    const [learnSkills] = await pool.query(
      `SELECT s.id, s.skill_name, s.category
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = ? AND us.type = 'learn'`,
      [id]
    );

    // Get average rating as a mentor
    const [ratingResult] = await pool.query(
      `SELECT AVG(r.rating) as avg_rating, COUNT(r.id) as total_reviews
       FROM reviews r
       JOIN sessions ses ON r.session_id = ses.id
       WHERE ses.mentor_id = ?`,
      [id]
    );

    res.json({
      ...users[0],
      offeredSkills,
      learnSkills,
      avgRating: ratingResult[0].avg_rating || 0,
      totalReviews: ratingResult[0].total_reviews || 0,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADD a skill to user profile (offer or learn)
const addUserSkill = async (req, res) => {
  try {
    const { skill_id, type } = req.body;
    const user_id = req.user.id;

    if (!["offer", "learn"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'offer' or 'learn'" });
    }

    await pool.query(
      "INSERT INTO user_skills (user_id, skill_id, type) VALUES (?, ?, ?)",
      [user_id, skill_id, type]
    );

    res.status(201).json({ message: "Skill added to profile" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Skill already added" });
    }
    console.error("Add skill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// REMOVE a skill from user profile
const removeUserSkill = async (req, res) => {
  try {
    const { skill_id, type } = req.body;
    const user_id = req.user.id;

    await pool.query(
      "DELETE FROM user_skills WHERE user_id = ? AND skill_id = ? AND type = ?",
      [user_id, skill_id, type]
    );

    res.json({ message: "Skill removed from profile" });
  } catch (err) {
    console.error("Remove skill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET credit balance and transaction history
const getCreditHistory = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [user] = await pool.query("SELECT credits FROM users WHERE id = ?", [user_id]);
    const [transactions] = await pool.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
      [user_id]
    );

    res.json({ credits: user[0].credits, transactions });
  } catch (err) {
    console.error("Credit history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserProfile, addUserSkill, removeUserSkill, getCreditHistory };
