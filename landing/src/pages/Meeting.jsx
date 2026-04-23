import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Video, Clock, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";

function formatClock(ms) {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

export default function Meeting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  // Fetch meeting info (URL is embedded in the response if in window)
  useEffect(() => {
    let cancelled = false;
    api
      .get(`/sessions/${id}/meeting`)
      .then((r) => !cancelled && setMeeting(r.data))
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ?? "Couldn't load meeting details"
        );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Tick every second for the elapsed timer
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  if (error) {
    return (
      <ErrorShell message={error} onBack={() => navigate("/my-sessions")} />
    );
  }
  if (!meeting) {
    return <LoadingShell />;
  }

  const startTs = new Date(meeting.start_time).getTime();
  const endTs = new Date(meeting.end_time).getTime();
  const beforeStart = now < startTs;
  const started = now >= startTs;
  const elapsed = started ? now - startTs : startTs - now;

  return (
    <div className="fixed inset-0 bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border/40 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            to="/my-sessions"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to sessions</span>
          </Link>
          <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-border/40">
            <Logo />
            <span className="font-bold text-base tracking-tight">SkillSwap</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 text-center">
          <p className="text-xs uppercase tracking-[3px] text-muted-foreground">
            {meeting.i_am_mentor ? "Teaching" : "Learning"}
          </p>
          <p className="font-medium truncate">
            {meeting.skill_name} <span className="text-muted-foreground">· with {meeting.other_party_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[96px] justify-end">
          <Clock className="w-4 h-4" />
          <span className="font-mono">
            {started ? "+" : ""}{formatClock(elapsed)}
          </span>
        </div>
      </header>

      {/* Body */}
      {meeting.can_join && meeting.meeting_url ? (
        <div className="flex-1 min-h-0 bg-black">
          <iframe
            title="SkillSwap meeting"
            src={meeting.meeting_url}
            allow="camera; microphone; fullscreen; display-capture; autoplay; speaker-selection"
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <ClosedRoom meeting={meeting} beforeStart={beforeStart} />
      )}
    </div>
  );
}

function ClosedRoom({ meeting, beforeStart }) {
  const target = beforeStart
    ? new Date(meeting.window_opens_at).getTime()
    : new Date(meeting.window_closes_at).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="flex-1 min-h-0 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="liquid-glass rounded-3xl p-10 md:p-14 max-w-lg text-center"
      >
        <div className="w-14 h-14 mx-auto mb-6 rounded-full liquid-glass flex items-center justify-center">
          {beforeStart ? (
            <Clock className="w-6 h-6 text-foreground/80" />
          ) : (
            <Video className="w-6 h-6 text-foreground/80" />
          )}
        </div>
        <h1 className="text-3xl font-medium tracking-[-0.5px]">
          {beforeStart ? (
            <>
              Meeting opens in{" "}
              <span className="font-serif italic font-normal">
                {formatClock(target - now)}
              </span>
            </>
          ) : (
            <>
              This session has{" "}
              <span className="font-serif italic font-normal">ended</span>
            </>
          )}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {beforeStart
            ? "The room opens 10 minutes before your session starts. Come back then."
            : "The meeting room closed 30 minutes after the scheduled end time."}
        </p>
        <Link
          to="/my-sessions"
          className="inline-flex items-center gap-2 mt-8 bg-foreground text-background rounded-full px-6 py-3 text-sm font-semibold tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sessions
        </Link>
      </motion.div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div className="fixed inset-0 bg-background text-foreground flex items-center justify-center">
      <div className="inline-flex items-center gap-3 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading meeting…
      </div>
    </div>
  );
}

function ErrorShell({ message, onBack }) {
  return (
    <div className="fixed inset-0 bg-background text-foreground flex items-center justify-center px-6">
      <div className="liquid-glass rounded-3xl p-10 md:p-14 max-w-md text-center">
        <h1 className="text-2xl font-medium">Can't open this meeting</h1>
        <p className="mt-3 text-muted-foreground text-sm">{message}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 mt-8 bg-foreground text-background rounded-full px-6 py-3 text-sm font-semibold tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
}
