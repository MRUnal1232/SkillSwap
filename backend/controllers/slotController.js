const pool = require("../config/db");

// CREATE a time slot (mentors only create slots for themselves)
const createSlot = async (req, res) => {
  try {
    const { start_time, end_time } = req.body;
    const user_id = req.user.id;

    // Validate that end_time is after start_time
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const [result] = await pool.query(
      "INSERT INTO time_slots (user_id, start_time, end_time) VALUES (?, ?, ?)",
      [user_id, start_time, end_time]
    );

    res.status(201).json({ message: "Time slot created", slotId: result.insertId });
  } catch (err) {
    console.error("Create slot error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET available slots for a specific mentor
const getMentorSlots = async (req, res) => {
  try {
    const { mentor_id } = req.params;

    const [slots] = await pool.query(
      "SELECT * FROM time_slots WHERE user_id = ? AND is_booked = FALSE AND start_time > NOW() ORDER BY start_time",
      [mentor_id]
    );

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET my slots (for the logged-in mentor to manage)
const getMySlots = async (req, res) => {
  try {
    const [slots] = await pool.query(
      "SELECT * FROM time_slots WHERE user_id = ? ORDER BY start_time DESC",
      [req.user.id]
    );
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE a slot (only if not booked)
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
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createSlot, getMentorSlots, getMySlots, deleteSlot };
