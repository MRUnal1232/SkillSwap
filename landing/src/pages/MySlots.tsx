import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Slot, UserProfile, UserSkill } from "@/lib/types";

export default function MySlots() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [offeredSkills, setOfferedSkills] = useState<UserSkill[]>([]);
  const [skillId, setSkillId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchSlots = async () => {
    try {
      const res = await api.get<Slot[]>("/slots/my");
      setSlots(res.data);
    } catch {
      // silent
    }
  };

  const fetchOfferedSkills = async () => {
    if (!user) return;
    try {
      const res = await api.get<UserProfile>(`/users/profile/${user.id}`);
      setOfferedSkills(res.data.offeredSkills);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchOfferedSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!skillId) {
      setError("Please choose which skill this slot is for.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Please choose both a start and end time.");
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/slots", {
        skill_id: Number(skillId),
        start_time: startTime,
        end_time: endTime,
      });
      setSkillId("");
      setStartTime("");
      setEndTime("");
      fetchSlots();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Failed to create slot"
        : "Failed to create slot";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/slots/${id}`);
      fetchSlots();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Failed to delete slot"
        : "Failed to delete slot";
      setError(msg);
    }
  };

  const noOfferedSkills = offeredSkills.length === 0;

  return (
    <AppShell
      title={
        <>
          My time <span className="font-serif italic font-normal">slots</span>
        </>
      }
      subtitle="Manage your availability for mentorship sessions."
    >
      <div className="liquid-glass rounded-2xl p-6 md:p-8 mb-10">
        <h2 className="text-xs tracking-[3px] uppercase text-muted-foreground mb-6">
          Create a new slot
        </h2>

        {error && (
          <Alert variant="error" className="mb-5">
            {error}
          </Alert>
        )}

        {noOfferedSkills && user && (
          <Alert variant="info" className="mb-5">
            You haven't added any teaching skills yet. Add one on your{" "}
            <Link
              to={`/profile/${user.id}`}
              className="underline underline-offset-2 hover:text-foreground"
            >
              profile
            </Link>{" "}
            before creating slots.
          </Alert>
        )}

        <form
          onSubmit={handleCreate}
          className="flex flex-col md:flex-row md:items-end gap-4"
        >
          <div className="flex-1 md:max-w-[280px]">
            <Label htmlFor="skill">Skill</Label>
            <Select
              id="skill"
              value={skillId}
              onChange={(e) => {
                setSkillId(e.target.value);
                if (e.target.value) setError("");
              }}
              disabled={noOfferedSkills}
            >
              <option value="">Select a skill you teach</option>
              {offeredSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.skill_name} ({s.category})
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="start">Start Time</Label>
            <Input
              id="start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={noOfferedSkills}
              required
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="end">End Time</Label>
            <Input
              id="end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={noOfferedSkills}
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting || noOfferedSkills}>
            <Plus className="w-4 h-4" />
            {submitting ? "Creating…" : "Create Slot"}
          </Button>
        </form>
      </div>

      {slots.length === 0 ? (
        <div className="border border-dashed border-border/50 rounded-2xl px-6 py-16 text-center text-muted-foreground">
          No time slots created yet. Add one above to get started.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40 text-xs uppercase tracking-[2px] text-muted-foreground">
                <Th>Skill</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, i) => (
                <tr
                  key={slot.id}
                  className={
                    i < slots.length - 1 ? "border-b border-border/40" : ""
                  }
                >
                  <Td>
                    <span className="font-medium">{slot.skill_name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {slot.category}
                    </span>
                  </Td>
                  <Td>{new Date(slot.start_time).toLocaleString()}</Td>
                  <Td>{new Date(slot.end_time).toLocaleString()}</Td>
                  <Td>
                    <Badge tone={slot.is_booked ? "default" : "outline"}>
                      {slot.is_booked ? "Booked" : "Available"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    {!slot.is_booked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
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
