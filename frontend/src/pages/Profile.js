import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillType, setSkillType] = useState("offer");
  const [reviews, setReviews] = useState([]);

  const isOwnProfile = user && user.id === Number(id);

  useEffect(() => {
    fetchProfile();
    fetchReviews();
    if (isOwnProfile) {
      axios.get("http://localhost:5000/api/skills").then((res) => setSkills(res.data));
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/profile/${id}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/mentor/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews");
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    try {
      await axios.post(
        "http://localhost:5000/api/users/skills",
        { skill_id: Number(selectedSkill), type: skillType },
        { withCredentials: true }
      );
      fetchProfile();
      setSelectedSkill("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skill_id, type) => {
    try {
      await axios.delete("http://localhost:5000/api/users/skills", {
        data: { skill_id, type },
        withCredentials: true,
      });
      fetchProfile();
    } catch (err) {
      alert("Failed to remove skill");
    }
  };

  if (!profile) return <div className="loading">Loading profile...</div>;

  return (
    <div className="page-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-name">{profile.name}</div>
        <div className="profile-email">{profile.email}</div>

        <div className="profile-stats">
          <div className="stat-box">
            <div className="stat-value green">{profile.credits}</div>
            <div className="stat-label">Credits</div>
          </div>
          <div className="stat-box">
            <div className="stat-value orange">
              {profile.avgRating ? Number(profile.avgRating).toFixed(1) : "N/A"}
            </div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{profile.totalReviews}</div>
            <div className="stat-label">Reviews</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
            <div className="stat-label">Joined</div>
          </div>
        </div>

        {!isOwnProfile && profile.offeredSkills.length > 0 && (
          <Link to={`/book/${id}`} className="btn btn-green btn-sm" style={{ marginTop: "20px" }}>
            Book a Session
          </Link>
        )}
      </div>

      {/* Skills Offered */}
      <div className="section">
        <h3>Skills Offered</h3>
        {profile.offeredSkills.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No skills offered yet</p>
        ) : (
          <div className="skill-tags">
            {profile.offeredSkills.map((s) => (
              <span key={s.id} className="skill-tag">
                {s.skill_name} - {s.category}
                {isOwnProfile && (
                  <button onClick={() => handleRemoveSkill(s.id, "offer")} className="remove-btn">x</button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Skills to Learn */}
      <div className="section">
        <h3>Want to Learn</h3>
        {profile.learnSkills.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No learning goals yet</p>
        ) : (
          <div className="skill-tags">
            {profile.learnSkills.map((s) => (
              <span key={s.id} className="skill-tag learn">
                {s.skill_name} - {s.category}
                {isOwnProfile && (
                  <button onClick={() => handleRemoveSkill(s.id, "learn")} className="remove-btn">x</button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add Skill */}
      {isOwnProfile && (
        <div className="section">
          <h3>Add a Skill</h3>
          <div className="add-skill-row">
            <select className="form-select" value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
              <option value="">Select a skill</option>
              {skills.map((s) => <option key={s.id} value={s.id}>{s.skill_name} ({s.category})</option>)}
            </select>
            <select className="form-select" value={skillType} onChange={(e) => setSkillType(e.target.value)}>
              <option value="offer">I can teach</option>
              <option value="learn">I want to learn</option>
            </select>
            <button onClick={handleAddSkill} className="btn btn-primary btn-sm">Add Skill</button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="section">
        <h3>Reviews</h3>
        {reviews.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No reviews yet</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="review-card">
              <span className="reviewer">{r.reviewer_name}</span>
              <span className="review-skill"> - {r.skill_name}</span>
              <div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              {r.comment && <p className="comment">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
