const { Server } = require("socket.io");
const pool = require("../config/db");

// Learning: Socket.io creates a persistent WebSocket connection
// Unlike HTTP (request-response), WebSocket keeps the connection open
// so messages can be sent/received instantly without refreshing

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:4173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // User joins their personal room (using their user ID)
    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room user_${userId}`);
    });

    // Handle sending a message
    socket.on("sendMessage", async (data) => {
      const { sender_id, receiver_id, message } = data;

      try {
        // Save message to database for persistence
        await pool.query(
          "INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
          [sender_id, receiver_id, message]
        );

        // Send message to receiver's room in real-time
        io.to(`user_${receiver_id}`).emit("receiveMessage", {
          sender_id,
          receiver_id,
          message,
          timestamp: new Date(),
        });

        // Also send back to sender for confirmation
        io.to(`user_${sender_id}`).emit("receiveMessage", {
          sender_id,
          receiver_id,
          message,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("Socket message error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = { initSocket };
