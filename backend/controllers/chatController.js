const pool = require("../config/db");

// GET chat history between two users
// Only allowed if they have a session together
const getChatHistory = async (req, res) => {
  try {
    const { other_user_id } = req.params;
    const user_id = req.user.id;

    // Verify they have a session together
    const [sessions] = await pool.query(
      `SELECT id FROM sessions
       WHERE (mentor_id = ? AND learner_id = ?) OR (mentor_id = ? AND learner_id = ?)`,
      [user_id, other_user_id, other_user_id, user_id]
    );

    if (sessions.length === 0) {
      return res.status(403).json({ message: "Chat only available between session participants" });
    }

    const [messages] = await pool.query(
      `SELECT cm.*, u.name as sender_name
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE (cm.sender_id = ? AND cm.receiver_id = ?)
          OR (cm.sender_id = ? AND cm.receiver_id = ?)
       ORDER BY cm.timestamp ASC`,
      [user_id, other_user_id, other_user_id, user_id]
    );

    res.json(messages);
  } catch (err) {
    console.error("Chat history error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET list of users I can chat with (users I have sessions with)
const getChatContacts = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [contacts] = await pool.query(
      `SELECT DISTINCT
        CASE WHEN ses.mentor_id = ? THEN ses.learner_id ELSE ses.mentor_id END as contact_id,
        CASE WHEN ses.mentor_id = ? THEN learner.name ELSE mentor.name END as contact_name
       FROM sessions ses
       JOIN users mentor ON ses.mentor_id = mentor.id
       JOIN users learner ON ses.learner_id = learner.id
       WHERE ses.mentor_id = ? OR ses.learner_id = ?`,
      [user_id, user_id, user_id, user_id]
    );

    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getChatHistory, getChatContacts };
