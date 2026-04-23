import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Video, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Same thresholds as the backend (keep in sync with sessionController.js)
const JOIN_OPENS_MS = 10 * 60 * 1000;
const JOIN_GRACE_MS = 30 * 60 * 1000;

function formatCountdown(ms) {
  if (ms <= 0) return "0m";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

/**
 * Given a session object with { id, start_time, end_time, status },
 * renders the right state:
 *   - Hidden entirely if cancelled / completed
 *   - "Opens in Xm" countdown badge when too early
 *   - Active "Join Meeting" link when in window
 *   - "Session ended" disabled pill after the grace window
 */
export function JoinMeetingButton({ session, className }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const { state, label } = useMemo(() => {
    if (session.status !== "booked") {
      return { state: "hidden" };
    }
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.end_time).getTime();
    const opens = start - JOIN_OPENS_MS;
    const closes = end + JOIN_GRACE_MS;

    if (now < opens) {
      return { state: "waiting", label: `Opens in ${formatCountdown(opens - now)}` };
    }
    if (now > closes) {
      return { state: "ended", label: "Session ended" };
    }
    return { state: "live", label: "Join Meeting" };
  }, [session.status, session.start_time, session.end_time, now]);

  if (state === "hidden") return null;

  if (state === "waiting") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3.5 text-xs rounded-lg border border-dashed border-border text-muted-foreground tracking-wide",
          className
        )}
        title="Meeting opens 10 minutes before start time"
      >
        <Clock className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }

  if (state === "ended") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3.5 text-xs rounded-lg border border-border/40 text-muted-foreground/60 tracking-wide",
          className
        )}
      >
        <Clock className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  }

  // Live — active button
  return (
    <Link
      to={`/meeting/${session.id}`}
      className={cn(
        "inline-flex items-center gap-2 h-9 px-4 text-xs rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors font-semibold tracking-wide",
        className
      )}
    >
      <Video className="w-3.5 h-3.5" />
      {label}
    </Link>
  );
}
