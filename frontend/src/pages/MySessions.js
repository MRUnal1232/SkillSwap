import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const MySessions = () => {
  const { user, refreshUser } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [reviewData, setReviewData] = useState({ session_id: null, rating: 5, comment: "" });

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sessions/my", { withCredentials: true });
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/sessions/${id}/status`, { status }, { withCredentials: true });
      fetchSessions();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  const submitReview = async () => {
    try {
      await axios.post("http://localhost:5000/api/reviews", reviewData, { withCredentials: true });
      setReviewData({ session_id: null, rating: 5, comment: "" });
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  const getStatusClass = (status) => {
    if (status === "completed") return "status-completed";
    if (status === "cancelled") return "status-cancelled";
    return "status-booked";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>My Sessions</h2>
        <p>Track your booked, completed, and cancelled sessions</p>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <p>No sessions yet. Visit the Marketplace to book your first session!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Mentor</th>
                <th>Learner</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{s.skill_name}</td>
                  <td>{s.mentor_name}</td>
                  <td>{s.learner_name}</td>
                  <td>{new Date(s.start_time).toLocaleString()}</td>
                  <td><span className={getStatusClass(s.status)}>{s.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {s.status === "booked" && (
                        <>
                          <button onClick={() => updateStatus(s.id, "completed")} className="btn btn-green btn-xs">
                            Complete
                          </button>
                          <button onClick={() => updateStatus(s.id, "cancelled")} className="btn btn-red btn-xs">
                            Cancel
                          </button>
                        </>
                      )}
                      {s.status === "completed" && s.learner_id === user?.id && (
                        <button onClick={() => setReviewData({ ...reviewData, session_id: s.id })}
                          className="btn btn-outline btn-xs">
                          Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {reviewData.session_id && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Leave a Review</h3>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <select className="form-select" value={reviewData.rating}
                onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)} ({n})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea className="form-textarea" placeholder="Share your experience..."
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button onClick={submitReview} className="btn btn-green btn-sm">Submit Review</button>
              <button onClick={() => setReviewData({ session_id: null, rating: 5, comment: "" })}
                className="btn btn-red btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
