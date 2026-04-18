import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io("http://localhost:5000", { withCredentials: true });
    socketRef.current.emit("join", user.id);

    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    axios.get("http://localhost:5000/api/chat/contacts", { withCredentials: true })
      .then((res) => setContacts(res.data));

    return () => { socketRef.current?.disconnect(); };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/history/${contact.contact_id}`,
        { withCredentials: true }
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load chat history");
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;
    socketRef.current.emit("sendMessage", {
      sender_id: user.id,
      receiver_id: selectedContact.contact_id,
      message: newMessage,
    });
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">Messages</div>
        <div className="chat-contacts">
          {contacts.length === 0 ? (
            <p style={{ padding: "16px", color: "var(--text-muted)", fontSize: "13px" }}>
              Book a session to start chatting
            </p>
          ) : (
            contacts.map((c) => (
              <div key={c.contact_id}
                onClick={() => selectContact(c)}
                className={`chat-contact ${selectedContact?.contact_id === c.contact_id ? "active" : ""}`}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent), var(--green))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: "700", color: "#fff", flexShrink: 0
                  }}>
                    {c.contact_name.charAt(0).toUpperCase()}
                  </div>
                  {c.contact_name}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-main">
        {selectedContact ? (
          <>
            <div className="chat-header">
              Chat with {selectedContact.contact_name}
            </div>
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.sender_id === user.id ? "sent" : "received"}`}>
                  <p style={{ margin: 0 }}>{msg.message}</p>
                  <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
              <input className="chat-input" placeholder="Type a message..."
                value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress} />
              <button onClick={sendMessage} className="chat-send-btn">Send</button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            Select a contact to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
