import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const BookSession = () => {
  const { mentorId } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [mentorProfile, setMentorProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/users/profile/${mentorId}`)
      .then((res) => setMentorProfile(res.data));
    axios.get(`http://localhost:5000/api/slots/mentor/${mentorId}`)
      .then((res) => setSlots(res.data));
  }, [mentorId]);

  const handleBook = async () => {
    if (!selectedSlot || !selectedSkill) {
      return alert("Please select a skill and time slot");
    }
    try {
      await axios.post("http://localhost:5000/api/sessions/book",
        { mentor_id: Number(mentorId), skill_id: Number(selectedSkill), slot_id: Number(selectedSlot) },
        { withCredentials: true }
      );
      await refreshUser();
      navigate("/my-sessions");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  if (!mentorProfile) return <div className="loading">Loading...</div>;

  return (
    <div className="book-container">
      <div className="page-header" style={{ textAlign: "center" }}>
        <h2>Book a Session</h2>
        <p>with {mentorProfile.name}</p>
      </div>

      <div className="book-info">
        <div>
          <div className="stat-value green">{user?.credits}</div>
          <div className="stat-label">Your Credits</div>
        </div>
        <div>
          <div className="stat-value orange">10</div>
          <div className="stat-label">Session Cost</div>
        </div>
        <div>
          <div className="stat-value">
            {mentorProfile.avgRating ? Number(mentorProfile.avgRating).toFixed(1) : "N/A"}
          </div>
          <div className="stat-label">Mentor Rating</div>
        </div>
      </div>

      <div className="card" style={{ cursor: "default" }}>
        <div className="form-group">
          <label className="form-label">Select Skill</label>
          <select className="form-select" value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
            <option value="">Choose a skill to learn</option>
            {mentorProfile.offeredSkills.map((s) => (
              <option key={s.id} value={s.id}>{s.skill_name} ({s.category})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Select Time Slot</label>
          {slots.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No available slots for this mentor</p>
          ) : (
            <select className="form-select" value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)}>
              <option value="">Choose a time slot</option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
                </option>
              ))}
            </select>
          )}
        </div>

        <button onClick={handleBook} className="btn btn-green" style={{ marginTop: "8px" }}>
          Confirm Booking - 10 Credits
        </button>
      </div>
    </div>
  );
};

export default BookSession;
