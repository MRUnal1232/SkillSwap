const pool = require("../config/db");

const CREDIT_COST = 10; // credits per session

// BOOK a session - the core business logic
// Learning: This uses a DATABASE TRANSACTION to ensure all operations succeed or all fail
// If credits deduction succeeds but slot booking fails, everything rolls back
const bookSession = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { mentor_id, skill_id, slot_id } = req.body;
    const learner_id = req.user.id;

    // Can't book yourself
    if (learner_id === mentor_id) {
      return res.status(400).json({ message: "You cannot book a session with yourself" });
    }

    await conn.beginTransaction();

    // 1. Check slot is available (lock the row to prevent double booking)
    const [slots] = await conn.query(
      "SELECT * FROM time_slots WHERE id = ? AND is_booked = FALSE FOR UPDATE",
      [slot_id]
    );
    if (slots.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Slot is not available" });
    }

    // 2. Verify learner has enough credits
    const [learner] = await conn.query(
      "SELECT credits FROM users WHERE id = ? FOR UPDATE",
      [learner_id]
    );
    if (learner[0].credits < CREDIT_COST) {
      await conn.rollback();
      return res.status(400).json({ message: "Not enough credits" });
    }

    // 3. Deduct credits from learner
    await conn.query(
      "UPDATE users SET credits = credits - ? WHERE id = ?",
      [CREDIT_COST, learner_id]
    );

    // 4. Add credits to mentor
    await conn.query(
      "UPDATE users SET credits = credits + ? WHERE id = ?",
      [CREDIT_COST, mentor_id]
    );

    // 5. Mark slot as booked
    await conn.query(
      "UPDATE time_slots SET is_booked = TRUE WHERE id = ?",
      [slot_id]
    );

    // 6. Create session record
    const slot = slots[0];
    const [result] = await conn.query(
      "INSERT INTO sessions (mentor_id, learner_id, skill_id, slot_id, status) VALUES (?, ?, ?, ?, 'booked')",
      [mentor_id, learner_id, skill_id, slot_id]
    );

    // 7. Record transactions for audit
    await conn.query(
      "INSERT INTO transactions (user_id, amount, type, reason) VALUES (?, ?, 'spent', ?)",
      [learner_id, CREDIT_COST, `Booked session #${result.insertId}`]
    );
    await conn.query(
      "INSERT INTO transactions (user_id, amount, type, reason) VALUES (?, ?, 'earned', ?)",
      [mentor_id, CREDIT_COST, `Session #${result.insertId} booked by learner`]
    );

    await conn.commit();
    res.status(201).json({ message: "Session booked successfully", sessionId: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error("Book session error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};

// GET my sessions (as mentor or learner)
const getMySessions = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [sessions] = await pool.query(
      `SELECT ses.*, s.skill_name,
              mentor.name as mentor_name, learner.name as learner_name,
              ts.start_time, ts.end_time
       FROM sessions ses
       JOIN skills s ON ses.skill_id = s.id
       JOIN users mentor ON ses.mentor_id = mentor.id
       JOIN users learner ON ses.learner_id = learner.id
       JOIN time_slots ts ON ses.slot_id = ts.id
       WHERE ses.mentor_id = ? OR ses.learner_id = ?
       ORDER BY ts.start_time DESC`,
      [user_id, user_id]
    );

    res.json(sessions);
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE session status (complete or cancel)
const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Only mentor or learner of this session can update it
    const [sessions] = await pool.query(
      "SELECT * FROM sessions WHERE id = ? AND (mentor_id = ? OR learner_id = ?)",
      [id, user_id, user_id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    await pool.query("UPDATE sessions SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: `Session marked as ${status}` });
  } catch (err) {
    console.error("Update session error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { bookSession, getMySessions, updateSessionStatus };
