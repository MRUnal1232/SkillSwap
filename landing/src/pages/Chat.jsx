import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useChatSocket } from "@/context/ChatSocketContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { user } = useAuth();
  const {
    sendMessage,
    subscribe,
    unreadCounts,
    setActiveContactId,
  } = useChatSocket();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api
      .get("/chat/contacts")
      .then((res) => setContacts(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedContact || !user) return;
    const off = subscribe((msg) => {
      const belongsToThread =
        (msg.sender_id === selectedContact.contact_id &&
          msg.receiver_id === user.id) ||
        (msg.sender_id === user.id &&
          msg.receiver_id === selectedContact.contact_id);
      if (belongsToThread) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return off;
  }, [selectedContact, user, subscribe]);

  useEffect(() => {
    setActiveContactId(selectedContact?.contact_id ?? null);
    return () => setActiveContactId(null);
  }, [selectedContact, setActiveContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      const res = await api.get(`/chat/history/${contact.contact_id}`);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedContact) return;
    sendMessage({
      receiver_id: selectedContact.contact_id,
      message: newMessage.trim(),
    });
    setNewMessage("");
  };

  const onKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
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
                const unread = unreadCounts[c.contact_id] ?? 0;
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
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center text-sm font-medium text-foreground">
                        {c.contact_name.charAt(0).toUpperCase()}
                      </div>
                      {unread > 0 && !active && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center leading-none">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                    <span className="truncate flex-1">{c.contact_name}</span>
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
                <Button onClick={handleSend} size="md">
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
