import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Coins,
  GraduationCap,
  BookOpen,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CalendarMenu } from "@/components/CalendarMenu";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/users/profile/${user.id}`)
      .then((r) => setProfile(r.data))
      .catch(() => {});
    api
      .get("/sessions/my")
      .then((r) => setSessions(r.data))
      .catch(() => {});
    api
      .get("/users/credits")
      .then((r) => setTransactions(r.data.transactions ?? []))
      .catch(() => {});
  }, [user]);

  const stats = useMemo(() => {
    if (!user) {
      return {
        teaching: 0,
        learning: 0,
        upcoming: [],
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      };
    }
    const now = Date.now();
    let teaching = 0;
    let learning = 0;
    const upcoming = [];

    for (const s of sessions) {
      if (s.mentor_id === user.id) teaching += 1;
      else if (s.learner_id === user.id) learning += 1;
      if (
        s.status === "booked" &&
        new Date(s.start_time).getTime() > now
      ) {
        upcoming.push(s);
      }
    }
    upcoming.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    let lifetimeEarned = 0;
    let lifetimeSpent = 0;
    for (const t of transactions) {
      if (t.type === "earned") lifetimeEarned += Number(t.credits);
      else if (t.type === "spent") lifetimeSpent += Number(t.credits);
    }

    return { teaching, learning, upcoming, lifetimeEarned, lifetimeSpent };
  }, [sessions, transactions, user]);

  const avgRating = profile?.avgRating
    ? Number(profile.avgRating).toFixed(1)
    : "—";
  const totalReviews = profile?.totalReviews ?? 0;

  return (
    <AppShell
      title={
        <>
          Welcome back,{" "}
          <span className="font-serif italic font-normal">
            {user?.name?.split(" ")[0] ?? "friend"}
          </span>
        </>
      }
      subtitle="Here's everything happening with your SkillSwap account."
    >
      {/* Credits hero */}
      <section className="liquid-glass rounded-3xl p-8 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[3px] text-muted-foreground mb-3">
              Credit Balance
            </p>
            <div className="flex items-end gap-3">
              <Coins className="w-8 h-8 text-foreground/60 mb-1" />
              <span className="text-6xl md:text-7xl font-medium tracking-[-2px] leading-none">
                {user?.credits ?? 0}
              </span>
              <span className="text-sm text-muted-foreground mb-2">credits</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-foreground font-medium">
                  {stats.lifetimeEarned}
                </span>{" "}
                earned
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <TrendingDown className="w-4 h-4" />
                <span className="text-foreground font-medium">
                  {stats.lifetimeSpent}
                </span>{" "}
                spent
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/marketplace">
              <Button>
                <BookOpen className="w-4 h-4" /> Find a mentor
              </Button>
            </Link>
            <Link to="/my-slots">
              <Button variant="outline">
                <Calendar className="w-4 h-4" /> Open my calendar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stat tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatTile
          icon={<GraduationCap className="w-4 h-4" />}
          label="Teaching"
          value={stats.teaching.toString()}
          hint="sessions as mentor"
        />
        <StatTile
          icon={<BookOpen className="w-4 h-4" />}
          label="Learning"
          value={stats.learning.toString()}
          hint="sessions as learner"
        />
        <StatTile
          icon={<Star className="w-4 h-4" />}
          label="Rating"
          value={avgRating}
          hint={`${totalReviews} review${totalReviews === 1 ? "" : "s"}`}
        />
        <StatTile
          icon={<Clock className="w-4 h-4" />}
          label="Upcoming"
          value={stats.upcoming.length.toString()}
          hint="sessions ahead"
        />
      </section>

      {/* Upcoming sessions */}
      <section className="mb-12">
        <SectionHeading
          title="Upcoming sessions"
          description="The next bookings on your calendar."
          action={
            sessions.length > 0 && (
              <Link
                to="/my-sessions"
                className="text-xs uppercase tracking-[2px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )
          }
        />

        {stats.upcoming.length === 0 ? (
          <EmptyState>
            No upcoming sessions. Book a mentor or open a slot to get started.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {stats.upcoming.slice(0, 4).map((s) => {
              const isMentor = s.mentor_id === user?.id;
              const other = isMentor ? s.learner_name : s.mentor_name;
              return (
                <div
                  key={s.id}
                  className="liquid-glass rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-3"
                >
                  <Badge tone="outline" className="self-start">
                    {isMentor ? "Teaching" : "Learning"}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{s.skill_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      with {other}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(s.start_time).toLocaleString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <CalendarMenu session={s} iAmMentor={isMentor} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Credit history */}
      <section>
        <SectionHeading
          title="Credit history"
          description="Every credit earned or spent on your account."
        />

        {transactions.length === 0 ? (
          <EmptyState>
            No credit movements yet. Book a session or teach one to see activity here.
          </EmptyState>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 text-xs uppercase tracking-[2px] text-muted-foreground">
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Reason</Th>
                  <Th className="text-right">When</Th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => {
                  const earned = t.type === "earned";
                  return (
                    <tr
                      key={t.id}
                      className={
                        i < transactions.length - 1
                          ? "border-b border-border/40"
                          : ""
                      }
                    >
                      <Td>
                        <Badge tone={earned ? "default" : "danger"}>
                          {earned ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {t.type}
                        </Badge>
                      </Td>
                      <Td>
                        <span
                          className={
                            earned ? "text-foreground" : "text-muted-foreground"
                          }
                        >
                          {earned ? "+" : "−"}
                          {t.credits}
                        </span>
                      </Td>
                      <Td className="text-muted-foreground">{t.reason ?? "—"}</Td>
                      <Td className="text-right text-muted-foreground">
                        {new Date(t.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function StatTile({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[2px] text-muted-foreground mb-3">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-medium">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}

function SectionHeading({ title, description, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 className="text-xl md:text-2xl font-medium tracking-[-0.5px]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div className="border border-dashed border-border/50 rounded-2xl px-6 py-10 text-center text-muted-foreground text-sm">
      {children}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th
      className={`text-left font-medium px-5 py-3.5 first:pl-6 last:pr-6 ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return (
    <td
      className={`px-5 py-4 text-foreground/90 first:pl-6 last:pr-6 ${className}`}
    >
      {children}
    </td>
  );
}
