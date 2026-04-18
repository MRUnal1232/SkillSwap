import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { Slot } from "@/lib/types";

export default function MySlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = async () => {
    try {
      const res = await api.get<Slot[]>("/slots/my");
      setSlots(res.data);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/slots", { start_time: startTime, end_time: endTime });
      setStartTime("");
      setEndTime("");
      fetchSlots();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Failed to create slot"
        : "Failed to create slot";
      alert(msg);
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
      alert(msg);
    }
  };

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
        <form
          onSubmit={handleCreate}
          className="flex flex-col md:flex-row md:items-end gap-4"
        >
          <div className="flex-1">
            <Label htmlFor="start">Start Time</Label>
            <Input
              id="start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
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
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting}>
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
