import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarPlus, Download, ExternalLink } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";

// Format a Date into Google Calendar's YYYYMMDDTHHMMSSZ UTC string.
function toGCalUtc(d) {
  const date = new Date(d);
  const pad = (n) => n.toString().padStart(2, "0");
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function googleCalendarUrl({ start, end, summary, description }) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    dates: `${toGCalUtc(start)}/${toGCalUtc(end)}`,
    details: description ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Small dropdown with two calendar options for a booked session.
 *
 *   <CalendarMenu session={s} iAmMentor={true} />
 */
export function CalendarMenu({ session, iAmMentor, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const otherParty = iAmMentor ? session.learner_name : session.mentor_name;
  const role = iAmMentor ? "Teaching" : "Learning";
  const summary = `${role} ${session.skill_name} with ${otherParty}`;
  const description = `SkillSwap session — ${role.toLowerCase()} ${session.skill_name} with ${otherParty}.`;

  const icsUrl = `${API_BASE}/api/sessions/${session.id}/calendar.ics`;
  const gCalUrl = googleCalendarUrl({
    start: session.start_time,
    end: session.end_time,
    summary,
    description,
  });

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 h-9 px-3.5 text-xs rounded-lg border border-border text-foreground hover:bg-secondary/40 transition-colors font-semibold tracking-wide"
      >
        <CalendarPlus className="w-3.5 h-3.5" />
        Add to calendar
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-56 z-50 liquid-glass rounded-xl p-1.5 text-sm"
          >
            <a
              href={gCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-foreground"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google Calendar
            </a>
            <a
              href={icsUrl}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-foreground"
            >
              <Download className="w-3.5 h-3.5" />
              Download .ics
            </a>
            <p className="px-3 py-1.5 text-[10px] uppercase tracking-[2px] text-muted-foreground">
              Works with Apple / Outlook too
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
