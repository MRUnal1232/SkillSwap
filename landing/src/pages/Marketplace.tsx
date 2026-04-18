import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Mentor, Skill } from "@/lib/types";

export default function Marketplace() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    api.get<Skill[]>("/skills").then((res) => setSkills(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const params: Record<string, string> = {};
        if (search) params.skill = search;
        if (category) params.category = category;
        if (minRating) params.min_rating = minRating;
        const res = await api.get<Mentor[]>("/skills/mentors", { params });
        setMentors(res.data);
      } catch {
        // silent
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, minRating]);

  const categories = useMemo(
    () => Array.from(new Set(skills.map((s) => s.category))),
    [skills]
  );

  return (
    <AppShell
      title={
        <>
          The <span className="font-serif italic font-normal">marketplace</span>
        </>
      }
      subtitle="Discover mentors, learn new skills, and grow your expertise."
    >
      <div className="liquid-glass rounded-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by skill name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-transparent border-transparent focus:border-border/60"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="md:max-w-[220px] bg-transparent border-transparent focus:border-border/60"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="md:max-w-[180px] bg-transparent border-transparent focus:border-border/60"
        >
          <option value="">Any Rating</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="5">5 Stars</option>
        </Select>
      </div>

      {mentors.length === 0 ? (
        <div className="border border-dashed border-border/50 rounded-2xl px-6 py-20 text-center text-muted-foreground">
          No mentors found. Try different filters or check back later.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mentors.map((mentor, i) => {
            const rating = mentor.avg_rating
              ? Number(mentor.avg_rating).toFixed(1)
              : null;
            return (
              <motion.div
                key={`${mentor.id}-${mentor.skill_name}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
                className="group relative liquid-glass rounded-2xl p-6 flex flex-col gap-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-secondary/80 border border-border/60 flex items-center justify-center font-semibold text-base">
                      {mentor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base leading-tight">
                        {mentor.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {mentor.category}
                      </p>
                    </div>
                  </div>
                  <Badge tone="outline">{mentor.skill_name}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {rating ? (
                    <>
                      <Star
                        className="w-4 h-4 fill-foreground text-foreground"
                        strokeWidth={0}
                      />
                      <span className="font-medium">{rating}</span>
                      <span className="text-muted-foreground">
                        · {mentor.total_reviews} review
                        {mentor.total_reviews === 1 ? "" : "s"}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      No ratings yet
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-auto pt-1">
                  <Link to={`/profile/${mentor.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  <Link to={`/book/${mentor.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      Book <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
