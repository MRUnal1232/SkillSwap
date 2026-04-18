import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { io, type Socket } from "socket.io-client";
import { Send, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { api, API_BASE } from "@/lib/api";
import type { ChatContact, ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const socket = io(API_BASE, { withCredentials: true });
    socketRef.current = socket;
    socket.emit("join", user.id);
    socket.on("receiveMessage", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    api
      .get<ChatContact[]>("/chat/contacts")
      .then((res) => setContacts(res.data))
      .catch(() => {});

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectContact = async (contact: ChatContact) => {
    setSelectedContact(contact);
    try {
      const res = await api.get<ChatMessage[]>(
        `/chat/history/${contact.contact_id}`
      );
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact || !user || !socketRef.current)
      return;
    socketRef.current.emit("sendMessage", {
      sender_id: user.id,
      receiver_id: selectedContact.contact_id,
      message: newMessage,
    });
    setNewMessage("");
  };

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <AppShell
      title={
        <>
          <span className="font-serif italic font-normal">Messages</span>
        </>
      }
      subtitle="Stay in touch with mentors and learners you've worked with."
    >
      <div className="liquid-glass rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr] h-[calc(100vh-18rem)] min-h-[540px]">
        <aside className="border-b md:border-b-0 md:border-r border-border/40 flex flex-col">
          <div className="px-5 py-4 border-b border-border/40">
            <h2 className="font-medium">Contacts</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {contacts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                Book a session to start chatting.
              </p>
            ) : (
              contacts.map((c) => {
                const active = selectedContact?.contact_id === c.contact_id;
                return (
                  <button
                    key={c.contact_id}
                    onClick={() => selectContact(c)}
                    className={cn(
                      "w-full text-left px-5 py-3.5 flex items-center gap-3 border-b border-border/20 transition-colors",
                      active
                        ? "bg-white/[0.04] text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center text-sm font-medium text-foreground shrink-0">
                      {c.contact_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{c.contact_name}</span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex flex-col min-h-0">
          {selectedContact ? (
            <>
              <header className="px-6 py-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center text-sm font-medium">
                    {selectedContact.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {selectedContact.contact_name}
                    </p>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
                {messages.map((msg, i) => {
                  const own = msg.sender_id === user?.id;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        own
                          ? "ml-auto bg-foreground text-background rounded-br-sm"
                          : "bg-secondary/70 text-foreground rounded-bl-sm"
                      )}
                    >
                      <p className="leading-relaxed">{msg.message}</p>
                      <span
                        className={cn(
                          "block mt-1 text-[10px]",
                          own
                            ? "text-background/60"
                            : "text-muted-foreground"
                        )}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-5 py-4 border-t border-border/40 flex items-center gap-3">
                <Input
                  placeholder="Type a message…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={onKeyPress}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="md">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center px-6">
              <div className="max-w-sm">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full liquid-glass flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-foreground/80" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Select a contact to start chatting.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
