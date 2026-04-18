import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">SkillSwap</Link>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/marketplace" className="nav-link">Marketplace</Link>
            <Link to="/my-sessions" className="nav-link">Sessions</Link>
            <Link to="/my-slots" className="nav-link">Slots</Link>
            <Link to="/chat" className="nav-link">Chat</Link>
            <Link to={`/profile/${user.id}`} className="nav-link">Profile</Link>
            <span className="nav-credits">{user.credits} Credits</span>
            <button onClick={handleLogout} className="nav-btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
