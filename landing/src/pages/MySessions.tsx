import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Session, SessionStatus } from "@/lib/types";

type ReviewDraft = {
  session_id: number | null;
  rating: number;
  comment: string;
};

export default function MySessions() {
  const { user, refreshUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [review, setReview] = useState<ReviewDraft>({
    session_id: null,
    rating: 5,
    comment: "",
  });

  const fetchSessions = async () => {
    try {
      const res = await api.get<Session[]>("/sessions/my");
      setSessions(res.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const updateStatus = async (id: number, status: SessionStatus) => {
    try {
      await api.put(`/sessions/${id}/status`, { status });
      fetchSessions();
      refreshUser();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Failed to update"
        : "Failed to update";
      alert(msg);
    }
  };

  const submitReview = async () => {
    try {
      await api.post("/reviews", review);
      setReview({ session_id: null, rating: 5, comment: "" });
      fetchSessions();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Failed to submit review"
        : "Failed to submit review";
      alert(msg);
    }
  };

  return (
    <AppShell
      title={
        <>
          My <span className="font-serif italic font-normal">sessions</span>
        </>
      }
      subtitle="Track your booked, completed, and cancelled sessions."
    >
      {sessions.length === 0 ? (
        <div className="border border-dashed border-border/50 rounded-2xl px-6 py-16 text-center text-muted-foreground">
          No sessions yet. Visit the Marketplace to book your first session.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40 text-xs uppercase tracking-[2px] text-muted-foreground">
                <Th>Skill</Th>
                <Th>Mentor</Th>
                <Th>Learner</Th>
                <Th>Time</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr
                  key={s.id}
                  className={
                    i < sessions.length - 1 ? "border-b border-border/40" : ""
                  }
                >
                  <Td className="font-medium">{s.skill_name}</Td>
                  <Td>{s.mentor_name}</Td>
                  <Td>{s.learner_name}</Td>
                  <Td>{new Date(s.start_time).toLocaleString()}</Td>
                  <Td>
                    <Badge
                      tone={
                        s.status === "completed"
                          ? "default"
                          : s.status === "cancelled"
                            ? "danger"
                            : "outline"
                      }
                    >
                      {s.status}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-2 justify-end">
                      {s.status === "booked" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(s.id, "completed")}
                          >
                            <Check className="w-3.5 h-3.5" />
                            Complete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(s.id, "cancelled")}
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {s.status === "completed" &&
                        s.learner_id === user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setReview({
                                session_id: s.id,
                                rating: 5,
                                comment: "",
                              })
                            }
                          >
                            <Star className="w-3.5 h-3.5" />
                            Review
                          </Button>
                        )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {review.session_id !== null && (
        <div
          className="fixed inset-0 z-[60] bg-background/85 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={() => setReview({ session_id: null, rating: 5, comment: "" })}
        >
          <div
            className="liquid-glass rounded-3xl p-8 md:p-10 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-medium tracking-[-0.5px] mb-6">
              Leave a <span className="font-serif italic font-normal">review</span>
            </h3>
            <div className="space-y-5">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Select
                  id="rating"
                  value={review.rating}
                  onChange={(e) =>
                    setReview({ ...review, rating: Number(e.target.value) })
                  }
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)}
                      {"☆".repeat(5 - n)} ({n})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience…"
                  value={review.comment}
                  onChange={(e) =>
                    setReview({ ...review, comment: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={submitReview} className="flex-1">
                  Submit Review
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setReview({ session_id: null, rating: 5, comment: "" })
                  }
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-left font-medium px-5 py-3.5 first:pl-6 last:pr-6 ${className}`}
    >
      {children}
    </th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-5 py-4 text-foreground/90 first:pl-6 last:pr-6 ${className}`}
    >
      {children}
    </td>
  );
}
