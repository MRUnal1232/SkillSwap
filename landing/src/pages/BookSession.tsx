import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Calendar, CreditCard } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Slot, UserProfile } from "@/lib/types";

const SESSION_COST = 10;

export default function BookSession() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [mentorProfile, setMentorProfile] = useState<UserProfile | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mentorId) return;
    api
      .get<UserProfile>(`/users/profile/${mentorId}`)
      .then((r) => setMentorProfile(r.data))
      .catch(() => {});
    api
      .get<Slot[]>(`/slots/mentor/${mentorId}`)
      .then((r) => setSlots(r.data))
      .catch(() => {});
  }, [mentorId]);

  const handleBook = async () => {
    if (!selectedSkill && !selectedSlot) {
      setError("Please select a skill and a time slot to continue.");
      return;
    }
    if (!selectedSkill) {
      setError("Please select a skill to learn.");
      return;
    }
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/sessions/book", {
        mentor_id: Number(mentorId),
        skill_id: Number(selectedSkill),
        slot_id: Number(selectedSlot),
      });
      await refreshUser();
      navigate("/my-sessions");
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Booking failed"
        : "Booking failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mentorProfile) {
    return (
      <AppShell>
        <div className="text-muted-foreground text-sm">Loading mentor…</div>
      </AppShell>
    );
  }

  const insufficientCredits = (user?.credits ?? 0) < SESSION_COST;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <p className="text-xs uppercase tracking-[3px] text-muted-foreground mb-4">
            Book a Session
          </p>
          <h1 className="text-4xl md:text-5xl font-medium tracking-[-1px]">
            with{" "}
            <span className="font-serif italic font-normal">
              {mentorProfile.name}
            </span>
          </h1>
        </header>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <InfoTile
            value={`${user?.credits ?? 0}`}
            label="Your Credits"
            icon={<CreditCard className="w-4 h-4" />}
          />
          <InfoTile value={`${SESSION_COST}`} label="Session Cost" />
          <InfoTile
            value={
              mentorProfile.avgRating
                ? Number(mentorProfile.avgRating).toFixed(1)
                : "—"
            }
            label="Rating"
          />
        </div>

        <div className="liquid-glass rounded-2xl p-6 md:p-8 space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <div>
            <Label htmlFor="skill">Select Skill</Label>
            <Select
              id="skill"
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                if (e.target.value) setError("");
              }}
            >
              <option value="">Choose a skill to learn</option>
              {mentorProfile.offeredSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.skill_name} ({s.category})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="slot">Select Time Slot</Label>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No available slots for this mentor.
              </p>
            ) : (
              <Select
                id="slot"
                value={selectedSlot}
                onChange={(e) => {
                  setSelectedSlot(e.target.value);
                  if (e.target.value) setError("");
                }}
              >
                <option value="">Choose a time slot</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {new Date(slot.start_time).toLocaleString()} —{" "}
                    {new Date(slot.end_time).toLocaleTimeString()}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {insufficientCredits && (
            <p className="text-sm text-muted-foreground">
              You need at least {SESSION_COST} credits to book this session.
            </p>
          )}

          <Button
            size="lg"
            onClick={handleBook}
            disabled={submitting || insufficientCredits}
            className="w-full"
          >
            <Calendar className="w-4 h-4" />
            {submitting ? "Booking…" : `Confirm Booking · ${SESSION_COST} Credits`}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function InfoTile({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 py-5 px-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-2xl md:text-3xl font-medium">
        {icon}
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[2px] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
