import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Star, X, Plus, Calendar } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillType, setSkillType] = useState("offer");
  const [reviews, setReviews] = useState([]);
  const [skillError, setSkillError] = useState("");

  const isOwnProfile = !!user && user.id === Number(id);

  useEffect(() => {
    if (!id) return;
    api.get(`/users/profile/${id}`).then((r) => setProfile(r.data)).catch(() => {});
    api.get(`/reviews/mentor/${id}`).then((r) => setReviews(r.data)).catch(() => {});
    if (isOwnProfile) {
      api.get("/skills").then((r) => setSkills(r.data)).catch(() => {});
    }
  }, [id, isOwnProfile]);

  const reload = () => {
    if (!id) return;
    api.get(`/users/profile/${id}`).then((r) => setProfile(r.data));
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) {
      setSkillError("Please select a skill before adding.");
      return;
    }
    setSkillError("");
    try {
      await api.post("/users/skills", {
        skill_id: Number(selectedSkill),
        type: skillType,
      });
      setSelectedSkill("");
      reload();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Failed to add skill"
        : "Failed to add skill";
      setSkillError(msg);
    }
  };

  const handleRemoveSkill = async (skill_id, type) => {
    try {
      await api.delete("/users/skills", { params: { skill_id, type } });
      reload();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Failed to remove skill"
        : "Failed to remove skill";
      setSkillError(msg);
    }
  };

  if (!profile) {
    return (
      <AppShell>
        <div className="text-muted-foreground text-sm">Loading profile…</div>
      </AppShell>
    );
  }

  const joined = new Date(profile.created_at).toLocaleDateString();
  const rating = profile.avgRating
    ? Number(profile.avgRating).toFixed(1)
    : "N/A";

  return (
    <AppShell>
      <div className="liquid-glass rounded-3xl p-8 md:p-12 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center text-4xl font-medium mb-6">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-3xl md:text-4xl font-medium tracking-[-0.5px]">
          {profile.name}
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">{profile.email}</p>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          <Stat value={profile.credits.toString()} label="Credits" />
          <Stat value={rating} label="Rating" />
          <Stat value={profile.totalReviews.toString()} label="Reviews" />
          <Stat value={joined} label="Joined" small />
        </div>

        {!isOwnProfile && profile.offeredSkills.length > 0 && (
          <Link to={`/book/${id}`} className="mt-10">
            <Button size="lg">
              <Calendar className="w-4 h-4" /> Book a Session
            </Button>
          </Link>
        )}
      </div>

      <Section title="Skills Offered">
        {profile.offeredSkills.length === 0 ? (
          <EmptyHint>No skills offered yet.</EmptyHint>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.offeredSkills.map((s) => (
              <SkillChip
                key={s.id}
                label={`${s.skill_name} · ${s.category}`}
                onRemove={
                  isOwnProfile
                    ? () => handleRemoveSkill(s.id, "offer")
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Want to Learn">
        {profile.learnSkills.length === 0 ? (
          <EmptyHint>No learning goals yet.</EmptyHint>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.learnSkills.map((s) => (
              <SkillChip
                key={s.id}
                label={`${s.skill_name} · ${s.category}`}
                onRemove={
                  isOwnProfile
                    ? () => handleRemoveSkill(s.id, "learn")
                    : undefined
                }
                muted
              />
            ))}
          </div>
        )}
      </Section>

      {isOwnProfile && (
        <Section title="Add a Skill">
          {skillError && (
            <Alert variant="error" className="mb-4">
              {skillError}
            </Alert>
          )}
          <div className="flex flex-col md:flex-row gap-3">
            <Select
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                if (e.target.value) setSkillError("");
              }}
              className="flex-1"
              aria-invalid={!!skillError}
            >
              <option value="">Select a skill</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.skill_name} ({s.category})
                </option>
              ))}
            </Select>
            <Select
              value={skillType}
              onChange={(e) => setSkillType(e.target.value)}
              className="md:max-w-[200px]"
            >
              <option value="offer">I can teach</option>
              <option value="learn">I want to learn</option>
            </Select>
            <Button onClick={handleAddSkill}>
              <Plus className="w-4 h-4" /> Add Skill
            </Button>
          </div>
        </Section>
      )}

      <Section title="Reviews">
        {reviews.length === 0 ? (
          <EmptyHint>No reviews yet.</EmptyHint>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border/50 bg-card/40 p-5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-medium">{r.reviewer_name}</span>
                    <span className="text-muted-foreground text-sm">
                      {" "}
                      · {r.skill_name}
                    </span>
                  </div>
                  <Stars rating={r.rating} />
                </div>
                {r.comment && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>
    </AppShell>
  );
}

function Stat({ value, label, small }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 py-5 px-3">
      <div
        className={
          small ? "text-sm font-medium" : "text-2xl md:text-3xl font-medium"
        }
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[2px] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-12">
      <h2 className="text-xs tracking-[3px] uppercase text-muted-foreground mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyHint({ children }) {
  return (
    <p className="text-sm text-muted-foreground border border-dashed border-border/40 rounded-xl px-5 py-6">
      {children}
    </p>
  );
}

function SkillChip({ label, onRemove, muted }) {
  return (
    <span
      className={`inline-flex items-center gap-2 pl-4 pr-3 py-2 rounded-full text-sm border ${
        muted
          ? "border-border/50 bg-secondary/30 text-muted-foreground"
          : "border-border/70 bg-secondary/50 text-foreground"
      }`}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-foreground/10"
          aria-label="Remove skill"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating ? "fill-foreground text-foreground" : "text-border"
          }`}
          strokeWidth={0}
        />
      ))}
    </span>
  );
}
