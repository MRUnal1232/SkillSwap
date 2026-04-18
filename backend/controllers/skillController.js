const pool = require("../config/db");

// GET all skills (for dropdowns and browsing)
const getAllSkills = async (req, res) => {
  try {
    const [skills] = await pool.query("SELECT * FROM skills ORDER BY category, skill_name");
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// SEARCH mentors by skill - the Skill Marketplace
// Learning: SQL JOINs connect multiple tables to get combined data
// This query joins users -> user_skills -> skills to find mentors for a skill
const searchMentors = async (req, res) => {
  try {
    const { skill, category, min_rating } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, s.skill_name, s.category,
             AVG(r.rating) as avg_rating, COUNT(r.id) as total_reviews
      FROM users u
      JOIN user_skills us ON u.id = us.user_id
      JOIN skills s ON us.skill_id = s.id
      LEFT JOIN sessions ses ON ses.mentor_id = u.id
      LEFT JOIN reviews r ON r.session_id = ses.id
      WHERE us.type = 'offer'
    `;
    const params = [];

    if (skill) {
      query += " AND s.skill_name LIKE ?";
      params.push(`%${skill}%`);
    }
    if (category) {
      query += " AND s.category = ?";
      params.push(category);
    }

    query += " GROUP BY u.id, u.name, u.email, s.skill_name, s.category";

    if (min_rating) {
      query += " HAVING avg_rating >= ?";
      params.push(Number(min_rating));
    }

    query += " ORDER BY avg_rating DESC";

    const [mentors] = await pool.query(query, params);
    res.json(mentors);
  } catch (err) {
    console.error("Search mentors error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllSkills, searchMentors };
