const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:4173"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes (will add step by step)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/skills", require("./routes/skillRoutes"));
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Socket.io setup
const { initSocket } = require("./socket/chat");
initSocket(server);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "SkillSwap API is running" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
