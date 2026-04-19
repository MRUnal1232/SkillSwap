const pool = require("../config/db");

const CREDIT_COST = 10; // credits per session

// BOOK a session — core business flow.
// All operations run inside one DB transaction so either everything commits
// or everything rolls back (no half-booked sessions, no lost credits).
const bookSession = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { slot_id } = req.body;
    const learner_id = req.user.id;

    if (!slot_id) {
      return res.status(400).json({ message: "Please pick a slot to book" });
    }

    await conn.beginTransaction();

    // 1. Lock and read the slot. Skill and mentor are both derived from it
    //    so there's no chance of a mismatch between what the learner picked
    //    and what the mentor is actually offering.
    const [slots] = await conn.query(
      "SELECT * FROM time_slots WHERE id = ? AND is_booked = FALSE FOR UPDATE",
      [slot_id]
    );
    if (slots.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Slot is not available" });
    }
    const slot = slots[0];
    const mentor_id = slot.user_id;
    const skill_id = slot.skill_id;

    if (learner_id === mentor_id) {
      await conn.rollback();
      return res
        .status(400)
        .json({ message: "You cannot book a session with yourself" });
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

    // 3. Move credits: learner -> mentor
    await conn.query("UPDATE users SET credits = credits - ? WHERE id = ?", [
      CREDIT_COST,
      learner_id,
    ]);
    await conn.query("UPDATE users SET credits = credits + ? WHERE id = ?", [
      CREDIT_COST,
      mentor_id,
    ]);

    // 4. Mark slot as booked
    await conn.query("UPDATE time_slots SET is_booked = TRUE WHERE id = ?", [
      slot_id,
    ]);

    // 5. Create session record (times copied from the slot at booking time)
    const [result] = await conn.query(
      `INSERT INTO sessions
         (mentor_id, learner_id, skill_id, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, 'booked')`,
      [mentor_id, learner_id, skill_id, slot.start_time, slot.end_time]
    );

    // 6. Ledger entries for audit
    await conn.query(
      "INSERT INTO transactions (user_id, credits, type, reason) VALUES (?, ?, 'spent', ?)",
      [learner_id, CREDIT_COST, `Booked session #${result.insertId}`]
    );
    await conn.query(
      "INSERT INTO transactions (user_id, credits, type, reason) VALUES (?, ?, 'earned', ?)",
      [mentor_id, CREDIT_COST, `Session #${result.insertId} booked by learner`]
    );

    await conn.commit();
    res
      .status(201)
      .json({ message: "Session booked successfully", sessionId: result.insertId });
  } catch (err) {
    await conn.rollback();
    console.error("Book session error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    conn.release();
  }
};

// GET sessions where the logged-in user is mentor OR learner.
const getMySessions = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [sessions] = await pool.query(
      `SELECT
         ses.id,
         ses.mentor_id,
         ses.learner_id,
         ses.skill_id,
         ses.start_time,
         ses.end_time,
         ses.status,
         ses.created_at,
         s.skill_name,
         mentor.name  AS mentor_name,
         learner.name AS learner_name
       FROM sessions ses
       JOIN skills s      ON s.id      = ses.skill_id
       JOIN users mentor  ON mentor.id  = ses.mentor_id
       JOIN users learner ON learner.id = ses.learner_id
       WHERE ses.mentor_id = ? OR ses.learner_id = ?
       ORDER BY ses.start_time DESC`,
      [user_id, user_id]
    );

    res.json(sessions);
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE a session's status (complete or cancel).
// Only the mentor or the learner of that session may update it.
const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

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
