const jwt = require("jsonwebtoken");

// This middleware checks if the user is logged in
// It reads the JWT token from the HTTP-only cookie
// If valid, it attaches user info to req.user so routes can use it
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = verifyToken;
