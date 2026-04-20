import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { api, API_BASE } from "@/lib/api";

const ChatSocketContext = createContext(undefined);

export function useChatSocket() {
  const ctx = useContext(ChatSocketContext);
  if (!ctx)
    throw new Error("useChatSocket must be used within ChatSocketProvider");
  return ctx;
}

const TOAST_TTL_MS = 4500;

export function ChatSocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());
  const contactNamesRef = useRef(new Map());
  const activeContactIdRef = useRef(null);

  const [unreadCounts, setUnreadCounts] = useState({});
  const [toasts, setToasts] = useState([]);
  const [activeContactId, setActiveContactIdState] = useState(null);

  const setActiveContactId = useCallback((id) => {
    activeContactIdRef.current = id;
    setActiveContactIdState(id);
    if (id !== null) {
      setUnreadCounts((prev) => {
        if (!prev[id]) return prev;
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  }, []);

  const clearUnread = useCallback((contactId) => {
    setUnreadCounts((prev) => {
      if (!prev[contactId]) return prev;
      const copy = { ...prev };
      delete copy[contactId];
      return copy;
    });
  }, []);

  const pushToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const item = { ...toast, id };
    setToasts((prev) => [...prev, item].slice(-3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_TTL_MS);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!user) return;
    api
      .get("/chat/contacts")
      .then((res) => {
        contactNamesRef.current.clear();
        res.data.forEach((c) => {
          contactNamesRef.current.set(c.contact_id, c.contact_name);
        });
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setUnreadCounts({});
      setToasts([]);
      return;
    }

    const socket = io(API_BASE, { withCredentials: true });
    socketRef.current = socket;
    socket.emit("join", user.id);

    socket.on("receiveMessage", (msg) => {
      listenersRef.current.forEach((l) => l(msg));

      if (msg.sender_id === user.id) return;
      if (activeContactIdRef.current === msg.sender_id) return;

      setUnreadCounts((prev) => ({
        ...prev,
        [msg.sender_id]: (prev[msg.sender_id] ?? 0) + 1,
      }));

      const sender_name =
        contactNamesRef.current.get(msg.sender_id) ?? "Someone";
      pushToast({
        sender_id: msg.sender_id,
        sender_name,
        message: msg.message,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, pushToast]);

  const sendMessage = useCallback(
    (payload) => {
      if (!user || !socketRef.current) return;
      socketRef.current.emit("sendMessage", {
        sender_id: user.id,
        receiver_id: payload.receiver_id,
        message: payload.message,
      });
    },
    [user]
  );

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <ChatSocketContext.Provider
      value={{
        sendMessage,
        subscribe,
        unreadCounts,
        totalUnread,
        clearUnread,
        activeContactId,
        setActiveContactId,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </ChatSocketContext.Provider>
  );
}
