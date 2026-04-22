const pool = require("../config/db");

// CREATE a time slot.
// Mentors pick WHICH skill they're offering during this window.
// Enforces: the mentor must actually "offer" that skill in user_skills.
const createSlot = async (req, res) => {
  try {
    const { skill_id, start_time, end_time } = req.body;
    const user_id = req.user.id;

    if (!skill_id) {
      return res.status(400).json({ message: "Please select a skill for this slot" });
    }
    if (!start_time || !end_time) {
      return res.status(400).json({ message: "Start and end times are required" });
    }
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // Mentor must offer this skill (so they can't open slots for things they don't teach)
    const [offered] = await pool.query(
      "SELECT 1 FROM user_skills WHERE user_id = ? AND skill_id = ? AND type = 'offer' LIMIT 1",
      [user_id, skill_id]
    );
    if (offered.length === 0) {
      return res.status(400).json({
        message: "You can only create slots for skills you offer. Add this skill to your profile first.",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO time_slots (user_id, skill_id, start_time, end_time) VALUES (?, ?, ?, ?)",
      [user_id, skill_id, start_time, end_time]
    );

    res.status(201).json({ message: "Time slot created", slotId: result.insertId });
  } catch (err) {
    console.error("Create slot error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET bookable slots for a specific mentor (joined with skill info).
// Optional ?skill_id=X narrows to slots for that specific skill.
const getMentorSlots = async (req, res) => {
  try {
    const { mentor_id } = req.params;
    const { skill_id } = req.query;

    const params = [mentor_id];
    let where = `ts.user_id = ?
        AND ts.is_booked = FALSE
        AND ts.start_time > NOW()`;

    if (skill_id) {
      where += " AND ts.skill_id = ?";
      params.push(skill_id);
    }

    const [slots] = await pool.query(
      `SELECT ts.id, ts.user_id, ts.skill_id,
              ts.start_time, ts.end_time, ts.is_booked,
              s.skill_name, s.category
         FROM time_slots ts
         JOIN skills s ON s.id = ts.skill_id
        WHERE ${where}
        ORDER BY ts.start_time`,
      params
    );

    res.json(slots);
  } catch (err) {
    console.error("Get mentor slots error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET my slots (for the logged-in mentor to manage).
const getMySlots = async (req, res) => {
  try {
    const [slots] = await pool.query(
      `SELECT ts.id, ts.user_id, ts.skill_id,
              ts.start_time, ts.end_time, ts.is_booked,
              s.skill_name, s.category
         FROM time_slots ts
         JOIN skills s ON s.id = ts.skill_id
        WHERE ts.user_id = ?
        ORDER BY ts.start_time DESC`,
      [req.user.id]
    );
    res.json(slots);
  } catch (err) {
    console.error("Get my slots error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE a slot (only if not booked).
const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const [slot] = await pool.query(
      "SELECT * FROM time_slots WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (slot.length === 0) {
      return res.status(404).json({ message: "Slot not found" });
    }
    if (slot[0].is_booked) {
      return res.status(400).json({ message: "Cannot delete a booked slot" });
    }

    await pool.query("DELETE FROM time_slots WHERE id = ?", [id]);
    res.json({ message: "Slot deleted" });
  } catch (err) {
    console.error("Delete slot error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createSlot, getMentorSlots, getMySlots, deleteSlot };
