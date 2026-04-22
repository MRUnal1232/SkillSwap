import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Calendar, CreditCard } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const SESSION_COST = 10;

function formatSlotLabel(slot) {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  const dateStr = start.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const startTime = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${slot.skill_name} · ${dateStr} ${startTime} – ${endTime}`;
}

export default function BookSession() {
  const { mentorId } = useParams();
  const [searchParams] = useSearchParams();
  const skillFilter = searchParams.get("skill");
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [mentorProfile, setMentorProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mentorId) return;
    api
      .get(`/users/profile/${mentorId}`)
      .then((r) => setMentorProfile(r.data))
      .catch(() => {});
    api
      .get(`/slots/mentor/${mentorId}`, {
        params: skillFilter ? { skill_id: skillFilter } : {},
      })
      .then((r) => setSlots(r.data))
      .catch(() => {});
  }, [mentorId, skillFilter]);

  // Derive the chosen skill name for the header (looked up on mentor profile).
  const chosenSkill = useMemo(() => {
    if (!skillFilter || !mentorProfile) return null;
    return mentorProfile.offeredSkills?.find(
      (s) => String(s.id) === String(skillFilter)
    );
  }, [skillFilter, mentorProfile]);

  const handleBook = async () => {
    if (!selectedSlot) {
      setError("Please pick a time slot.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/sessions/book", { slot_id: Number(selectedSlot) });
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

  const selected = slots.find((s) => s.id === Number(selectedSlot));

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <p className="text-xs uppercase tracking-[3px] text-muted-foreground mb-4">
            {chosenSkill ? `Book a ${chosenSkill.skill_name} Session` : "Book a Session"}
          </p>
          <h1 className="text-4xl md:text-5xl font-medium tracking-[-1px]">
            with{" "}
            <span className="font-serif italic font-normal">
              {mentorProfile.name}
            </span>
          </h1>
          {chosenSkill && (
            <p className="mt-3 text-sm text-muted-foreground">
              Showing only slots for{" "}
              <span className="text-foreground font-medium">
                {chosenSkill.skill_name}
              </span>
              {" · "}
              {chosenSkill.category}
            </p>
          )}
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
            <Label htmlFor="slot">Pick a skill & time</Label>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {chosenSkill
                  ? `No open ${chosenSkill.skill_name} slots right now. Check back later.`
                  : "This mentor hasn't opened any slots yet."}
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
                <option value="">Choose a slot</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {formatSlotLabel(slot)}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {selected && (
            <div className="rounded-lg border border-border/50 bg-card/40 px-4 py-3 text-sm">
              <p className="text-foreground">
                Booking{" "}
                <span className="font-medium">{selected.skill_name}</span>{" "}
                <span className="text-muted-foreground">
                  · {selected.category}
                </span>
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                {new Date(selected.start_time).toLocaleString()} —{" "}
                {new Date(selected.end_time).toLocaleTimeString()}
              </p>
            </div>
          )}

          {insufficientCredits && (
            <p className="text-sm text-muted-foreground">
              You need at least {SESSION_COST} credits to book this session.
            </p>
          )}

          <Button
            size="lg"
            onClick={handleBook}
            disabled={submitting || insufficientCredits || slots.length === 0}
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

function InfoTile({ value, label, icon }) {
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
