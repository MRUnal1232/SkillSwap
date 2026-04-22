const pool = require("../config/db");

// Platform-wide stats: counts, averages, totals.
const getStats = async (_req, res) => {
  try {
    const [[userRow]] = await pool.query("SELECT COUNT(*) AS total FROM users");
    const [[sessionRow]] = await pool.query(
      "SELECT COUNT(*) AS total FROM sessions"
    );
    const [statusRows] = await pool.query(
      "SELECT status, COUNT(*) AS c FROM sessions GROUP BY status"
    );
    const [[reviewRow]] = await pool.query(
      "SELECT COUNT(*) AS total, AVG(rating) AS avg_rating FROM reviews"
    );
    const [[creditsRow]] = await pool.query(
      "SELECT COALESCE(SUM(credits),0) AS total FROM transactions WHERE type = 'earned'"
    );
    const [[slotRow]] = await pool.query(
      "SELECT COUNT(*) AS total FROM time_slots"
    );
    const [[openSlotsRow]] = await pool.query(
      "SELECT COUNT(*) AS total FROM time_slots WHERE is_booked = FALSE AND start_time > NOW()"
    );

    const byStatus = { booked: 0, completed: 0, cancelled: 0 };
    for (const r of statusRows) byStatus[r.status] = r.c;

    res.json({
      users: userRow.total,
      sessions: sessionRow.total,
      sessionsByStatus: byStatus,
      reviews: reviewRow.total,
      avgRating: reviewRow.avg_rating
        ? Number(reviewRow.avg_rating).toFixed(2)
        : null,
      creditsCirculated: creditsRow.total,
      slotsTotal: slotRow.total,
      slotsOpen: openSlotsRow.total,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Top mentors by avg rating (tie-break by review count).
const getLeaderboard = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email,
              AVG(r.rating) AS avg_rating,
              COUNT(r.id)    AS total_reviews,
              COUNT(DISTINCT ses.id) AS sessions_taught
         FROM users u
         LEFT JOIN sessions ses ON ses.mentor_id = u.id
         LEFT JOIN reviews  r   ON r.session_id  = ses.id
        GROUP BY u.id, u.name, u.email
       HAVING total_reviews > 0 OR sessions_taught > 0
        ORDER BY avg_rating DESC, total_reviews DESC, sessions_taught DESC
        LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin leaderboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Latest 10 sessions, with mentor + learner + skill names.
const getRecentSessions = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ses.id, ses.status, ses.start_time, ses.created_at,
              mentor.name  AS mentor_name,
              learner.name AS learner_name,
              sk.skill_name
         FROM sessions ses
         JOIN users  mentor  ON mentor.id  = ses.mentor_id
         JOIN users  learner ON learner.id = ses.learner_id
         JOIN skills sk      ON sk.id      = ses.skill_id
        ORDER BY ses.created_at DESC
        LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin recent sessions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// All users with their current credit balance and role.
const getUsers = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, credits, is_admin, created_at
         FROM users
        ORDER BY created_at DESC`
    );
    res.json(
      rows.map((u) => ({
        ...u,
        is_admin: !!u.is_admin,
      }))
    );
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStats, getLeaderboard, getRecentSessions, getUsers };
