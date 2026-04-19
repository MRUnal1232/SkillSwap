import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { api, API_BASE } from "@/lib/api";
import type { ChatContact, ChatMessage } from "@/lib/types";

export interface ToastItem {
  id: number;
  sender_id: number;
  sender_name: string;
  message: string;
}

type Listener = (msg: ChatMessage) => void;

interface ChatSocketContextValue {
  sendMessage: (payload: { receiver_id: number; message: string }) => void;
  subscribe: (listener: Listener) => () => void;
  unreadCounts: Record<number, number>;
  totalUnread: number;
  clearUnread: (contactId: number) => void;
  activeContactId: number | null;
  setActiveContactId: (id: number | null) => void;
  toasts: ToastItem[];
  dismissToast: (id: number) => void;
}

const ChatSocketContext = createContext<ChatSocketContextValue | undefined>(
  undefined
);

export function useChatSocket() {
  const ctx = useContext(ChatSocketContext);
  if (!ctx)
    throw new Error("useChatSocket must be used within ChatSocketProvider");
  return ctx;
}

const TOAST_TTL_MS = 4500;

export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const contactNamesRef = useRef<Map<number, string>>(new Map());
  const activeContactIdRef = useRef<number | null>(null);

  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeContactId, setActiveContactIdState] = useState<number | null>(
    null
  );

  const setActiveContactId = useCallback((id: number | null) => {
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

  const clearUnread = useCallback((contactId: number) => {
    setUnreadCounts((prev) => {
      if (!prev[contactId]) return prev;
      const copy = { ...prev };
      delete copy[contactId];
      return copy;
    });
  }, []);

  const pushToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = Date.now() + Math.random();
      const item: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, item].slice(-3));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_TTL_MS);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch contacts once so toasts can show the sender's name.
  useEffect(() => {
    if (!user) return;
    api
      .get<ChatContact[]>("/chat/contacts")
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

    socket.on("receiveMessage", (msg: ChatMessage) => {
      listenersRef.current.forEach((l) => l(msg));

      // Don't notify yourself for messages you sent.
      if (msg.sender_id === user.id) return;

      // If you're currently viewing that chat, no toast / badge.
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

  const sendMessage: ChatSocketContextValue["sendMessage"] = useCallback(
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

  const subscribe: ChatSocketContextValue["subscribe"] = useCallback(
    (listener) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    []
  );

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
