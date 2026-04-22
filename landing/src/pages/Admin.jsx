import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Star,
  Coins,
  Clock,
  TrendingUp,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recent, setRecent] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, l, r, u] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/leaderboard"),
          api.get("/admin/recent-sessions"),
          api.get("/admin/users"),
        ]);
        setStats(s.data);
        setLeaderboard(l.data);
        setRecent(r.data);
        setUsers(u.data);
      } catch (err) {
        setError(
          err?.response?.data?.message ?? "Failed to load admin data"
        );
      }
    };
    fetchAll();
  }, []);

  if (error) {
    return (
      <AppShell
        title={
          <>
            <span className="font-serif italic font-normal">Admin</span>
          </>
        }
      >
        <div className="rounded-2xl border border-border/50 bg-card/40 p-8 text-muted-foreground">
          {error}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={
        <>
          Platform <span className="font-serif italic font-normal">overview</span>
        </>
      }
      subtitle="Everything happening across SkillSwap."
    >
      {/* Top-level stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatTile
          icon={<Users className="w-4 h-4" />}
          label="Users"
          value={stats?.users ?? "—"}
        />
        <StatTile
          icon={<Calendar className="w-4 h-4" />}
          label="Sessions"
          value={stats?.sessions ?? "—"}
          hint={
            stats
              ? `${stats.sessionsByStatus.booked} booked · ${stats.sessionsByStatus.completed} done`
              : undefined
          }
        />
        <StatTile
          icon={<Star className="w-4 h-4" />}
          label="Avg Rating"
          value={stats?.avgRating ?? "—"}
          hint={stats ? `${stats.reviews} reviews` : undefined}
        />
        <StatTile
          icon={<Coins className="w-4 h-4" />}
          label="Credits Circulated"
          value={stats?.creditsCirculated ?? "—"}
          hint="lifetime earned"
        />
        <StatTile
          icon={<Clock className="w-4 h-4" />}
          label="Open Slots"
          value={stats?.slotsOpen ?? "—"}
          hint={stats ? `of ${stats.slotsTotal} total` : undefined}
        />
        <StatTile
          icon={<TrendingUp className="w-4 h-4" />}
          label="Completed"
          value={stats?.sessionsByStatus?.completed ?? "—"}
          hint="finished sessions"
        />
        <StatTile
          icon={<ShieldCheck className="w-4 h-4" />}
          label="Cancelled"
          value={stats?.sessionsByStatus?.cancelled ?? "—"}
          hint="cancelled sessions"
        />
        <StatTile
          icon={<Trophy className="w-4 h-4" />}
          label="Mentors on board"
          value={leaderboard.length}
          hint="with taught sessions"
        />
      </section>

      {/* Leaderboard */}
      <section className="mb-12">
        <SectionHeading
          title="Top mentors"
          description="Ranked by average rating (tie-broken by review count)."
        />
        {leaderboard.length === 0 ? (
          <Empty>No mentors yet have completed a rated session.</Empty>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/40 text-xs uppercase tracking-[2px] text-muted-foreground">
                  <Th>#</Th>
                  <Th>Mentor</Th>
                  <Th>Rating</Th>
                  <Th>Reviews</Th>
                  <Th>Sessions Taught</Th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((m, i) => (
                  <tr
                    key={m.id}
                    className={
                      i < leaderboard.length - 1
                        ? "border-b border-border/40"
                        : ""
                    }
                  >
                    <Td className="text-muted-foreground">{i + 1}</Td>
                    <Td>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </Td>
                    <Td>
                      {m.avg_rating ? (
                        <span className="inline-flex items-center gap-1">
                          <Star
                            className="w-3.5 h-3.5 fill-foreground text-foreground"
                            strokeWidth={0}
                          />
                          {Number(m.avg_rating).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </Td>
                    <Td>{m.total_reviews}</Td>
                    <Td>{m.sessions_taught}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent sessions */}
      <section className="mb-12">
        <SectionHeading
          title="Recent sessions"
          description="Last 10 bookings across the platform."
        />
        {recent.length === 0 ? (
          <Empty>No sessions have been booked yet.</Empty>
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
                </tr>
              </thead>
              <tbody>
                {recent.map((s, i) => (
                  <tr
                    key={s.id}
                    className={
                      i < recent.length - 1 ? "border-b border-border/40" : ""
                    }
                  >
                    <Td className="font-medium">{s.skill_name}</Td>
                    <Td>{s.mentor_name}</Td>
                    <Td>{s.learner_name}</Td>
                    <Td>
                      {new Date(s.start_time).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Users */}
      <section>
        <SectionHeading
          title="All users"
          description={`${users.length} registered account${users.length === 1 ? "" : "s"}.`}
        />
        <div className="overflow-hidden rounded-2xl border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/40 text-xs uppercase tracking-[2px] text-muted-foreground">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Credits</Th>
                <Th>Role</Th>
                <Th className="text-right">Joined</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={
                    i < users.length - 1 ? "border-b border-border/40" : ""
                  }
                >
                  <Td className="font-medium">{u.name}</Td>
                  <Td className="text-muted-foreground">{u.email}</Td>
                  <Td>{u.credits}</Td>
                  <Td>
                    <Badge tone={u.is_admin ? "default" : "outline"}>
                      {u.is_admin ? "Admin" : "User"}
                    </Badge>
                  </Td>
                  <Td className="text-right text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      {hint && (
        <div className="text-xs text-muted-foreground mt-1">{hint}</div>
      )}
    </div>
  );
}

function SectionHeading({ title, description }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl md:text-2xl font-medium tracking-[-0.5px]">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}

function Empty({ children }) {
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
