const pool = require("../config/db");

// ADD a review for a completed session.
// Only the session's learner may review, and only once per session.
// The reviewer is not stored separately — it is always the session's learner_id.
const addReview = async (req, res) => {
  try {
    const { session_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be an integer between 1 and 5" });
    }

    // Session must exist, be completed, and the caller must be its learner.
    const [sessions] = await pool.query(
      "SELECT * FROM sessions WHERE id = ? AND learner_id = ? AND status = 'completed'",
      [session_id, reviewer_id]
    );
    if (sessions.length === 0) {
      return res
        .status(400)
        .json({ message: "You can only review completed sessions you attended as learner" });
    }

    // One review per session (also enforced by the UNIQUE constraint).
    const [existing] = await pool.query(
      "SELECT id FROM reviews WHERE session_id = ?",
      [session_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Session already reviewed" });
    }

    await pool.query(
      "INSERT INTO reviews (session_id, rating, comment) VALUES (?, ?, ?)",
      [session_id, rating, comment ?? null]
    );

    res.status(201).json({ message: "Review submitted" });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET every review a given mentor has received, with reviewer and skill names.
// The reviewer is derived from sessions.learner_id (no reviewer_id column).
const getMentorReviews = async (req, res) => {
  try {
    const { mentor_id } = req.params;

    const [reviews] = await pool.query(
      `SELECT
         r.id,
         r.session_id,
         r.rating,
         r.comment,
         r.created_at,
         learner.name AS reviewer_name,
         s.skill_name
       FROM reviews r
       JOIN sessions ses   ON ses.id = r.session_id
       JOIN users    learner ON learner.id = ses.learner_id
       JOIN skills   s       ON s.id = ses.skill_id
       WHERE ses.mentor_id = ?
       ORDER BY r.created_at DESC`,
      [mentor_id]
    );

    res.json(reviews);
  } catch (err) {
    console.error("Get mentor reviews error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addReview, getMentorReviews };
