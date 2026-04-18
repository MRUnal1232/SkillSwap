const pool = require("../config/db");

// ADD a review for a completed session
const addReview = async (req, res) => {
  try {
    const { session_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;

    // Verify session exists and is completed
    const [sessions] = await pool.query(
      "SELECT * FROM sessions WHERE id = ? AND learner_id = ? AND status = 'completed'",
      [session_id, reviewer_id]
    );

    if (sessions.length === 0) {
      return res.status(400).json({ message: "Can only review completed sessions you attended as learner" });
    }

    // Check if already reviewed (UNIQUE constraint on session_id will also catch this)
    const [existing] = await pool.query(
      "SELECT id FROM reviews WHERE session_id = ?",
      [session_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Session already reviewed" });
    }

    await pool.query(
      "INSERT INTO reviews (session_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)",
      [session_id, reviewer_id, rating, comment]
    );

    res.status(201).json({ message: "Review submitted" });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET reviews for a mentor
const getMentorReviews = async (req, res) => {
  try {
    const { mentor_id } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.*, u.name as reviewer_name, s.skill_name
       FROM reviews r
       JOIN sessions ses ON r.session_id = ses.id
       JOIN users u ON r.reviewer_id = u.id
       JOIN skills s ON ses.skill_id = s.id
       WHERE ses.mentor_id = ?
       ORDER BY r.created_at DESC`,
      [mentor_id]
    );

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addReview, getMentorReviews };
