// Minimal iCalendar (.ics) generator. No external deps.
// Compatible with Google Calendar, Apple Calendar, Outlook, Proton, etc.

function pad(n) {
  return n.toString().padStart(2, "0");
}

// Format a JS Date as iCal UTC basic form: YYYYMMDDTHHMMSSZ
function toIcsUtc(date) {
  const d = new Date(date);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

// Escape commas, semicolons, newlines as iCal requires.
function escapeText(s = "") {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// Long lines must be folded at 75 chars; most clients tolerate unfolded though,
// we fold defensively.
function fold(line) {
  if (line.length <= 75) return line;
  const parts = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + (i === 0 ? 75 : 74));
    parts.push((i === 0 ? "" : " ") + chunk);
    i += i === 0 ? 75 : 74;
  }
  return parts.join("\r\n");
}

/**
 * Build a one-event .ics string.
 *
 *   buildIcs({
 *     uid: "session-42@skillswap",
 *     start: "2026-05-01T14:00:00Z",
 *     end:   "2026-05-01T15:00:00Z",
 *     summary: "React session with Sakshi",
 *     description: "Booked through SkillSwap.",
 *     url: "http://localhost:5173/my-sessions",
 *   })
 */
function buildIcs({ uid, start, end, summary, description, url, location }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SkillSwap//Session Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    description ? `DESCRIPTION:${escapeText(description)}` : null,
    url ? `URL:${escapeText(url)}` : null,
    location ? `LOCATION:${escapeText(location)}` : null,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .map(fold);

  return lines.join("\r\n") + "\r\n";
}

module.exports = { buildIcs };
