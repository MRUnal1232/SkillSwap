const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER - Create a new user account
// Learning: bcrypt.hash() converts plain password into a hash that can't be reversed
// Salt rounds (10) = how many times the password is re-hashed for extra security
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with 100 starting credits
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, credits) VALUES (?, ?, ?, 100)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN - Authenticate user and issue JWT token
// Learning: JWT contains user data (id, email) encoded with a secret key
// HTTP-only cookie means JavaScript can't access the token (prevents XSS attacks)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Compare plain password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT token (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send token as HTTP-only cookie (not accessible via JavaScript)
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      sameSite: "lax",
    });

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT - Clear the cookie
const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// GET ME - Return currently logged-in user's info
const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, credits, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// FORGOT PASSWORD - Step 1: Verify email exists, generate reset token
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate a temporary reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { id: users[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // In production you'd send this via email. Here we return it directly.
    res.json({ message: "Reset token generated", resetToken });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD - Step 2: Verify token and set new password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, decoded.id]);

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset token has expired. Please try again." });
    }
    console.error("Reset password error:", err);
    res.status(400).json({ message: "Invalid or expired reset token" });
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
