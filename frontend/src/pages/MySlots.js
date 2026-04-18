import { useState, useEffect } from "react";
import axios from "axios";

const MySlots = () => {
  const [slots, setSlots] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/slots/my", { withCredentials: true });
      setSlots(res.data);
    } catch (err) {
      console.error("Failed to fetch slots");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/slots",
        { start_time: startTime, end_time: endTime },
        { withCredentials: true }
      );
      setStartTime("");
      setEndTime("");
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create slot");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/slots/${id}`, { withCredentials: true });
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete slot");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>My Time Slots</h2>
        <p>Manage your availability for mentorship sessions</p>
      </div>

      <div className="slot-form">
        <h3>Create New Slot</h3>
        <form onSubmit={handleCreate}>
          <div className="slot-form-row">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="datetime-local" className="form-input" value={startTime}
                onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="datetime-local" className="form-input" value={endTime}
                onChange={(e) => setEndTime(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: "140px" }}>
              Create Slot
            </button>
          </div>
        </form>
      </div>

      {slots.length === 0 ? (
        <div className="empty-state">
          <p>No time slots created yet. Create one above to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id}>
                  <td>{new Date(slot.start_time).toLocaleString()}</td>
                  <td>{new Date(slot.end_time).toLocaleString()}</td>
                  <td>
                    <span className={slot.is_booked ? "status-booked" : "status-available"}>
                      {slot.is_booked ? "Booked" : "Available"}
                    </span>
                  </td>
                  <td>
                    {!slot.is_booked && (
                      <button onClick={() => handleDelete(slot.id)} className="btn btn-red btn-xs">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MySlots;
