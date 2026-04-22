const pool = require("../config/db");

// Must run AFTER verifyToken. Looks up is_admin fresh from the DB so
// we can't be fooled by a stale JWT payload.
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const [rows] = await pool.query(
      "SELECT is_admin FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0 || !rows[0].is_admin) {
      return res.status(403).json({ message: "Admins only" });
    }
    next();
  } catch (err) {
    console.error("adminOnly middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminOnly;
