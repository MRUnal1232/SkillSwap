import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Marketplace = () => {
  const [mentors, setMentors] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/skills").then((res) => setSkills(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchMentors(), 500);
    return () => clearTimeout(timer);
  }, [search, category, minRating]);

  const fetchMentors = async () => {
    try {
      const params = {};
      if (search) params.skill = search;
      if (category) params.category = category;
      if (minRating) params.min_rating = minRating;
      const res = await axios.get("http://localhost:5000/api/skills/mentors", { params });
      setMentors(res.data);
    } catch (err) {
      console.error("Failed to fetch mentors");
    }
  };

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Skill Marketplace</h2>
        <p>Discover mentors, learn new skills, and grow your expertise</p>
      </div>

      <div className="filters-bar">
        <input className="form-input" placeholder="Search by skill name..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
          <option value="">Any Rating</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>

      {mentors.length === 0 ? (
        <div className="empty-state">
          <p>No mentors found. Try different filters or check back later.</p>
        </div>
      ) : (
        <div className="card-grid">
          {mentors.map((mentor) => (
            <div key={`${mentor.id}-${mentor.skill_name}`} className="card">
              <h3>{mentor.name}</h3>
              <p className="card-info"><strong>Skill:</strong> {mentor.skill_name}</p>
              <p className="card-info"><strong>Category:</strong> {mentor.category}</p>
              <p className="card-rating">
                {mentor.avg_rating
                  ? "★".repeat(Math.round(Number(mentor.avg_rating))) +
                    "☆".repeat(5 - Math.round(Number(mentor.avg_rating))) +
                    ` ${Number(mentor.avg_rating).toFixed(1)}`
                  : "No ratings yet"
                }
                <span style={{ color: "var(--text-muted)", marginLeft: "6px" }}>
                  ({mentor.total_reviews} reviews)
                </span>
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <Link to={`/profile/${mentor.id}`} className="btn btn-outline btn-sm">View Profile</Link>
                <Link to={`/book/${mentor.id}`} className="btn btn-green btn-sm">Book Session</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
